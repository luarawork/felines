// /map route for Felines.
// Renders the MapShell client component, which lazy-loads the actual
// Leaflet map (Leaflet relies on the browser DOM, so it cannot run on the server).
import Link from "next/link";
import MapShell from "@/components/MapShell";

export default function MapPage() {
  return (
    <div className="relative h-[calc(100vh-65px)] w-full">
      <MapShell />
      <Link
        href="/colony/new"
        className="absolute bottom-6 right-6 z-[1000] rounded-full bg-felines-accent px-5 py-3 text-sm font-medium text-white shadow-lg transition-colors hover:bg-felines-accent-hover"
      >
        + Cadastrar colônia
      </Link>
    </div>
  );
}
