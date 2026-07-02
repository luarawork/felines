// Trigger + modal for a caretaker to formally register a neutering need
// for their colony. Gated by canManage, same pattern as
// HelpRequestButton/ShareStoryButton.
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useColonyAccessContext } from "@/components/ColonyAccessProvider";
import { useEscapeToClose } from "@/lib/useEscapeToClose";
import { useLanguage } from "@/lib/i18n";

export default function NeuteringRequestButton({ colonyId }: { colonyId: string }) {
  const router = useRouter();
  const { session, canManage, checkingAccess } = useColonyAccessContext();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [catsCount, setCatsCount] = useState(1);
  const [urgency, setUrgency] = useState<"low" | "medium" | "high">("medium");
  const [transportAvailable, setTransportAvailable] = useState<"yes" | "no" | "need_help">("no");
  const [bestTimes, setBestTimes] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEscapeToClose(open, () => setOpen(false));

  async function handleSubmit(formEvent: React.FormEvent) {
    formEvent.preventDefault();
    setError(null);

    if (!session) return;
    if (catsCount < 1) {
      setError(t("forms.neutering.catsRequired"));
      return;
    }

    setSubmitting(true);
    const { error: insertError } = await supabase.from("neutering_requests").insert({
      colony_id: colonyId,
      created_by: session.user.id,
      cats_count: catsCount,
      urgency,
      transport_available: transportAvailable,
      best_times: bestTimes.trim() || null,
      notes: notes.trim() || null,
    });
    setSubmitting(false);

    if (insertError) {
      setError(t("forms.neutering.insertError"));
      return;
    }

    setSubmitted(true);
    router.refresh();
  }

  if (checkingAccess || !canManage) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-full border border-felines-border px-4 py-2 text-sm font-medium text-felines-text-secondary transition-colors hover:border-felines-accent hover:text-felines-accent-hover"
      >
        {t("forms.neutering.trigger")}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="neutering-request-title"
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-felines-background p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <h2 id="neutering-request-title" className="text-lg font-bold text-felines-text-primary">
                {t("forms.neutering.title")}
              </h2>
              <button
                onClick={() => setOpen(false)}
                aria-label={t("common.close")}
                className="flex h-11 w-11 flex-shrink-0 items-center justify-center text-xl leading-none text-felines-text-secondary hover:text-felines-text-primary"
              >
                ×
              </button>
            </div>

            {submitted ? (
              <div className="mt-4">
                <p className="rounded-lg border border-felines-success bg-felines-success/10 px-4 py-3 text-sm text-felines-success-hover" role="status">
                  {t("forms.neutering.submitted")}
                </p>
                <button
                  onClick={() => setOpen(false)}
                  className="mt-3 text-sm font-medium text-felines-text-secondary hover:text-felines-text-primary"
                >
                  {t("common.close")}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-4 space-y-3">
                <div>
                  <label htmlFor="cats-count" className="block text-xs font-medium text-felines-text-secondary">
                    {t("forms.neutering.catsCountLabel")}
                  </label>
                  <input
                    id="cats-count"
                    type="number"
                    min={1}
                    value={catsCount}
                    onChange={(event) => setCatsCount(parseInt(event.target.value, 10) || 1)}
                    className="mt-1 w-full rounded-md border border-felines-border bg-white px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <span className="block text-xs font-medium text-felines-text-secondary">{t("forms.neutering.urgencyLabel")}</span>
                  <div className="mt-1 flex gap-2">
                    {(["low", "medium", "high"] as const).map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setUrgency(level)}
                        className={`rounded-full border px-3 py-1 text-xs font-medium ${
                          urgency === level
                            ? "border-felines-accent bg-felines-accent-light text-felines-text-primary"
                            : "border-felines-border text-felines-text-secondary"
                        }`}
                      >
                        {t(`urgency.${level}`)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="transport" className="block text-xs font-medium text-felines-text-secondary">
                    {t("forms.neutering.transportLabel")}
                  </label>
                  <select
                    id="transport"
                    value={transportAvailable}
                    onChange={(event) => setTransportAvailable(event.target.value as "yes" | "no" | "need_help")}
                    className="mt-1 w-full rounded-md border border-felines-border bg-white px-3 py-2 text-sm"
                  >
                    <option value="yes">{t("transport.yes")}</option>
                    <option value="no">{t("transport.no")}</option>
                    <option value="need_help">{t("transport.need_help")}</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="best-times" className="block text-xs font-medium text-felines-text-secondary">
                    {t("forms.neutering.bestTimesLabel")}
                  </label>
                  <input
                    id="best-times"
                    type="text"
                    value={bestTimes}
                    onChange={(event) => setBestTimes(event.target.value)}
                    maxLength={120}
                    className="mt-1 w-full rounded-md border border-felines-border bg-white px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="notes" className="block text-xs font-medium text-felines-text-secondary">
                    {t("forms.neutering.notesLabel")}
                  </label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    maxLength={300}
                    rows={3}
                    className="mt-1 w-full rounded-md border border-felines-border bg-white px-3 py-2 text-sm"
                  />
                </div>

                {error && <p role="alert" className="text-sm text-felines-emergency">{error}</p>}

                <button
                  type="submit"
                  disabled={submitting}
                  aria-busy={submitting}
                  className="rounded-full bg-felines-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-felines-accent-hover disabled:opacity-50"
                >
                  {submitting ? t("forms.neutering.submitting") : t("forms.neutering.submit")}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
