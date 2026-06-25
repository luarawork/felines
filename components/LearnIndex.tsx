// Client component for the /learn index page.
// Groups articles by level, shows a knowledge progress bar for signed-in
// users (based on knowledge_progress rows), and surfaces a quiz prompt
// once at least 3 articles have been read.
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import { getReadingTimeMinutes, type Article, type ArticleLevel } from "@/lib/articles";
import Quiz from "@/components/Quiz";

// Theme labels for each article level — the level number itself isn't
// shown anywhere anymore, just the topic name.
const LEVEL_LABELS: Record<ArticleLevel, string> = {
  1: "Primeiros passos",
  2: "Agindo na prática",
  3: "Situações específicas",
  4: "Convivência e conflito",
  5: "Compromisso de longo prazo",
};

export default function LearnIndex({ articles }: { articles: Article[] }) {
  const [session, setSession] = useState<Session | null>(null);
  const [readSlugs, setReadSlugs] = useState<string[]>([]);
  const [showQuiz, setShowQuiz] = useState(false);

  // Load auth session and, if signed in, the user's reading progress.
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

  const levels: ArticleLevel[] = [1, 2, 3, 4, 5];
  const progressPercent = Math.round((readSlugs.length / articles.length) * 100);

  return (
    <div className="mt-8">
      {session && (
        <div className="rounded-xl border border-felines-border bg-felines-surface p-4">
          <div className="flex items-center justify-between text-sm font-medium text-felines-text-primary">
            <span>Seu progresso</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="mt-2 h-2 w-full rounded-full bg-felines-border">
            <div
              className="h-2 rounded-full bg-felines-success transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          {readSlugs.length >= 3 && !showQuiz && (
            <div className="mt-3">
              <p className="text-sm text-felines-accent">
                Você já leu {readSlugs.length} artigos — que tipo de vizinho você é?
              </p>
              <button
                onClick={() => setShowQuiz(true)}
                className="mt-2 rounded-full bg-felines-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-felines-accent-hover"
              >
                Descobrir
              </button>
            </div>
          )}
          {showQuiz && <Quiz onSkip={() => setShowQuiz(false)} />}
        </div>
      )}

      {!session && (
        <p className="mt-6 text-sm text-felines-text-secondary">
          <Link href="/login?returnTo=/%23aprender" className="font-medium text-felines-accent">
            Entre na sua conta
          </Link>{" "}
          para acompanhar seu progresso de leitura.
        </p>
      )}

      {levels.map((level) => (
        <section key={level} className="mt-8">
          <h2 className="text-lg font-bold text-felines-text-primary">{LEVEL_LABELS[level]}</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {articles
              .filter((article) => article.level === level)
              .map((article) => (
                <Link
                  key={article.slug}
                  href={`/learn/${article.slug}`}
                  className="rounded-xl border border-felines-border bg-felines-surface p-4 transition-colors hover:border-felines-accent"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-felines-text-secondary">
                      {getReadingTimeMinutes(article)} min
                    </span>
                    {readSlugs.includes(article.slug) && (
                      <span className="rounded-full bg-felines-success/15 px-2 py-0.5 text-xs font-medium text-felines-success">
                        Lido
                      </span>
                    )}
                  </div>
                  <p className="mt-2 font-semibold text-felines-text-primary">{article.title}</p>
                  <p className="mt-1 text-sm text-felines-text-secondary">{article.summary}</p>
                </Link>
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}
