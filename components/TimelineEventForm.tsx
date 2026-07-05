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
import { assertSafeStoragePath, buildSafeStoragePath, validatePhotoFile } from "@/lib/storage";
import { useColonyAccessContext } from "@/components/ColonyAccessProvider";
import PhotoUploadButton from "@/components/PhotoUploadButton";
import { useLanguage } from "@/lib/i18n";

const EVENT_TYPE_KEYS = [
  "castration_round",
  "health_issue",
  "new_cat",
  "feeding_change",
  "relocation",
  "photo_update",
  "other",
] as const;

export default function TimelineEventForm({ colonyId }: { colonyId: string }) {
  const router = useRouter();
  const { session, canManage, checkingAccess } = useColonyAccessContext();
  const { t } = useLanguage();

  const [eventType, setEventType] = useState<(typeof EVENT_TYPE_KEYS)[number]>(EVENT_TYPE_KEYS[0]);
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
      assertSafeStoragePath(filePath);
      const { error: uploadError } = await supabase.storage
        .from("colony-photos")
        .upload(filePath, photoFile);

      if (uploadError) {
        setSubmitting(false);
        setError(t("timelineForm.photoUploadError"));
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
      setError(t("timelineForm.insertError"));
      return;
    }

    await supabase.rpc("record_care_streak", { p_colony_id: colonyId });

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
        {t("timelineForm.formTitle")}
      </p>

      <div className="mt-3 flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="timeline-event-type" className="block text-xs font-medium text-felines-text-secondary">
            {t("timelineForm.typeLabel")}
          </label>
          <select
            id="timeline-event-type"
            value={eventType}
            onChange={(formEvent) => {
              const nextType = formEvent.target.value as typeof EVENT_TYPE_KEYS[number];
              setEventType(nextType);
              if (nextType !== "photo_update") setPhotoFile(null);
              setSubmitted(false);
            }}
            className="mt-1 rounded-md border border-felines-border bg-white px-3 py-2 text-sm"
          >
            {EVENT_TYPE_KEYS.map((key) => (
              <option key={key} value={key}>
                {t(`timelineForm.eventTypes.${key}`)}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label
            htmlFor="timeline-event-description"
            className="block text-xs font-medium text-felines-text-secondary"
          >
            {t("timelineForm.descLabel")}
          </label>
          <input
            id="timeline-event-description"
            type="text"
            value={description}
            onChange={(formEvent) => {
              setDescription(formEvent.target.value);
              setSubmitted(false);
            }}
            maxLength={300}
            className="mt-1 w-full rounded-md border border-felines-border bg-white px-3 py-3.5 text-sm"
          />
        </div>
      </div>

      {eventType === "photo_update" && (
        <div className="mt-3">
          <label className="block text-xs font-medium text-felines-text-secondary">
            {t("timelineForm.photoLabel")}
          </label>
          <div className="mt-1">
            <PhotoUploadButton
              label={t("common.choosePhoto")}
              file={photoFile}
              onChange={(file) => {
                setPhotoFile(file);
                setSubmitted(false);
              }}
            />
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        aria-busy={submitting}
        className="mt-3 rounded-full bg-felines-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-felines-accent-hover disabled:opacity-50"
      >
        {submitting ? t("forms.timeline.submitting") : t("forms.timeline.submit")}
      </button>

      {error && <p role="alert" className="mt-2 text-sm text-felines-emergency">{error}</p>}
      {submitted && <p role="status" className="mt-2 text-sm text-felines-success-hover">{t("timelineForm.success")}</p>}
    </form>
  );
}
