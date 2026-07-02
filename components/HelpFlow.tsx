// Two-step "what should I do" wizard for the /help page.
// Step 1 asks what's happening, step 2 asks where, then shows tailored
// educational guidance and, when relevant, a way to submit a report
// directly from the flow — no login required, except for "Gato
// desaparecido", which opens the full LostCatForm and does require an
// account (so the owner can be identified for sighting replies).
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { submitReport } from "@/lib/submitReport";
import AnonymousReportNotice from "@/components/AnonymousReportNotice";
import MapMarkerPickerShell from "@/components/MapMarkerPickerShell";
import CreateAccountInvite from "@/components/CreateAccountInvite";
import LostCatForm from "@/components/LostCatForm";
import { useLanguage } from "@/lib/i18n";

type SituationKey =
  | "spotted"
  | "injured"
  | "kitten"
  | "abuse"
  | "disease"
  | "conflict"
  | "missing"
  | "threat"
  | "other";

type SituationMeta = {
  key: SituationKey;
  reportType: string | null;
  guidanceCount: number;
  hasAlert: boolean;
  relatedArticleSlug?: string;
};

// Static metadata — no translatable strings here. Translated content is
// looked up via t("helpFlow.situations.<key>.*") at render time.
// Order of the two-column grid (sm:grid-cols-2):
// col A: spotted, injured, kitten, missing, disease
// col B: conflict, abuse, threat, map_colony (special Link), other
const SITUATION_META: SituationMeta[] = [
  { key: "spotted",  reportType: "sighting",         guidanceCount: 2, hasAlert: true  },
  { key: "conflict", reportType: null,                guidanceCount: 2, hasAlert: false, relatedArticleSlug: "cats-bothering-your-building" },
  { key: "injured",  reportType: "injured_sick",      guidanceCount: 2, hasAlert: true,  relatedArticleSlug: "found-injured-cat-step-by-step" },
  { key: "abuse",    reportType: "suspected_abuse",   guidanceCount: 2, hasAlert: true,  relatedArticleSlug: "how-to-report-animal-abuse" },
  { key: "kitten",   reportType: "new_kitten",        guidanceCount: 2, hasAlert: false, relatedArticleSlug: "found-a-kitten-alone" },
  { key: "threat",   reportType: "threat_to_colony",  guidanceCount: 2, hasAlert: true  },
  { key: "missing",  reportType: "missing_cat",       guidanceCount: 2, hasAlert: true  },
  { key: "disease",  reportType: "disease_outbreak",  guidanceCount: 2, hasAlert: true  },
  { key: "other",    reportType: "sighting",          guidanceCount: 2, hasAlert: false },
];

