"use client";

import Link from "next/link";
import OpenHelpModalButton from "@/components/OpenHelpModalButton";
import ShareButton from "@/components/ShareButton";
import FactChip from "@/components/FactChip";
import Reveal from "@/components/Reveal";
import BackLink from "@/components/BackLink";
import type { Article } from "@/lib/articles";
import { localizeArticle } from "@/lib/articles";
import { useLanguage } from "@/lib/i18n";

export function ArticleBackLink() {
  const { t } = useLanguage();
  return (
    <BackLink fallbackHref="/#aprender" className="text-sm text-felines-text-secondary hover:text-felines-accent">
      {t("article.backToGuide")}
    </BackLink>
  );
}

export function ArticleReadingTime({ minutes }: { minutes: number }) {
  const { t } = useLanguage();
  return (
    <span className="text-xs text-felines-text-secondary">
      {minutes} {t("article.readingTime")}
    </span>
  );
}

export function ArticlePracticeCta() {
  const { t } = useLanguage();
  return (
    <Reveal delayMs={200}>
      <div className="mt-10 rounded-xl border border-felines-border bg-felines-surface p-5">
        <p className="font-semibold text-felines-text-primary">{t("article.practiceHeadline")}</p>
        <div className="mt-3 flex flex-wrap gap-3">
          <Link
            href="/map"
            className="rounded-full bg-felines-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-felines-accent-hover"
          >
            {t("article.practiceMapCta")}
          </Link>
          <OpenHelpModalButton className="rounded-full border border-felines-accent px-4 py-2 text-sm font-medium text-felines-accent-hover transition-colors hover:bg-felines-accent hover:text-white">
            {t("article.practiceHelpCta")}
          </OpenHelpModalButton>
        </div>
      </div>
    </Reveal>
  );
}

export function ArticleRelatedHeading() {
  const { t } = useLanguage();
  return (
    <h3 className="text-lg font-bold text-felines-text-primary">{t("article.relatedArticles")}</h3>
  );
}

export function ArticleTitleAndShare({ article }: { article: Article }) {
  const { language } = useLanguage();
  const localized = localizeArticle(article, language);
  return (
    <Reveal>
      <div className="mt-3 flex items-center justify-end gap-3">
        <ShareButton title={localized.title} />
      </div>
      <h1 className="mt-2 text-2xl font-bold text-felines-text-primary sm:text-3xl">
        {localized.title}
      </h1>
    </Reveal>
  );
}

export function ArticleBody({ article }: { article: Article }) {
  const { language } = useLanguage();
  const localized = localizeArticle(article, language);
  return (
    <Reveal delayMs={100}>
      <div className="mt-6 space-y-4">
        {localized.body.map((paragraph) =>
          paragraph.startsWith("### ") ? (
            <h2 key={paragraph} className="!mt-8 text-xl font-bold text-felines-text-primary">
              {paragraph.slice(4)}
            </h2>
          ) : (
            <p key={paragraph} className="text-base leading-relaxed text-felines-text-secondary">
              {paragraph}
            </p>
          )
        )}
      </div>
    </Reveal>
  );
}

export function ArticleFactChips({ article }: { article: Article }) {
  const { language } = useLanguage();
  const localized = localizeArticle(article, language);
  if (!localized.factChips || localized.factChips.length === 0) return null;
  return (
    <div className="mt-6 flex flex-wrap gap-2">
      {localized.factChips.map((fact) => (
        <FactChip key={fact} text={fact} />
      ))}
    </div>
  );
}

export function ArticleRelatedList({ relatedArticles }: { relatedArticles: Article[] }) {
  const { language } = useLanguage();
  return (
    <div className="mt-3 grid gap-3 sm:grid-cols-2">
      {relatedArticles.map((related, index) => {
        const localizedRelated = localizeArticle(related, language);
        return (
          <Reveal key={related.slug} delayMs={Math.min(index, 6) * 60}>
            <Link
              href={`/learn/${related.slug}`}
              className="block rounded-xl border border-felines-border bg-felines-surface p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-felines-accent hover:shadow-md"
            >
              <p className="font-semibold text-felines-text-primary">{localizedRelated.title}</p>
              <p className="mt-1 text-sm text-felines-text-secondary">{localizedRelated.summary}</p>
            </Link>
          </Reveal>
        );
      })}
    </div>
  );
}
