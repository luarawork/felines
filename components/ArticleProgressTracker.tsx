// Invisible client component that records an article as read in
// knowledge_progress for the signed-in user. Renders nothing — it only
// runs the side effect of logging progress once the reader actually
// reaches the bottom of the article (not just on page mount), so
// "read" reflects having seen the whole thing rather than just opening
// the link.
"use client";

import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";

// How close to the bottom of the page (in pixels) counts as "reached
// the end" — matches the tolerance used by ReadingProgressBar's 100%
// state, so both agree on what "finished" means.
const BOTTOM_THRESHOLD_PX = 48;

export default function ArticleProgressTracker({ slug }: { slug: string }) {
  const recordedRef = useRef(false);

  useEffect(() => {
    recordedRef.current = false;

    async function recordProgress() {
      if (recordedRef.current) return;
      const { data } = await supabase.auth.getSession();
      if (!data.session) return;

      recordedRef.current = true;

      // upsert with ignoreDuplicates skips the separate SELECT — one
      // round-trip instead of two regardless of whether the row exists.
      await supabase.from("knowledge_progress").upsert(
        { user_id: data.session.user.id, article_slug: slug },
        { onConflict: "user_id,article_slug", ignoreDuplicates: true }
      );
    }

    function handleScroll() {
      if (recordedRef.current) return;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      // Short articles that don't scroll at all count as read immediately.
      const reachedBottom =
        scrollable <= 0 || window.scrollY >= scrollable - BOTTOM_THRESHOLD_PX;
      if (reachedBottom) recordProgress();
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [slug]);

  return null;
}