export default function HelpFlow({ onClose }: { onClose?: () => void }) {
  const { t } = useLanguage();
  const [step, setStep] = useState<1 | 2>(1);
  const [activeMeta, setActiveMeta] = useState<SituationMeta | null>(null);
  const [locationCoords, setLocationCoords] = useState<[number, number] | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  // Lets a signed-out visitor explicitly choose to continue into
  // LostCatForm anyway (which then shows its own AuthRequiredNotice),
  // instead of only finding out login is required after already
  // opening the form.
  const [missingCatGuestConfirmed, setMissingCatGuestConfirmed] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setIsLoggedIn(!!data.session));
  }, []);

  // Sends a report using the situation's report type and the marked location.
  async function handleSubmitReport() {
    if (!activeMeta?.reportType) return;
    setSubmitting(true);
    setReportError(null);
    const { error } = await submitReport({
      type: activeMeta.reportType,
      latitude: locationCoords?.[0] ?? null,
      longitude: locationCoords?.[1] ?? null,
      status: "open",
    });
    setSubmitting(false);
    if (error) {
      setReportError(error);
    } else {
      setSubmitted(true);
      if (onClose) setTimeout(onClose, 1500);
    }
  }

  const situationLabel = activeMeta
    ? t(`helpFlow.situations.${activeMeta.key}.label`)
    : "";

  const situationGuidance = activeMeta
    ? Array.from({ length: activeMeta.guidanceCount }, (_, i) =>
        t(`helpFlow.situations.${activeMeta.key}.guidance.${i}`)
      )
    : [];

  const situationAlert = activeMeta?.hasAlert
    ? t(`helpFlow.situations.${activeMeta.key}.alert`)
    : null;

  const situationRelatedLabel = activeMeta?.relatedArticleSlug
    ? t(`helpFlow.situations.${activeMeta.key}.relatedLabel`)
    : null;

  return (
    <div className="mt-8">
      {step === 1 && (
        <div>
          <h2 className="text-lg font-semibold text-felines-text-primary">
            {t("helpFlow.title")}
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {SITUATION_META.flatMap((meta, index) => {
              const btn = (
                <button
                  key={meta.key}
                  onClick={() => {
                    setActiveMeta(meta);
                    setStep(2);
                    setMissingCatGuestConfirmed(false);
                  }}
                  className="rounded-xl border border-felines-border bg-felines-surface px-4 py-3 text-left text-sm font-medium text-felines-text-primary transition-colors hover:border-felines-accent"
                >
                  {t(`helpFlow.situations.${meta.key}.label`)}
                </button>
              );
              // "Colocar uma colônia no mapa" sits at column-B of row 4,
              // right after "Gato desaparecido" (index 6, 0-based).
              if (index === 6) {
                return [
                  btn,
                  <Link
                    key="map_colony"
                    href="/colony/new"
                    onClick={onClose}
                    className="rounded-xl border border-felines-border bg-felines-surface px-4 py-3 text-left text-sm font-medium text-felines-text-primary transition-colors hover:border-felines-accent"
                  >
                    {t("helpFlow.mapColony")}
                  </Link>,
                ];
              }
              return [btn];
            })}
          </div>
        </div>
      )}

      {step === 2 && activeMeta && (
        <div>
          <button
            onClick={() => setStep(1)}
            className="text-sm text-felines-text-secondary hover:text-felines-accent"
          >
            {t("helpFlow.back")}
          </button>

          {activeMeta.key === "missing" ? (
            <div className="mt-3 rounded-xl border border-felines-border bg-felines-surface p-5">
              <h3 className="font-semibold text-felines-text-primary">{situationLabel}</h3>
              <ul className="mt-3 space-y-2">
                {situationGuidance.map((line) => (
                  <li
                    key={line}
                    className="flex gap-2 text-sm leading-relaxed text-felines-text-secondary"
                  >
                    <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-felines-success" />
                    {line}
                  </li>
                ))}
              </ul>
              {situationAlert && (
                <p className="mt-3 rounded-md bg-felines-warning/10 px-3 py-2 text-sm text-felines-text-primary">
                  {situationAlert}
                </p>
              )}
              <div className="mt-5">
                {!isLoggedIn && !missingCatGuestConfirmed ? (
                  <div className="rounded-md bg-felines-warning/10 px-3 py-3 text-sm text-felines-text-primary">
                    <p>{t("helpFlow.loginRequired")}</p>
                    <div className="mt-3 flex flex-wrap gap-3">
                      <Link
                        href="/login?returnTo=/help"
                        className="rounded-full bg-felines-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-felines-accent-hover"
                      >
                        {t("helpFlow.signIn")}
                      </Link>
                      <button
                        onClick={() => setMissingCatGuestConfirmed(true)}
                        className="text-sm font-medium text-felines-text-secondary hover:text-felines-accent"
                      >
                        {t("helpFlow.continueGuest")}
                      </button>
                    </div>
                  </div>
                ) : (
                  <LostCatForm onSubmitted={onClose} />
                )}
              </div>
            </div>
          ) : (
            <>
              <h2 className="mt-3 text-lg font-semibold text-felines-text-primary">
                {t("helpFlow.whereTitle")}
              </h2>
              {activeMeta.reportType && !isLoggedIn && <AnonymousReportNotice />}
              <p className="mt-2 text-xs text-felines-text-secondary">
                {t("helpFlow.dragPin")}
              </p>
              <div className="mt-2 h-48 w-full overflow-hidden rounded-xl border border-felines-border">
                <MapMarkerPickerShell
                  position={locationCoords}
                  onPick={(lat, lng) => setLocationCoords([lat, lng])}
                />
              </div>

              <div className="mt-6 rounded-xl border border-felines-border bg-felines-surface p-5">
                <h3 className="font-semibold text-felines-text-primary">{situationLabel}</h3>
                <ul className="mt-3 space-y-2">
                  {situationGuidance.map((line) => (
                    <li
                      key={line}
                      className="flex gap-2 text-sm leading-relaxed text-felines-text-secondary"
                    >
                      <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-felines-success" />
                      {line}
                    </li>
                  ))}
                </ul>

                {situationAlert && (
                  <p className="mt-3 rounded-md bg-felines-warning/10 px-3 py-2 text-sm text-felines-text-primary">
                    {situationAlert}
                  </p>
                )}

                {activeMeta.relatedArticleSlug && (
                  <Link
                    href={`/learn/${activeMeta.relatedArticleSlug}`}
                    onClick={onClose}
                    className="mt-3 inline-block text-sm font-medium text-felines-accent hover:text-felines-accent-hover"
                  >
                    {situationRelatedLabel ?? t("common.learnMore")}
                  </Link>
                )}

                {reportError && !submitted && (
                  <p className="mt-3 text-sm text-felines-emergency">{reportError}</p>
                )}

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  {activeMeta.reportType && !submitted && (
                    <button
                      onClick={handleSubmitReport}
                      disabled={submitting}
                      className="rounded-full bg-felines-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-felines-accent-hover disabled:opacity-50"
                    >
                      {submitting ? t("helpFlow.submitting") : t("helpFlow.submit")}
                    </button>
                  )}
                  {submitted && (
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-3">
                        <p className="text-sm text-felines-success-hover">
                          {t("helpFlow.submitted")}
                        </p>
                        {onClose && (
                          <button
                            onClick={onClose}
                            className="text-sm font-medium text-felines-text-secondary hover:text-felines-accent"
                          >
                            {t("helpFlow.close")}
                          </button>
                        )}
                      </div>
                      {!isLoggedIn && <CreateAccountInvite />}
                    </div>
                  )}
                  <Link
                    href="/#aprender"
                    onClick={onClose}
                    className="rounded-full border border-felines-accent px-4 py-2 text-sm font-medium text-felines-accent-hover transition-colors hover:bg-felines-accent hover:text-white"
                  >
                    {t("helpFlow.understand")}
                  </Link>
                  <Link
                    href="/map"
                    onClick={onClose}
                    className="rounded-full border border-felines-border px-4 py-2 text-sm font-medium text-felines-text-secondary transition-colors hover:border-felines-accent hover:text-felines-accent"
                  >
                    {t("helpFlow.seeColonies")}
                  </Link>
                  <Link
                    href="/colony/new"
                    onClick={onClose}
                    className="rounded-full border border-felines-border px-4 py-2 text-sm font-medium text-felines-text-secondary transition-colors hover:border-felines-accent hover:text-felines-accent"
                  >
                    {t("helpFlow.addColony")}
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
