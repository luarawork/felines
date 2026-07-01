"use client";
import { useLanguage } from "@/lib/i18n";

export default function ReportsPageHeader() {
  const { t } = useLanguage();
  return (
    <>
      <h1 className="text-2xl font-bold text-felines-text-primary sm:text-3xl">
        {t("reports.title")}
      </h1>
      <p className="mt-2 text-sm text-felines-text-secondary">{t("reports.subtitle")}</p>
    </>
  );
}
