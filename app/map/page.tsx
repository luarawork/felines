// /map route for Felines.
// MapPageClient handles the map/list toggle, lazy-loads the Leaflet map
// (Leaflet relies on the browser DOM, so it can't run on the server), and
// owns the weather banner — it needs to update as the map's visible
// center moves, which only client-side state can track.
import MapPageClient from "@/components/map/MapPageClient";

export default function MapPage() {
  return <MapPageClient />;
}
