// Closes a modal when Escape is pressed, while it's open. Keyboard users
// expect this from any dialog; without it, a modal can only be
// dismissed by finding its close button or clicking outside.
//
// Also handles the two other keyboard-modal requirements every dialog
// in this codebase needs: trapping Tab/Shift+Tab inside the dialog
// while it's open (so focus can't silently leak behind it onto the
// page), and returning focus to whatever triggered the modal once it
// closes (otherwise focus resets to <body> and a keyboard user loses
// their place entirely).
//
// Every modal here already renders role="dialog" aria-modal="true" —
// this hook finds that element itself instead of requiring every
// call site to thread a ref through, which would've meant touching
// 15+ components for the same handful of lines each.
import { useEffect, useRef } from "react";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function useEscapeToClose(isOpen: boolean, onClose: () => void) {
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    triggerRef.current = document.activeElement as HTMLElement | null;

    const dialog = document.querySelector<HTMLElement>('[role="dialog"][aria-modal="true"], [role="alertdialog"][aria-modal="true"]');
    const focusables = dialog?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    (focusables?.[0] ?? dialog)?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab" || !dialog) return;

      const nodes = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (nodes.length === 0) return;

      const first = nodes[0];
      const last = nodes[nodes.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      triggerRef.current?.focus();
    };
  }, [isOpen, onClose]);
}
