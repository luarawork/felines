// Global search — Cmd+K/Ctrl+K or the search icon in the navbar opens a
// full-screen modal that searches colonies (Supabase, ilike — explicitly
// allowed as a fallback to full-text search per spec, and simpler to
// keep correct than a to_tsvector + GIN index setup for this dataset
// size), articles, and glossary terms (both static, searched client-side
// since there's no backend round-trip worth making for content that's
// already in the bundle).
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { ARTICLES } from "@/lib/articles";
import { GLOSSARY_TERMS } from "@/lib/glossary";

const RECENT_SEARCHES_KEY = "felines_recent_searches";
const MAX_RECENT_SEARCHES = 5;
const MAX_RESULTS_PER_GROUP = 5;

type SearchResult = {
  id: string;
  icon: string;
  title: string;
  excerpt: string;
  href: string;
  group: "Colônias" | "Artigos" | "Glossário";
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

function searchArticlesAndGlossary(query: string): SearchResult[] {
  const normalized = query.toLowerCase();

  const articleResults: SearchResult[] = ARTICLES.filter(
    (article) =>
      article.title.toLowerCase().includes(normalized) ||
      article.body.some((paragraph) => paragraph.toLowerCase().includes(normalized))
  )
    .slice(0, MAX_RESULTS_PER_GROUP)
    .map((article) => ({
      id: `article-${article.slug}`,
      icon: "📖",
      title: article.title,
      excerpt: article.summary,
      href: `/learn/${article.slug}`,
      group: "Artigos" as const,
    }));

  const glossaryResults: SearchResult[] = GLOSSARY_TERMS.filter(
    (item) =>
      item.term.toLowerCase().includes(normalized) || item.definition.toLowerCase().includes(normalized)
  )
    .slice(0, MAX_RESULTS_PER_GROUP)
    .map((item) => ({
      id: `glossary-${item.term}`,
      icon: "📚",
      title: item.term,
      excerpt: item.definition,
      href: `/glossary`,
      group: "Glossário" as const,
    }));

  return [...articleResults, ...glossaryResults];
}

export default function GlobalSearchButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [colonyResults, setColonyResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const handleClose = useCallback(() => {
    setOpen(false);
    setQuery("");
    setDebouncedQuery("");
    setSelectedIndex(0);
    // Return focus to the button that opened the search.
    setTimeout(() => triggerRef.current?.focus(), 50);
  }, []);

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
      return;
    }

    let cancelled = false;

    async function runSearch() {
      const { data } = await supabase
        .from("colonies")
        .select("id, name, narrative")
        .or(`name.ilike.%${normalized}%,narrative.ilike.%${normalized}%`)
        .limit(MAX_RESULTS_PER_GROUP);

      if (cancelled) return;
      setColonyResults(
        (data ?? []).map((colony) => ({
          id: `colony-${colony.id}`,
          icon: "🐾",
          title: colony.name,
          excerpt: colony.narrative ?? "",
          href: `/colony/${colony.id}`,
          group: "Colônias" as const,
        }))
      );
    }

    runSearch();
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, open]);

  const contentResults = debouncedQuery.trim() ? searchArticlesAndGlossary(debouncedQuery) : [];
  const allResults = [...colonyResults, ...contentResults];
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

  const groups: { name: SearchResult["group"]; results: SearchResult[] }[] = [
    { name: "Colônias", results: colonyResults },
    { name: "Artigos", results: contentResults.filter((r) => r.group === "Artigos") },
    { name: "Glossário", results: contentResults.filter((r) => r.group === "Glossário") },
  ];

  return (
    <>
      <button
        ref={triggerRef}
        onClick={() => setOpen(true)}
        aria-label="Buscar"
        title="Buscar (Ctrl+K)"
        className="flex h-9 w-9 items-center justify-center rounded-full text-felines-text-secondary transition-colors hover:bg-felines-background hover:text-felines-accent"
      >
        🔍
      </button>

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-[2500] flex justify-center bg-black/50 p-4"
            style={{ paddingTop: "var(--navbar-height, 64px)" }}
            onClick={handleClose}
          >
            <div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-label="Busca global"
              className="h-fit w-full max-w-lg overflow-hidden rounded-2xl bg-felines-background shadow-2xl"
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
              placeholder="Buscar colônias, artigos, termos do glossário..."
              aria-label="Campo de busca"
              className="w-full border-b border-felines-border bg-transparent px-5 py-4 text-base text-felines-text-primary outline-none"
            />

            <div className="max-h-[60vh] overflow-y-auto p-2">
              {!hasQuery ? (
                recentSearches.length > 0 ? (
                  <div className="p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.1em] text-felines-text-secondary">
                      Buscas recentes
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
                    Busque por colônias, artigos ou termos do glossário.
                  </p>
                )
              ) : allResults.length === 0 ? (
                <p className="p-4 text-sm text-felines-text-secondary">
                  Nenhum resultado para &quot;{debouncedQuery}&quot;. Tente buscar por &quot;colônia&quot;,
                  &quot;TNR&quot; ou &quot;alimentação&quot;.
                </p>
              ) : (
                groups.map(
                  (group) =>
                    group.results.length > 0 && (
                      <div key={group.name} className="mb-2">
                        <p className="px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-felines-text-secondary">
                          {group.name}
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
