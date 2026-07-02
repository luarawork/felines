import { validateCoordinates } from "@/lib/validateCoordinates";

// Reverse geocoding via Nominatim (OpenStreetMap) — resolves a lat/lon
// pair to a human-readable city name. Used for colony city auto-fill
// (components/NewColonyForm.tsx) and for labeling the weather banner
// with the place being shown, since the map's visible center has no
// name of its own.
//
// lat/lon come from map clicks/drags, not raw text input, but they're
// still validated here (range-checked, never string-interpolated into
// the URL) before reaching Nominatim — reported by Aikido Security.
export async function reverseGeocodeCity(
  lat: number,
  lon: number,
  language: "pt" | "en"
): Promise<string | null> {
  try {
    const safe = validateCoordinates(lat, lon);
    const acceptLanguage = language === "en" ? "en" : "pt-BR";

    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("lat", String(safe.lat));
    url.searchParams.set("lon", String(safe.lon));
    url.searchParams.set("format", "json");
    url.searchParams.set("accept-language", acceptLanguage);

    const res = await fetch(url, { redirect: "error" });
    if (!res.ok) return null;

    const json = await res.json();
    if (typeof json !== "object" || json === null) return null;

    const addr = json.address ?? {};
    return addr.city ?? addr.town ?? addr.village ?? addr.municipality ?? null;
  } catch {
    return null;
  }
}
