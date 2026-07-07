"use client";
// Small pill badge shown on colony map popups to explain why the pin
// isn't at the exact location. Location blur protects cats from
// malicious users who could use exact coordinates to find and harm
// animals — so the badge exists to make that tradeoff visible, not to
// apologize for it.
import { useLanguage } from "@/lib/i18n";

export type LocationAccessLevel = 1 | 2 | 3;

export default function LocationBlurBadge({ level }: { level: LocationAccessLevel }) {
  const { t } = useLanguage();
  if (level === 3) return null;

  const text = level === 1 ? t("locationBlur.signIn") : t("locationBlur.becomeCaretaker");

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full bg-felines-warning-light px-2 py-1 text-xs font-medium text-felines-warning-hover"
    >
      🔒 {text}
    </span>
  );
}
