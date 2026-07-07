// Gate shown from the map's "Ver colônia" action — instead of going
// straight to the colony page, this asks whether the visitor actually
// wants to look after that colony, since the detailed page (cats,
// timeline, exact-ish narrative) is meant for people who'd realistically
// become caretakers, not casual browsing. Anyone who says no, or who
// isn't actually nearby, is told the detail page is caretaker-only and
// stays on the map.
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEscapeToClose } from "@/lib/useEscapeToClose";
import { useLanguage } from "@/lib/i18n";

type Step = "interest" | "proximity" | "denied";

export default function ColonyInterestModal({
  colonyId,
  onClose,
}: {
  colonyId: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const { t } = useLanguage();
  const [step, setStep] = useState<Step>("interest");
  useEscapeToClose(true, onClose);

  function goToColony() {
    router.push(`/colony/${colonyId}`);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="colony-interest-title"
        className="max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-xl bg-felines-background p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <h2 id="colony-interest-title" className="text-lg font-bold text-felines-text-primary">
            {t("colonyInterest.title")}
          </h2>
          <button
            onClick={onClose}
            aria-label={t("colonyInterest.close")}
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center text-xl leading-none text-felines-text-secondary hover:text-felines-text-primary"
          >
            ×
          </button>
        </div>

        {step === "interest" && (
          <>
            <p className="mt-3 text-sm text-felines-text-secondary">
              {t("colonyInterest.interestQuestion")}
            </p>
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setStep("proximity")}
                className="rounded-full bg-felines-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-felines-accent-hover"
              >
                {t("colonyInterest.yes")}
              </button>
              <button
                onClick={() => setStep("denied")}
                className="rounded-full border border-felines-border px-4 py-2 text-sm font-medium text-felines-text-secondary transition-colors hover:border-felines-accent hover:text-felines-accent-hover"
              >
                {t("colonyInterest.no")}
              </button>
            </div>
          </>
        )}

        {step === "proximity" && (
          <>
            <p className="mt-3 text-sm text-felines-text-secondary">
              {t("colonyInterest.proximityQuestion")}
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <button
                onClick={goToColony}
                className="rounded-full bg-felines-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-felines-accent-hover"
              >
                {t("colonyInterest.liveNearby")}
              </button>
              <button
                onClick={goToColony}
                className="rounded-full border border-felines-accent px-4 py-2 text-sm font-medium text-felines-accent-hover transition-colors hover:bg-felines-accent hover:text-white"
              >
                {t("colonyInterest.passByOften")}
              </button>
              <button
                onClick={() => setStep("denied")}
                className="rounded-full border border-felines-border px-4 py-2 text-sm font-medium text-felines-text-secondary transition-colors hover:border-felines-accent hover:text-felines-accent-hover"
              >
                {t("colonyInterest.noneOfTheAbove")}
              </button>
            </div>
          </>
        )}

        {step === "denied" && (
          <p className="mt-3 text-sm text-felines-text-secondary">
            {t("colonyInterest.denied")}
          </p>
        )}
      </div>
    </div>
  );
}
