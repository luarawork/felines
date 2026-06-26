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
import Reveal from "@/components/Reveal";
import { getReadingTimeMinutes, type Article, type ArticleLevel } from "@/lib/articles";

const LEVEL_LABELS: Record<ArticleLevel, string> = {
  1: "Primeiros passos",
  2: "Agindo na prática",
  3: "Situações específicas",
  4: "Convivência e conflito",
  5: "Compromisso de longo prazo",
};

const LEVEL_DESCRIPTIONS: Record<ArticleLevel, string> = {
  1: "O básico pra entender por que os gatos de rua existem e como colônias funcionam.",
  2: "O que fazer no dia a dia, na prática, quando você decide agir.",
  3: "Guias específicos pra situações que pedem mais cuidado.",
  4: "Como conviver bem quando os gatos incomodam ou geram conflito.",
  5: "O que muda quando você decide cuidar de uma colônia a longo prazo.",
};

export default function LearnIndex({
  articles,
  startDark = false,
}: {
  articles: Article[];
  startDark?: boolean;
}) {
  const [session, setSession] = useState<Session | null>(null);
  const [readSlugs, setReadSlugs] = useState<string[]>([]);

  useEffect(() => {
    async function loadProgress() {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);

      if (data.session) {
        const { data: progress } = await supabase
          .from("knowledge_progress")
          .select("article_slug")
          .eq("user_id", data.session.user.id);

        if (progress) {
          setReadSlugs(Array.from(new Set(progress.map((row) => row.article_slug))));
        }
      }
    }

    loadProgress();
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
                    isDark ? "text-felines-text-secondary-on-dark" : "text-felines-accent"
                  }`}
                >
                  {LEVEL_LABELS[level]}
                </p>
                <h2
                  className={`mt-3 max-w-xl text-3xl font-bold leading-tight sm:text-[40px] ${
                    isDark ? "text-white" : "text-felines-text-primary"
                  }`}
                >
                  {LEVEL_DESCRIPTIONS[level]}
                </h2>
              </Reveal>

              <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {levelArticles.map((article, articleIndex) => (
                  <Reveal key={article.slug} delayMs={articleIndex * 80}>
                    <Link
                      href={`/learn/${article.slug}`}
                      className={
                        isDark
                          ? "block h-full rounded-2xl border border-felines-border-on-dark bg-felines-dark-accent p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.25)]"
                          : "block h-full rounded-2xl border border-felines-border bg-felines-surface p-5 shadow-[0_2px_8px_rgba(0,0,0,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.10)]"
                      }
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={`font-semibold ${
                            isDark ? "text-white" : "text-felines-text-primary"
                          }`}
                        >
                          {article.title}
                        </p>
                        {readSlugs.includes(article.slug) && (
                          <span className="flex-shrink-0 rounded-full bg-felines-success/15 px-2 py-0.5 text-xs font-medium text-felines-success">
                            Lido
                          </span>
                        )}
                      </div>
                      <p
                        className={`mt-1 text-sm ${
                          isDark ? "text-felines-text-secondary-on-dark" : "text-felines-text-secondary"
                        }`}
                      >
                        {article.summary}
                      </p>
                      <p
                        className={`mt-2 text-xs ${
                          isDark ? "text-felines-text-secondary-on-dark" : "text-felines-text-secondary"
                        }`}
                      >
                        {getReadingTimeMinutes(article)} min de leitura
                      </p>
                    </Link>
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
            <Link href="/login?returnTo=/%23aprender" className="font-medium text-felines-accent">
              Entre na sua conta
            </Link>{" "}
            para acompanhar seu progresso de leitura no seu perfil.
          </p>
        </div>
      )}
    </>
  );
}
