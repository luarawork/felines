// Closes a modal when Escape is pressed, while it's open. Keyboard users
// expect this from any dialog; without it, a modal can only be
// dismissed by finding its close button or clicking outside.
import { useEffect } from "react";

export function useEscapeToClose(isOpen: boolean, onClose: () => void) {
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);
}
