// Small "Flag" link that opens a simple reason form and records a flag
// for later moderation review. No automated action happens — this just
// creates a row in the `flags` table. Anyone can flag, same as anyone
// can submit a report, since waiting for an account would defeat the
// point of flagging something harmful quickly.
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useLanguage } from "@/lib/i18n";

export function getFlagReasons(t: (key: string) => string): { value: string; label: string }[] {
  return [
    { value: "fake_location", label: t("flag.reasons.fake_location") },
    { value: "harmful_content", label: t("flag.reasons.harmful_content") },
    { value: "spam", label: t("flag.reasons.spam") },
    { value: "other", label: t("flag.reasons.other") },
  ];
}

export function getFlagReasonLabel(value: string, t: (key: string) => string): string {
  return getFlagReasons(t).find((reason) => reason.value === value)?.label ?? value;
}

export default function FlagButton({
  targetType,
  targetId,
  onDark = false,
}: {
  targetType: "colony" | "report" | "profile";
  targetId: string;
  // The trigger text needs a lighter color on this app's dark sections
  // (bg-felines-dark) — the default felines-text-secondary gray was
  // built for light backgrounds and is too low-contrast there.
  onDark?: boolean;
}) {
  const { t } = useLanguage();
  const FLAG_REASONS = getFlagReasons(t);
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(FLAG_REASONS[0].value);
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUserId(data.session?.user.id ?? null));
  }, []);

  async function handleSubmit(formEvent: React.FormEvent) {
    formEvent.preventDefault();
    setSubmitting(true);

    // Only signed-in users are deduped at the DB level (see migration
    // 0066) — anonymous flags (created_by null) have no stable identity
    // to check against, same limitation as StoryHeartButton.
    const { error: insertError } = await supabase.from("flags").insert({
      target_type: targetType,
      target_id: targetId,
      reason,
      details: details.trim() || null,
      created_by: userId,
    });

    setSubmitting(false);
    // A unique-violation here just means this user already flagged this
    // target for this reason — treat it the same as a fresh success
    // instead of surfacing a raw DB error.
    if (!insertError || insertError.code === "23505") {
      setSubmitted(true);
    }
  }

  if (submitted) {
    return (
      <p className={`text-xs ${onDark ? "text-felines-text-secondary-on-dark" : "text-felines-text-secondary"}`}>
        {t("flag.submitted")}
      </p>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className={`text-xs underline hover:text-felines-emergency ${
          onDark ? "text-felines-text-secondary-on-dark" : "text-felines-text-secondary"
        }`}
      >
        {t("flag.trigger")}
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="felines-step-in mt-2 max-w-xs rounded-md border border-felines-border bg-felines-surface p-3"
    >
      <label htmlFor="flag-reason" className="text-xs font-medium text-felines-text-primary">
        {t("flag.reasonLabel")}
      </label>
      <select
        id="flag-reason"
        value={reason}
        onChange={(formEvent) => setReason(formEvent.target.value)}
        className="mt-1 w-full rounded-md border border-felines-border bg-white px-2 py-1 text-xs"
      >
        {FLAG_REASONS.map((flagReason) => (
          <option key={flagReason.value} value={flagReason.value}>
            {flagReason.label}
          </option>
        ))}
      </select>
      <textarea
        aria-label={t("flag.detailsAriaLabel")}
        value={details}
        onChange={(formEvent) => setDetails(formEvent.target.value)}
        placeholder={t("flag.detailsPlaceholder")}
        maxLength={300}
        rows={2}
        className="mt-2 w-full rounded-md border border-felines-border bg-white px-2 py-1 text-xs"
      />
      <div className="mt-2 flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-felines-emergency px-3 py-1 text-xs font-medium text-white disabled:opacity-50"
        >
          {submitting ? t("forms.report.submitting") : t("forms.report.submit")}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs text-felines-text-secondary"
        >
          {t("flag.cancel")}
        </button>
      </div>
    </form>
  );
}
