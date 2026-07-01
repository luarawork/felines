// Small ghost share button reused on article, colony, and /impact pages.
// Uses the Web Share API where available (mobile browsers, mainly) and
// falls back to copying the current URL to the clipboard everywhere
// else — there's no server-side way to tell "mobile" reliably, so this
// branches on API availability instead of user agent sniffing.
"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n";

export default function ShareButton({
  title,
  onDark = false,
}: {
  title: string;
  // Light border/text don't have enough contrast on this app's dark
  // sections (bg-felines-dark, #2D1810) — same pattern as FlagButton's
  // onDark prop.
  onDark?: boolean;
}) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // User cancelled the native share sheet — not an error to surface.
      }
      return;
    }

    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleShare}
      aria-label={t("share.trigger")}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors hover:border-felines-accent hover:text-felines-accent ${
        onDark
          ? "border-felines-border-on-dark text-felines-text-secondary-on-dark"
          : "border-felines-border text-felines-text-secondary"
      }`}
    >
      <span aria-hidden="true">🔗</span>
      <span className="hidden sm:inline">{copied ? t("share.copied") : t("share.trigger")}</span>
    </button>
  );
}
