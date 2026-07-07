// /impact route for Felines.
// Public, no-login page showing live platform-wide statistics — every
// number here comes from get_platform_impact_stats() and
// get_recent_platform_activity(), two SECURITY DEFINER RPCs that return
// only aggregates/anonymized labels, never raw rows (several source
// tables, like feedings and knowledge_progress, have no anon SELECT
// policy at all, by design — this page never widens that, it just asks
// the database for a count instead of the rows themselves).
import type { Metadata } from "next";
import { supabase } from "@/lib/supabaseClient";
import { ARTICLES, getArticleBySlug, getReadingTimeMinutes } from "@/lib/content/articles";
import ImpactPageClient from "@/components/impact/ImpactPageClient";

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

export default async function ImpactPage() {
  const [
    { data: statsRows },
    { data: activityRows },
    { data: helpRequestRows },
    { data: neuteringRows },
    { data: colonyHealthRows },
  ] = await Promise.all([
      supabase.rpc("get_platform_impact_stats"),
      supabase.rpc("get_recent_platform_activity", { p_limit: 100 }),
      supabase
        .from("help_requests")
        .select("id, colony_id, type, description, urgency, created_at, colonies(name)")
        .eq("status", "open")
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(10),
      supabase.from("neutering_requests").select("cats_count").neq("status", "completed"),
      supabase.from("colonies").select("health_status"),
    ]);

  const activeHelpRequests = (helpRequestRows ?? []).map((row) => ({
    id: row.id,
    colonyId: row.colony_id,
    colonyName: (row.colonies as unknown as { name: string } | null)?.name ?? "Colônia",
    type: row.type,
    description: row.description,
    urgency: row.urgency as "normal" | "urgent",
  }));

  const catsAwaitingNeutering = (neuteringRows ?? []).reduce((total, row) => total + row.cats_count, 0);

  const healthCounts = { thriving: 0, stable: 0, needs_attention: 0, at_risk: 0 };
  (colonyHealthRows ?? []).forEach((row) => {
    const status = row.health_status as keyof typeof healthCounts;
    if (status in healthCounts) healthCounts[status] += 1;
  });

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

  // Group consecutive identical actions by (kind + date) so the feed
  // doesn't show 10 identical lines in a row.
  type GroupedActivity = { kind: string; date: string; count: number };
  const groupedActivity: GroupedActivity[] = [];
  for (const item of activity) {
    const date = new Date(item.occurred_at).toLocaleDateString("pt-BR");
    const last = groupedActivity[groupedActivity.length - 1];
    if (last && last.kind === item.kind && last.date === date) {
      last.count += 1;
    } else {
      groupedActivity.push({ kind: item.kind, date, count: 1 });
    }
  }
  groupedActivity.splice(15);

  const averageReadingTime = Math.round(
    ARTICLES.reduce((total, article) => total + getReadingTimeMinutes(article), 0) / ARTICLES.length
  );
  const mostReadArticle = stats.most_read_article_slug
    ? getArticleBySlug(stats.most_read_article_slug)
    : null;

  return (
    <ImpactPageClient
      stats={stats}
      activeHelpRequests={activeHelpRequests}
      catsAwaitingNeutering={catsAwaitingNeutering}
      healthCounts={healthCounts}
      groupedActivity={groupedActivity}
      articlesCount={ARTICLES.length}
      averageReadingTime={averageReadingTime}
      mostReadArticle={
        mostReadArticle
          ? { title: mostReadArticle.title, title_en: mostReadArticle.title_en }
          : null
      }
    />
  );
}
