// /map route for Felines.
// Renders MapPageClient, which lazy-loads the actual Leaflet map (Leaflet
// relies on the browser DOM, so it cannot run on the server) and lets the
// visitor toggle to a list view (the reports list) without leaving /map.
import MapPageClient from "@/components/MapPageClient";

export default function MapPage() {
  return <MapPageClient />;
}
