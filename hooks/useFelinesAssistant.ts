// Controls when and which cat curiosity appears based on user behavior
// and current page context. Mounted once, globally, from
// FelinesAssistantWrapper — every trigger below is a candidate the hook
// itself decides whether to fire, so the assistant never competes with
// itself and never interrupts something the visitor is doing.
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { getCuriosityById, getRandomCuriosity } from "@/lib/catCuriosities";
import type { AssistantTrigger } from "@/components/FelinesAssistant";

const MIN_MINUTES_BETWEEN_APPEARANCES = 15;
const LAST_SHOWN_KEY = "felines_assistant_last";
const VISITED_KEY = "felines_visited";
const FIRST_COLONY_KEY = "felines_first_colony";

function isModalOpen(): boolean {
  return document.querySelector('[role="dialog"], [role="alertdialog"]') !== null;
}

function isUserTyping(): boolean {
  const active = document.activeElement;
  return active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement;
}

function canShowNow(): boolean {
  if (isModalOpen() || isUserTyping()) return false;
  const last = sessionStorage.getItem(LAST_SHOWN_KEY) ?? localStorage.getItem(LAST_SHOWN_KEY);
  if (!last) return true;
  const minutesSince = (Date.now() - Number(last)) / (1000 * 60);
  return minutesSince >= MIN_MINUTES_BETWEEN_APPEARANCES;
}

function markShown() {
  localStorage.setItem(LAST_SHOWN_KEY, String(Date.now()));
}

export function useFelinesAssistant() {
  const pathname = usePathname();
  const [activeTrigger, setActiveTrigger] = useState<AssistantTrigger | null>(null);
  // Guards against two triggers firing into the same render pass
  // (e.g. idle timer + a custom event landing back to back).
  const hasFiredRef = useRef(false);

  // Returns whether the assistant actually appeared — callers use this
  // to decide whether a "fires once ever/once per session" marker
  // should be written. Without that check, a trigger blocked by the
  // 15-minute cooldown would still burn its one-time flag and could
  // end up never actually appearing for that visitor.
  const fire = useCallback((id: string, curiosityId?: string, excludeIds: string[] = []): boolean => {
    if (hasFiredRef.current || !canShowNow()) return false;
    hasFiredRef.current = true;
    const curiosity = curiosityId ? getCuriosityById(curiosityId) ?? getRandomCuriosity(excludeIds) : getRandomCuriosity(excludeIds);
    markShown();
    setActiveTrigger({ id, curiosity });
    return true;
  }, []);

  const handleComplete = useCallback(() => {
    setActiveTrigger(null);
    hasFiredRef.current = false;
  }, []);

  // TRIGGER 1 — first ever visit, home page only.
  useEffect(() => {
    if (pathname !== "/") return;
    if (localStorage.getItem(VISITED_KEY)) return;

    const timeout = setTimeout(() => {
      if (fire("first-visit", "meow")) localStorage.setItem(VISITED_KEY, "true");
    }, 2500);
    return () => clearTimeout(timeout);
  }, [pathname, fire]);

  // TRIGGER 2 — idle 45s on home, only after the first-visit milestone
  // exists (so it never races trigger 1 on a brand-new visitor).
  useEffect(() => {
    if (pathname !== "/") return;
    if (!localStorage.getItem(VISITED_KEY)) return;
    if (sessionStorage.getItem("assistant_idle")) return;

    let idleTimer: ReturnType<typeof setTimeout>;
    function resetIdleTimer() {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        if (fire("idle-home")) sessionStorage.setItem("assistant_idle", "true");
      }, 45000);
    }

    resetIdleTimer();
    window.addEventListener("click", resetIdleTimer);
    window.addEventListener("keydown", resetIdleTimer);
    return () => {
      clearTimeout(idleTimer);
      window.removeEventListener("click", resetIdleTimer);
      window.removeEventListener("keydown", resetIdleTimer);
    };
  }, [pathname, fire]);

  // TRIGGER 3 — article scroll reaches 95% of page height.
  useEffect(() => {
    if (!pathname.startsWith("/learn/")) return;
    if (sessionStorage.getItem("assistant_article")) return;

    function handleScroll() {
      const scrollPercent =
        (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight;
      if (scrollPercent < 0.95) return;
      window.removeEventListener("scroll", handleScroll);
      setTimeout(() => {
        // Prefer the "clowder"/"sounds" word-fact curiosities here — a
        // fun-word-fact payoff fits the "you finished reading" moment
        // better than a random draw from the whole array.
        const preferred = ["clowder", "sounds"][Math.floor(Math.random() * 2)];
        if (fire("article-finished", preferred)) sessionStorage.setItem("assistant_article", "true");
      }, 1200);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname, fire]);

  // TRIGGER 4 — first colony ever registered. Fired externally via a
  // 'felines:colony-created' event dispatched by NewColonyForm right
  // after a successful insert, since this hook has no visibility into
  // that form's submit handler otherwise.
  useEffect(() => {
    function handleColonyCreated() {
      if (localStorage.getItem(FIRST_COLONY_KEY)) return;
      setTimeout(() => {
        if (fire("first-colony", "cheeks")) localStorage.setItem(FIRST_COLONY_KEY, "true");
      }, 1800);
    }
    window.addEventListener("felines:colony-created", handleColonyCreated);
    return () => window.removeEventListener("felines:colony-created", handleColonyCreated);
  }, [fire]);

  // TRIGGER 5 — map loaded with zero colony pins in view. Fired
  // externally via 'felines:map-empty' dispatched by ColonyMap once
  // its own empty-state condition is confirmed.
  useEffect(() => {
    if (pathname !== "/map") return;
    if (sessionStorage.getItem("assistant_map_empty")) return;

    function handleMapEmpty() {
      setTimeout(() => {
        if (fire("map-empty", "domestication")) sessionStorage.setItem("assistant_map_empty", "true");
      }, 7000);
    }
    window.addEventListener("felines:map-empty", handleMapEmpty);
    return () => window.removeEventListener("felines:map-empty", handleMapEmpty);
  }, [pathname, fire]);

  // TRIGGER 6 — quiz result shown, fired externally via
  // 'felines:quiz-completed' dispatched by Quiz.tsx when its result
  // screen mounts.
  useEffect(() => {
    if (pathname !== "/learn") return;
    if (sessionStorage.getItem("assistant_quiz")) return;

    function handleQuizCompleted() {
      setTimeout(() => {
        if (fire("quiz-completed", "purr")) sessionStorage.setItem("assistant_quiz", "true");
      }, 2000);
    }
    window.addEventListener("felines:quiz-completed", handleQuizCompleted);
    return () => window.removeEventListener("felines:quiz-completed", handleQuizCompleted);
  }, [pathname, fire]);

  return { activeTrigger, handleComplete };
}
