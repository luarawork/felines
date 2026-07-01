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
import { submitReport } from "@/lib/submitReport";
import MapMarkerPickerShell from "@/components/MapMarkerPickerShell";
import AuthRequiredNotice from "@/components/AuthRequiredNotice";
import PhotoUploadButton from "@/components/PhotoUploadButton";

export default function LostCatForm({ onSubmitted }: { onSubmitted?: () => void }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const [description, setDescription] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [locationCoords, setLocationCoords] = useState<[number, number] | null>(null);
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
      setError("A foto do gato é obrigatória — sem ela, fica difícil alguém reconhecer ele na rua.");
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
      setError("A foto não subiu. Tenta de novo?");
      return;
    }

    const photoUrl = supabase.storage.from("colony-photos").getPublicUrl(filePath).data.publicUrl;

    const { error: submitError } = await submitReport({
      type: "missing_cat",
      description: description.trim() || null,
      photo_url: photoUrl,
      latitude: locationCoords?.[0] ?? null,
      longitude: locationCoords?.[1] ?? null,
      status: "open",
    });

    setSubmitting(false);

    if (submitError) {
      setError(submitError);
      return;
    }

    onSubmitted?.();
  }

  if (checkingSession) return null;

  if (!isLoggedIn) {
    return (
      <div>
        <p className="mb-3 text-sm text-felines-text-secondary">
          Pra cadastrar um gato perdido, você precisa de uma conta. Assim, quem encontrar ele sabe
          como te avisar.
        </p>
        <AuthRequiredNotice />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label
          htmlFor="lost-cat-description"
          className="block text-xs font-medium text-felines-text-secondary"
        >
          Como ele é (nome, cor, jeitão)
        </label>
        <textarea
          id="lost-cat-description"
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
        <div className="mt-1">
          <PhotoUploadButton label="Escolher foto" file={photoFile} onChange={setPhotoFile} />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-felines-text-secondary">
          Onde foi a última vez que você viu ele
        </label>
        <p className="mt-1 text-xs text-felines-text-secondary">
          Toque ou arraste o pino até o local.
        </p>
        <div className="mt-2 h-48 w-full overflow-hidden rounded-xl border border-felines-border">
          <MapMarkerPickerShell
            position={locationCoords}
            onPick={(lat, lng) => setLocationCoords([lat, lng])}
          />
        </div>
      </div>

      {error && <p role="alert" className="text-sm text-felines-emergency">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        aria-busy={submitting}
        className="rounded-full bg-felines-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-felines-accent-hover disabled:opacity-50"
      >
        {submitting ? "Cadastrando..." : "Avisar que ele está perdido"}
      </button>
    </form>
  );
}
