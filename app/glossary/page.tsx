// /glossary route for Felines.
"use client";
import GlossaryList from "@/components/learn/GlossaryList";
import { GLOSSARY_TERMS } from "@/lib/content/glossary";
import { useLanguage } from "@/lib/i18n";

export default function GlossaryPage() {
  const { t } = useLanguage();
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold text-felines-text-primary sm:text-3xl">{t("glossary.title")}</h1>
      <p className="mt-2 text-base text-felines-text-secondary">{t("glossary.subtitle")}</p>
      <GlossaryList terms={GLOSSARY_TERMS} />
    </div>
  );
}
