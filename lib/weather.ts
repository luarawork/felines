// Weather lookup for Felines, using the OpenWeatherMap current-weather API.
// Used to surface care alerts for street cat colonies (extreme heat or
// heavy rain affect food/water availability and shelter needs).
//
// SECURITY NOTE: this key is genuinely public today. WeatherBanner calls
// this from a server component, but lib/notifications.ts also calls it
// from NavBar.tsx ("use client"), which means this fetch — and the
// NEXT_PUBLIC_WEATHER_API_KEY appid in the URL — runs in the browser for
// that call site. Fixing this properly means moving the extreme-weather
// check in lib/notifications.ts behind a server action, not just renaming
// this env var (renaming it would silently break that client call site
// instead of fixing the leak). See checkExtremeWeatherForCaretaker().
const NATAL_COORDS = { lat: -5.7945, lon: -35.211 };

export type WeatherSnapshot = {
  temperatureCelsius: number;
  description: string;
  isHeavyRain: boolean;
  isExtremeHeat: boolean;
};

// Fetches the current weather for Natal. Returns null if the API key is
// missing or the request fails, so the UI can simply omit the banner.
export async function getNatalWeather(): Promise<WeatherSnapshot | null> {
  const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${NATAL_COORDS.lat}&lon=${NATAL_COORDS.lon}&units=metric&lang=pt_br&appid=${apiKey}`,
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
