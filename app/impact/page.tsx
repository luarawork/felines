// /impact route for Felines.
// Public, no-login page showing live platform-wide statistics — every
// number here comes from get_platform_impact_stats() and
// get_recent_platform_activity(), two SECURITY DEFINER RPCs that return
// only aggregates/anonymized labels, never raw rows (several source
// tables, like feedings and knowledge_progress, have no anon SELECT
// policy at all, by design — this page never widens that, it just asks
// the database for a count instead of the rows themselves).
import type { Metadata } from "next";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { ARTICLES, getArticleBySlug, getReadingTimeMinutes } from "@/lib/articles";
import Reveal from "@/components/Reveal";
import CountUpStat from "@/components/CountUpStat";
import MapShell from "@/components/MapShell";
import ShareButton from "@/components/ShareButton";
import { getHelpRequestTypeIcon, getHelpRequestTypeLabel } from "@/lib/helpRequestTypes";

// These are live counts, not content that should be baked in at build
// time — without this, Next.js would statically render the page once
// during `next build` and serve that stale snapshot to every visitor.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Impacto — Felines",
  description: "Veja o impacto real da comunidade Felines: colônias mapeadas, gatos castrados, relatos resolvidos e muito mais.",
  openGraph: {
    title: "Impacto — Felines",
    description: "Veja o impacto real da comunidade Felines: colônias mapeadas, gatos castrados, relatos resolvidos e muito mais.",
    url: "/impact",
    images: ["/images/hero-cat.png"],
  },
};

type PlatformStats = {
  total_colonies: number;
  total_cats: number;
  total_cats_castrated: number;
  total_reports: number;
  total_reports_resolved: number;
  total_feedings: number;
  total_caretakers: number;
  total_articles_read: number;
  most_read_article_slug: string | null;
};

type ActivityRow = { kind: string; occurred_at: string };

// Maps a raw activity "kind" (an event_type, "report:<type>",
// "notification:<type>", or "article_read") to an anonymized,
// human-readable sentence — no user names, no colony names, no
// coordinates, ever. Notifications in particular only ever expose their
// `type` column here (see migration 0048) — the actual message text
// often names a specific colony, which would defeat the point.
function describeActivity(kind: string): string {
  if (kind === "article_read") return "Alguém terminou de ler um artigo educativo";

  if (kind.startsWith("report:")) {
    const reportType = kind.slice("report:".length);
    const reportLabels: Record<string, string> = {
      no_food_water: "uma colônia sem comida ou água",
      injured_sick: "um gato ferido ou doente",
      new_kitten: "um filhote novo",
      missing_cat: "um gato desaparecido",
      suspected_poisoning: "uma suspeita de envenenamento",
      suspected_abuse: "uma suspeita de maus-tratos",
      disease_outbreak: "um surto de doença",
      threat_to_colony: "uma ameaça a uma colônia",
      sighting: "um avistamento de gato",
    };
    return `Alguém relatou ${reportLabels[reportType] ?? "algo"} perto de uma colônia`;
  }

  if (kind.startsWith("notification:")) {
    const notificationType = kind.slice("notification:".length);
    const notificationLabels: Record<string, string> = {
      extreme_weather: "Um alerta de clima extremo foi enviado a um cuidador",
      cat_unseen: "Um cuidador foi avisado sobre um gato não visto há um tempo",
      sighting_cluster: "Avistamentos sugeriram uma possível nova colônia",
      action_thanks: "Alguém agradeceu uma ação de cuidado",
    };
    return notificationLabels[notificationType] ?? "Uma notificação foi enviada a um cuidador";
  }

  const eventLabels: Record<string, string> = {
    colony_created: "Uma colônia foi cadastrada",
    new_caretaker: "Um cuidador passou a olhar por uma colônia",
    new_cat: "Um gato foi adicionado a uma colônia",
    cat_castrated: "Um gato foi castrado",
    feeding: "Alguém registrou uma alimentação",
    water: "Alguém registrou a troca de água",
    thank_you: "Alguém agradeceu um cuidador",
    report_resolved: "Um relato foi resolvido",
    colony_info_updated: "As informações de uma colônia foram atualizadas",
    cover_photo_changed: "A foto de capa de uma colônia foi trocada",
    caretaker_letter_updated: "Um cuidador deixou um recado pro próximo",
  };
  return eventLabels[kind] ?? "Algo aconteceu em uma colônia";
}

