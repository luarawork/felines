// Renders /map's map and the floating "+ Cadastrar colônia" action.
// The activity panel (showing what's visible in the current map area)
// and its own show/hide toggle live inside ColonyMap itself, since the
// panel is always present on screen rather than swapped in and out.
// Holds the map's current center so the weather banner reflects wherever
// the visitor is currently looking, instead of a fixed city.
"use client";

import { useState } from "react";
import Link from "next/link";
import MapShell from "@/components/MapShell";
import WeatherBanner from "@/components/WeatherBanner";
import { NATAL_COORDS } from "@/lib/weather";

export default function MapPageClient() {
  const [mapCenter, setMapCenter] = useState<{ lat: number; lon: number }>({
    lat: NATAL_COORDS.lat,
    lon: NATAL_COORDS.lon,
  });

  return (
    // --navbar-height is set by NavBar via ResizeObserver, since the
    // nav wraps to 2-3 lines on narrow screens and a hardcoded subtraction
    // (or relying on percentage-height through the flex `<main>`, which
    // doesn't reliably resolve since <body> only has min-height) doesn't
    // track that. Falls back to 65px before the observer's first measurement.
    <div className="relative h-[calc(100vh-var(--navbar-height,65px))] w-full">
      <MapShell onCenterChange={(lat, lon) => setMapCenter({ lat, lon })} />

      {/* On mobile the weather banner sits below the search/filter panel
          instead of beside it — both are wide enough that side-by-side
          corner placement overlaps on narrow screens. */}
      <div className="absolute left-4 right-4 top-[15.5rem] z-[1000] sm:left-auto sm:right-4 sm:top-4 sm:max-w-sm">
        <WeatherBanner lat={mapCenter.lat} lon={mapCenter.lon} />
      </div>

      <Link
        href="/colony/new"
        className="absolute bottom-6 right-6 z-[1000] rounded-full bg-felines-accent px-5 py-3 text-sm font-medium text-white shadow-lg transition-colors hover:bg-felines-accent-hover"
      >
+ Colocar uma colônia no mapa
      </Link>
    </div>
  );
}
