// /colony/:id route for Felines.
// Server component that loads a single colony's public data (name,
// narrative, castration status, named cats, and timeline) and renders
// the colony detail page. Exact coordinates are never fetched here —
// only data already safe for public display.
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import ReportButton from "@/components/ReportButton";
import ColonyActions from "@/components/ColonyActions";
import WeatherBanner from "@/components/WeatherBanner";
import CatManager from "@/components/CatManager";
import CaretakerLetters from "@/components/CaretakerLetters";
import TimelineEventForm from "@/components/TimelineEventForm";

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
        </div>
        <ReportButton colonyId={colony.id} />
      </div>

      {colony.narrative && (
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-felines-text-secondary">
          {colony.narrative}
        </p>
      )}

      {/* Available actions, scoped by the visitor's access level */}
      <ColonyActions colonyId={colony.id} />

      {/* Named cats */}
      <section className="mt-10">
        <h2 className="text-xl font-bold text-felines-text-primary">Gatos da colônia</h2>
        {!cats || cats.length === 0 ? (
          <p className="mt-2 text-sm text-felines-text-secondary">
            Ainda não há gatos cadastrados nesta colônia.
          </p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
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
      </section>

      {/* Cat management, visible only to the colony's creator/caretakers */}
      <CatManager colonyId={colony.id} />

      {/* Letter for the next caretaker */}
      <CaretakerLetters colonyId={colony.id} />

      {/* Collective timeline */}
      <section className="mt-10">
        <h2 className="text-xl font-bold text-felines-text-primary">Linha do tempo</h2>
        <TimelineEventForm colonyId={colony.id} />
        {!timelineEvents || timelineEvents.length === 0 ? (
          <p className="mt-2 text-sm text-felines-text-secondary">
            Nenhum evento registrado ainda.
          </p>
        ) : (
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
      </section>
    </div>
  );
}
