// /colony/:id route for Felines.
// Server component that loads a single colony's public data (name,
// narrative, castration status, named cats, and timeline) and renders
// the colony detail page in the same editorial style as the home page
// and /profile: a full-bleed hero with a gradient overlay, Reveal-animated
// sections, and card styles consistent with the rest of the site. Exact
// coordinates are never fetched here — only data already safe for public
// display. Sections below the hero are organized into tabs to keep the
// page scannable instead of one long scroll.
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import ColonyActions from "@/components/ColonyActions";
import WeatherBanner from "@/components/WeatherBanner";
import CatManager from "@/components/CatManager";
import CaretakerLetters from "@/components/CaretakerLetters";
import TimelineEventForm from "@/components/TimelineEventForm";
import ColonyTabs from "@/components/ColonyTabs";
import EditColonyButton from "@/components/EditColonyButton";
import EmptyState from "@/components/EmptyState";
import ThankYouButton from "@/components/ThankYouButton";
import MarkCatSeenButton from "@/components/MarkCatSeenButton";
import FlagButton from "@/components/FlagButton";
import ColonyAccessProvider from "@/components/ColonyAccessProvider";
import Reveal from "@/components/Reveal";
import RotatingSingleFact from "@/components/RotatingSingleFact";
import TimelinePhoto from "@/components/TimelinePhoto";
import ColonyMilestones from "@/components/ColonyMilestones";
import ColonyStatsTab from "@/components/ColonyStatsTab";
import ActionThanksButton from "@/components/ActionThanksButton";
import Link from "next/link";

// Contextual facts shown on every colony page — general background on
// street cats, not specific to this particular colony, but relevant
// enough to give a first-time visitor some grounding right where they land.
const COLONY_FACT_CHIPS: string[] = [
  "📊 Existem cerca de 480 milhões de gatos de rua no mundo",
  "📊 Abrigos formais já recebem mais gatos do que conseguem cuidar",
  "📊 4 em cada 10 pessoas já brigaram com um vizinho por causa de animais",
  "📊 TNR é o único método com eficácia comprovada para estabilizar colônias",
];

type Cat = {
  id: string;
  name: string | null;
  photo_url: string | null;
  castrated: boolean;
  last_seen: string | null;
};

type TimelineEvent = {
  id: string;
  event_type: string;
  description: string | null;
  photo_url: string | null;
  created_at: string;
  created_by: string | null;
};

const CASTRATION_LABELS: Record<string, string> = {
  none: "Ninguém castrado ainda",
  partial: "Castração em andamento",
  full: "Todo mundo castrado",
};

// timeline_events.event_type has no check constraint (see
// TimelineEventForm), so values come from a few different places —
// this just needs to cover every value any of them actually inserts.
const EVENT_TYPE_LABELS: Record<string, string> = {
  colony_created: "Colônia cadastrada",
  feeding: "Alimentação registrada",
  water: "Água registrada",
  new_caretaker: "Novo cuidador",
  new_cat: "Novo gato na colônia",
  cat_castrated: "Gato castrado",
  caretaker_letter_updated: "Carta de cuidador atualizada",
  colony_info_updated: "Informações da colônia atualizadas",
  cover_photo_changed: "Foto de capa trocada",
  report_resolved: "Relato resolvido",
  thank_you: "Agradecimento",
  castration_round: "Rodada de castração",
  health_issue: "Problema de saúde",
  feeding_change: "Mudança na alimentação",
  relocation: "Mudança de local",
  photo_update: "Foto da colônia",
  other: "Outra atualização",
};

function eventTypeLabel(eventType: string): string {
  return EVENT_TYPE_LABELS[eventType] ?? eventType.replace(/_/g, " ");
}

