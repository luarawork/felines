// Single shared card used for every article preview across the site —
// home's "Entenda antes de agir" strip, the learn theme sections, and
// anywhere else an article gets previewed. One layout (title,
// description, reading time, in that order) so cards never look
// different depending on which section happens to render them.
import Link from "next/link";
import type { Article } from "@/lib/articles";
import { getReadingTimeMinutes } from "@/lib/articles";

export default function ArticleCard({
  article,
  isDark = false,
  isRead = false,
}: {
  article: Article;
  isDark?: boolean;
  isRead?: boolean;
}) {
  return (
    <Link
      href={`/learn/${article.slug}`}
      className={
        isDark
          ? "block h-full rounded-2xl border border-felines-border-on-dark bg-felines-dark-accent p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.25)]"
          : "block h-full rounded-2xl border border-felines-border bg-felines-surface p-5 shadow-[0_2px_8px_rgba(0,0,0,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.10)]"
      }
    >
      <div className="flex items-start justify-between gap-2">
        <p className={`font-semibold ${isDark ? "text-white" : "text-felines-text-primary"}`}>
          {article.title}
        </p>
        {isRead && (
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
  );
}
