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
import ReportButton from "@/components/ReportButton";
import ColonyActions from "@/components/ColonyActions";
import WeatherBanner from "@/components/WeatherBanner";
import CatManager from "@/components/CatManager";
import CaretakerLetters from "@/components/CaretakerLetters";
import TimelineEventForm from "@/components/TimelineEventForm";
import ColonyTabs from "@/components/ColonyTabs";
import EditColonyForm from "@/components/EditColonyForm";
import EmptyState from "@/components/EmptyState";
import ThankYouButton from "@/components/ThankYouButton";
import MarkCatSeenButton from "@/components/MarkCatSeenButton";
import FlagButton from "@/components/FlagButton";
import ColonyAccessProvider from "@/components/ColonyAccessProvider";
import FactChip from "@/components/FactChip";
import Reveal from "@/components/Reveal";

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
};

const CASTRATION_LABELS: Record<string, string> = {
  none: "Ninguém castrado ainda",
  partial: "Castração em andamento",
  full: "Todo mundo castrado",
};

export default async function ColonyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: colony } = await supabase
    .from("colonies")
    .select("id, name, narrative, castration_status, cover_photo_url")
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
    .select("id, event_type, description, photo_url, created_at")
    .eq("colony_id", id)
    .order("created_at", { ascending: false });

  // caretakers.user_id references auth.users, not profiles, so PostgREST
  // can't embed profiles in this query — fetched separately and merged.
  const { data: caretakerRows } = await supabase
    .from("caretakers")
    .select("user_id")
    .eq("colony_id", id);

  const caretakerUserIds = (caretakerRows ?? []).map((row) => row.user_id);

  const { data: caretakerProfiles } =
    caretakerUserIds.length > 0
      ? await supabase.from("profiles").select("id, display_name").in("id", caretakerUserIds)
      : { data: [] };

  const caretakers = caretakerUserIds.map((userId) => ({
    userId,
    displayName:
      (caretakerProfiles ?? []).find((profile) => profile.id === userId)?.display_name ?? null,
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
                      <MarkCatSeenButton catId={cat.id} catName={cat.name ?? "esse gato"} />
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
                    {event.event_type.replace(/_/g, " ")}
                  </p>
                  {event.description && (
                    <p className="mt-1 text-sm text-felines-text-secondary">
                      {event.description}
                    </p>
                  )}
                  {event.photo_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={event.photo_url}
                      alt={event.event_type.replace(/_/g, " ")}
                      className="mt-2 h-24 w-24 rounded-lg object-cover"
                    />
                  )}
                  <p className="mt-1 text-xs text-felines-text-secondary">
                    {new Date(event.created_at).toLocaleDateString("pt-BR")}
                  </p>
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
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-4xl px-4 pb-6 sm:px-6">
          <h1 className="text-3xl font-bold leading-tight text-white sm:text-[40px]">
            {colony.name}
          </h1>
          <span className="mt-2 inline-block rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-felines-text-primary">
            {CASTRATION_LABELS[colony.castration_status] ?? colony.castration_status}
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="mb-6">
          <WeatherBanner />
        </div>

        <Reveal>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              {caretakers.length > 0 && (
                <div className="flex flex-wrap items-center gap-x-1 gap-y-1 text-sm text-felines-text-secondary">
                  <span>Quem cuida:</span>
                  {caretakers.map((caretaker, index) => (
                    <span key={caretaker.userId} className="flex items-center gap-1">
                      {index > 0 && <span>,</span>}
                      <a href={`/u/${caretaker.userId}`} className="text-felines-accent-hover">
                        {caretaker.displayName || "Alguém da comunidade"}
                      </a>
                      <ThankYouButton
                        colonyId={colony.id}
                        caretakerUserId={caretaker.userId}
                        caretakerDisplayName={caretaker.displayName || "o cuidador"}
                      />
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div id="colony-report-button">
              <ReportButton colonyId={colony.id} />
            </div>
          </div>

          {colony.narrative && (
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-felines-text-secondary">
              {colony.narrative}
            </p>
          )}

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible">
            {COLONY_FACT_CHIPS.map((fact) => (
              <span key={fact} className="flex-shrink-0">
                <FactChip text={fact} />
              </span>
            ))}
          </div>
        </Reveal>

        {/* Shared so becoming a caretaker (in ColonyActions) immediately
            unlocks the edit controls below, instead of each independently
            checking access once on mount and never finding out it changed. */}
        <ColonyAccessProvider colonyId={colony.id}>
          {/* Available actions, scoped by the visitor's access level */}
          <ColonyActions colonyId={colony.id} />

          <ColonyTabs
            tabs={[
              { id: "cats", label: "Gatos", content: catsSection },
              { id: "timeline", label: "Linha do tempo", content: timelineSection },
              {
                id: "letter",
                label: "Carta de quem cuidou antes",
                content: <CaretakerLetters colonyId={colony.id} />,
              },
              {
                id: "edit",
                label: "Editar",
                content: (
                  <EditColonyForm
                    colonyId={colony.id}
                    initialName={colony.name}
                    initialNarrative={colony.narrative}
                    initialCastrationStatus={colony.castration_status}
                    initialCoverPhotoUrl={colony.cover_photo_url}
                  />
                ),
              },
            ]}
          />
        </ColonyAccessProvider>

        <div className="mt-8">
          <FlagButton targetType="colony" targetId={colony.id} />
        </div>
      </div>
    </div>
  );
}
