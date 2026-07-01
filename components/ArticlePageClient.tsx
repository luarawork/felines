"use client";

import Link from "next/link";
import OpenHelpModalButton from "@/components/OpenHelpModalButton";
import { useLanguage } from "@/lib/i18n";

export function ArticleBackLink() {
  const { t } = useLanguage();
  return (
    <Link href="/#aprender" className="text-sm text-felines-text-secondary hover:text-felines-accent">
      {t("article.backToGuide")}
    </Link>
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
    <div className="mt-10 rounded-xl border border-felines-border bg-felines-surface p-5">
      <p className="font-semibold text-felines-text-primary">{t("article.practiceHeadline")}</p>
      <div className="mt-3 flex flex-wrap gap-3">
        <Link
          href="/map"
          className="rounded-full bg-felines-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-felines-accent-hover"
        >
          {t("article.practiceMapCta")}
        </Link>
        <OpenHelpModalButton className="rounded-full border border-felines-accent px-4 py-2 text-sm font-medium text-felines-accent transition-colors hover:bg-felines-accent hover:text-white">
          {t("article.practiceHelpCta")}
        </OpenHelpModalButton>
      </div>
    </div>
  );
}

export function ArticleRelatedHeading() {
  const { t } = useLanguage();
  return (
    <h3 className="text-lg font-bold text-felines-text-primary">{t("article.relatedArticles")}</h3>
  );
}
