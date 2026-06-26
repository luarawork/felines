// Lightweight sighting report, reached from /colony/new when the
// validation questions suggest this is a single sighting rather than an
// actual colony. Deliberately simpler than the full colony form — just
// enough to get the sighting on the map without forcing the visitor
// through colony-registration requirements (a required photo, exact
// marker placement, a name). No account required.
"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { buildSafeStoragePath, validatePhotoFile } from "@/lib/storage";
import AddressAutocomplete from "@/components/AddressAutocomplete";

export default function QuickSightingForm({
  initialAddress,
  initialPosition,
  onClose,
}: {
  initialAddress?: string;
  initialPosition?: [number, number] | null;
  onClose?: () => void;
}) {
  const [description, setDescription] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [address, setAddress] = useState(initialAddress ?? "");
  const [position, setPosition] = useState<[number, number] | null>(initialPosition ?? null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formEvent: React.FormEvent) {
    formEvent.preventDefault();
    setError(null);

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
      const filePath = buildSafeStoragePath("sightings", photoFile);
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

    const { data: sessionData } = await supabase.auth.getSession();

    const { error: insertError } = await supabase.from("reports").insert({
      type: "sighting",
      description: description.trim() || null,
      photo_url: photoUrl,
      latitude: position?.[0] ?? null,
      longitude: position?.[1] ?? null,
      status: "open",
      created_by: sessionData.session?.user.id ?? null,
    });

    setSubmitting(false);

    if (insertError) {
      setError("Não foi possível enviar o avistamento. Tente novamente.");
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-felines-success bg-felines-success/10 p-5">
        <p className="text-sm text-felines-success">
          Obrigado por relatar! Seu avistamento foi adicionado ao mapa. Se você vir mais gatos
          nesse local com frequência, considere mapear uma colônia.
        </p>
        <Link
          href="/map"
          className="mt-3 inline-block rounded-full bg-felines-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-felines-accent-hover"
        >
          Voltar ao mapa
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-felines-text-primary">
          Foto (opcional)
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(formEvent) => setPhotoFile(formEvent.target.files?.[0] ?? null)}
          className="mt-1 w-full text-sm text-felines-text-secondary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-felines-text-primary">
          Descrição (opcional)
        </label>
        <textarea
          value={description}
          onChange={(formEvent) => setDescription(formEvent.target.value)}
          rows={3}
          maxLength={500}
          placeholder="Descreva o que você viu..."
          className="mt-1 w-full rounded-md border border-felines-border bg-white px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-felines-text-primary">Localização</label>
        <div className="mt-1">
          <AddressAutocomplete
            value={address}
            onChange={(newValue) => {
              setAddress(newValue);
              setPosition(null);
            }}
            onSelectLocation={(lat, lon) => setPosition([lat, lon])}
          />
        </div>
      </div>

      {error && <p className="text-sm text-felines-emergency">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-felines-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-felines-accent-hover disabled:opacity-50"
        >
          {submitting ? "Enviando..." : "Enviar avistamento"}
        </button>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-4 py-2 text-sm font-medium text-felines-text-secondary"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
