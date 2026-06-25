// /map route for Felines.
// Renders the MapShell client component, which lazy-loads the actual
// Leaflet map (Leaflet relies on the browser DOM, so it cannot run on the server).
import Link from "next/link";
import MapShell from "@/components/MapShell";
import WeatherBanner from "@/components/WeatherBanner";

export default function MapPage() {
  return (
    <div className="relative h-[calc(100vh-65px)] w-full">
      <MapShell />
      <div className="absolute left-4 right-4 top-4 z-[1000] sm:left-4 sm:right-auto sm:max-w-sm">
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
