// Lets anyone — no account required, same as any other report — say
// "I saw this cat" on a lost-cat report, marking where, with an
// optional note. Creates a new sighting report linked back to the
// original via related_report_id, which is how the owner finds out:
// there's no email/push notification system, so this is surfaced
// in-app on /reports instead (see the "Avistamentos" list there).
"use client";

import { useState } from "react";
import { submitReport } from "@/lib/submitReport";
import MapMarkerPickerShell from "@/components/MapMarkerPickerShell";
import { useLanguage } from "@/lib/i18n";

export default function SightingReportButton({ lostCatReportId }: { lostCatReportId: string }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [locationCoords, setLocationCoords] = useState<[number, number] | null>(null);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(formEvent: React.FormEvent) {
    formEvent.preventDefault();
    setSubmitting(true);

    const { error } = await submitReport({
      type: "sighting",
      description: note.trim()
        ? t("sightingReportButton.descriptionWithNote").replace("{note}", note.trim())
        : t("sightingReportButton.descriptionNoNote"),
      related_report_id: lostCatReportId,
      latitude: locationCoords?.[0] ?? null,
      longitude: locationCoords?.[1] ?? null,
      status: "open",
    });

    setSubmitting(false);
    if (!error) setSubmitted(true);
  }

  if (submitted) {
    return <p role="status" className="text-xs text-felines-success-hover">{t("sightingReportButton.thankYouOwnerNotified")}</p>;
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-full border border-felines-accent px-3 py-1 text-xs font-medium text-felines-accent-hover transition-colors hover:bg-felines-accent hover:text-white"
      >
        {t("sightingReportButton.trigger")}
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-2 max-w-xs rounded-md border border-felines-border bg-white p-3"
    >
      <label className="block text-xs font-medium text-felines-text-secondary">
        {t("sightingReportButton.whereYouSaw")}
      </label>
      <div className="mt-1 h-40 w-full overflow-hidden rounded-md border border-felines-border">
        <MapMarkerPickerShell
          position={locationCoords}
          onPick={(lat, lng) => setLocationCoords([lat, lng])}
        />
      </div>
      <label
        htmlFor="sighting-note"
        className="mt-2 block text-xs font-medium text-felines-text-secondary"
      >
        {t("sightingReportButton.notePlaceholder")}
      </label>
      <textarea
        id="sighting-note"
        value={note}
        onChange={(formEvent) => setNote(formEvent.target.value)}
        rows={2}
        maxLength={300}
        className="mt-1 w-full rounded-md border border-felines-border bg-white px-2 py-1 text-sm"
      />
      <div className="mt-2 flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-felines-accent px-3 py-1 text-xs font-medium text-white disabled:opacity-50"
        >
          {submitting ? t("forms.report.submitting") : t("forms.report.submit")}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-xs text-felines-text-secondary">
          {t("common.cancel")}
        </button>
      </div>
    </form>
  );
}
