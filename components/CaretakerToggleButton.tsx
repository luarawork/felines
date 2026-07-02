// Lets a signed-in visitor join or step down as a colony's caretaker.
// Rendered as a menu item inside ColonySettingsMenu — this happens
// rarely enough (once, in either direction) that it doesn't need a
// permanent, prominent button competing with daily feed/water actions.
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useColonyAccessContext } from "@/components/ColonyAccessProvider";
import { useLanguage } from "@/lib/i18n";

export default function CaretakerToggleButton({ colonyId }: { colonyId: string }) {
  const router = useRouter();
  const { t } = useLanguage();
  const { session, checkingAccess, refreshAccess } = useColonyAccessContext();
  const [caretakerJoined, setCaretakerJoined] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

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

  async function handleBecomeCaretaker() {
    if (!session) return;
    setActionError(null);
    const { error } = await supabase
      .from("caretakers")
      .insert({ colony_id: colonyId, user_id: session.user.id });

    if (error) {
      setActionError(t("colony.joinError"));
      return;
    }

    await Promise.all([
      supabase.from("timeline_events").insert({
        colony_id: colonyId,
        event_type: "new_caretaker",
        description: t("colony.newCaretakerEventDesc"),
        created_by: session.user.id,
      }),
      supabase.rpc("recalculate_colony_health", { p_colony_id: colonyId }),
    ]);

    setCaretakerJoined(true);
    refreshAccess();
    router.refresh();
  }

  async function handleStopCaretaking() {
    if (!session) return;
    if (!window.confirm(t("colony.confirmStopCaretaking"))) return;
    setActionError(null);
    const { error } = await supabase
      .from("caretakers")
      .delete()
      .eq("colony_id", colonyId)
      .eq("user_id", session.user.id);

    if (error) {
      setActionError(t("colony.leaveError"));
      return;
    }

    await supabase.rpc("recalculate_colony_health", { p_colony_id: colonyId });

    setCaretakerJoined(false);
    refreshAccess();
    router.refresh();
  }

  if (checkingAccess || !session) return null;

  return (
    <>
      {caretakerJoined ? (
        <button
          onClick={handleStopCaretaking}
          className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-felines-text-secondary transition-colors hover:bg-felines-emergency/10 hover:text-felines-emergency"
        >
          {t("colony.stopCaretaking")}
        </button>
      ) : (
        <button
          onClick={handleBecomeCaretaker}
          className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-felines-text-secondary transition-colors hover:bg-felines-background hover:text-felines-accent-hover"
        >
          {t("colony.becomeCaretaker")}
        </button>
      )}
      {actionError && <p className="px-3 pb-1 text-xs text-felines-emergency">{actionError}</p>}
    </>
  );
}
