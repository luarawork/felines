// Shared session-gated body for the community stories list — used both
// by the standalone /stories page and the "Histórias" tab on /reports,
// so the login requirement and the actual grid-vs-empty logic live in
// one place instead of being duplicated per caller.
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import StoriesGrid from "@/components/StoriesGrid";
import type { StoryWithMeta } from "@/app/stories/page";
import { useLanguage } from "@/lib/i18n";

export default function StoriesSection({
  stories,
  emptyState,
}: {
  stories: StoryWithMeta[];
  emptyState: React.ReactNode;
}) {
  const { t } = useLanguage();
  const [session, setSession] = useState<Session | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setCheckingSession(false);
    });
  }, []);

  if (checkingSession) return null;

  if (!session) {
    return (
      <p className="mt-8 rounded-lg border border-felines-border bg-felines-surface px-4 py-3 text-sm text-felines-text-secondary">
        <Link href="/login?returnTo=/stories" className="font-medium text-felines-accent-hover">
          {t("stories.loginPromptPre")}
        </Link>{" "}
        {t("stories.loginPromptPost")}
      </p>
    );
  }

  if (stories.length === 0) return <>{emptyState}</>;

  return <StoriesGrid stories={stories} />;
}
