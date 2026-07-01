// Client-side search + alphabetical sections for /glossary. Filters in
// real time as the visitor types — small enough term list (a dozen or
// so) that filtering client-side beats round-tripping to a search API.
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { GlossaryTerm } from "@/lib/glossary";
import { localizeGlossaryTerm } from "@/lib/glossary";
import { getArticleBySlug, localizeArticle } from "@/lib/articles";
import FactChip from "@/components/FactChip";
import { useLanguage } from "@/lib/i18n";

export default function GlossaryList({ terms }: { terms: GlossaryTerm[] }) {
  const [search, setSearch] = useState("");
  const { t, language } = useLanguage();

  const localizedTerms = useMemo(
    () => terms.map((term) => localizeGlossaryTerm(term, language)),
    [terms, language]
  );

  const sortedTerms = useMemo(
    () => [...localizedTerms].sort((a, b) => a.term.localeCompare(b.term, language === "en" ? "en" : "pt-BR")),
    [localizedTerms, language]
  );

  const filteredTerms = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    if (!normalizedSearch) return sortedTerms;
    return sortedTerms.filter(
      (item) =>
        item.term.toLowerCase().includes(normalizedSearch) ||
        item.definition.toLowerCase().includes(normalizedSearch)
    );
  }, [sortedTerms, search]);

  const availableLetters = useMemo(
    () => Array.from(new Set(filteredTerms.map((item) => item.term[0].toUpperCase()))),
    [filteredTerms]
  );

  return (
    <div>
      <input
        type="text"
        value={search}
        onChange={(formEvent) => setSearch(formEvent.target.value)}
        placeholder={t("glossary.searchPlaceholder")}
        aria-label={t("glossary.searchLabel")}
        className="mt-6 w-full rounded-md border border-felines-border bg-white px-4 py-2.5 text-sm"
      />

      {availableLetters.length > 1 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {availableLetters.map((letter) => (
            <a
              key={letter}
              href={`#glossary-${letter}`}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-felines-border text-xs font-medium text-felines-text-secondary hover:border-felines-accent hover:text-felines-accent"
            >
              {letter}
            </a>
          ))}
        </div>
      )}

      {filteredTerms.length === 0 ? (
        <p className="mt-8 text-sm text-felines-text-secondary">
          {t("glossary.noResults").replace("{query}", search)}
        </p>
      ) : (
        <dl className="mt-8 space-y-8">
          {filteredTerms.map((item, index) => {
            const letter = item.term[0].toUpperCase();
            const isFirstOfLetter = index === 0 || filteredTerms[index - 1].term[0].toUpperCase() !== letter;
            return (
              <div key={item.term} id={isFirstOfLetter ? `glossary-${letter}` : undefined}>
                <dt className="text-lg font-bold text-felines-text-primary">{item.term}</dt>
                <dd className="mt-1.5 text-base leading-relaxed text-felines-text-secondary">
                  {item.definition}
                </dd>
                {item.factChip && (
                  <div className="mt-2">
                    <FactChip text={item.factChip} />
                  </div>
                )}
                {item.relatedArticleSlugs && item.relatedArticleSlugs.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-3">
                    {item.relatedArticleSlugs.map((slug) => {
                      const article = getArticleBySlug(slug);
                      if (!article) return null;
                      const localizedArticle = localizeArticle(article, language);
                      return (
                        <Link
                          key={slug}
                          href={`/learn/${slug}`}
                          className="text-sm font-medium text-felines-accent-hover"
                        >
                          {localizedArticle.title}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </dl>
      )}
    </div>
  );
}
