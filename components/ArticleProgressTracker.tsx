// Invisible client component that records an article as read in
// knowledge_progress for the signed-in user. Renders nothing — it only
// runs the side effect of logging progress when the article page mounts.
"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ArticleProgressTracker({ slug }: { slug: string }) {
  useEffect(() => {
    async function recordProgress() {
      const { data } = await supabase.auth.getSession();
      if (!data.session) return;

      // upsert with ignoreDuplicates skips the separate SELECT — one
      // round-trip instead of two regardless of whether the row exists.
      await supabase.from("knowledge_progress").upsert(
        { user_id: data.session.user.id, article_slug: slug },
        { onConflict: "user_id,article_slug", ignoreDuplicates: true }
      );
    }

    recordProgress();
  }, [slug]);

  return null;
}
