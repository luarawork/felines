// Lets a colony's creator or a linked caretaker edit its narrative,
// castration status, and cover photo. Until now colonies could only be
// created, never updated, so a typo or outdated castration status had
// no way to be fixed through the app.
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { buildSafeStoragePath, validatePhotoFile } from "@/lib/storage";
import { useColonyAccessContext } from "@/components/ColonyAccessProvider";
import PhotoUploadButton from "@/components/PhotoUploadButton";
import { encodeColonyEdit } from "@/lib/colonyEditHistory";
import EditHistorySection from "@/components/EditHistorySection";

type CastrationStatus = "none" | "partial" | "full";

const CASTRATION_LABELS: Record<CastrationStatus, string> = {
  none: "nenhum gato castrado",
  partial: "castração parcial",
  full: "colônia totalmente castrada",
};

export default function EditColonyForm({
  colonyId,
  initialName,
  initialNarrative,
  initialCastrationStatus,
  initialCoverPhotoUrl,
  onSaved,
}: {
  colonyId: string;
  initialName: string;
  initialNarrative: string | null;
  initialCastrationStatus: CastrationStatus;
  initialCoverPhotoUrl: string | null;
  onSaved?: () => void;
}) {
  const router = useRouter();
  const { session, canManage, checkingAccess } = useColonyAccessContext();

  const [name, setName] = useState(initialName);
  const [narrative, setNarrative] = useState(initialNarrative ?? "");
  const [castrationStatus, setCastrationStatus] = useState<CastrationStatus>(
    initialCastrationStatus
  );
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(formEvent: React.FormEvent) {
    formEvent.preventDefault();
    setError(null);
    setSaved(false);

    if (!name.trim()) {
      setError("Informe um nome para a colônia.");
      return;
    }

    if (photoFile) {
      const photoError = validatePhotoFile(photoFile);
      if (photoError) {
        setError(photoError);
        return;
      }
    }

    setSubmitting(true);

    let coverPhotoUrl = initialCoverPhotoUrl;
    if (photoFile) {
      const filePath = buildSafeStoragePath(colonyId, photoFile);
      const { error: uploadError } = await supabase.storage
        .from("colony-photos")
        .upload(filePath, photoFile);

      if (uploadError) {
        setSubmitting(false);
        setError("A nova foto não subiu. Tenta de novo?");
        return;
      }

      coverPhotoUrl = supabase.storage.from("colony-photos").getPublicUrl(filePath).data.publicUrl;

      // Preserve the outgoing cover photo in the timeline instead of
      // letting it just disappear — it's still part of the colony's
      // history even after a newer photo takes its place.
      if (initialCoverPhotoUrl && session) {
        await supabase.from("timeline_events").insert({
          colony_id: colonyId,
          event_type: "cover_photo_changed",
          description: "Foto de capa anterior da colônia.",
          photo_url: initialCoverPhotoUrl,
          created_by: session.user.id,
        });
      }
    }

    const { error: updateError } = await supabase
      .from("colonies")
      .update({
        name: name.trim(),
        narrative: narrative.trim() || null,
        castration_status: castrationStatus,
        cover_photo_url: coverPhotoUrl,
      })
      .eq("id", colonyId);

    setSubmitting(false);

    if (updateError) {
      setError("As alterações não foram salvas. Tenta de novo?");
      return;
    }

    // Leaves a trace of what actually changed — one "colony_edited"
    // event per changed field, each carrying the old/new value (JSON-
    // encoded; see lib/colonyEditHistory.ts) so the Edit modal's history
    // section can show a real diff, not just "something changed".
    // Narrative is truncated to 100 chars per field, since storing the
    // full text twice on every edit isn't worth it for a free-text field
    // that can run to 1000 characters.
    if (session) {
      const edits: { field: "name" | "narrative" | "castration_status"; oldValue: string; newValue: string }[] =
        [];

      if (name.trim() !== initialName) {
        edits.push({ field: "name", oldValue: initialName, newValue: name.trim() });
      }
      if ((narrative.trim() || null) !== (initialNarrative ?? null)) {
        edits.push({
          field: "narrative",
          oldValue: (initialNarrative ?? "").slice(0, 100),
          newValue: narrative.trim().slice(0, 100),
        });
      }
      if (castrationStatus !== initialCastrationStatus) {
        edits.push({
          field: "castration_status",
          oldValue: CASTRATION_LABELS[initialCastrationStatus],
          newValue: CASTRATION_LABELS[castrationStatus],
        });
      }

      for (const edit of edits) {
        await supabase.from("timeline_events").insert({
          colony_id: colonyId,
          event_type: "colony_edited",
          description: encodeColonyEdit(edit),
          created_by: session.user.id,
        });
      }
    }

    setPhotoFile(null);
    setSaved(true);
    router.refresh();
  }

  if (checkingAccess) return null;

  if (!session || !canManage) {
    return (
      <p className="text-sm text-felines-text-secondary">
        Apenas o criador ou um cuidador vinculado pode editar esta colônia.
      </p>
    );
  }

  return (
    <>
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
      <div>
        <label
          htmlFor="edit-colony-name"
          className="block text-sm font-medium text-felines-text-primary"
        >
          Nome da colônia
        </label>
        <input
          id="edit-colony-name"
          type="text"
          value={name}
          onChange={(formEvent) => setName(formEvent.target.value)}
          maxLength={100}
          className="mt-1 w-full rounded-md border border-felines-border bg-white px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label
          htmlFor="edit-colony-narrative"
          className="block text-sm font-medium text-felines-text-primary"
        >
          Narrativa
        </label>
        <textarea
          id="edit-colony-narrative"
          value={narrative}
          onChange={(formEvent) => setNarrative(formEvent.target.value)}
          rows={4}
          maxLength={1000}
          className="mt-1 w-full rounded-md border border-felines-border bg-white px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label
          htmlFor="edit-colony-castration"
          className="block text-sm font-medium text-felines-text-primary"
        >
          Situação de castração
        </label>
        <select
          id="edit-colony-castration"
          value={castrationStatus}
          onChange={(formEvent) => setCastrationStatus(formEvent.target.value as CastrationStatus)}
          className="mt-1 w-full rounded-md border border-felines-border bg-white px-3 py-2 text-sm"
        >
          <option value="none">Nenhum gato castrado</option>
          <option value="partial">Castração parcial</option>
          <option value="full">Colônia totalmente castrada</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-felines-text-primary">
          Substituir foto de capa (opcional)
        </label>
        <div className="mt-1">
          <PhotoUploadButton label="Escolher foto" file={photoFile} onChange={setPhotoFile} />
        </div>
      </div>

      {error && <p role="alert" className="text-sm text-felines-emergency">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-felines-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-felines-accent-hover disabled:opacity-50"
        >
          {submitting ? "Salvando..." : saved ? "Salvo" : "Salvar alterações"}
        </button>
        {saved && onSaved && (
          <button
            type="button"
            onClick={onSaved}
            className="text-sm font-medium text-felines-text-secondary hover:text-felines-text-primary"
          >
            Fechar
          </button>
        )}
      </div>
    </form>

    <EditHistorySection colonyId={colonyId} />
    </>
  );
}
