// Global provider that renders the "what should I do" help flow as a
// modal, reachable from anywhere in the app (nav link, CTAs in articles
// and forms) without needing a dedicated /help route.
"use client";

import { createContext, useContext, useState } from "react";
import HelpFlow from "@/components/HelpFlow";

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

  return (
    <HelpModalContext.Provider value={{ openHelpModal: () => setIsOpen(true) }}>
      {children}

      {isOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-felines-background p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-felines-text-primary">
                  Não sabe o que fazer? A gente te orienta.
                </h2>
                <p className="mt-2 text-sm text-felines-text-secondary">
                  Responda duas perguntas rápidas e mostramos o que fazer agora.
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Fechar"
                className="flex-shrink-0 text-2xl leading-none text-felines-text-secondary hover:text-felines-text-primary"
              >
                ×
              </button>
            </div>
            <HelpFlow />
          </div>
        </div>
      )}
    </HelpModalContext.Provider>
  );
}
