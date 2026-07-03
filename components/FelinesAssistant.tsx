// Floating cat assistant — a small looping video of a cat, shown inside
// a rounded card/circle bottom-right (not blended into the page
// background). After a short delay a speech bubble surfaces one
// bite-sized cat curiosity; dismissing the bubble lets the video keep
// playing instead of yanking it off mid-animation.
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
          className="relative rounded-2xl border border-felines-border bg-felines-surface p-4 shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
        >
          <button
            type="button"
            onClick={() => {
              setIsVisible(false);
              onComplete();
            }}
            aria-label={t("assistant.dismiss")}
            className="absolute right-0 top-0 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-felines-text-secondary hover:text-felines-text-primary"
          >
            ✕
          </button>
          <p className="pr-8 text-xs font-semibold uppercase tracking-[0.08em] text-felines-accent-hover">
            {label}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-felines-text-primary">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pointer-events-none fixed bottom-[126px] right-4 z-40 sm:bottom-6 sm:right-6">
      {showBubble && (
        <div className="pointer-events-auto absolute bottom-[118px] right-0 w-64 sm:bottom-[140px]">
          <div
            role="status"
            aria-live="polite"
            className="felines-step-in relative rounded-2xl border border-felines-border bg-felines-surface p-4 shadow-[0_8px_24px_rgba(0,0,0,0.14)]"
          >
            <button
              type="button"
              onClick={handleDismiss}
              aria-label={t("assistant.dismiss")}
              className="absolute right-0 top-0 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-felines-text-secondary hover:text-felines-text-primary"
            >
              ✕
            </button>
            <p className="pr-8 text-xs font-semibold uppercase tracking-[0.08em] text-felines-accent-hover">
              {label}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-felines-text-primary">{message}</p>
          </div>
          {/* Triangle pointer aimed down at the circular video card. */}
          <div
            aria-hidden="true"
            className="absolute -bottom-2 right-8 h-4 w-4 rotate-45 border-b border-r border-felines-border bg-felines-surface"
          />
        </div>
      )}

      <div className="h-[110px] w-[110px] overflow-hidden rounded-full border-2 border-felines-surface bg-felines-surface shadow-[0_8px_24px_rgba(0,0,0,0.18)] sm:h-[130px] sm:w-[130px]">
        <video
          ref={videoRef}
          src="/videos/catcurious.mp4"
          aria-hidden="true"
          preload="none"
          autoPlay
          muted
          playsInline
          onEnded={handleVideoEnd}
          onError={handleVideoEnd}
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  );
}
