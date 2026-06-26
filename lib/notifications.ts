// Helpers for the `notifications` table — currently just extreme
// weather alerts for caretakers, created client-side since this stack
// has no scheduled job runner. De-duplication (one alert per colony per
// day) happens here, by checking for an existing row from today before
// inserting a new one.
import { supabase } from "@/lib/supabaseClient";
import { getNatalWeather } from "@/lib/weather";

export type Notification = {
  id: string;
  colony_id: string | null;
  type: string;
  message: string;
  read: boolean;
  created_at: string;
};

export async function getUnreadCount(userId: string): Promise<number> {
  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("read", false);

  return count ?? 0;
}

export async function getNotifications(userId: string): Promise<Notification[]> {
  const { data } = await supabase
    .from("notifications")
    .select("id, colony_id, type, message, read, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function markAllRead(userId: string): Promise<void> {
  await supabase.from("notifications").update({ read: true }).eq("user_id", userId).eq("read", false);
}

// Checks the current temperature and, if it's extreme (below 10°C or
// above 32°C), creates one notification per colony the user cares for —
// unless one was already created today for that colony. The weather
// reading is a single regional value (see lib/weather.ts), so this is
// an approximation: every colony gets the same reading rather than a
// lookup at its own coordinates.
export async function checkExtremeWeatherForCaretaker(userId: string): Promise<void> {
  const weather = await getNatalWeather();
  if (!weather) return;

  const isExtremeCold = weather.temperatureCelsius < 10;
  const isExtremeHeat = weather.temperatureCelsius > 32;
  if (!isExtremeCold && !isExtremeHeat) return;

  const { data: caretakerRows } = await supabase
    .from("caretakers")
    .select("colonies(id, name)")
    .eq("user_id", userId);

  const colonies = (caretakerRows ?? [])
    .map((row) => row.colonies as unknown as { id: string; name: string } | null)
    .filter((colony): colony is { id: string; name: string } => colony !== null);

  if (colonies.length === 0) return;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const roundedTemp = Math.round(weather.temperatureCelsius);
  const message = isExtremeCold
    ? `Está fazendo ${roundedTemp}°C — frio extremo para os gatos de`
    : `Está fazendo ${roundedTemp}°C — calor extremo para os gatos de`;

  for (const colony of colonies) {
    const { data: existing } = await supabase
      .from("notifications")
      .select("id")
      .eq("user_id", userId)
      .eq("colony_id", colony.id)
      .eq("type", "extreme_weather")
      .gte("created_at", todayStart.toISOString())
      .maybeSingle();

    if (existing) continue;

    await supabase.from("notifications").insert({
      user_id: userId,
      colony_id: colony.id,
      type: "extreme_weather",
      message: `${message} ${colony.name}. Considere checar comida, água e abrigo.`,
    });
  }
}
