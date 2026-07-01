// Reverse geocoding via Nominatim (OpenStreetMap) — resolves a lat/lon
// pair to a human-readable city name. Used for colony city auto-fill
// (components/NewColonyForm.tsx) and for labeling the weather banner
// with the place being shown, since the map's visible center has no
// name of its own.
export async function reverseGeocodeCity(
  lat: number,
  lon: number,
  language: "pt" | "en"
): Promise<string | null> {
  try {
    const acceptLanguage = language === "en" ? "en" : "pt-BR";
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=${acceptLanguage}`
    );
    const json = await res.json();
    const addr = json.address ?? {};
    return addr.city ?? addr.town ?? addr.village ?? addr.municipality ?? null;
  } catch {
    return null;
  }
}
