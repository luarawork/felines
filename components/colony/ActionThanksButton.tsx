// Small heart button shown on each timeline event, letting any signed-in
// visitor thank whoever performed that specific action (a feeding, a new
// cat, a castration round...). Distinct from ThankYouButton, which is a
// one-time "thanks for caretaking" per caretaker — this is per action,
// and notifies the action's author via thank_action() (see migration
// 0039), which also handles the notification insert server-side.
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useLanguage } from "@/lib/i18n";

export default function ActionThanksButton({ timelineEventId }: { timelineEventId: string }) {
  const { t } = useLanguage();
  const [userId, setUserId] = useState<string | null>(null);
  const [count, setCount] = useState(0);
  const [thanked, setThanked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;
      setUserId(session?.user.id ?? null);

      const { count: totalCount } = await supabase
        .from("action_thanks")
        .select("id", { count: "exact", head: true })
        .eq("timeline_event_id", timelineEventId);
      setCount(totalCount ?? 0);

      if (session) {
        const { data: existing } = await supabase
          .from("action_thanks")
          .select("id")
          .eq("timeline_event_id", timelineEventId)
          .eq("sender_user_id", session.user.id)
          .maybeSingle();
        setThanked(!!existing);
      }

      setLoading(false);
    }

    load();
  }, [timelineEventId]);

  async function handleClick() {
    if (!userId || thanked) return;
    setThanked(true);
    setCount((previous) => previous + 1);

    const { error } = await supabase.rpc("thank_action", { p_timeline_event_id: timelineEventId });
    if (error) {
      // Roll back the optimistic update — most likely a transient
      // network/RPC failure, since a duplicate thanks is a silent no-op
      // server-side, not an error.
      setThanked(false);
      setCount((previous) => Math.max(0, previous - 1));
    }
  }

  if (loading) return null;

  return (
    <button
      onClick={handleClick}
      disabled={!userId || thanked}
      title={!userId ? t("actionThanks.loginRequired") : thanked ? t("actionThanks.alreadyThanked") : t("actionThanks.thankAction")}
      className={`inline-flex min-h-[44px] items-center gap-1 px-2 text-xs transition-colors ${
        thanked ? "text-felines-emergency" : "text-felines-text-secondary hover:text-felines-emergency"
      } ${!userId ? "cursor-default opacity-60" : ""}`}
    >
      <span aria-hidden="true">{thanked ? "❤️" : "🤍"}</span>
      {count > 0 && <span>{count}</span>}
    </button>
  );
}
