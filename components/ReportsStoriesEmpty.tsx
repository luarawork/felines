"use client";

import EmptyState from "@/components/EmptyState";
import { useLanguage } from "@/lib/i18n";

export default function ReportsStoriesEmpty() {
  const { t } = useLanguage();
  return (
    <EmptyState
      main={t("reports.storiesEmpty.main")}
      sub={t("reports.storiesEmpty.sub")}
      ctas={[{ label: t("reports.storiesEmpty.cta"), href: "/map" }]}
    />
  );
}
