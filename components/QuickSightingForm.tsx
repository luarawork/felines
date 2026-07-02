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
import { useLanguage } from "@/lib/i18n";
import { buildSafeStoragePath, validatePhotoFile } from "@/lib/storage";
import { submitReport } from "@/lib/submitReport";
import MapMarkerPickerShell from "@/components/MapMarkerPickerShell";
import PhotoUploadButton from "@/components/PhotoUploadButton";

export default function QuickSightingForm({
  initialPosition,
  onClose,
}: {
  initialPosition?: [number, number] | null;
  onClose?: () => void;
}) {
  const [description, setDescription] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [position, setPosition] = useState<[number, number] | null>(initialPosition ?? null);
  const { t } = useLanguage();
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
        setError(t("quickSighting.photoUploadError"));
        return;
      }

      photoUrl = supabase.storage.from("colony-photos").getPublicUrl(filePath).data.publicUrl;
    }

    const { error: submitError } = await submitReport({
      type: "sighting",
      description: description.trim() || null,
      photo_url: photoUrl,
      latitude: position?.[0] ?? null,
      longitude: position?.[1] ?? null,
      status: "open",
    });

    setSubmitting(false);

    if (submitError) {
      setError(submitError);
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-felines-success bg-felines-success/10 p-5">
        <p role="status" className="text-sm text-felines-success-hover">
          {t("quickSighting.successMessage")}
        </p>
        <Link
          href="/map"
          className="mt-3 inline-block rounded-full bg-felines-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-felines-accent-hover"
        >
          {t("quickSighting.backToMap")}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-felines-text-primary">
          {t("quickSighting.photoLabel")}
        </label>
        <div className="mt-1">
          <PhotoUploadButton label="Escolher foto" file={photoFile} onChange={setPhotoFile} />
        </div>
      </div>

      <div>
        <label
          htmlFor="quick-sighting-description"
          className="block text-sm font-medium text-felines-text-primary"
        >
          {t("quickSighting.descLabel")}
        </label>
        <textarea
          id="quick-sighting-description"
          value={description}
          onChange={(formEvent) => setDescription(formEvent.target.value)}
          rows={3}
          maxLength={500}
          placeholder={t("quickSighting.descPlaceholder")}
          className="mt-1 w-full rounded-md border border-felines-border bg-white px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-felines-text-primary">{t("quickSighting.locationLabel")}</label>
        <p className="mt-1 text-xs text-felines-text-secondary">
          {t("quickSighting.locationHint")}
        </p>
        <div className="mt-2 h-48 w-full overflow-hidden rounded-xl border border-felines-border">
          <MapMarkerPickerShell position={position} onPick={(lat, lng) => setPosition([lat, lng])} />
        </div>
      </div>

      {error && <p role="alert" className="text-sm text-felines-emergency">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          aria-busy={submitting}
          className="rounded-full bg-felines-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-felines-accent-hover disabled:opacity-50"
        >
          {submitting ? t("quickSighting.submitting") : t("quickSighting.submit")}
        </button>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-4 py-2 text-sm font-medium text-felines-text-secondary"
          >
            {t("common.cancel")}
          </button>
        )}
      </div>
    </form>
  );
}
