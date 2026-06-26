// Soft welcome banner shown once to first-time visitors of the home
// page. Closing it (or simply having visited before) hides it for good
// via localStorage — it's just a friendly orientation, not something
// that should nag a returning visitor.
"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "felines_seen_first_visit_banner";

export default function FirstVisitBanner() {
  const [visible, setVisible] = useState(false);

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
        👋 Primeira vez por aqui? O Felines te ajuda a entender os gatos de rua da sua região,
        ver quem já cuida deles e relatar o que você encontrar — sem precisar de conta para a
        maioria das coisas.
      </p>
      <button
        onClick={dismiss}
        aria-label="Fechar"
        className="flex-shrink-0 text-lg leading-none text-felines-text-secondary hover:text-felines-text-primary"
      >
        ×
      </button>
    </div>
  );
}