export default async function ImpactPage() {
  const [{ data: statsRows }, { data: activityRows }, { data: helpRequestRows }] = await Promise.all([
    supabase.rpc("get_platform_impact_stats"),
    supabase.rpc("get_recent_platform_activity", { p_limit: 20 }),
    supabase
      .from("help_requests")
      .select("id, colony_id, type, description, urgency, created_at, colonies(name)")
      .eq("status", "open")
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const activeHelpRequests = (helpRequestRows ?? []).map((row) => ({
    id: row.id,
    colonyId: row.colony_id,
    colonyName: (row.colonies as unknown as { name: string } | null)?.name ?? "Colônia",
    type: row.type,
    description: row.description,
    urgency: row.urgency as "normal" | "urgent",
  }));

  const stats = (statsRows?.[0] as PlatformStats | undefined) ?? {
    total_colonies: 0,
    total_cats: 0,
    total_cats_castrated: 0,
    total_reports: 0,
    total_reports_resolved: 0,
    total_feedings: 0,
    total_caretakers: 0,
    total_articles_read: 0,
    most_read_article_slug: null,
  };

  const activity = (activityRows as ActivityRow[] | null) ?? [];

  const averageReadingTime = Math.round(
    ARTICLES.reduce((total, article) => total + getReadingTimeMinutes(article), 0) / ARTICLES.length
  );
  const mostReadArticle = stats.most_read_article_slug
    ? getArticleBySlug(stats.most_read_article_slug)
    : null;

  const STAT_CARDS: { value: number; label: string }[] = [
    { value: stats.total_colonies, label: "Colônias mapeadas" },
    { value: stats.total_cats, label: "Gatos nomeados cadastrados" },
    { value: stats.total_cats_castrated, label: "Gatos castrados" },
    { value: stats.total_reports, label: "Relatos enviados" },
    { value: stats.total_reports_resolved, label: "Relatos resolvidos" },
    { value: stats.total_feedings, label: "Check-ins de alimentação" },
    { value: stats.total_caretakers, label: "Cuidadores ativos" },
    { value: stats.total_articles_read, label: "Artigos lidos" },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="bg-[#2D1810] py-20">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
          <div className="mb-4 flex justify-center">
            <ShareButton title="Impacto do Felines" onDark />
          </div>
          <Reveal>
            <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl">
              Cada ação deixa uma marca.
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-lg text-felines-text-secondary-on-dark">
              Veja o que a comunidade do Felines já fez até agora.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Live stats grid */}
      <section className="bg-[#2D1810] pb-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
            {STAT_CARDS.map((stat, index) => (
              <Reveal key={stat.label} delayMs={index * 80}>
                <div className="text-center">
                  <p className="text-[56px] font-bold leading-none text-felines-accent">
                    <CountUpStat value={String(stat.value)} />
                  </p>
                  <p className="mt-2 text-sm text-felines-text-secondary-on-dark">{stat.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Colony map preview */}
      <section className="bg-felines-background py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-felines-accent-hover">
              Alcance geográfico
            </p>
            <h2 className="mt-3 text-3xl font-bold leading-tight text-felines-text-primary">
              Cada pin é uma colônia que alguém está cuidando.
            </h2>
          </Reveal>
          <Reveal delayMs={100}>
            <div className="mt-8 h-96 w-full overflow-hidden rounded-2xl border border-felines-border shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
              <MapShell compact />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Active help requests */}
      {activeHelpRequests.length > 0 && (
        <section className="bg-felines-surface py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Reveal>
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-felines-accent-hover">
                Quem precisa de uma mão
              </p>
              <h2 className="mt-3 text-3xl font-bold leading-tight text-felines-text-primary">
                Necessidades da comunidade agora
              </h2>
            </Reveal>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {activeHelpRequests.map((request, index) => (
                <Reveal key={request.id} delayMs={index * 60}>
                  <Link
                    href={`/colony/${request.colonyId}`}
                    className={`block h-full rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-1 ${
                      request.urgency === "urgent"
                        ? "border-felines-emergency bg-felines-emergency/5"
                        : "border-felines-border bg-felines-background"
                    }`}
                  >
                    <p className="text-sm font-semibold text-felines-text-primary">
                      {getHelpRequestTypeIcon(request.type)} {getHelpRequestTypeLabel(request.type)}
                    </p>
                    <p className="mt-1 text-sm text-felines-text-secondary">{request.description}</p>
                    <p className="mt-2 text-xs font-medium text-felines-accent-hover">{request.colonyName}</p>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recent activity feed */}
      <section className="bg-felines-surface py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-felines-accent-hover">
              Acontecendo agora
            </p>
            <h2 className="mt-3 text-3xl font-bold leading-tight text-felines-text-primary">
              Atividade recente
            </h2>
          </Reveal>

          {activity.length === 0 ? (
            <p className="mt-6 text-sm text-felines-text-secondary">
              Nada registrado ainda — seja a primeira pessoa a deixar uma marca.
            </p>
          ) : (
            <ol className="mt-8 space-y-3">
              {activity.map((item, index) => (
                <Reveal key={`${item.kind}-${item.occurred_at}-${index}`} delayMs={Math.min(index, 10) * 40}>
                  <li className="flex items-center justify-between rounded-xl border border-felines-border bg-felines-background px-4 py-3 text-sm">
                    <span className="text-felines-text-primary">{describeActivity(item.kind)}</span>
                    <span className="text-xs text-felines-text-secondary">
                      {new Date(item.occurred_at).toLocaleDateString("pt-BR")}
                    </span>
                  </li>
                </Reveal>
              ))}
            </ol>
          )}
        </div>
      </section>

      {/* Educational impact */}
      <section className="bg-felines-background py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-felines-accent-hover">
              Educação
            </p>
            <h2 className="mt-3 text-3xl font-bold leading-tight text-felines-text-primary">
              Conhecimento se espalhando
            </h2>
          </Reveal>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            <Reveal>
              <p className="text-[40px] font-bold leading-none text-felines-accent">{ARTICLES.length}</p>
              <p className="mt-2 text-sm text-felines-text-secondary">Artigos publicados</p>
            </Reveal>
            <Reveal delayMs={80}>
              <p className="text-[40px] font-bold leading-none text-felines-accent">
                {averageReadingTime} min
              </p>
              <p className="mt-2 text-sm text-felines-text-secondary">Tempo médio de leitura</p>
            </Reveal>
            <Reveal delayMs={160}>
              <p className="text-lg font-semibold leading-tight text-felines-text-primary">
                {mostReadArticle ? mostReadArticle.title : "Nenhum artigo lido ainda"}
              </p>
              <p className="mt-2 text-sm text-felines-text-secondary">Artigo mais lido</p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-felines-dark py-16">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-4 px-4 sm:px-6">
          <Link
            href="/map"
            className="rounded-full bg-felines-accent px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-felines-accent-hover"
          >
            Veja o que está acontecendo perto de você →
          </Link>
          <Link
            href="/#aprender"
            className="rounded-full border-2 border-white px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-felines-dark"
          >
            Comece a aprender →
          </Link>
          <Link
            href="/stories"
            className="rounded-full border-2 border-white px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-felines-dark"
          >
            Veja histórias da comunidade →
          </Link>
        </div>
      </section>
    </div>
  );
}
