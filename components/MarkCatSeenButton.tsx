// Small action shown on a cat's card when it hasn't been seen in 7+
// days, letting any signed-in visitor (not just a caretaker) confirm a
// fresh sighting via a security-definer RPC scoped to just last_seen.
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function MarkCatSeenButton({
  catId,
  catName,
  colonyId,
}: {
  catId: string;
  catName: string;
  colonyId: string;
}) {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setIsLoggedIn(!!data.session));
  }, []);

  async function handleClick() {
    setSubmitting(true);
    const { error } = await supabase.rpc("mark_cat_seen_today", { p_cat_id: catId });

    if (!error) {
      // No-ops server-side unless this user is actually a caretaker of
      // this colony — anyone signed in can use this button (see the
      // comment at the top of this file), but only a caretaker's streak
      // should move.
      await supabase.rpc("record_care_streak", { p_colony_id: colonyId });
      await supabase.rpc("recalculate_colony_health", { p_colony_id: colonyId });
      setDone(true);
      router.refresh();
    }
    setSubmitting(false);
  }

  if (done) {
    return <p className="mt-1 text-xs text-felines-success">Obrigado por avisar!</p>;
  }

  if (!isLoggedIn) return null;

  return (
    <button
      onClick={handleClick}
      disabled={submitting}
      className="mt-1 text-xs font-medium text-felines-accent hover:text-felines-accent-hover disabled:opacity-50"
    >
      {submitting ? "Enviando..." : `Vi ${catName} hoje`}
    </button>
  );
}
