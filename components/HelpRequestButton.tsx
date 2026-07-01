// Trigger + modal for a caretaker to post a time-bound help request for
// their colony. Gated by canManage, same pattern as ShareStoryButton/
// EditColonyButton.
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useColonyAccessContext } from "@/components/ColonyAccessProvider";
import { useEscapeToClose } from "@/lib/useEscapeToClose";
import { HELP_REQUEST_TYPES, getHelpRequestTypeLabel } from "@/lib/helpRequestTypes";
import { useLanguage } from "@/lib/i18n";

export default function HelpRequestButton({ colonyId }: { colonyId: string }) {
  const router = useRouter();
  const { session, canManage, checkingAccess } = useColonyAccessContext();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState(HELP_REQUEST_TYPES[0].value);
  const [description, setDescription] = useState("");
  const [urgency, setUrgency] = useState<"normal" | "urgent">("normal");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEscapeToClose(open, () => setOpen(false));

  async function handleSubmit(formEvent: React.FormEvent) {
    formEvent.preventDefault();
    setError(null);

    if (!description.trim()) {
      setError(t("forms.helpRequest.descRequired"));
      return;
    }
    if (!session) return;

    setSubmitting(true);
    const { error: insertError } = await supabase.from("help_requests").insert({
      colony_id: colonyId,
      created_by: session.user.id,
      type,
      description: description.trim(),
      urgency,
    });
    setSubmitting(false);

    if (insertError) {
      setError(t("forms.helpRequest.insertError"));
      return;
    }

    await supabase.rpc("notify_followers", {
      p_colony_id: colonyId,
      p_type: "help_request_posted",
      p_message: `Uma colônia que você segue precisa de ajuda: ${getHelpRequestTypeLabel(type, t)}.`,
    });

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
        {t("forms.helpRequest.trigger")}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="help-request-title"
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-felines-background p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <h2 id="help-request-title" className="text-lg font-bold text-felines-text-primary">
                {t("forms.helpRequest.title")}
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
                <p className="rounded-lg border border-felines-success bg-felines-success/10 px-4 py-3 text-sm text-felines-success">
                  {t("forms.helpRequest.submitted")}
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
                  <label htmlFor="help-type" className="block text-xs font-medium text-felines-text-secondary">
                    {t("forms.helpRequest.typeLabel")}
                  </label>
                  <select
                    id="help-type"
                    value={type}
                    onChange={(event) => setType(event.target.value)}
                    className="mt-1 w-full rounded-md border border-felines-border bg-white px-3 py-2 text-sm"
                  >
                    {HELP_REQUEST_TYPES.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.icon} {getHelpRequestTypeLabel(option.value, t)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="help-description" className="block text-xs font-medium text-felines-text-secondary">
                    {t("forms.helpRequest.descLabel")}
                  </label>
                  <textarea
                    id="help-description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    maxLength={200}
                    rows={3}
                    className="mt-1 w-full rounded-md border border-felines-border bg-white px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <span className="block text-xs font-medium text-felines-text-secondary">{t("forms.helpRequest.urgencyLabel")}</span>
                  <div className="mt-1 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setUrgency("normal")}
                      className={`rounded-full border px-3 py-1 text-xs font-medium ${
                        urgency === "normal"
                          ? "border-felines-accent bg-felines-accent-light text-felines-text-primary"
                          : "border-felines-border text-felines-text-secondary"
                      }`}
                    >
                      {t("forms.helpRequest.urgencyNormal")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setUrgency("urgent")}
                      className={`rounded-full border px-3 py-1 text-xs font-medium ${
                        urgency === "urgent"
                          ? "border-felines-emergency bg-felines-emergency text-white"
                          : "border-felines-border text-felines-text-secondary"
                      }`}
                    >
                      {t("forms.helpRequest.urgencyUrgent")}
                    </button>
                  </div>
                </div>

                {error && <p role="alert" className="text-sm text-felines-emergency">{error}</p>}

                <button
                  type="submit"
                  disabled={submitting}
                  aria-busy={submitting}
                  className="rounded-full bg-felines-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-felines-accent-hover disabled:opacity-50"
                >
                  {submitting ? t("forms.helpRequest.submitting") : t("forms.helpRequest.submit")}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
