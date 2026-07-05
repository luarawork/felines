// Small, non-blocking tooltip shown the first time ever that a user
// clicks a colony pin on the map. Auto-dismisses after 4 seconds or on
// click, and never shows again (tracked in localStorage).
"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n";

const STORAGE_KEY = "felines_colony_click_tooltip_shown";

export function hasSeenColonyClickTooltip(): boolean {
  if (typeof window === "undefined") return true;
  return !!window.localStorage.getItem(STORAGE_KEY);
}

export function markColonyClickTooltipSeen(): void {
  window.localStorage.setItem(STORAGE_KEY, "true");
}

export default function ColonyClickTooltip({ onDismiss }: { onDismiss: () => void }) {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onDismiss();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  if (!visible) return null;

  return (
    <div
      className="absolute bottom-20 left-1/2 z-[1100] w-72 -translate-x-1/2 rounded-lg border border-felines-border bg-felines-surface px-4 py-3 text-sm shadow-lg"
      onClick={() => {
        setVisible(false);
        onDismiss();
      }}
    >
      {t("colonyClickTooltip.body")}
    </div>
  );
}
