"use client";

import BackLink from "@/components/BackLink";
import ContactsBoard from "@/components/ContactsBoard";
import type { ContactRow } from "@/app/contacts/page";
import { useLanguage } from "@/lib/i18n";

export default function ContactsPageClient({
  byCity,
  categoryLabels,
}: {
  byCity: Record<string, ContactRow[]>;
  categoryLabels: Record<string, { label: string; emoji: string }>;
}) {
  const { t } = useLanguage();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <BackLink fallbackHref="/" className="text-sm text-felines-text-secondary hover:text-felines-accent">
        {t("common.backHome")}
      </BackLink>

      <h1 className="mt-4 text-3xl font-bold text-felines-text-primary">
        {t("contacts.pageTitle")}
      </h1>
      <p className="mt-2 max-w-xl text-base text-felines-text-secondary">
        {t("contacts.pageDescription")}
      </p>

      <ContactsBoard initialByCity={byCity} categoryLabels={categoryLabels} />
    </div>
  );
}
