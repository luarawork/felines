// /impact route for Felines.
// Public, no-login page showing live platform-wide statistics — every
// number here comes from get_platform_impact_stats() and
// get_recent_platform_activity(), two SECURITY DEFINER RPCs that return
// only aggregates/anonymized labels, never raw rows (several source
// tables, like feedings and knowledge_progress, have no anon SELECT
// policy at all, by design — this page never widens that, it just asks
// the database for a count instead of the rows themselves).
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { ARTICLES, getArticleBySlug, getReadingTimeMinutes } from "@/lib/articles";
import Reveal from "@/components/Reveal";
import CountUpStat from "@/components/CountUpStat";
import MapShell from "@/components/MapShell";

// These are live counts, not content that should be baked in at build
// time — without this, Next.js would statically render the page once
// during `next build` and serve that stale snapshot to every visitor.
export const dynamic = "force-dynamic";

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

// Maps a raw activity "kind" (an event_type, "report:<type>", or
// "article_read") to an anonymized, human-readable sentence — no user
// names, no colony names, no coordinates, ever.
function describeActivity(kind: string): string {
  if (kind === "article_read") return "Someone completed an educational article";
  if (kind.startsWith("report:")) {
    const reportType = kind.slice("report:".length);
    const reportLabels: Record<string, string> = {
      no_food_water: "a colony running low on food or water",
      injured_sick: "an injured or sick cat",
      new_kitten: "a new kitten",
      missing_cat: "a missing cat",
      suspected_poisoning: "a suspected poisoning",
      suspected_abuse: "suspected abuse",
      disease_outbreak: "a disease outbreak",
      threat_to_colony: "a threat to a colony",
      sighting: "a cat sighting",
    };
    return `Someone reported ${reportLabels[reportType] ?? "something"} near a colony`;
  }
  const eventLabels: Record<string, string> = {
    colony_created: "A colony was registered",
    new_caretaker: "A caretaker joined a colony",
    new_cat: "A cat was added to a colony",
    feeding: "Someone logged a feeding check-in",
    water: "Someone logged a water check-in",
    thank_you: "Someone thanked a caretaker",
    report_resolved: "A report was resolved",
    colony_info_updated: "A colony's page was updated",
    cover_photo_changed: "A colony's cover photo was updated",
    caretaker_letter_updated: "A caretaker left a note for the next one",
  };
  return eventLabels[kind] ?? "Something happened in a colony";
}

export default async function ImpactPage() {
  const [{ data: statsRows }, { data: activityRows }] = await Promise.all([
    supabase.rpc("get_platform_impact_stats"),
    supabase.rpc("get_recent_platform_activity", { p_limit: 20 }),
  ]);

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
    { value: stats.total_colonies, label: "Colonies mapped" },
    { value: stats.total_cats, label: "Named cats registered" },
    { value: stats.total_cats_castrated, label: "Cats marked as castrated" },
    { value: stats.total_reports, label: "Reports submitted" },
    { value: stats.total_reports_resolved, label: "Reports resolved" },
    { value: stats.total_feedings, label: "Feeding check-ins logged" },
    { value: stats.total_caretakers, label: "Active caretakers" },
    { value: stats.total_articles_read, label: "Articles read" },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="bg-[#2D1810] py-20">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
          <Reveal>
            <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl">
              Every action leaves a mark.
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-lg text-felines-text-secondary-on-dark">
              Here&apos;s what the Felines community has done so far.
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
              Geographic spread
            </p>
            <h2 className="mt-3 text-3xl font-bold leading-tight text-felines-text-primary">
              Every pin is a colony someone is looking after.
            </h2>
          </Reveal>
          <Reveal delayMs={100}>
            <div className="mt-8 h-96 w-full overflow-hidden rounded-2xl border border-felines-border shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
              <MapShell />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Recent activity feed */}
      <section className="bg-felines-surface py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-felines-accent-hover">
              Happening right now
            </p>
            <h2 className="mt-3 text-3xl font-bold leading-tight text-felines-text-primary">
              Recent activity
            </h2>
          </Reveal>

          {activity.length === 0 ? (
            <p className="mt-6 text-sm text-felines-text-secondary">
              Nothing recorded yet — be the first to leave a mark.
            </p>
          ) : (
            <ol className="mt-8 space-y-3">
              {activity.map((item, index) => (
                <Reveal key={`${item.kind}-${item.occurred_at}-${index}`} delayMs={Math.min(index, 10) * 40}>
                  <li className="flex items-center justify-between rounded-xl border border-felines-border bg-felines-background px-4 py-3 text-sm">
                    <span className="text-felines-text-primary">{describeActivity(item.kind)}</span>
                    <span className="text-xs text-felines-text-secondary">
                      {new Date(item.occurred_at).toLocaleDateString("en-US")}
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
              Education
            </p>
            <h2 className="mt-3 text-3xl font-bold leading-tight text-felines-text-primary">
              Knowledge spreading
            </h2>
          </Reveal>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            <Reveal>
              <p className="text-[40px] font-bold leading-none text-felines-accent">{ARTICLES.length}</p>
              <p className="mt-2 text-sm text-felines-text-secondary">Articles published</p>
            </Reveal>
            <Reveal delayMs={80}>
              <p className="text-[40px] font-bold leading-none text-felines-accent">
                {averageReadingTime} min
              </p>
              <p className="mt-2 text-sm text-felines-text-secondary">Average reading time</p>
            </Reveal>
            <Reveal delayMs={160}>
              <p className="text-lg font-semibold leading-tight text-felines-text-primary">
                {mostReadArticle ? mostReadArticle.title : "No articles read yet"}
              </p>
              <p className="mt-2 text-sm text-felines-text-secondary">Most read article</p>
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
            See what&apos;s happening near you →
          </Link>
          <Link
            href="/#aprender"
            className="rounded-full border-2 border-white px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-felines-dark"
          >
            Start learning →
          </Link>
        </div>
      </section>
    </div>
  );
}
