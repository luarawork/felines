"use client";
// i18n context for Felines.
// Provides a t() function, the current language, and a setLanguage setter
// to every client component in the tree. Language is persisted to
// localStorage and defaults to PT. The html lang attribute is kept in
// sync via a useEffect so screen readers announce the right language.
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { pt } from "./pt";
import { en } from "./en";

export type Language = "pt" | "en";

const STORAGE_KEY = "felines_language";

type I18nContextValue = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
};

const I18nContext = createContext<I18nContextValue>({
  language: "pt",
  setLanguage: () => {},
  t: (key) => key,
});

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split(".");
  let current: unknown = obj;
  for (const key of keys) {
    if (typeof current !== "object" || current === null || !(key in (current as object))) {
      return path;
    }
    current = (current as Record<string, unknown>)[key];
  }
  return typeof current === "string" ? current : path;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("pt");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
      if (stored === "en" || stored === "pt") {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLanguageState(stored);
      }
    } catch {
      // localStorage unavailable (SSR, private browsing) — stay with default
    }
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // ignore
    }
  }, []);

  const translations = language === "en" ? en : pt;

  const t = useCallback(
    (key: string): string => {
      return getNestedValue(translations as unknown as Record<string, unknown>, key);
    },
    [translations]
  );

  useEffect(() => {
    document.documentElement.lang = language === "en" ? "en" : "pt-BR";
  }, [language]);

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useLanguage() {
  return useContext(I18nContext);
}
