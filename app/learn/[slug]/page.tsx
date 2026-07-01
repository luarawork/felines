// /learn/:slug route for Felines.
// Renders a single article's content, level badge, reading time, fact
// chips, related articles, and a CTA pointing to the map or help flow.
// Localization (title/summary/body/factChips) happens client-side in
// ArticlePageClient, since this server component can't call useLanguage().
import type { Metadata } from "next";
import { getArticleBySlug, getReadingTimeMinutes, getRelatedArticles } from "@/lib/articles";
import ArticleProgressTracker from "@/components/ArticleProgressTracker";
import ReadingProgressBar from "@/components/ReadingProgressBar";
import ArticleNotFound from "@/components/ArticleNotFound";
import {
  ArticleBackLink,
  ArticleReadingTime,
  ArticlePracticeCta,
  ArticleRelatedHeading,
  ArticleBody,
  ArticleFactChips,
  ArticleTitleAndShare,
  ArticleRelatedList,
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
      </div>

      <ArticleTitleAndShare article={article} />

      <ArticleBody article={article} />

      <ArticleFactChips article={article} />

      <ArticlePracticeCta />

      {relatedArticles.length > 0 && (
        <section className="mt-10">
          <ArticleRelatedHeading />
          <ArticleRelatedList relatedArticles={relatedArticles} />
        </section>
      )}
    </div>
  );
}
