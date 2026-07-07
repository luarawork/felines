// Small client-only trigger for the global help modal, styled to drop
// into places that used to link to /help (CTAs inside server-rendered
// pages, forms, etc).
"use client";

import { useHelpModal } from "@/components/assistant/HelpModalProvider";

export default function OpenHelpModalButton({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { openHelpModal } = useHelpModal();
  return (
    <button onClick={openHelpModal} className={className}>
      {children}
    </button>
  );
}
