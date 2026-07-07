// Article guide rendered on the home page as a series of alternating
// light/dark sections — one per theme — matching the editorial rhythm
// of the rest of the page instead of a single dense list. Reading
// progress (the percentage bar and the quiz) lives on /profile only;
// this just surfaces the content itself, plus a quiet "Lido" badge per
// article for signed-in readers.
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import Reveal from "@/components/shared/Reveal";
import ArticleCard from "@/components/learn/ArticleCard";
import type { Article, ArticleLevel } from "@/lib/content/articles";
import { useLanguage } from "@/lib/i18n";

export default function LearnIndex({
  articles,
  startDark = false,
}: {
  articles: Article[];
  startDark?: boolean;
}) {
  const [session, setSession] = useState<Session | null>(null);
  const [readSlugs, setReadSlugs] = useState<string[]>([]);
  const { t } = useLanguage();

  useEffect(() => {
    async function loadProgress(currentSession: Session | null) {
      setSession(currentSession);

      if (!currentSession) {
        // Signing out doesn't unmount this component (it renders inline
        // on the home page), so without this the previous session's
        // "Lido" badges would keep showing after logout until a full
        // page reload.
        setReadSlugs([]);
        return;
      }

      const { data: progress } = await supabase
        .from("knowledge_progress")
        .select("article_slug")
        .eq("user_id", currentSession.user.id);

      if (progress) {
        setReadSlugs(Array.from(new Set(progress.map((row) => row.article_slug))));
      }
    }

    supabase.auth.getSession().then(({ data }) => loadProgress(data.session));

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      loadProgress(newSession);
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  // "Convivência e conflito" goes second, right after the introductory
  // level — the primary audience is people who currently dislike or
  // are in conflict with stray cats, so the content that turns them
  // into collaborators should show up early, not buried fourth.
  const levels: ArticleLevel[] = [1, 4, 2, 3, 5];
  const renderedLevels = levels.filter((level) =>
    articles.some((article) => article.level === level)
  );
  const lastSectionWasDark = (renderedLevels.length - 1) % 2 === (startDark ? 0 : 1);

  return (
    <>
      {renderedLevels.map((level, index) => {
        const levelArticles = articles.filter((article) => article.level === level);
        const isDark = startDark ? index % 2 === 0 : index % 2 === 1;

        return (
          <section
            key={level}
            id={index === 0 ? "aprender" : undefined}
            className={isDark ? "bg-felines-dark py-20" : "bg-felines-background py-20"}
          >
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
              <Reveal>
                <p
                  className={`text-xs font-semibold uppercase tracking-[0.1em] ${
                    isDark ? "text-felines-text-secondary-on-dark" : "text-felines-accent-hover"
                  }`}
                >
                  {t(`learn.levels.${level}`)}
                </p>
                <h2
                  className={`mt-3 max-w-xl text-3xl font-bold leading-tight sm:text-[40px] ${
                    isDark ? "text-white" : "text-felines-text-primary"
                  }`}
                >
                  {t(`learn.levelDescriptions.${level}`)}
                </h2>
              </Reveal>

              <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {levelArticles.map((article, articleIndex) => (
                  <Reveal key={article.slug} delayMs={articleIndex * 80}>
                    <ArticleCard
                      article={article}
                      isDark={isDark}
                      isRead={readSlugs.includes(article.slug)}
                    />
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        );
      })}

      {!session && (
        <div
          className={
            lastSectionWasDark
              ? "bg-felines-background py-8 text-center"
              : "bg-felines-dark py-8 text-center"
          }
        >
          <p
            className={`text-sm ${
              lastSectionWasDark ? "text-felines-text-secondary" : "text-felines-text-secondary-on-dark"
            }`}
          >
            <Link href="/login?returnTo=/%23aprender" className="font-medium text-felines-accent-hover">
              {t("learn.trackSignIn")}
            </Link>{" "}
            {t("learn.trackSuffix")}
          </p>
        </div>
      )}
    </>
  );
}
