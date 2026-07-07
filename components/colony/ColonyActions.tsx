// Renders the daily, high-frequency colony actions (log food/water,
// report something) — always visible at the top since these happen
// often. Rarer actions (edit colony, become/stop caretaker) live in
// ColonySettingsMenu instead.
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import AuthRequiredNotice from "@/components/auth/AuthRequiredNotice";
import ReportButton from "@/components/reports/ReportButton";
import { useColonyAccessContext } from "@/components/colony/ColonyAccessProvider";
import { useLanguage } from "@/lib/i18n";

export default function ColonyActions({ colonyId }: { colonyId: string }) {
  const router = useRouter();
  const { t } = useLanguage();
  const { session, checkingAccess } = useColonyAccessContext();
  const [foodLogged, setFoodLogged] = useState(false);
  const [waterLogged, setWaterLogged] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  // Guards against a rapid double-click creating two feeding/water
  // check-ins — foodLogged/waterLogged only flip to true after the
  // insert resolves, which is too late to stop a second click fired
  // before that await settles.
  const [checkInPending, setCheckInPending] = useState<"food" | "water" | null>(null);

  // Logs a feeding check-in (food or water) for this colony by the
  // signed-in user, and mirrors it into the timeline so it actually
  // shows up in the colony's history — the feedings row alone is
  // invisible to visitors.
  async function handleLogCheckIn(type: "food" | "water") {
    if (!session || checkInPending) return;
    setActionError(null);
    setCheckInPending(type);
    const { error } = await supabase
      .from("feedings")
      .insert({ colony_id: colonyId, user_id: session.user.id, type });

    if (error) {
      setCheckInPending(null);
      setActionError(
        type === "food"
          ? t("colony.foodError")
          : t("colony.waterError")
      );
      return;
    }

    await Promise.all([
      supabase.from("timeline_events").insert({
        colony_id: colonyId,
        event_type: type === "food" ? "feeding" : "water",
        description: type === "food" ? t("colony.feedingEventDesc") : t("colony.waterEventDesc"),
        created_by: session.user.id,
      }),
      // No-ops server-side if the user isn't a caretaker (see 0043).
      supabase.rpc("record_care_streak", { p_colony_id: colonyId }),
      supabase.rpc("recalculate_colony_health", { p_colony_id: colonyId }),
    ]);

    setCheckInPending(null);
    if (type === "food") setFoodLogged(true);
    else setWaterLogged(true);
    router.refresh();
  }

  if (checkingAccess) return null;

  if (!session) {
    return (
      <div id="colony-report-button" className="mt-6 rounded-2xl border border-felines-border bg-felines-surface p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-felines-accent-hover">
          {t("colony.whatYouCanDo")}
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
        {t("colony.whatYouCanDo")}
      </p>
      <div className="mt-3 flex flex-wrap gap-3">
        <ReportButton colonyId={colonyId} />
        <button
          onClick={() => handleLogCheckIn("food")}
          disabled={foodLogged || checkInPending !== null}
          className="rounded-full bg-felines-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-felines-accent-hover disabled:opacity-50"
        >
          {foodLogged ? t("colony.foodLogged") : t("colony.logFood")}
        </button>
        <button
          onClick={() => handleLogCheckIn("water")}
          disabled={waterLogged || checkInPending !== null}
          className="rounded-full border border-felines-accent px-4 py-2 text-sm font-medium text-felines-accent-hover transition-colors hover:bg-felines-accent hover:text-white disabled:opacity-50"
        >
          {waterLogged ? t("colony.waterLogged") : t("colony.logWater")}
        </button>
      </div>
      {actionError && <p className="mt-2 text-xs text-felines-emergency">{actionError}</p>}
    </div>
  );
}
