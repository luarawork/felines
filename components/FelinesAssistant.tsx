// Floating cat assistant — a small video of a cat walking in from the
// bottom-right corner, blending into the page's own background color
// (#F2F2F2, matching public/videos/f2f2f2.mp4) so it reads as "a cat
// wandered onscreen" rather than a boxed widget. After a short delay a
// speech bubble surfaces one bite-sized cat curiosity; dismissing the
// bubble lets the cat keep walking and leave naturally instead of
// yanking it off mid-animation.
"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/lib/i18n";
import type { CatCuriosity } from "@/lib/catCuriosities";

export type AssistantTrigger = {
  id: string;
  curiosity: CatCuriosity;
};

const BUBBLE_DELAY_MS = 3500;
const REDUCED_MOTION_AUTO_DISMISS_MS = 8000;

export default function FelinesAssistant({
  trigger,
  onComplete,
}: {
  trigger: AssistantTrigger;
  onComplete: () => void;
}) {
  const { language, t } = useLanguage();
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Reduced motion shows the bubble immediately (no video to wait on).
  const [showBubble, setShowBubble] = useState(prefersReducedMotion);
  const [isVisible, setIsVisible] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const label = language === "en" ? trigger.curiosity.label_en : trigger.curiosity.label_pt;
  const message = language === "en" ? trigger.curiosity.message_en : trigger.curiosity.message_pt;

  useEffect(() => {
    if (prefersReducedMotion) {
      // No video at all — a plain static toast is the whole
      // experience, auto-dismissed instead of waiting on a video
      // that will never play.
      const timeout = setTimeout(() => {
        setIsVisible(false);
        onComplete();
      }, REDUCED_MOTION_AUTO_DISMISS_MS);
      return () => clearTimeout(timeout);
    }

    const timeout = setTimeout(() => setShowBubble(true), BUBBLE_DELAY_MS);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only needs to run once per mount (one trigger = one appearance)
  }, []);

  if (!isVisible) return null;

  function handleDismiss() {
    setShowBubble(false);
    // Video keeps playing — the cat walks away on its own instead of
    // vanishing mid-stride the instant the bubble closes.
  }

  function handleVideoEnd() {
    setIsVisible(false);
    onComplete();
  }

  if (prefersReducedMotion) {
    return (
      <div className="fixed bottom-24 right-4 z-40 max-w-xs sm:bottom-6">
        <div
          role="status"
          aria-live="polite"
          className="rounded-2xl border border-felines-border bg-felines-surface p-4 shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-felines-accent-hover">
              {label}
            </p>
            <button
              type="button"
              onClick={() => {
                setIsVisible(false);
                onComplete();
              }}
              aria-label={t("assistant.dismiss")}
              className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-felines-text-secondary hover:text-felines-text-primary"
            >
              ✕
            </button>
          </div>
          <p className="mt-1 text-sm leading-relaxed text-felines-text-primary">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pointer-events-none fixed bottom-[120px] right-0 z-40 sm:bottom-0">
      {showBubble && (
        <div className="pointer-events-auto absolute bottom-[104px] right-4 w-64 sm:bottom-24 sm:right-8">
          <div
            role="status"
            aria-live="polite"
            className="felines-step-in rounded-2xl border border-felines-border bg-felines-surface p-4 shadow-[0_8px_24px_rgba(0,0,0,0.14)]"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-felines-accent-hover">
                {label}
              </p>
              <button
                type="button"
                onClick={handleDismiss}
                aria-label={t("assistant.dismiss")}
                className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-felines-text-secondary hover:text-felines-text-primary"
              >
                ✕
              </button>
            </div>
            <p className="mt-1 text-sm leading-relaxed text-felines-text-primary">{message}</p>
          </div>
          {/* Triangle pointer aimed down-right at the cat's video. */}
          <div
            aria-hidden="true"
            className="absolute -bottom-2 right-8 h-4 w-4 rotate-45 border-b border-r border-felines-border bg-felines-surface"
          />
        </div>
      )}

      <video
        ref={videoRef}
        src="/videos/f2f2f2.mp4"
        aria-hidden="true"
        autoPlay
        muted
        playsInline
        onEnded={handleVideoEnd}
        className="h-[120px] w-[160px] object-cover sm:h-[140px] sm:w-[200px]"
      />
    </div>
  );
}
