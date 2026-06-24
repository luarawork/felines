// /map route for Felines.
// Renders the MapShell client component, which lazy-loads the actual
// Leaflet map (Leaflet relies on the browser DOM, so it cannot run on the server).
import MapShell from "@/components/MapShell";

export default function MapPage() {
  return (
    <div className="h-[calc(100vh-65px)] w-full">
      <MapShell />
    </div>
  );
}
