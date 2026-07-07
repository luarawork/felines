// Report button shown on colony and map pages.
// Lets anyone (no login required) open a modal with a small form and
// submit a report tied to a colony. Reports are insert-only for the
// public; reading full report status requires authentication (enforced
// by RLS).
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { REPORT_TYPES, getReportTypeLabel } from "@/lib/content/reportTypes";
import { submitReport } from "@/lib/data/submitReport";
import AnonymousReportNotice from "@/components/reports/AnonymousReportNotice";
import CreateAccountInvite from "@/components/auth/CreateAccountInvite";
import { useEscapeToClose } from "@/lib/useEscapeToClose";
import { useLanguage } from "@/lib/i18n";

export default function ReportButton({ colonyId }: { colonyId: string }) {
  const { t, language } = useLanguage();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState(REPORT_TYPES[0].value);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setIsLoggedIn(!!data.session);
    });
  }, []);

  function handleClose() {
    setOpen(false);
    setSubmitted(false);
    setError(null);
  }

  useEscapeToClose(open, handleClose);

  // Validates and submits the report to Supabase.
  async function handleSubmit(formEvent: React.FormEvent) {
    formEvent.preventDefault();
    setError(null);

    if (!type) {
      setError(t("forms.report.typeRequired"));
      return;
    }

    setSubmitting(true);
    const { error: submitError } = await submitReport({
      colony_id: colonyId,
      type,
      description: description.trim() || null,
      status: "open",
      language,
    });
    setSubmitting(false);

    if (submitError) {
      setError(submitError);
      return;
    }

    setSubmitted(true);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-full border border-felines-emergency px-4 py-2 text-sm font-medium text-felines-emergency transition-colors hover:bg-felines-emergency hover:text-white"
      >
        {t("forms.report.triggerLabel")}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40 p-4"
          onClick={handleClose}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-modal-title"
            className="max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-xl bg-felines-background p-5 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <h2 id="report-modal-title" className="text-lg font-bold text-felines-text-primary">
                {t("forms.report.title")}
              </h2>
              <button
                onClick={handleClose}
                aria-label={t("forms.report.close")}
                className="flex h-11 w-11 flex-shrink-0 items-center justify-center text-xl leading-none text-felines-text-secondary hover:text-felines-text-primary"
              >
                ×
              </button>
            </div>

            {submitted ? (
              <div className="mt-4">
                <p className="rounded-lg border border-felines-success bg-felines-success/10 px-4 py-3 text-sm text-felines-success-hover" role="status">
                  {t("forms.report.submitted")}
                </p>
                {!isLoggedIn && <CreateAccountInvite />}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-4">
                {!isLoggedIn && <AnonymousReportNotice />}

                <label
                  htmlFor="report-type"
                  className="block text-xs font-medium text-felines-text-secondary"
                >
                  {t("forms.report.typeLabel")}
                </label>
                <select
                  id="report-type"
                  value={type}
                  onChange={(formEvent) => setType(formEvent.target.value)}
                  className="mt-1 w-full rounded-md border border-felines-border bg-white px-3 py-3.5 text-sm"
                >
                  {REPORT_TYPES.map((reportType) => (
                    <option key={reportType.value} value={reportType.value}>
                      {getReportTypeLabel(reportType.value, t)}
                    </option>
                  ))}
                </select>

                <label
                  htmlFor="report-description"
                  className="mt-3 block text-xs font-medium text-felines-text-secondary"
                >
                  {t("forms.report.descLabel")}
                </label>
                <textarea
                  id="report-description"
                  value={description}
                  onChange={(formEvent) => setDescription(formEvent.target.value)}
                  maxLength={500}
                  rows={3}
                  className="mt-1 w-full rounded-md border border-felines-border bg-white px-3 py-3.5 text-sm"
                />

                {error && <p role="alert" className="mt-2 text-xs text-felines-emergency">{error}</p>}

                <div className="mt-3 flex gap-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    aria-busy={submitting}
                    className="rounded-full bg-felines-emergency px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                  >
                    {submitting ? t("forms.report.submitting") : t("forms.report.submit")}
                  </button>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="rounded-full px-4 py-2 text-sm font-medium text-felines-text-secondary"
                  >
                    {t("common.cancel")}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
