// Shows the current weather at a given location along with a care alert
// when conditions are likely to affect street cats (extreme heat increases
// dehydration risk, heavy rain removes shelter/food access). Client-side
// (not a server component) so it can refetch whenever lat/lon change —
// used both for a colony's fixed location and for the map's current
// visible area, which moves as the visitor pans/zooms.
"use client";

import { useEffect, useState } from "react";
import { NATAL_COORDS, getWeatherAt, type WeatherSnapshot } from "@/lib/weather";

export default function WeatherBanner({
  lat = NATAL_COORDS.lat,
  lon = NATAL_COORDS.lon,
}: {
  lat?: number;
  lon?: number;
}) {
  const [weather, setWeather] = useState<WeatherSnapshot | null>(null);

  useEffect(() => {
    getWeatherAt(lat, lon).then(setWeather);
  }, [lat, lon]);

  if (!weather) return null;

  const roundedTemp = Math.round(weather.temperatureCelsius);

  let alertMessage: string | null = null;
  let alertColorClass = "border-felines-border bg-felines-surface text-felines-text-secondary";

  if (weather.isExtremeHeat) {
    alertMessage =
      "Calor forte hoje. Os gatos de rua vão precisar de água fresca na sombra com mais frequência.";
    alertColorClass = "border-felines-warning bg-felines-warning/10 text-felines-text-primary";
  } else if (weather.isHeavyRain) {
    alertMessage = "Chuva forte a caminho. Vale checar se a colônia tem um abrigo seco por perto.";
    alertColorClass = "border-felines-accent bg-felines-accent/10 text-felines-text-primary";
  }

  return (
    <div
      className={`flex flex-wrap items-center gap-3 rounded-xl border px-4 py-3 text-sm ${alertColorClass}`}
    >
      <span className="font-medium">
        Agora: {roundedTemp}°C, {weather.description}
      </span>
      {alertMessage && <span>{alertMessage}</span>}
    </div>
  );
}
