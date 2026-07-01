"use client";

import EmptyState from "@/components/EmptyState";
import StoriesGrid from "@/components/StoriesGrid";
import type { StoryWithMeta } from "@/app/stories/page";
import { useLanguage } from "@/lib/i18n";

export default function StoriesPageClient({ stories }: { stories: StoryWithMeta[] }) {
  const { t } = useLanguage();

  if (stories.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <h1 className="text-2xl font-bold text-felines-text-primary sm:text-3xl">
          {t("stories.pageTitle")}
        </h1>
        <div className="mt-8">
          <EmptyState
            main={t("stories.empty")}
            ctas={[{ label: t("stories.emptyCta"), href: "/map" }]}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-bold text-felines-text-primary sm:text-3xl">
        {t("stories.pageTitle")}
      </h1>
      <p className="mt-2 text-base text-felines-text-secondary">{t("stories.pageSub")}</p>
      <StoriesGrid stories={stories} />
    </div>
  );
}
