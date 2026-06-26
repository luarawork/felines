// Lets a colony's creator or a linked caretaker add an entry to the
// collective timeline (e.g. a castration round, a health issue, a new
// cat joining), optionally with a photo — for updates that deserve a
// picture but aren't meant to replace the colony's cover photo. Hidden
// for everyone else, since timeline_events can only be inserted by an
// authenticated user per RLS.
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { buildSafeStoragePath, validatePhotoFile } from "@/lib/storage";
import { useColonyAccessContext } from "@/components/ColonyAccessProvider";
import PhotoUploadButton from "@/components/PhotoUploadButton";

// Common timeline event types. The column has no check constraint, so
// these are just suggestions to keep entries consistent.
const EVENT_TYPES = [
  { value: "castration_round", label: "Rodada de castração" },
  { value: "health_issue", label: "Problema de saúde" },
  { value: "new_cat", label: "Novo gato na colônia" },
  { value: "feeding_change", label: "Mudança na alimentação" },
  { value: "relocation", label: "Mudança de local" },
  { value: "photo_update", label: "Foto da colônia" },
  { value: "other", label: "Outro" },
];

export default function TimelineEventForm({ colonyId }: { colonyId: string }) {
  const router = useRouter();
  const { session, canManage, checkingAccess } = useColonyAccessContext();

  const [eventType, setEventType] = useState(EVENT_TYPES[0].value);
  const [description, setDescription] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(formEvent: React.FormEvent) {
    formEvent.preventDefault();
    setError(null);

    if (!session) return;

    if (photoFile) {
      const photoError = validatePhotoFile(photoFile);
      if (photoError) {
        setError(photoError);
        return;
      }
    }

    setSubmitting(true);

    let photoUrl: string | null = null;
    if (photoFile) {
      const filePath = buildSafeStoragePath(`timeline/${colonyId}`, photoFile);
      const { error: uploadError } = await supabase.storage
        .from("colony-photos")
        .upload(filePath, photoFile);

      if (uploadError) {
        setSubmitting(false);
        setError("Não foi possível enviar a foto.");
        return;
      }

      photoUrl = supabase.storage.from("colony-photos").getPublicUrl(filePath).data.publicUrl;
    }

    const { error: insertError } = await supabase.from("timeline_events").insert({
      colony_id: colonyId,
      event_type: eventType,
      description: description.trim() || null,
      photo_url: photoUrl,
      created_by: session.user.id,
    });
    setSubmitting(false);

    if (insertError) {
      setError("Não foi possível adicionar o evento.");
      return;
    }

    setDescription("");
    setPhotoFile(null);
    setSubmitted(true);
    router.refresh();
  }

  if (checkingAccess || !canManage) return null;

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 rounded-xl border border-felines-border bg-felines-surface p-4"
    >
      <p className="text-sm font-semibold text-felines-text-primary">
        Adicionar evento à linha do tempo
      </p>

      <div className="mt-3 flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs font-medium text-felines-text-secondary">Tipo</label>
          <select
            value={eventType}
            onChange={(formEvent) => {
              setEventType(formEvent.target.value);
              setSubmitted(false);
            }}
            className="mt-1 rounded-md border border-felines-border bg-white px-3 py-2 text-sm"
          >
            {EVENT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-xs font-medium text-felines-text-secondary">
            Descrição (opcional)
          </label>
          <input
            type="text"
            value={description}
            onChange={(formEvent) => {
              setDescription(formEvent.target.value);
              setSubmitted(false);
            }}
            maxLength={300}
            className="mt-1 w-full rounded-md border border-felines-border bg-white px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="mt-3">
        <label className="block text-xs font-medium text-felines-text-secondary">
          Foto (opcional) — não altera a foto de capa da colônia
        </label>
        <div className="mt-1">
          <PhotoUploadButton
            label="Escolher foto"
            file={photoFile}
            onChange={(file) => {
              setPhotoFile(file);
              setSubmitted(false);
            }}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="mt-3 rounded-full bg-felines-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-felines-accent-hover disabled:opacity-50"
      >
        {submitting ? "Adicionando..." : "Adicionar"}
      </button>

      {error && <p className="mt-2 text-sm text-felines-emergency">{error}</p>}
      {submitted && <p className="mt-2 text-sm text-felines-success">Evento adicionado.</p>}
    </form>
  );
}
