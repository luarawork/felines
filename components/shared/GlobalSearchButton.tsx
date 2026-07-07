// Global search — Cmd+K/Ctrl+K or the search icon in the navbar opens a
// full-screen modal that searches colonies and community contacts
// (Supabase, ilike — explicitly allowed as a fallback to full-text
// search per spec, and simpler to keep correct than a to_tsvector +
// GIN index setup for this dataset size), plus articles and glossary
// terms (both static, searched client-side since there's no backend
// round-trip worth making for content that's already in the bundle).
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { ARTICLES, localizeArticle } from "@/lib/content/articles";
import { GLOSSARY_TERMS, localizeGlossaryTerm } from "@/lib/content/glossary";
import { useLanguage } from "@/lib/i18n";

const RECENT_SEARCHES_KEY = "felines_recent_searches";
const MAX_RECENT_SEARCHES = 5;
const MAX_RESULTS_PER_GROUP = 5;

type SearchGroup = "colonies" | "articles" | "glossary" | "contacts";

type SearchResult = {
  id: string;
  icon: string;
  title: string;
  excerpt: string;
  href: string;
  group: SearchGroup;
};

function loadRecentSearches(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRecentSearch(query: string) {
  const trimmed = query.trim();
  if (!trimmed) return;
  const existing = loadRecentSearches().filter((item) => item.toLowerCase() !== trimmed.toLowerCase());
  const updated = [trimmed, ...existing].slice(0, MAX_RECENT_SEARCHES);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
}

function searchArticlesAndGlossary(query: string, language: "pt" | "en"): SearchResult[] {
  const normalized = query.toLowerCase();

  const articleResults: SearchResult[] = ARTICLES.filter((article) => {
    const localized = localizeArticle(article, language);
    return (
      localized.title.toLowerCase().includes(normalized) ||
      localized.body.some((paragraph) => paragraph.toLowerCase().includes(normalized))
    );
  })
    .slice(0, MAX_RESULTS_PER_GROUP)
    .map((article) => {
      const localized = localizeArticle(article, language);
      return {
        id: `article-${article.slug}`,
        icon: "📖",
        title: localized.title,
        excerpt: localized.summary,
        href: `/learn/${article.slug}`,
        group: "articles" as const,
      };
    });

  const glossaryResults: SearchResult[] = GLOSSARY_TERMS.filter((item) => {
    const localized = localizeGlossaryTerm(item, language);
    return (
      localized.term.toLowerCase().includes(normalized) ||
      localized.definition.toLowerCase().includes(normalized)
    );
  })
    .slice(0, MAX_RESULTS_PER_GROUP)
    .map((item) => {
      const localized = localizeGlossaryTerm(item, language);
      return {
        id: `glossary-${item.term}`,
        icon: "📚",
        title: localized.term,
        excerpt: localized.definition,
        href: `/glossary`,
        group: "glossary" as const,
      };
    });

  return [...articleResults, ...glossaryResults];
}

export default function GlobalSearchButton() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [colonyResults, setColonyResults] = useState<SearchResult[]>([]);
  const [contactResults, setContactResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  // Drives the enter transition: mounts hidden, then flips to the
  // "-in" classes a frame later for a fade + slide-up entrance instead
  // of an instant snap into view.
  const [entered, setEntered] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const handleClose = useCallback(() => {
    setOpen(false);
    setEntered(false);
    setQuery("");
    setDebouncedQuery("");
    setSelectedIndex(0);
    // Return focus to the button that opened the search.
    setTimeout(() => triggerRef.current?.focus(), 50);
  }, []);

  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(frame);
  }, [open]);

  // Global Cmd+K / Ctrl+K shortcut, available from anywhere in the app.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      // Reading localStorage on open, not deriving state from props —
      // outside what this lint rule covers.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRecentSearches(loadRecentSearches());
      setTimeout(() => inputRef.current?.focus(), 50);
      // Colony results require a session (see the search effect below)
      // — re-checked every time the modal opens so a sign-in/out since
      // the last search is reflected immediately.
      supabase.auth.getSession().then(({ data }) => setSession(data.session));
    }
  }, [open]);

  // 300ms debounce before actually searching.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const normalized = debouncedQuery.trim();
    if (!normalized) {
      // Resetting in response to the query being cleared, not deriving
      // render state from props — outside what this lint rule covers.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setColonyResults([]);
      setContactResults([]);
      return;
    }

    let cancelled = false;

    async function runSearch() {
      // Colony detail pages require a session (ColonyDetailClient
      // gates them) — surfacing colonies to a signed-out searcher would
      // just be a dead-end result that bounces to a login wall, so
      // skip that query entirely instead of running it for nothing.
      const [{ data: colonyRows }, { data: contactRows }] = await Promise.all([
        session
          ? supabase
              .from("colonies")
              .select("id, name, narrative")
              .or(`name.ilike.%${normalized}%,narrative.ilike.%${normalized}%`)
              .limit(MAX_RESULTS_PER_GROUP)
          : Promise.resolve({ data: [] }),
        supabase
          .from("community_contacts")
          .select("id, city, name, category, notes")
          .or(`name.ilike.%${normalized}%,city.ilike.%${normalized}%,notes.ilike.%${normalized}%`)
          .limit(MAX_RESULTS_PER_GROUP),
      ]);

      if (cancelled) return;

      setColonyResults(
        (colonyRows ?? []).map((colony) => ({
          id: `colony-${colony.id}`,
          icon: "🐾",
          title: colony.name,
          excerpt: colony.narrative ?? "",
          href: `/colony/${colony.id}`,
          group: "colonies" as const,
        }))
      );

      setContactResults(
        (contactRows ?? []).map((contact) => ({
          id: `contact-${contact.id}`,
          icon: "📇",
          title: contact.name,
          excerpt: contact.city,
          href: `/contacts`,
          group: "contacts" as const,
        }))
      );
    }

    runSearch();
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, open, session]);

  const contentResults = debouncedQuery.trim() ? searchArticlesAndGlossary(debouncedQuery, language) : [];
  const allResults = [...colonyResults, ...contactResults, ...contentResults];
  const hasQuery = query.trim().length > 0;

  const handleSelectResult = useCallback((result: SearchResult) => {
    saveRecentSearch(query);
    handleClose();
    router.push(result.href);
  }, [query, handleClose, router]);

  function handleKeyDownInModal(event: React.KeyboardEvent) {
    if (event.key === "Escape") {
      handleClose();
    } else if (event.key === "Tab") {
      // Trap focus inside the modal.
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button, input, [href], [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey) {
        if (document.activeElement === first) { event.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelectedIndex((previous) => Math.min(previous + 1, allResults.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelectedIndex((previous) => Math.max(previous - 1, 0));
    } else if (event.key === "Enter" && allResults[selectedIndex]) {
      event.preventDefault();
      handleSelectResult(allResults[selectedIndex]);
    }
  }

  const groups: { name: SearchGroup; label: string; results: SearchResult[] }[] = [
    { name: "colonies", label: t("common.searchGroupColonies"), results: colonyResults },
    { name: "contacts", label: t("common.searchGroupContacts"), results: contactResults },
    { name: "articles", label: t("common.searchGroupArticles"), results: contentResults.filter((r) => r.group === "articles") },
    { name: "glossary", label: t("common.searchGroupGlossary"), results: contentResults.filter((r) => r.group === "glossary") },
  ];

  return (
    <>
      <button
        ref={triggerRef}
        onClick={() => setOpen(true)}
        aria-label={t("common.searchAriaLabel")}
        title={t("common.searchTitle")}
        className="flex h-11 w-11 items-center justify-center rounded-full text-felines-text-secondary transition-colors hover:bg-felines-background hover:text-felines-accent"
      >
        🔍
      </button>

      {open &&
        createPortal(
          <div
            className={`felines-modal-backdrop fixed inset-0 z-[2500] flex justify-center bg-black/50 p-4 ${
              entered ? "felines-modal-backdrop-in" : ""
            }`}
            style={{ paddingTop: "var(--navbar-height, 64px)" }}
            onClick={handleClose}
          >
            <div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-label={t("common.searchAriaModal")}
              className={`felines-modal-panel h-fit w-full max-w-lg overflow-hidden rounded-2xl bg-felines-background shadow-2xl ${
                entered ? "felines-modal-panel-in" : ""
              }`}
              onClick={(event) => event.stopPropagation()}
              onKeyDown={handleKeyDownInModal}
            >
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setSelectedIndex(0);
              }}
              placeholder={t("common.searchPlaceholder")}
              aria-label={t("common.searchLabel")}
              className="w-full border-b border-felines-border bg-transparent px-5 py-4 text-base text-felines-text-primary outline-none"
            />

            <div className="max-h-[60vh] overflow-y-auto p-2">
              {!hasQuery ? (
                recentSearches.length > 0 ? (
                  <div className="p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.1em] text-felines-text-secondary">
                      {t("common.searchRecent")}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {recentSearches.map((recent) => (
                        <button
                          key={recent}
                          onClick={() => setQuery(recent)}
                          className="rounded-full border border-felines-border px-3 py-1 text-xs text-felines-text-secondary hover:border-felines-accent hover:text-felines-accent"
                        >
                          {recent}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="p-4 text-sm text-felines-text-secondary">
                    {t("common.searchEmptyInitial")}
                  </p>
                )
              ) : allResults.length === 0 ? (
                <p className="p-4 text-sm text-felines-text-secondary">
                  {t("common.searchEmpty").replace("{query}", debouncedQuery)}
                </p>
              ) : (
                groups.map(
                  (group) =>
                    group.results.length > 0 && (
                      <div key={group.name} className="mb-2">
                        <p className="px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-felines-text-secondary">
                          {group.label}
                        </p>
                        {group.results.map((result) => {
                          const flatIndex = allResults.indexOf(result);
                          const isSelected = flatIndex === selectedIndex;
                          return (
                            <button
                              key={result.id}
                              // eslint-disable-next-line react-hooks/refs
                              onClick={() => handleSelectResult(result)}
                              onMouseEnter={() => setSelectedIndex(flatIndex)}
                              className={`flex w-full items-start gap-3 rounded-lg px-3 py-2 text-left ${
                                isSelected ? "bg-felines-accent-light" : "hover:bg-felines-surface"
                              }`}
                            >
                              <span aria-hidden="true">{result.icon}</span>
                              <span className="flex-1 overflow-hidden">
                                <span className="block truncate text-sm font-medium text-felines-text-primary">
                                  {result.title}
                                </span>
                                {result.excerpt && (
                                  <span className="block truncate text-xs text-felines-text-secondary">
                                    {result.excerpt}
                                  </span>
                                )}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )
                )
              )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
