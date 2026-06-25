// Renders the set of actions available on a colony page based on the
// visitor's access level. Anonymous visitors only see a prompt to log in;
// authenticated users can log a feeding or become a caretaker.
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import AuthRequiredNotice from "@/components/AuthRequiredNotice";
import { useColonyAccessContext } from "@/components/ColonyAccessProvider";

export default function ColonyActions({ colonyId }: { colonyId: string }) {
  const router = useRouter();
  const { session, checkingAccess, refreshAccess } = useColonyAccessContext();
  const [feedingLogged, setFeedingLogged] = useState(false);
  const [caretakerJoined, setCaretakerJoined] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Logs a feeding event for this colony by the signed-in user, and
  // mirrors it into the timeline so it actually shows up in the
  // colony's history — the feedings row alone is invisible to visitors.
  async function handleLogFeeding() {
    if (!session) return;
    setActionError(null);
    const { error } = await supabase
      .from("feedings")
      .insert({ colony_id: colonyId, user_id: session.user.id });

    if (error) {
      setActionError("Não foi possível registrar a alimentação.");
      return;
    }

    await supabase.from("timeline_events").insert({
      colony_id: colonyId,
      event_type: "feeding",
      description: "Alimentação registrada.",
      created_by: session.user.id,
    });

    setFeedingLogged(true);
    router.refresh();
  }

  // Links the signed-in user as a caretaker of this colony, logs it on
  // the timeline, and refreshes the shared access context so the edit
  // controls in CatManager/EditColonyForm/TimelineEventForm unlock
  // immediately — they used to only check access once on mount, so
  // becoming a caretaker had no way to reach them without a full reload.
  async function handleBecomeCaretaker() {
    if (!session) return;
    setActionError(null);
    const { error } = await supabase
      .from("caretakers")
      .insert({ colony_id: colonyId, user_id: session.user.id });

    if (error) {
      setActionError("Não foi possível vincular você como cuidador.");
      return;
    }

    await supabase.from("timeline_events").insert({
      colony_id: colonyId,
      event_type: "new_caretaker",
      description: "Um novo cuidador se vinculou a esta colônia.",
      created_by: session.user.id,
    });

    setCaretakerJoined(true);
    refreshAccess();
    router.refresh();
  }

  if (checkingAccess) return null;

  if (!session) {
    return (
      <div className="mt-6">
        <AuthRequiredNotice />
      </div>
    );
  }

  return (
    <div className="mt-6 flex flex-wrap gap-3">
      <button
        onClick={handleLogFeeding}
        disabled={feedingLogged}
        className="rounded-full bg-felines-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-felines-accent-hover disabled:opacity-50"
      >
        {feedingLogged ? "Alimentação registrada" : "Registrar alimentação"}
      </button>
      <button
        onClick={handleBecomeCaretaker}
        disabled={caretakerJoined}
        className="rounded-full border border-felines-accent px-4 py-2 text-sm font-medium text-felines-accent transition-colors hover:bg-felines-accent hover:text-white disabled:opacity-50"
      >
        {caretakerJoined ? "Você é cuidador" : "Tornar-se cuidador"}
      </button>
      {actionError && <p className="text-xs text-felines-emergency">{actionError}</p>}
    </div>
  );
}
