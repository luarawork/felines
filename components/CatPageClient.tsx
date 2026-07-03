// Client wrapper for /cat/[id] — the route itself is a server component
// (fetches cat + notes data), but rendering needs useLanguage(), which
// only works in a client component. Same split used by ArticlePageClient
// and ColonyDetailClient for the same reason.
"use client";

import Image from "next/image";
import Link from "next/link";
import CatNotesSection from "@/components/CatNotesSection";
import { useLanguage } from "@/lib/i18n";

type CatNote = { id: string; body: string; health_status: string | null; created_at: string };

export function CatNotFoundNotice() {
  const { t } = useLanguage();
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <p className="text-felines-text-secondary">{t("catPage.notFound")}</p>
      <Link
        href="/map"
        className="mt-4 inline-block text-sm font-medium text-felines-accent-hover hover:underline"
      >
        {t("catPage.viewMap")}
      </Link>
    </div>
  );
}

export default function CatPageClient({
  catId,
  catName,
  photoUrl,
  castrated,
  lastSeenDate,
  colony,
  notes,
}: {
  catId: string;
  catName: string | null;
  photoUrl: string | null;
  castrated: boolean;
  lastSeenDate: string | null;
  colony: { id: string; name: string } | null;
  notes: CatNote[];
}) {
  const { t } = useLanguage();

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      {colony && (
        <Link
          href={`/colony/${colony.id}`}
          className="text-sm text-felines-text-secondary hover:text-felines-accent"
        >
          ← {colony.name}
        </Link>
      )}

      <div className="mt-5 flex gap-5">
        {photoUrl ? (
          <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl">
            <Image
              src={photoUrl}
              alt={catName ?? t("catPage.photoAlt")}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-2xl bg-felines-surface text-4xl">
            🐱
          </div>
        )}

        <div>
          <h1 className="text-2xl font-bold text-felines-text-primary">
            {catName ?? t("catPage.noName")}
          </h1>
          {colony && (
            <p className="mt-0.5 text-sm text-felines-text-secondary">{colony.name}</p>
          )}
          <div className="mt-2 flex flex-wrap gap-2">
            <span
              className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                castrated
                  ? "border-felines-success/30 bg-felines-success/10 text-felines-success-hover"
                  : "border-felines-border text-felines-text-secondary"
              }`}
            >
              {castrated ? t("catPage.castrated") : t("catPage.notCastrated")}
            </span>
            {lastSeenDate && (
              <span className="rounded-full border border-felines-border px-2.5 py-0.5 text-xs text-felines-text-secondary">
                {t("catPage.seenOn").replace("{date}", lastSeenDate)}
              </span>
            )}
          </div>
        </div>
      </div>

      <CatNotesSection catId={catId} initialNotes={notes} />
    </div>
  );
}
