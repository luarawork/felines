// "Follow this colony" toggle, shown to signed-in non-caretakers (a
// caretaker already gets everything a follower would via the colony
// itself). Shows the total follower count — never who's following,
// since colony_followers' column grant omits user_id from general
// SELECT (see migration 0051).
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useColonyAccessContext } from "@/components/ColonyAccessProvider";

export default function FollowColonyButton({ colonyId }: { colonyId: string }) {
  const { session, canManage, checkingAccess } = useColonyAccessContext();
  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadFollowState() {
      const { count } = await supabase
        .from("colony_followers")
        .select("id", { count: "exact", head: true })
        .eq("colony_id", colonyId);
      setFollowerCount(count ?? 0);

      if (session) {
        const { count: ownCount } = await supabase
          .from("colony_followers")
          .select("id", { count: "exact", head: true })
          .eq("colony_id", colonyId)
          .eq("user_id", session.user.id);
        setFollowing((ownCount ?? 0) > 0);
      }

      setLoading(false);
    }

    loadFollowState();
  }, [colonyId, session]);

  async function handleToggle() {
    if (!session || submitting) return;
    setSubmitting(true);

    if (following) {
      await supabase
        .from("colony_followers")
        .delete()
        .eq("colony_id", colonyId)
        .eq("user_id", session.user.id);
      setFollowing(false);
      setFollowerCount((previous) => Math.max(0, previous - 1));
    } else {
      const { error } = await supabase
        .from("colony_followers")
        .insert({ colony_id: colonyId, user_id: session.user.id });
      if (!error) {
        setFollowing(true);
        setFollowerCount((previous) => previous + 1);
      }
    }

    setSubmitting(false);
  }

  if (checkingAccess || loading || !session || canManage) return null;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleToggle}
        disabled={submitting}
        className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${
          following
            ? "border-felines-accent bg-felines-accent-light text-felines-text-primary"
            : "border-felines-border text-felines-text-secondary hover:border-felines-accent hover:text-felines-accent-hover"
        }`}
      >
        {following ? "Seguindo ✓" : "Seguir essa colônia"}
      </button>
      <span className="text-xs text-felines-text-secondary">
        {followerCount} {followerCount === 1 ? "pessoa seguindo" : "pessoas seguindo"}
      </span>
    </div>
  );
}
