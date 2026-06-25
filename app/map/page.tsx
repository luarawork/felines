// /map route for Felines.
// Stays a server component so WeatherBanner (an async server component
// fetching live weather data) can render server-side; its output is then
// passed down into MapPageClient, which handles the map/list toggle and
// lazy-loads the Leaflet map (Leaflet relies on the browser DOM, so it
// cannot run on the server).
import MapPageClient from "@/components/MapPageClient";
import WeatherBanner from "@/components/WeatherBanner";

export default function MapPage() {
  return <MapPageClient weatherBanner={<WeatherBanner />} />;
}
