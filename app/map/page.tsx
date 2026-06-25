// /map route for Felines.
// Renders the MapShell client component, which lazy-loads the actual
// Leaflet map (Leaflet relies on the browser DOM, so it cannot run on the server).
import Link from "next/link";
import MapShell from "@/components/MapShell";
import WeatherBanner from "@/components/WeatherBanner";

export default function MapPage() {
  return (
    // h-full (not a hardcoded "100vh minus navbar height") because the
    // navbar wraps to 2-3 lines on narrow screens — its real height
    // varies, and the parent <main> in the root layout already sizes
    // itself correctly via flexbox, so this just needs to fill that.
    <div className="relative h-full w-full">
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
    </div>
  );
}
