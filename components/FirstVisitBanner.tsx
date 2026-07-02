// Soft welcome banner shown once to first-time visitors of the home
// page. Closing it (or simply having visited before) hides it for good
// via localStorage — it's just a friendly orientation, not something
// that should nag a returning visitor.
"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n";
import AboutFelinesModal from "@/components/AboutFelinesModal";

const STORAGE_KEY = "felines_seen_first_visit_banner";

export default function FirstVisitBanner() {
  const [visible, setVisible] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    // Responding to a one-time localStorage check on mount, not deriving
    // render state from props/state — outside what this lint rule covers.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisible(localStorage.getItem(STORAGE_KEY) !== "true");
  }, []);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "true");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="mb-8 flex items-start justify-between gap-4 rounded-xl border border-felines-accent/30 bg-felines-accent/5 px-4 py-3 text-sm">
      <p className="text-felines-text-primary">
        {t("common.firstVisit")}{" "}
        <AboutFelinesModal
          trigger={(open) => (
            <button
              onClick={open}
              className="font-semibold text-felines-accent-hover underline hover:text-felines-accent"
            >
              {t("common.firstVisitLearnMore")}
            </button>
          )}
        />
      </p>
      <button
        onClick={dismiss}
        aria-label={t("common.close")}
        className="flex h-11 w-11 flex-shrink-0 items-center justify-center text-lg leading-none text-felines-text-secondary hover:text-felines-text-primary"
      >
        ×
      </button>
    </div>
  );
}
