// Lets /map switch the activity panel between hidden and visible without
// a separate nav item or route — instead of navigating away to a list
// page, the panel overlays the map and stays in sync with whatever area
// is currently in view, so a single on/off toggle at the bottom covers it.
"use client";

import { useState } from "react";
import Link from "next/link";
import MapShell from "@/components/MapShell";

type ViewMode = "map" | "list";

export default function MapPageClient({ weatherBanner }: { weatherBanner: React.ReactNode }) {
  const [view, setView] = useState<ViewMode>("map");
  const showListPanel = view === "list";

  return (
    // --navbar-height is set by NavBar via ResizeObserver, since the
    // nav wraps to 2-3 lines on narrow screens and a hardcoded subtraction
    // (or relying on percentage-height through the flex `<main>`, which
    // doesn't reliably resolve since <body> only has min-height) doesn't
    // track that. Falls back to 65px before the observer's first measurement.
    <div className="relative h-[calc(100vh-var(--navbar-height,65px))] w-full">
      <MapShell showListPanel={showListPanel} />

      {/* Hidden while the activity panel is open since they'd occupy the
          same corner of the screen, and the panel is the more relevant
          thing to see once it's been opened. */}
      {!showListPanel && (
        <div className="absolute left-4 right-4 top-[15.5rem] z-[1000] sm:left-auto sm:right-4 sm:top-4 sm:max-w-sm">
          {weatherBanner}
        </div>
      )}

      <Link
        href="/colony/new"
        className="absolute bottom-6 right-6 z-[1000] rounded-full bg-felines-accent px-5 py-3 text-sm font-medium text-white shadow-lg transition-colors hover:bg-felines-accent-hover"
      >
        + Cadastrar colônia
      </Link>

      <div className="absolute bottom-6 left-1/2 z-[1000] -translate-x-1/2">
        <button
          onClick={() => setView((current) => (current === "map" ? "list" : "map"))}
          role="switch"
          aria-checked={showListPanel}
          aria-label="Alternar entre mapa e lista"
          className="flex items-center gap-2 rounded-full bg-felines-surface px-3 py-2 text-xs font-medium text-felines-text-primary shadow-lg ring-1 ring-felines-border"
        >
          <span className={!showListPanel ? "text-felines-accent" : "text-felines-text-secondary"}>
            Mapa
          </span>
          <span
            className={`relative h-5 w-9 flex-shrink-0 rounded-full transition-colors ${
              showListPanel ? "bg-felines-accent" : "bg-felines-border"
            }`}
          >
            <span
              className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                showListPanel ? "translate-x-[18px]" : "translate-x-0.5"
              }`}
            />
          </span>
          <span className={showListPanel ? "text-felines-accent" : "text-felines-text-secondary"}>
            Lista
          </span>
        </button>
      </div>
    </div>
  );
}
