// /learn/:slug route for Felines.
// Renders a single article's content, level badge, reading time, fact
// chips, related articles, and a CTA pointing to the map or help flow.
import type { Metadata } from "next";
import Link from "next/link";
import { getArticleBySlug, getReadingTimeMinutes, getRelatedArticles } from "@/lib/articles";
import ArticleProgressTracker from "@/components/ArticleProgressTracker";
import FactChip from "@/components/FactChip";
import ReadingProgressBar from "@/components/ReadingProgressBar";
import ArticleNotFound from "@/components/ArticleNotFound";
import ShareButton from "@/components/ShareButton";
import {
  ArticleBackLink,
  ArticleReadingTime,
  ArticlePracticeCta,
  ArticleRelatedHeading,
} from "@/components/ArticlePageClient";

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

      <ArticleBackLink />

      <div className="mt-3 flex items-center justify-between gap-3">
        <ArticleReadingTime minutes={readingTime} />
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

      <ArticlePracticeCta />

      {relatedArticles.length > 0 && (
        <section className="mt-10">
          <ArticleRelatedHeading />
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
