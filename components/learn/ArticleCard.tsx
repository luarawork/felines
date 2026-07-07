// Single shared card used for every article preview across the site —
// home's "Entenda antes de agir" strip, the learn theme sections, and
// anywhere else an article gets previewed. Same visual hierarchy
// everywhere: a clearly dominant title, a quieter description below
// it, and reading time set apart as the least prominent, caption-style
// detail — instead of three lines of near-equal weight.
"use client";
import Link from "next/link";
import type { Article } from "@/lib/content/articles";
import { getReadingTimeMinutes, localizeArticle } from "@/lib/content/articles";
import { useLanguage } from "@/lib/i18n";

export default function ArticleCard({
  article,
  isDark = false,
  isRead = false,
}: {
  article: Article;
  isDark?: boolean;
  isRead?: boolean;
}) {
  const { t, language } = useLanguage();
  const localized = localizeArticle(article, language);
  return (
    <Link
      href={localized.href ?? `/learn/${localized.slug}`}
      className={
        isDark
          ? "block h-full rounded-2xl border border-felines-border-on-dark bg-felines-dark-accent p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.25)]"
          : "block h-full rounded-2xl border border-felines-border bg-felines-surface p-5 shadow-[0_2px_8px_rgba(0,0,0,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.10)]"
      }
    >
      <div className="flex items-start justify-between gap-2">
        <h3
          className={`text-lg font-bold leading-snug ${
            isDark ? "text-white" : "text-felines-text-primary"
          }`}
        >
          {localized.title}
        </h3>
        {isRead && (
          <span className="flex-shrink-0 rounded-full bg-felines-success px-2 py-0.5 text-xs font-semibold text-white">
            {t("article.readBadge")}
          </span>
        )}
      </div>
      <p
        className={`mt-2 text-sm leading-relaxed ${
          isDark ? "text-felines-text-secondary-on-dark" : "text-felines-text-secondary"
        }`}
      >
        {localized.summary}
      </p>
      <p
        className={`mt-4 border-t pt-3 text-xs uppercase tracking-[0.06em] ${
          isDark
            ? "border-felines-border-on-dark text-felines-text-secondary-on-dark"
            : "border-felines-border text-felines-text-secondary"
        }`}
      >
        {getReadingTimeMinutes(localized)} {t("article.readingTime")}
      </p>
    </Link>
  );
}
