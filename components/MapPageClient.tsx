// Lets /map switch between the Leaflet map and the reports list without
// a separate nav item or route — both views answer "what's happening
// near me", just visually different, so a single on/off toggle at the
// bottom covers it instead of a dedicated "Relatos" link in the nav.
"use client";

import { useState } from "react";
import Link from "next/link";
import MapShell from "@/components/MapShell";
import WeatherBanner from "@/components/WeatherBanner";
import ReportsList from "@/components/ReportsList";

type ViewMode = "map" | "list";

export default function MapPageClient() {
  const [view, setView] = useState<ViewMode>("map");

  return (
    // --navbar-height is set by NavBar via ResizeObserver, since the
    // nav wraps to 2-3 lines on narrow screens and a hardcoded subtraction
    // (or relying on percentage-height through the flex `<main>`, which
    // doesn't reliably resolve since <body> only has min-height) doesn't
    // track that. Falls back to 65px before the observer's first measurement.
    <div className="relative h-[calc(100vh-var(--navbar-height,65px))] w-full">
      {view === "map" ? (
        <>
          <MapShell />
          {/* On mobile the weather banner sits below the search/filter panel
              instead of beside it — both are wide enough that side-by-side
              corner placement overlaps on narrow screens. */}
          <div className="absolute left-4 right-4 top-[15.5rem] z-[1000] sm:left-auto sm:right-4 sm:top-4 sm:max-w-sm">
            <WeatherBanner />
          </div>
          <Link
            href="/colony/new"
            className="absolute bottom-6 right-6 z-[1000] rounded-full bg-felines-accent px-5 py-3 text-sm font-medium text-white shadow-lg transition-colors hover:bg-felines-accent-hover"
          >
            + Cadastrar colônia
          </Link>
        </>
      ) : (
        <div className="h-full overflow-y-auto px-4 pb-24 pt-4 sm:px-6">
          <h1 className="text-xl font-bold text-felines-text-primary">Relatos</h1>
          <ReportsList />
        </div>
      )}

      <div className="absolute bottom-6 left-1/2 z-[1000] -translate-x-1/2">
        <button
          onClick={() => setView((current) => (current === "map" ? "list" : "map"))}
          role="switch"
          aria-checked={view === "list"}
          aria-label="Alternar entre mapa e lista"
          className="flex items-center gap-2 rounded-full bg-felines-surface px-3 py-2 text-xs font-medium text-felines-text-primary shadow-lg ring-1 ring-felines-border"
        >
          <span className={view === "map" ? "text-felines-accent" : "text-felines-text-secondary"}>
            Mapa
          </span>
          <span
            className={`relative h-5 w-9 flex-shrink-0 rounded-full transition-colors ${
              view === "list" ? "bg-felines-accent" : "bg-felines-border"
            }`}
          >
            <span
              className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                view === "list" ? "translate-x-[18px]" : "translate-x-0.5"
              }`}
            />
          </span>
          <span className={view === "list" ? "text-felines-accent" : "text-felines-text-secondary"}>
            Lista
          </span>
        </button>
      </div>
    </div>
  );
}
