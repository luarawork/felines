// Renders the set of actions available on a colony page based on the
// visitor's access level. Anonymous visitors only see a prompt to log in;
// authenticated users can log a feeding or become a caretaker.
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import AuthRequiredNotice from "@/components/AuthRequiredNotice";
import ReportButton from "@/components/ReportButton";
import { useColonyAccessContext } from "@/components/ColonyAccessProvider";

export default function ColonyActions({ colonyId }: { colonyId: string }) {
  const router = useRouter();
  const { session, checkingAccess, refreshAccess } = useColonyAccessContext();
  const [foodLogged, setFoodLogged] = useState(false);
  const [waterLogged, setWaterLogged] = useState(false);
  const [caretakerJoined, setCaretakerJoined] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // caretakerJoined used to only flip to true after clicking the button
  // in this session, so an account that was already a caretaker before
  // visiting (or linked in a previous session) still saw "Tornar-se
  // cuidador". Check the actual link on mount/session change instead.
  useEffect(() => {
    async function checkExistingCaretaker() {
      if (!session) return;
      const { data } = await supabase
        .from("caretakers")
        .select("id")
        .eq("colony_id", colonyId)
        .eq("user_id", session.user.id)
        .maybeSingle();
      if (data) setCaretakerJoined(true);
    }
    checkExistingCaretaker();
  }, [colonyId, session]);

  // Logs a feeding check-in (food or water) for this colony by the
  // signed-in user, and mirrors it into the timeline so it actually
  // shows up in the colony's history — the feedings row alone is
  // invisible to visitors.
  async function handleLogCheckIn(type: "food" | "water") {
    if (!session) return;
    setActionError(null);
    const { error } = await supabase
      .from("feedings")
      .insert({ colony_id: colonyId, user_id: session.user.id, type });

    if (error) {
      setActionError(
        type === "food"
          ? "A alimentação não foi registrada. Tenta de novo?"
          : "A água não foi registrada. Tenta de novo?"
      );
      return;
    }

    await supabase.from("timeline_events").insert({
      colony_id: colonyId,
      event_type: type === "food" ? "feeding" : "water",
      description: type === "food" ? "Alguém alimentou a colônia." : "Alguém trocou a água da colônia.",
      created_by: session.user.id,
    });

    if (type === "food") setFoodLogged(true);
    else setWaterLogged(true);
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
      setActionError("Não foi possível te vincular como cuidador. Tenta de novo?");
      return;
    }

    await supabase.from("timeline_events").insert({
      colony_id: colonyId,
      event_type: "new_caretaker",
      description: "Um novo cuidador passou a olhar por essa colônia.",
      created_by: session.user.id,
    });

    setCaretakerJoined(true);
    refreshAccess();
    router.refresh();
  }

  // Lets a caretaker step down. RLS only allows a caretaker row to be
  // deleted by the caretaker themselves (caretakers_delete_own, 0009),
  // so this can't be used to remove someone else's link.
  async function handleStopCaretaking() {
    if (!session) return;
    setActionError(null);
    const { error } = await supabase
      .from("caretakers")
      .delete()
      .eq("colony_id", colonyId)
      .eq("user_id", session.user.id);

    if (error) {
      setActionError("Não consegui te desvincular agora. Tenta de novo?");
      return;
    }

    setCaretakerJoined(false);
    refreshAccess();
    router.refresh();
  }

  if (checkingAccess) return null;

  if (!session) {
    return (
      <div id="colony-report-button" className="mt-6 rounded-2xl border border-felines-border bg-felines-surface p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-felines-accent-hover">
          O que você pode fazer aqui
        </p>
        <div className="mt-3">
          <ReportButton colonyId={colonyId} />
        </div>
        <div className="mt-4">
          <AuthRequiredNotice />
        </div>
      </div>
    );
  }

  return (
    <div id="colony-report-button" className="mt-6 rounded-2xl border border-felines-border bg-felines-surface p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-felines-accent-hover">
        O que você pode fazer aqui
      </p>
      <div className="mt-3 flex flex-wrap gap-3">
        <ReportButton colonyId={colonyId} />
        <button
          onClick={() => handleLogCheckIn("food")}
          disabled={foodLogged}
          className="rounded-full bg-felines-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-felines-accent-hover disabled:opacity-50"
        >
          {foodLogged ? "Alimentação registrada ✓" : "Alimentei essa colônia hoje"}
        </button>
        <button
          onClick={() => handleLogCheckIn("water")}
          disabled={waterLogged}
          className="rounded-full border border-felines-accent px-4 py-2 text-sm font-medium text-felines-accent transition-colors hover:bg-felines-accent hover:text-white disabled:opacity-50"
        >
          {waterLogged ? "Água registrada ✓" : "Coloquei água hoje"}
        </button>
        {caretakerJoined ? (
          <button
            onClick={handleStopCaretaking}
            className="rounded-full border border-felines-border px-4 py-2 text-sm font-medium text-felines-text-secondary transition-colors hover:border-felines-emergency hover:text-felines-emergency"
          >
            Deixar de cuidar dessa colônia
          </button>
        ) : (
          <button
            onClick={handleBecomeCaretaker}
            className="rounded-full border border-felines-border px-4 py-2 text-sm font-medium text-felines-text-secondary transition-colors hover:border-felines-accent hover:text-felines-accent-hover"
          >
            Quero cuidar dessa colônia
          </button>
        )}
      </div>
      {actionError && <p className="mt-2 text-xs text-felines-emergency">{actionError}</p>}
    </div>
  );
}
