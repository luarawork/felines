// /colony/:id route for Felines.
// Server component that fetches all colony data and passes it to
// ColonyDetailClient, a client component that handles i18n and interactive
// rendering. Exact coordinates are never fetched here.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import ColonyDetailClient from "@/components/ColonyDetailClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const { data: colony } = await supabase
    .from("colonies")
    .select("name, narrative, cover_photo_url")
    .eq("id", id)
    .single();

  if (!colony) return {};

  const description = colony.narrative
    ? colony.narrative.slice(0, 150)
    : "Veja essa colônia de gatos de rua no Felines.";

  return {
    title: `${colony.name} — Felines`,
    description,
    openGraph: {
      title: `${colony.name} — Felines`,
      description,
      url: `/colony/${id}`,
      images: [colony.cover_photo_url || "/images/hero-cat.png"],
    },
  };
}

export default async function ColonyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: colony } = await supabase
    .from("colonies")
    .select(
      "id, name, narrative, castration_status, cover_photo_url, latitude_blurred, longitude_blurred, created_at, verified_status, verified_at, health_status, health_score"
    )
    .eq("id", id)
    .single();

  if (!colony) notFound();

  // None of these 7 queries depend on each other's results, only on
  // `id` — fire them together instead of round-tripping one at a time.
  const [
    { data: cats },
    { data: timelineEvents },
    { data: activeHelpRequestRows },
    { data: neuteringRequestRows },
    { data: neuteringHistoryRows },
    { data: falsePinFlagRows },
    { data: caretakerRows },
  ] = await Promise.all([
    supabase
      .from("cats")
      .select("id, name, photo_url, castrated, last_seen")
      .eq("colony_id", id)
      .order("last_seen", { ascending: false }),
    supabase
      .from("timeline_events")
      .select("id, event_type, description, photo_url, created_at, created_by")
      .eq("colony_id", id)
      .order("created_at", { ascending: false }),
    // Most urgent, most recent active request — banner shows one at a
    // time. "Active" means open AND not past its 7-day expiry; there's no
    // backend job flipping status automatically, so this filter is what
    // actually enforces the expiry.
    supabase
      .from("help_requests")
      .select("id, type, description, urgency")
      .eq("colony_id", id)
      .eq("status", "open")
      .gt("expires_at", new Date().toISOString())
      .order("urgency", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(1),
    supabase
      .from("neutering_requests")
      .select("id, cats_count, urgency, status")
      .eq("colony_id", id)
      .neq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(1),
    supabase
      .from("neutering_requests")
      .select("id, cats_count, urgency, status, created_at")
      .eq("colony_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("flags")
      .select("id")
      .eq("target_type", "colony")
      .eq("target_id", id)
      .in("reason", ["never_seen_cats", "location_doesnt_exist", "duplicate_colony", "suspicious_harmful"]),
    // caretakers.user_id and timeline_events.created_by both reference
    // auth.users, not profiles, so PostgREST can't embed profiles in
    // either query — every author id across both is resolved in one
    // batched lookup instead.
    supabase.from("caretakers").select("user_id").eq("colony_id", id),
  ]);

  const activeHelpRequest = activeHelpRequestRows?.[0] ?? null;
  const activeNeuteringRequest = neuteringRequestRows?.[0] ?? null;
  const hasFalsePinWarning = (falsePinFlagRows?.length ?? 0) >= 3;

  const caretakerUserIds = (caretakerRows ?? []).map((row) => row.user_id);
  const timelineAuthorIds = (timelineEvents ?? [])
    .map((event) => event.created_by)
    .filter((authorId): authorId is string => !!authorId);

  const allAuthorIds = Array.from(new Set([...caretakerUserIds, ...timelineAuthorIds]));

  const { data: authorProfiles } =
    allAuthorIds.length > 0
      ? await supabase.from("profiles").select("id, display_name, avatar_url").in("id", allAuthorIds)
      : { data: [] };

  const caretakers = caretakerUserIds.map((userId) => ({
    userId,
    displayName:
      (authorProfiles ?? []).find((p) => p.id === userId)?.display_name ?? "",
    avatarUrl:
      (authorProfiles ?? []).find((p) => p.id === userId)?.avatar_url ?? null,
  }));

  // Powers the "Relatórios" tab. All four are SECURITY DEFINER RPCs
  // (0046) returning aggregates only, scoped to this one colony — not a
  // direct select, since feedings has no anon SELECT policy at all.
  const [
    { data: statsRows },
    { data: weeklyFeedingRows },
    { data: monthlyReportRows },
    { data: reportBreakdownRows },
    { data: monthlyWeatherRows },
    { data: healthBreakdownRows },
  ] = await Promise.all([
    supabase.rpc("get_colony_stats", { p_colony_id: id }),
    supabase.rpc("get_colony_feeding_weekly", { p_colony_id: id }),
    supabase.rpc("get_colony_reports_monthly", { p_colony_id: id }),
    supabase.rpc("get_colony_report_breakdown", { p_colony_id: id }),
    supabase.rpc("get_colony_weather_monthly", { p_colony_id: id }),
    supabase.rpc("get_colony_health_breakdown", { p_colony_id: id }),
  ]);

  const healthBreakdown = healthBreakdownRows?.[0] ?? {
    feeding_score: 0,
    sighting_score: 0,
    castration_score: 0,
    reports_score: 0,
    caretaker_score: 0,
  };

  const colonyStats = statsRows?.[0] ?? {
    total_cats: 0,
    cats_castrated: 0,
    total_feedings: 0,
    total_reports: 0,
    total_reports_resolved: 0,
    total_caretakers: 0,
    total_timeline_events: 0,
    total_weather_events: 0,
    days_since_registered: 0,
  };

  return (
    <ColonyDetailClient
      colony={colony}
      cats={(cats ?? []) as Parameters<typeof ColonyDetailClient>[0]["cats"]}
      timelineEvents={(timelineEvents ?? []) as Parameters<typeof ColonyDetailClient>[0]["timelineEvents"]}
      caretakers={caretakers}
      activeHelpRequest={activeHelpRequest}
      activeNeuteringRequest={activeNeuteringRequest}
      neuteringHistoryRows={neuteringHistoryRows ?? []}
      hasFalsePinWarning={hasFalsePinWarning}
      colonyStats={colonyStats}
      weeklyFeedingRows={weeklyFeedingRows ?? []}
      monthlyReportRows={monthlyReportRows ?? []}
      reportBreakdownRows={reportBreakdownRows ?? []}
      monthlyWeatherRows={monthlyWeatherRows ?? []}
      healthBreakdown={healthBreakdown}
    />
  );
}
