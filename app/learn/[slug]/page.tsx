// /learn/:slug route for Felines.
// Renders a single article's content, related articles from the same
// level, and a CTA pointing to the map or the report flow.
import { notFound } from "next/navigation";
import Link from "next/link";
import { ARTICLES, getArticleBySlug } from "@/lib/articles";
import ArticleProgressTracker from "@/components/ArticleProgressTracker";

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) notFound();

  const relatedArticles = ARTICLES.filter(
    (candidate) => candidate.level === article.level && candidate.slug !== article.slug
  );

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      {/* Records this article as read for the signed-in user, if any */}
      <ArticleProgressTracker slug={article.slug} />

      <Link href="/learn" className="text-sm text-felines-text-secondary hover:text-felines-accent">
        ← Voltar ao guia
      </Link>

      <h1 className="mt-3 text-2xl font-bold text-felines-text-primary sm:text-3xl">
        {article.title}
      </h1>

      <div className="mt-6 space-y-4">
        {article.body.map((paragraph) => (
          <p key={paragraph} className="text-base leading-relaxed text-felines-text-secondary">
            {paragraph}
          </p>
        ))}
      </div>

      <div className="mt-10 rounded-xl border border-felines-border bg-felines-surface p-5">
        <p className="font-semibold text-felines-text-primary">Quer colocar isso em prática?</p>
        <div className="mt-3 flex flex-wrap gap-3">
          <Link
            href="/map"
            className="rounded-full bg-felines-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-felines-accent-hover"
          >
            Ver colônias no mapa
          </Link>
          <Link
            href="/help"
            className="rounded-full border border-felines-accent px-4 py-2 text-sm font-medium text-felines-accent transition-colors hover:bg-felines-accent hover:text-white"
          >
            Fazer um relato
          </Link>
        </div>
      </div>

      {relatedArticles.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-bold text-felines-text-primary">Artigos relacionados</h2>
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
