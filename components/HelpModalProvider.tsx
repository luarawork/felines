// Global provider that renders the "what should I do" help flow as a
// modal, reachable from anywhere in the app (nav link, CTAs in articles
// and forms) without needing a dedicated /help route.
"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import HelpFlow from "@/components/HelpFlow";
import { useEscapeToClose } from "@/lib/useEscapeToClose";
import { useLanguage } from "@/lib/i18n";

type HelpModalContextValue = {
  openHelpModal: () => void;
};

const HelpModalContext = createContext<HelpModalContextValue | null>(null);

export function useHelpModal(): HelpModalContextValue {
  const context = useContext(HelpModalContext);
  if (!context) {
    throw new Error("useHelpModal must be used within HelpModalProvider");
  }
  return context;
}

export default function HelpModalProvider({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  // Drives the enter transition: mounts hidden, then flips to the
  // "-in" classes a frame later for a fade + slide-up entrance instead
  // of an instant snap into view.
  const [entered, setEntered] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const openHelpModal = useCallback(() => {
    triggerRef.current = document.activeElement as HTMLElement;
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setEntered(false);
    // Return focus to the element that opened the modal.
    setTimeout(() => triggerRef.current?.focus(), 50);
  }, []);

  useEscapeToClose(isOpen, close);

  // Move focus into the dialog whenever it opens.
  useEffect(() => {
    if (isOpen) {
      const id = setTimeout(() => dialogRef.current?.focus(), 50);
      return () => clearTimeout(id);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const frame = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(frame);
  }, [isOpen]);

  return (
    <HelpModalContext.Provider value={{ openHelpModal }}>
      {children}

      {isOpen && (
        <div
          className={`felines-modal-backdrop fixed inset-0 z-[2000] flex items-center justify-center bg-black/40 p-4 ${
            entered ? "felines-modal-backdrop-in" : ""
          }`}
          onClick={close}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="help-modal-title"
            tabIndex={-1}
            className={`felines-modal-panel max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-felines-background p-6 shadow-xl outline-none ${
              entered ? "felines-modal-panel-in" : ""
            }`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 id="help-modal-title" className="text-2xl font-bold text-felines-text-primary">
                  {t("helpFlow.title")}
                </h2>
                <p className="mt-2 text-sm text-felines-text-secondary">
                  {t("helpFlow.subtitle")}
                </p>
              </div>
              <button
                onClick={close}
                aria-label={t("common.close")}
                className="flex h-11 w-11 flex-shrink-0 items-center justify-center text-2xl leading-none text-felines-text-secondary hover:text-felines-text-primary"
              >
                ×
              </button>
            </div>
            <HelpFlow onClose={close} />
          </div>
        </div>
      )}
    </HelpModalContext.Provider>
  );
}
