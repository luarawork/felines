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

      const { data: existing } = await supabase
        .from("knowledge_progress")
        .select("id")
        .eq("user_id", data.session.user.id)
        .eq("article_slug", slug)
        .maybeSingle();

      if (existing) return;

      await supabase.from("knowledge_progress").insert({
        user_id: data.session.user.id,
        article_slug: slug,
      });
    }

    recordProgress();
  }, [slug]);

  return null;
}
