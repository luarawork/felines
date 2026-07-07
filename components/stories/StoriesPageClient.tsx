"use client";

import EmptyState from "@/components/shared/EmptyState";
import StoriesSection from "@/components/stories/StoriesSection";
import type { StoryWithMeta } from "@/app/stories/page";
import { useLanguage } from "@/lib/i18n";

export default function StoriesPageClient({ stories }: { stories: StoryWithMeta[] }) {
  const { t } = useLanguage();

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-bold text-felines-text-primary sm:text-3xl">
        {t("stories.pageTitle")}
      </h1>
      <p className="mt-2 text-base text-felines-text-secondary">{t("stories.pageSub")}</p>
      <StoriesSection
        stories={stories}
        emptyState={
          <div className="mt-8">
            <EmptyState
              main={t("stories.empty")}
              ctas={[{ label: t("stories.emptyCta"), href: "/map" }]}
            />
          </div>
        }
      />
    </div>
  );
}
