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
}: {
  catId: string;
  catName: string;
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
    setSubmitting(false);

    if (!error) {
      setDone(true);
      router.refresh();
    }
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
