// Validates geographic coordinates before they're used to build a
// request to an external API (Nominatim reverse geocoding). Reported
// by Aikido Security — coordinates reach the request URL without
// range validation, so a malformed/injected lat or lon could shape
// the outgoing request in unintended ways.
export function isValidLatitude(lat: unknown): lat is number {
  return typeof lat === "number" && Number.isFinite(lat) && lat >= -90 && lat <= 90;
}

export function isValidLongitude(lon: unknown): lon is number {
  return typeof lon === "number" && Number.isFinite(lon) && lon >= -180 && lon <= 180;
}

// Throws if either value isn't a real, in-range coordinate. Rounding
// to 6 decimal places (~10cm precision) also discards any floating
// point noise without losing meaningful precision.
export function validateCoordinates(lat: unknown, lon: unknown): { lat: number; lon: number } {
  if (!isValidLatitude(lat)) throw new Error(`Invalid latitude: ${lat}`);
  if (!isValidLongitude(lon)) throw new Error(`Invalid longitude: ${lon}`);

  return {
    lat: Math.round(lat * 1_000_000) / 1_000_000,
    lon: Math.round(lon * 1_000_000) / 1_000_000,
  };
}
