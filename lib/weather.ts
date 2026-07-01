// Weather lookup for Felines, using the OpenWeatherMap current-weather API.
// Used to surface care alerts for street cat colonies (extreme heat or
// heavy rain affect food/water availability and shelter needs). Takes
// coordinates instead of hardcoding a single city, so the weather banner
// can reflect the colony being viewed or the map's current location
// instead of always showing Natal.
//
// SECURITY NOTE: this key is genuinely public today — both WeatherBanner
// (client-side, so it can refetch as the map moves) and
// lib/notifications.ts call this directly, which means the
// NEXT_PUBLIC_WEATHER_API_KEY appid in the URL runs in the browser.
export const NATAL_COORDS = { lat: -5.7945, lon: -35.211 };

export type WeatherSnapshot = {
  temperatureCelsius: number;
  description: string;
  isHeavyRain: boolean;
  isExtremeHeat: boolean;
};

// Fetches the current weather for the given coordinates. Returns null if
// the API key is missing or the request fails, so the UI can simply omit
// the banner.
export async function getWeatherAt(
  lat: number,
  lon: number,
  language: "pt" | "en" = "pt"
): Promise<WeatherSnapshot | null> {
  const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
  if (!apiKey) return null;

  const owmLang = language === "en" ? "en" : "pt_br";

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=${owmLang}&appid=${apiKey}`,
      { next: { revalidate: 1800 } } // cache for 30 minutes
    );

    if (!response.ok) return null;

    const data = await response.json();
    const temperatureCelsius = data.main?.temp;
    const description = data.weather?.[0]?.description ?? "";
    const weatherId = data.weather?.[0]?.id ?? 0;

    if (typeof temperatureCelsius !== "number") return null;

    return {
      temperatureCelsius,
      description,
      // OpenWeatherMap group 5xx codes are rain; 502+ is moderate/heavy rain and above.
      isHeavyRain: weatherId >= 502 && weatherId < 600,
      isExtremeHeat: temperatureCelsius >= 33,
    };
  } catch {
    return null;
  }
}
