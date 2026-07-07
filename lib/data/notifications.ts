// Helpers for the `notifications` table — extreme weather alerts and
// "cat unseen for a while" alerts for caretakers, created client-side
// since this stack has no scheduled job runner. De-duplication (one
// alert per colony/cat per day) happens here, by checking for an
// existing row from today before inserting a new one.
import { supabase } from "@/lib/supabaseClient";
import { NATAL_COORDS, getWeatherAt } from "@/lib/external/weather";

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

// Dismisses a single notification permanently — there's no separate
// read/unread view in this app, so "mark as read" on an individual
// notification means removing it from the list entirely rather than
// leaving it there forever in a read state.
export async function dismissNotification(notificationId: string): Promise<void> {
  await supabase.from("notifications").delete().eq("id", notificationId);
}

// Checks the current weather and, if it's significant (extreme heat,
// extreme cold, or heavy rain), creates a notification AND a
// timeline_event for every colony the user cares for — unless one was
// already created today for that colony. The weather reading is a
// single regional value (see lib/weather.ts), so this is an
// approximation: every colony gets the same reading rather than a
// lookup at its own (blurred) coordinates. timeline_events.created_by
// is left null — these are system-generated, not attributed to the
// signed-in user whose session happened to trigger the check.
export async function checkExtremeWeatherForCaretaker(
  userId: string,
  language: "pt" | "en" = "pt"
): Promise<void> {
  const weather = await getWeatherAt(NATAL_COORDS.lat, NATAL_COORDS.lon, language);
  if (!weather) return;

  const isExtremeCold = weather.temperatureCelsius < 10;
  const isExtremeHeat = weather.temperatureCelsius > 32;
  if (!isExtremeCold && !isExtremeHeat && !weather.isHeavyRain) return;

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
  const notificationMessage =
    language === "en"
      ? isExtremeCold
        ? `It's ${roundedTemp}°C — extreme cold for the cats of`
        : isExtremeHeat
          ? `It's ${roundedTemp}°C — extreme heat for the cats of`
          : `Heavy rain recorded near`
      : isExtremeCold
        ? `Está fazendo ${roundedTemp}°C — frio extremo para os gatos de`
        : isExtremeHeat
          ? `Está fazendo ${roundedTemp}°C — calor extremo para os gatos de`
          : `Chuva forte registrada perto de`;
  const notificationSuffix =
    language === "en" ? "Consider checking food, water, and shelter." : "Considere checar comida, água e abrigo.";

  const timelineEventType = isExtremeCold ? "extreme_cold" : isExtremeHeat ? "extreme_heat" : "heavy_rain";
  const timelineDescription =
    language === "en"
      ? isExtremeCold
        ? `🌡️ Extreme cold recorded — ${roundedTemp}°C`
        : isExtremeHeat
          ? `🌡️ Extreme heat recorded — ${roundedTemp}°C`
          : `🌧️ Heavy rain recorded`
      : isExtremeCold
        ? `🌡️ Frio extremo registrado — ${roundedTemp}°C`
        : isExtremeHeat
          ? `🌡️ Calor extremo registrado — ${roundedTemp}°C`
          : `🌧️ Chuva forte registrada`;

  for (const colony of colonies) {
    const { data: existingNotification } = await supabase
      .from("notifications")
      .select("id")
      .eq("user_id", userId)
      .eq("colony_id", colony.id)
      .eq("type", "extreme_weather")
      .gte("created_at", todayStart.toISOString())
      .maybeSingle();

    if (!existingNotification) {
      await supabase.from("notifications").insert({
        user_id: userId,
        colony_id: colony.id,
        type: "extreme_weather",
        message: `${notificationMessage} ${colony.name}. ${notificationSuffix}`,
      });
    }

    const { data: existingEvent } = await supabase
      .from("timeline_events")
      .select("id")
      .eq("colony_id", colony.id)
      .eq("event_type", timelineEventType)
      .gte("created_at", todayStart.toISOString())
      .maybeSingle();

    if (!existingEvent) {
      await supabase.from("timeline_events").insert({
        colony_id: colony.id,
        event_type: timelineEventType,
        description: timelineDescription,
        created_by: null,
      });
    }
  }
}

// Checks every cat in every colony the user cares for, and creates one
// notification per cat that hasn't had a "last seen" update in 7+ days
// — unless one was already created today for that cat. last_seen is
// only ever set at registration or via "marcar como visto", so a stale
// value is a real signal something might be wrong, not just inactivity.
export async function checkStaleCatsForCaretaker(
  userId: string,
  language: "pt" | "en" = "pt"
): Promise<void> {
  const { data: caretakerRows } = await supabase
    .from("caretakers")
    .select("colonies(id, name)")
    .eq("user_id", userId);

  const colonies = (caretakerRows ?? [])
    .map((row) => row.colonies as unknown as { id: string; name: string } | null)
    .filter((colony): colony is { id: string; name: string } => colony !== null);

  if (colonies.length === 0) return;

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  for (const colony of colonies) {
    const { data: staleCats } = await supabase
      .from("cats")
      .select("id, name, last_seen")
      .eq("colony_id", colony.id)
      .or(`last_seen.is.null,last_seen.lt.${sevenDaysAgo.toISOString()}`);

    for (const cat of staleCats ?? []) {
      const { data: existing } = await supabase
        .from("notifications")
        .select("id")
        .eq("user_id", userId)
        .eq("colony_id", colony.id)
        .eq("type", "cat_unseen")
        .gte("created_at", todayStart.toISOString())
        .ilike("message", `%${cat.id}%`)
        .maybeSingle();

      if (existing) continue;

      await supabase.from("notifications").insert({
        user_id: userId,
        colony_id: colony.id,
        type: "cat_unseen",
        // The cat id is embedded (invisibly, for the reader) in the
        // message so the dedupe check above can target this specific
        // cat — `notifications` has no cat_id column, and adding one
        // for a single notification type isn't worth a new migration.
        message:
          language === "en"
            ? `${cat.name ?? "A cat"} from ${colony.name} hasn't been seen in over 7 days. Is everything okay? (ref:${cat.id})`
            : `${cat.name ?? "Um gato"} de ${colony.name} não é visto há mais de 7 dias. Tudo bem com ele? (ref:${cat.id})`,
      });
    }
  }
}
