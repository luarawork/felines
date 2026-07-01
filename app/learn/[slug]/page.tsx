// /learn/:slug route for Felines.
// Renders a single article's content, level badge, reading time, fact
// chips, related articles, and a CTA pointing to the map or help flow.
import type { Metadata } from "next";
import Link from "next/link";
import { getArticleBySlug, getReadingTimeMinutes, getRelatedArticles } from "@/lib/articles";
import ArticleProgressTracker from "@/components/ArticleProgressTracker";
import FactChip from "@/components/FactChip";
import OpenHelpModalButton from "@/components/OpenHelpModalButton";
import ReadingProgressBar from "@/components/ReadingProgressBar";
import ArticleNotFound from "@/components/ArticleNotFound";
import ShareButton from "@/components/ShareButton";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return {};

  // Each article already has a hand-written `summary` — a better og:
  // description than mechanically truncating the body to 150 characters,
  // since it's written to stand alone instead of just being cut off.
  return {
    title: article.title,
    description: article.summary,
    openGraph: {
      title: article.title,
      description: article.summary,
      url: `/learn/${article.slug}`,
      images: ["/images/hero-cat.png"],
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) return <ArticleNotFound />;

  const relatedArticles = getRelatedArticles(article);
  const readingTime = getReadingTimeMinutes(article);

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <ReadingProgressBar />

      {/* Records this article as read for the signed-in user, if any */}
      <ArticleProgressTracker slug={article.slug} />

      <Link href="/#aprender" className="text-sm text-felines-text-secondary hover:text-felines-accent">
        ← Voltar ao guia
      </Link>

      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="text-xs text-felines-text-secondary">{readingTime} min de leitura</span>
        <ShareButton title={article.title} />
      </div>

      <h1 className="mt-2 text-2xl font-bold text-felines-text-primary sm:text-3xl">
        {article.title}
      </h1>

      <div className="mt-6 space-y-4">
        {article.body.map((paragraph) =>
          paragraph.startsWith("### ") ? (
            <h2
              key={paragraph}
              className="!mt-8 text-xl font-bold text-felines-text-primary"
            >
              {paragraph.slice(4)}
            </h2>
          ) : (
            <p key={paragraph} className="text-base leading-relaxed text-felines-text-secondary">
              {paragraph}
            </p>
          )
        )}
      </div>

      {article.factChips && article.factChips.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {article.factChips.map((fact) => (
            <FactChip key={fact} text={fact} />
          ))}
        </div>
      )}

      <div className="mt-10 rounded-xl border border-felines-border bg-felines-surface p-5">
        <p className="font-semibold text-felines-text-primary">Quer colocar isso em prática?</p>
        <div className="mt-3 flex flex-wrap gap-3">
          <Link
            href="/map"
            className="rounded-full bg-felines-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-felines-accent-hover"
          >
            Ver colônias no mapa
          </Link>
          <OpenHelpModalButton className="rounded-full border border-felines-accent px-4 py-2 text-sm font-medium text-felines-accent transition-colors hover:bg-felines-accent hover:text-white">
            Fazer um relato
          </OpenHelpModalButton>
        </div>
      </div>

      {relatedArticles.length > 0 && (
        <section className="mt-10">
          <h3 className="text-lg font-bold text-felines-text-primary">Artigos relacionados</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {relatedArticles.map((related) => (
              <Link
                key={related.slug}
                href={`/learn/${related.slug}`}
                className="rounded-xl border border-felines-border bg-felines-surface p-4 transition-colors hover:border-felines-accent"
              >
                <p className="font-semibold text-felines-text-primary">{related.title}</p>
                <p className="mt-1 text-sm text-felines-text-secondary">{related.summary}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
