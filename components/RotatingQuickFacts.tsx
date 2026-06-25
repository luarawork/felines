// Shows 4 quick facts at a time from a larger pool, rotating to the
// next batch every few seconds so the home page can carry more stats
// than would fit (or feel readable) all at once. Each fact links to
// its source.
"use client";

import { useEffect, useState } from "react";
import { QUICK_FACTS } from "@/lib/quickFacts";

const VISIBLE_COUNT = 4;
const ROTATE_INTERVAL_MS = 8000;

export default function RotatingQuickFacts() {
  const [startIndex, setStartIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStartIndex((previous) => (previous + VISIBLE_COUNT) % QUICK_FACTS.length);
    }, ROTATE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  const visibleFacts = Array.from({ length: Math.min(VISIBLE_COUNT, QUICK_FACTS.length) }, (_, i) => QUICK_FACTS[(startIndex + i) % QUICK_FACTS.length]);

  return (
    <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {visibleFacts.map((fact) => (
        <div key={fact.label} className="rounded-lg bg-felines-background p-4">
          <p className="text-2xl font-bold text-felines-accent">{fact.value}</p>
          <p className="mt-1 text-sm leading-relaxed text-felines-text-secondary">{fact.label}</p>
          <a
            href={fact.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-block text-xs font-medium text-felines-accent hover:text-felines-accent-hover"
          >
            Fonte: {fact.sourceLabel} ↗
          </a>
        </div>
      ))}
    </div>
  );
}
