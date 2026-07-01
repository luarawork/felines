// Shows the current weather at a given location along with a care alert
// when conditions are likely to affect street cats (extreme heat increases
// dehydration risk, heavy rain removes shelter/food access). Client-side
// (not a server component) so it can refetch whenever lat/lon change —
// used both for a colony's fixed location and for the map's current
// visible area, which moves as the visitor pans/zooms.
"use client";

import { useEffect, useState } from "react";
import { NATAL_COORDS, getWeatherAt, type WeatherSnapshot } from "@/lib/weather";
import { reverseGeocodeCity } from "@/lib/geocode";
import { useLanguage } from "@/lib/i18n";

export default function WeatherBanner({
  lat = NATAL_COORDS.lat,
  lon = NATAL_COORDS.lon,
  // Known place name (e.g. a colony's own name) — skips the reverse
  // geocode lookup below when the caller already knows what to show.
  locationName,
}: {
  lat?: number;
  lon?: number;
  locationName?: string;
}) {
  const [weather, setWeather] = useState<WeatherSnapshot | null>(null);
  const [cityName, setCityName] = useState<string | null>(null);
  const { t, language } = useLanguage();

  useEffect(() => {
    getWeatherAt(lat, lon, language).then(setWeather);
  }, [lat, lon, language]);

  // Only resolve a city name via reverse geocoding when the caller
  // didn't already pass one (the map view has no fixed place name of
  // its own, unlike a colony page).
  useEffect(() => {
    if (locationName) return;
    reverseGeocodeCity(lat, lon, language).then(setCityName);
  }, [lat, lon, language, locationName]);

  if (!weather) return null;

  const roundedTemp = Math.round(weather.temperatureCelsius);
  const displayName = locationName ?? cityName;

  let alertMessage: string | null = null;
  let alertColorClass = "border-felines-border bg-felines-surface text-felines-text-secondary";

  if (weather.isExtremeHeat) {
    alertMessage = t("common.weather.extremeHeat");
    alertColorClass = "border-felines-warning bg-felines-warning/10 text-felines-text-primary";
  } else if (weather.isHeavyRain) {
    alertMessage = t("common.weather.heavyRain");
    alertColorClass = "border-felines-accent bg-felines-accent/10 text-felines-text-primary";
  }

  return (
    <div
      className={`flex flex-wrap items-center gap-3 rounded-xl border px-4 py-3 text-sm ${alertColorClass}`}
    >
      <span className="font-medium">
        {displayName ? `${displayName}, ` : `${t("common.weather.now")} `}
        {roundedTemp}°C, {weather.description}
      </span>
      {alertMessage && <span>{alertMessage}</span>}
    </div>
  );
}
