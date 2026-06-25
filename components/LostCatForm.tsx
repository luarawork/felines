// Dedicated flow for reporting a lost cat. Requires an account — unlike
// other report types, this one only makes sense if we know who the
// owner is, since the whole point is letting someone who spots the cat
// reach them (surfaced in-app on /reports, see SightingReportButton).
// A photo is mandatory: a "have you seen this cat" report without a
// photo isn't useful to anyone who might spot it.
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { buildSafeStoragePath, validatePhotoFile } from "@/lib/storage";
import AddressAutocomplete from "@/components/AddressAutocomplete";
import AuthRequiredNotice from "@/components/AuthRequiredNotice";

export default function LostCatForm({ onSubmitted }: { onSubmitted?: () => void }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const [description, setDescription] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [location, setLocation] = useState("");
  const [locationCoords, setLocationCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setIsLoggedIn(!!data.session);
      setCheckingSession(false);
    });
  }, []);

  async function handleSubmit(formEvent: React.FormEvent) {
    formEvent.preventDefault();
    setError(null);

    if (!photoFile) {
      setError("A foto do gato é obrigatória.");
      return;
    }
    const photoError = validatePhotoFile(photoFile);
    if (photoError) {
      setError(photoError);
      return;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData.session;
    if (!session) return;

    setSubmitting(true);

    const filePath = buildSafeStoragePath(`lost-cats/${session.user.id}`, photoFile);
    const { error: uploadError } = await supabase.storage
      .from("colony-photos")
      .upload(filePath, photoFile);

    if (uploadError) {
      setSubmitting(false);
      setError("Não foi possível enviar a foto. Tente novamente.");
      return;
    }

    const photoUrl = supabase.storage.from("colony-photos").getPublicUrl(filePath).data.publicUrl;

    const { error: insertError } = await supabase.from("reports").insert({
      type: "missing_cat",
      description: description.trim() || null,
      photo_url: photoUrl,
      latitude: locationCoords?.lat ?? null,
      longitude: locationCoords?.lon ?? null,
      status: "open",
      created_by: session.user.id,
    });

    setSubmitting(false);

    if (insertError) {
      setError("Não foi possível registrar o gato perdido. Tente novamente.");
      return;
    }

    onSubmitted?.();
  }

  if (checkingSession) return null;

  if (!isLoggedIn) {
    return (
      <div>
        <p className="mb-3 text-sm text-felines-text-secondary">
          Para cadastrar um gato perdido você precisa de uma conta — assim quem avistar o gato
          consegue te avisar.
        </p>
        <AuthRequiredNotice />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-felines-text-secondary">
          Sobre o gato (nome, cor, características)
        </label>
        <textarea
          value={description}
          onChange={(formEvent) => setDescription(formEvent.target.value)}
          rows={3}
          maxLength={500}
          className="mt-1 w-full rounded-md border border-felines-border bg-white px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-felines-text-secondary">
          Foto do gato (obrigatória)
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(formEvent) => setPhotoFile(formEvent.target.files?.[0] ?? null)}
          className="mt-1 block text-sm text-felines-text-secondary"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-felines-text-secondary">
          Onde ele foi visto pela última vez
        </label>
        <div className="mt-1">
          <AddressAutocomplete
            value={location}
            onChange={(newValue) => {
              setLocation(newValue);
              setLocationCoords(null);
            }}
            onSelectLocation={(lat, lon) => setLocationCoords({ lat, lon })}
          />
        </div>
      </div>

      {error && <p className="text-sm text-felines-emergency">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-full bg-felines-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-felines-accent-hover disabled:opacity-50"
      >
        {submitting ? "Cadastrando..." : "Cadastrar gato perdido"}
      </button>
    </form>
  );
}
