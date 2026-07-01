// Empty state shown when a /learn/:slug route doesn't match any known
// article, instead of a generic 404 page.
"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n";

export default function ArticleNotFound() {
  const { t } = useLanguage();

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 text-center sm:px-6">
      <p className="text-xl font-bold text-felines-text-primary">
        {t("articleNotFound.heading")}
      </p>
      <p className="mt-2 text-base text-felines-text-secondary">{t("articleNotFound.prompt")}</p>
      <Link
        href="/#aprender"
        className="mt-6 inline-block rounded-full bg-felines-accent px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-felines-accent-hover"
      >
        {t("articleNotFound.exploreCta")}
      </Link>
    </div>
  );
}
