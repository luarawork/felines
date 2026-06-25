// Server component that shows the current weather in Natal along with a
// care alert when conditions are likely to affect street cats (extreme
// heat increases dehydration risk, heavy rain removes shelter/food access).
import { getNatalWeather } from "@/lib/weather";

export default async function WeatherBanner() {
  const weather = await getNatalWeather();
  if (!weather) return null;

  const roundedTemp = Math.round(weather.temperatureCelsius);

  let alertMessage: string | null = null;
  let alertColorClass = "border-felines-border bg-felines-surface text-felines-text-secondary";

  if (weather.isExtremeHeat) {
    alertMessage =
      "Calor intenso hoje — gatos de rua precisam de água fresca à sombra com mais frequência.";
    alertColorClass = "border-felines-warning bg-felines-warning/10 text-felines-text-primary";
  } else if (weather.isHeavyRain) {
    alertMessage =
      "Chuva forte prevista — verifique se a colônia tem abrigo seco disponível.";
    alertColorClass = "border-felines-accent bg-felines-accent/10 text-felines-text-primary";
  }

  return (
    <div
      className={`flex flex-wrap items-center gap-3 rounded-xl border px-4 py-3 text-sm ${alertColorClass}`}
    >
      <span className="font-medium">
        Natal agora: {roundedTemp}°C, {weather.description}
      </span>
      {alertMessage && <span>{alertMessage}</span>}
    </div>
  );
}
