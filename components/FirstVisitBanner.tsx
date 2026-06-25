// Soft, closeable banner shown once to first-time visitors, explaining
// what Felines is. Not a modal — it never blocks the page, and never
// reappears once dismissed (tracked in localStorage).
"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "felines_first_visit_banner_dismissed";

export default function FirstVisitBanner() {
  // Starts hidden on both server and client render so hydration always
  // matches, then reveals itself after mount if the visitor hasn't
  // dismissed the banner before — reading localStorage during render
  // would mismatch the server-rendered (window-less) output.
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = window.localStorage.getItem(STORAGE_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!dismissed) setVisible(true);
  }, []);

  function handleClose() {
    window.localStorage.setItem(STORAGE_KEY, "true");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      className="flex items-center justify-between gap-3 border-b px-4 py-3 text-sm sm:px-6"
      style={{ background: "#FEF9EC", color: "#2D2D2D", borderColor: "#E8E4DF" }}
    >
      <p className="flex-1">
        O Felines mapeia colônias de gatos no seu bairro e ajuda você a entender o que está
        acontecendo — e o que você pode fazer.
      </p>
      <button
        onClick={handleClose}
        aria-label="Fechar aviso"
        className="flex-shrink-0 text-lg leading-none opacity-70 hover:opacity-100"
      >
        ×
      </button>
    </div>
  );
}
