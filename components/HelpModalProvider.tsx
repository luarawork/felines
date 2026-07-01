// Global provider that renders the "what should I do" help flow as a
// modal, reachable from anywhere in the app (nav link, CTAs in articles
// and forms) without needing a dedicated /help route.
"use client";

import { createContext, useCallback, useContext, useState } from "react";
import HelpFlow from "@/components/HelpFlow";
import { useEscapeToClose } from "@/lib/useEscapeToClose";

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
  const [isOpen, setIsOpen] = useState(false);
  const close = useCallback(() => setIsOpen(false), []);
  useEscapeToClose(isOpen, close);

  return (
    <HelpModalContext.Provider value={{ openHelpModal: () => setIsOpen(true) }}>
      {children}

      {isOpen && (
        <div
          className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40 p-4"
          onClick={close}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="help-modal-title"
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-felines-background p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 id="help-modal-title" className="text-2xl font-bold text-felines-text-primary">
                  O que está acontecendo?
                </h2>
                <p className="mt-2 text-sm text-felines-text-secondary">
                  Escolha a situação mais parecida com a sua — a gente mostra o que fazer agora.
                </p>
              </div>
              <button
                onClick={close}
                aria-label="Fechar"
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
