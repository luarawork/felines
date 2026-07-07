"use client";

// Client wrapper that connects the trigger hook to the visual
// assistant component — kept separate from FelinesAssistant itself so
// the hook's trigger-selection logic never has to think about how the
// video/bubble render, and vice versa.
import FelinesAssistant from "@/components/assistant/FelinesAssistant";
import { useFelinesAssistant } from "@/hooks/useFelinesAssistant";

export default function FelinesAssistantWrapper() {
  const { activeTrigger, handleComplete } = useFelinesAssistant();

  if (!activeTrigger) return null;

  return <FelinesAssistant trigger={activeTrigger} onComplete={handleComplete} />;
}
