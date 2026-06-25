// /colony/:id route for Felines.
// Server component that loads a single colony's public data (name,
// narrative, castration status, named cats, and timeline) and renders
// the colony detail page. Exact coordinates are never fetched here —
// only data already safe for public display. Sections are organized
// into tabs to keep the page scannable instead of one long scroll.
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
  created_at: string;
};

const CASTRATION_LABELS: Record<string, string> = {
  none: "Nenhum gato castrado ainda",
  partial: "Castração parcial em andamento",
  full: "Colônia totalmente castrada",
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
    .select("id, event_type, description, created_at")
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

  const catsSection = (
    <>
      {!cats || cats.length === 0 ? (
        <p className="text-sm text-felines-text-secondary">
          Ainda não há gatos cadastrados nesta colônia.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {(cats as Cat[]).map((cat) => (
            <div
              key={cat.id}
              className="rounded-xl border border-felines-border bg-felines-surface p-4"
            >
              {cat.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={cat.photo_url}
                  alt={cat.name ?? "Gato da colônia"}
                  className="h-32 w-full rounded-lg object-cover"
                />
              ) : (
                <div className="h-32 w-full rounded-lg bg-felines-border" />
              )}
              <p className="mt-3 font-semibold text-felines-text-primary">
                {cat.name ?? "Sem nome"}
              </p>
              <p className="text-xs text-felines-text-secondary">
                {cat.castrated ? "Castrado" : "Não castrado"}
                {cat.last_seen &&
                  ` · Visto em ${new Date(cat.last_seen).toLocaleDateString("pt-BR")}`}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Cat management, visible only to the colony's creator/caretakers */}
      <CatManager colonyId={colony.id} />
    </>
  );

  const mostRecentEventDate = timelineEvents?.[0]?.created_at
    ? new Date(timelineEvents[0].created_at)
    : null;
  // This is a server component rendered fresh per request, not a
  // client component re-rendered in place — Date.now() here just reads
  // the request time once, it isn't a purity hazard in practice.
  const now = Date.now(); // eslint-disable-line react-hooks/purity
  const daysSinceLastUpdate = mostRecentEventDate
    ? (now - mostRecentEventDate.getTime()) / (1000 * 60 * 60 * 24)
    : null;
  const hasNoRecentUpdates = daysSinceLastUpdate === null || daysSinceLastUpdate >= 7;

  const timelineSection = (
    <>
      <TimelineEventForm colonyId={colony.id} />

      {hasNoRecentUpdates && (
        <div className="mt-4">
          <EmptyState
            main="Nenhuma atualização recente — você sabe o que está acontecendo aqui?"
            ctas={[{ label: "Relatar algo →", href: "#colony-report-button" }]}
          />
        </div>
      )}

      {!timelineEvents || timelineEvents.length === 0 ? null : (
        <ol className="mt-4 space-y-4 border-l border-felines-border pl-5">
          {(timelineEvents as TimelineEvent[]).map((event) => (
            <li key={event.id}>
              <p className="text-sm font-medium text-felines-text-primary">
                {event.event_type.replace(/_/g, " ")}
              </p>
              {event.description && (
                <p className="text-sm text-felines-text-secondary">{event.description}</p>
              )}
              <p className="text-xs text-felines-text-secondary">
                {new Date(event.created_at).toLocaleDateString("pt-BR")}
              </p>
            </li>
          ))}
        </ol>
      )}
    </>
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-4">
        <WeatherBanner />
      </div>

      {/* Cover */}
      {colony.cover_photo_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={colony.cover_photo_url}
          alt={`Foto da colônia ${colony.name}`}
          className="h-40 w-full rounded-xl object-cover sm:h-56"
        />
      ) : (
        <div className="h-40 w-full rounded-xl bg-felines-border sm:h-56" />
      )}

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-felines-text-primary sm:text-3xl">
            {colony.name}
          </h1>
          <span className="mt-2 inline-block rounded-full bg-felines-success/10 px-3 py-1 text-xs font-medium text-felines-success">
            {CASTRATION_LABELS[colony.castration_status] ?? colony.castration_status}
          </span>
          {caretakers.length > 0 && (
            <p className="mt-2 text-xs text-felines-text-secondary">
              Cuidado por:{" "}
              {caretakers.map((caretaker, index) => (
                <span key={caretaker.userId}>
                  {index > 0 && ", "}
                  <a href={`/u/${caretaker.userId}`} className="text-felines-accent">
                    {caretaker.displayName || "Cuidador da comunidade"}
                  </a>
                </span>
              ))}
            </p>
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

      {/* Available actions, scoped by the visitor's access level */}
      <ColonyActions colonyId={colony.id} />

      <ColonyTabs
        tabs={[
          { id: "cats", label: "Gatos", content: catsSection },
          { id: "timeline", label: "Linha do tempo", content: timelineSection },
          {
            id: "letter",
            label: "Carta do cuidador",
            content: <CaretakerLetters colonyId={colony.id} />,
          },
          {
            id: "edit",
            label: "Editar colônia",
            content: (
              <EditColonyForm
                colonyId={colony.id}
                initialNarrative={colony.narrative}
                initialCastrationStatus={colony.castration_status}
                initialCoverPhotoUrl={colony.cover_photo_url}
              />
            ),
          },
        ]}
      />
    </div>
  );
}