// Castration status is a manual field set at registration/edit time, but
// once cats are individually tracked, the count of cats actually marked
// castrated is more trustworthy than that one static field — this shows
// the live count whenever there's at least one cat registered, and only
// falls back to the manual status for colonies with no cats yet.
function resolveCastrationLabel(castrationStatus: string, cats: Cat[]): string {
  if (cats.length === 0) return CASTRATION_LABELS[castrationStatus] ?? castrationStatus;
  const castratedCount = cats.filter((cat) => cat.castrated).length;
  if (castratedCount === 0) return "Nenhum gato castrado ainda";
  if (castratedCount === cats.length) return "Todos os gatos castrados";
  return `${castratedCount} de ${cats.length} gatos castrados`;
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
      "id, name, narrative, castration_status, cover_photo_url, latitude_blurred, longitude_blurred, created_at"
    )
    .eq("id", id)
    .single();

  if (!colony) notFound();

  const { data: cats } = await supabase
    .from("cats")
    .select("id, name, photo_url, castrated, last_seen")
    .eq("colony_id", id)
    .order("last_seen", { ascending: false });

  const { data: timelineEvents } = await supabase
    .from("timeline_events")
    .select("id, event_type, description, photo_url, created_at, created_by")
    .eq("colony_id", id)
    .order("created_at", { ascending: false });

  // caretakers.user_id and timeline_events.created_by both reference
  // auth.users, not profiles, so PostgREST can't embed profiles in
  // either query — every author id across both is resolved in one
  // batched lookup instead.
  const { data: caretakerRows } = await supabase
    .from("caretakers")
    .select("user_id")
    .eq("colony_id", id);

  const caretakerUserIds = (caretakerRows ?? []).map((row) => row.user_id);
  const timelineAuthorIds = (timelineEvents ?? [])
    .map((event) => event.created_by)
    .filter((authorId): authorId is string => !!authorId);

  const allAuthorIds = Array.from(new Set([...caretakerUserIds, ...timelineAuthorIds]));

  const { data: authorProfiles } =
    allAuthorIds.length > 0
      ? await supabase.from("profiles").select("id, display_name, avatar_url").in("id", allAuthorIds)
      : { data: [] };

  function authorName(userId: string) {
    return (authorProfiles ?? []).find((profile) => profile.id === userId)?.display_name || "Alguém da comunidade";
  }

  function authorAvatar(userId: string) {
    return (authorProfiles ?? []).find((profile) => profile.id === userId)?.avatar_url ?? null;
  }

  // Powers the "Relatórios" tab. All four are SECURITY DEFINER RPCs
  // (0046) returning aggregates only, scoped to this one colony — not a
  // direct select, since feedings has no anon SELECT policy at all.
  const [
    { data: statsRows },
    { data: weeklyFeedingRows },
    { data: monthlyReportRows },
    { data: reportBreakdownRows },
  ] = await Promise.all([
    supabase.rpc("get_colony_stats", { p_colony_id: id }),
    supabase.rpc("get_colony_feeding_weekly", { p_colony_id: id }),
    supabase.rpc("get_colony_reports_monthly", { p_colony_id: id }),
    supabase.rpc("get_colony_report_breakdown", { p_colony_id: id }),
  ]);

  const colonyStats = statsRows?.[0] ?? {
    total_cats: 0,
    cats_castrated: 0,
    total_feedings: 0,
    total_reports: 0,
    total_reports_resolved: 0,
    total_caretakers: 0,
    total_timeline_events: 0,
    days_since_registered: 0,
  };

  const caretakers = caretakerUserIds.map((userId) => ({
    userId,
    displayName: authorName(userId),
    avatarUrl: authorAvatar(userId),
  }));

  // This is a server component rendered fresh per request, not a
  // client component re-rendered in place — Date.now() here just reads
  // the request time once, it isn't a purity hazard in practice.
  const now = Date.now(); // eslint-disable-line react-hooks/purity

  const catsSection = (
    <>
      {!cats || cats.length === 0 ? (
        <EmptyState
          main="Ainda não tem nenhum gato cadastrado aqui."
          sub="Quem cuida dessa colônia pode adicionar os gatos um por um, com nome e foto."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {(cats as Cat[]).map((cat, index) => {
            const daysSinceSeen = cat.last_seen
              ? (now - new Date(cat.last_seen).getTime()) / (1000 * 60 * 60 * 24)
              : null;
            const isStale = daysSinceSeen === null || daysSinceSeen >= 7;

            return (
              <Reveal key={cat.id} delayMs={Math.min(index, 6) * 60}>
                <div className="h-full rounded-2xl border border-felines-border bg-felines-surface p-4 shadow-[0_2px_8px_rgba(0,0,0,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.10)]">
                  {cat.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cat.photo_url}
                      alt={cat.name ?? "Gato da colônia"}
                      className="h-32 w-full rounded-xl object-cover"
                    />
                  ) : (
                    <div className="h-32 w-full rounded-xl bg-felines-border" />
                  )}
                  <p className="mt-3 font-semibold text-felines-text-primary">
                    {cat.name ?? "Sem nome"}
                  </p>
                  <p className="text-xs text-felines-text-secondary">
                    {cat.castrated ? "Já castrado" : "Ainda não castrado"}
                    {cat.last_seen &&
                      ` · Visto em ${new Date(cat.last_seen).toLocaleDateString("pt-BR")}`}
                  </p>
                  {isStale && (
                    <>
                      <p className="mt-1 text-xs text-felines-warning">
                        Ninguém viu {cat.name ?? "ele"} há um tempo. Sabe se ele está bem?
                      </p>
                      <MarkCatSeenButton catId={cat.id} catName={cat.name ?? "esse gato"} colonyId={colony.id} />
                    </>
                  )}
                </div>
              </Reveal>
            );
          })}
        </div>
      )}

      {/* Cat management, visible only to the colony's creator/caretakers */}
      <CatManager colonyId={colony.id} />
    </>
  );

  const hasNoTimelineEntriesEver = !timelineEvents || timelineEvents.length === 0;
  const mostRecentEventDate = timelineEvents?.[0]?.created_at
    ? new Date(timelineEvents[0].created_at)
    : null;
  const daysSinceLastUpdate = mostRecentEventDate
    ? (now - mostRecentEventDate.getTime()) / (1000 * 60 * 60 * 24)
    : null;
  const hasStaleUpdates =
    !hasNoTimelineEntriesEver && daysSinceLastUpdate !== null && daysSinceLastUpdate >= 7;

  const timelineSection = (
    <>
      <ColonyMilestones
        colonyCreatedAt={colony.created_at}
        catCount={cats?.length ?? 0}
        timelineEvents={timelineEvents ?? []}
      />

      <TimelineEventForm colonyId={colony.id} />

      {hasNoTimelineEntriesEver && (
        <div className="mt-4">
          <EmptyState
            main="A linha do tempo dessa colônia ainda está em branco."
            sub="Alimentação, gato novo, castração — qualquer atualização ajuda quem passar por aqui depois."
            ctas={[{ label: "Contar algo →", href: "#colony-report-button" }]}
          />
        </div>
      )}

      {hasStaleUpdates && (
        <div className="mt-4">
          <EmptyState
            main="Faz um tempo que ninguém atualiza essa colônia. Sabe o que está acontecendo aqui?"
            ctas={[{ label: "Contar algo →", href: "#colony-report-button" }]}
          />
        </div>
      )}

      {!timelineEvents || timelineEvents.length === 0 ? null : (
        <ol className="mt-4 space-y-4 border-l-2 border-felines-accent pl-5">
          {(timelineEvents as TimelineEvent[]).map((event, index) => (
            <Reveal key={event.id} delayMs={Math.min(index, 8) * 60}>
              <li>
                <div className="rounded-xl border border-felines-border bg-felines-surface p-4">
                  <p className="text-sm font-medium text-felines-text-primary">
                    {eventTypeLabel(event.event_type)}
                  </p>
                  {event.description && (
                    <p className="mt-1 text-sm text-felines-text-secondary">
                      {event.description}
                    </p>
                  )}
                  {event.photo_url && (
                    <TimelinePhoto src={event.photo_url} alt={eventTypeLabel(event.event_type)} />
                  )}
                  <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs text-felines-text-secondary">
                      {event.created_by && (
                        <>
                          <Link href={`/u/${event.created_by}`} className="text-felines-accent-hover">
                            {authorName(event.created_by)}
                          </Link>{" "}
                          ·{" "}
                        </>
                      )}
                      {new Date(event.created_at).toLocaleDateString("pt-BR")}
                    </p>
                    <ActionThanksButton timelineEventId={event.id} />
                  </div>
                </div>
              </li>
            </Reveal>
          ))}
        </ol>
      )}
    </>
  );

  return (
    <div>
      {/* Shared across the whole page (not just the action card below)
          so the "Editar" button in the hero itself only renders once
          access is confirmed, same as everything else gated by it. */}
      <ColonyAccessProvider colonyId={colony.id}>
        {/* Hero */}
        <div className="relative h-72 w-full sm:h-80">
          {colony.cover_photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={colony.cover_photo_url}
              alt={`Foto de capa da colônia ${colony.name}`}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 h-full w-full bg-felines-dark" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <div className="absolute right-4 top-4">
            <EditColonyButton
              colonyId={colony.id}
              initialName={colony.name}
              initialNarrative={colony.narrative}
              initialCastrationStatus={colony.castration_status}
              initialCoverPhotoUrl={colony.cover_photo_url}
            />
          </div>
          <div className="absolute inset-x-0 bottom-0 mx-auto max-w-4xl px-4 pb-6 sm:px-6">
            <h1 className="text-3xl font-bold leading-tight text-white sm:text-[40px]">
              {colony.name}
            </h1>
            <span className="mt-2 inline-block rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-felines-text-primary">
              {resolveCastrationLabel(colony.castration_status, (cats as Cat[] | null) ?? [])}
            </span>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
          <div className="mb-6">
            <WeatherBanner lat={colony.latitude_blurred} lon={colony.longitude_blurred} />
          </div>

          {caretakers.length > 0 && (
            <Reveal>
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-felines-accent-hover">
                Quem cuida
              </p>
              <div className="mt-3 flex flex-wrap gap-4">
                {caretakers.map((caretaker) => (
                  <div key={caretaker.userId} className="flex flex-col items-center gap-1.5 text-center">
                    <Link href={`/u/${caretaker.userId}`}>
                      {caretaker.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={caretaker.avatarUrl}
                          alt={caretaker.displayName}
                          className="h-16 w-16 rounded-full border border-felines-border object-cover"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-full border border-felines-border bg-felines-accent-light" />
                      )}
                    </Link>
                    <Link
                      href={`/u/${caretaker.userId}`}
                      className="max-w-[80px] truncate text-xs font-medium text-felines-text-primary hover:text-felines-accent-hover"
                    >
                      {caretaker.displayName}
                    </Link>
                    <ThankYouButton
                      colonyId={colony.id}
                      caretakerUserId={caretaker.userId}
                      caretakerDisplayName={caretaker.displayName}
                    />
                  </div>
                ))}
              </div>
            </Reveal>
          )}

          <Reveal delayMs={80}>
            {colony.narrative && (
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-felines-text-secondary">
                {colony.narrative}
              </p>
            )}

            <div className="mt-4">
              <RotatingSingleFact facts={COLONY_FACT_CHIPS} />
            </div>
          </Reveal>

          {/* Available actions, scoped by the visitor's access level */}
          <ColonyActions colonyId={colony.id} />

          <ColonyTabs
            tabs={[
              { id: "cats", label: "Gatos", content: catsSection },
              { id: "timeline", label: "Linha do tempo", content: timelineSection },
              {
                id: "reports",
                label: "Relatórios",
                content: (
                  <ColonyStatsTab
                    stats={colonyStats}
                    weeklyFeedings={weeklyFeedingRows ?? []}
                    monthlyReports={monthlyReportRows ?? []}
                    reportBreakdown={reportBreakdownRows ?? []}
                    colonyCreatedAt={colony.created_at}
                    timelineEvents={timelineEvents ?? []}
                  />
                ),
              },
              {
                id: "letter",
                label: "Carta de quem cuidou antes",
                content: <CaretakerLetters colonyId={colony.id} />,
              },
            ]}
            footer={
              <div className="mt-8">
                <FlagButton targetType="colony" targetId={colony.id} />
              </div>
            }
          />
        </div>
      </ColonyAccessProvider>
    </div>
  );
}
