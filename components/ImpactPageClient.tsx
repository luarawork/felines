"use client";

import Link from "next/link";
import Reveal from "@/components/Reveal";
import CountUpStat from "@/components/CountUpStat";
import MapShell from "@/components/MapShell";
import TnrProjectionCalculator from "@/components/TnrProjectionCalculator";
import ShareButton from "@/components/ShareButton";
import { getHelpRequestTypeIcon, getHelpRequestTypeLabel } from "@/lib/helpRequestTypes";
import { useLanguage } from "@/lib/i18n";

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

type ActiveHelpRequest = {
  id: string;
  colonyId: string;
  colonyName: string;
  type: string;
  description: string;
  urgency: "normal" | "urgent";
};

type GroupedActivity = { kind: string; date: string; count: number };

type MostReadArticle = { title: string; title_en?: string } | null;

export default function ImpactPageClient({
  stats,
  activeHelpRequests,
  catsAwaitingNeutering,
  healthCounts,
  groupedActivity,
  articlesCount,
  averageReadingTime,
  mostReadArticle,
}: {
  stats: PlatformStats;
  activeHelpRequests: ActiveHelpRequest[];
  catsAwaitingNeutering: number;
  healthCounts: { thriving: number; stable: number; needs_attention: number; at_risk: number };
  groupedActivity: GroupedActivity[];
  articlesCount: number;
  averageReadingTime: number;
  mostReadArticle: MostReadArticle;
}) {
  const { t, language } = useLanguage();

  // Maps a raw activity "kind" (an event_type, "report:<type>",
  // "notification:<type>", or "article_read") to an anonymized,
  // human-readable, translated sentence.
  function describeActivity(kind: string): string {
    if (kind === "article_read") return t("impact.activity.article_read");

    if (kind.startsWith("report:")) {
      const reportType = kind.slice("report:".length);
      const reportKey = `impact.activity.report_${reportType}`;
      const translated = t(reportKey);
      const label = translated === reportKey ? t("impact.activity.report_something") : translated;
      return `${t("impact.activity.report_prefix")} ${label} ${t("impact.activity.report_near_colony")}`;
    }

    if (kind.startsWith("notification:")) {
      const notificationType = kind.slice("notification:".length);
      const key = `impact.activity.notification_${notificationType}`;
      const translated = t(key);
      return translated === key ? t("impact.activity.notification_default") : translated;
    }

    const key = `impact.activity.event_${kind}`;
    const translated = t(key);
    return translated === key ? t("impact.activity.event_default") : translated;
  }

  const STAT_CARDS: { value: number; label: string }[] = [
    { value: stats.total_colonies, label: t("impact.stats.colonies") },
    { value: stats.total_cats, label: t("impact.stats.cats") },
    { value: stats.total_cats_castrated, label: t("impact.stats.catsCastrated") },
    { value: stats.total_reports, label: t("impact.stats.reports") },
    { value: stats.total_reports_resolved, label: t("impact.stats.reportsResolved") },
    { value: stats.total_feedings, label: t("impact.stats.feedings") },
    { value: stats.total_caretakers, label: t("impact.stats.caretakers") },
    { value: stats.total_articles_read, label: t("impact.stats.articlesRead") },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="bg-felines-dark py-20">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
          <div className="mb-4 flex justify-center">
            <ShareButton title={t("impact.heroHeadline")} onDark />
          </div>
          <Reveal>
            <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl">
              {t("impact.heroHeadline")}
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-lg text-felines-text-secondary-on-dark">
              {t("impact.heroSub")}
            </p>
          </Reveal>
        </div>
      </section>

      {/* Live stats grid */}
      <section className="bg-felines-dark pb-20">
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
              {t("impact.mapLabel")}
            </p>
            <h2 className="mt-3 text-3xl font-bold leading-tight text-felines-text-primary">
              {t("impact.mapHeadline")}
            </h2>
          </Reveal>
          <Reveal delayMs={100}>
            <div className="mt-8 h-96 w-full overflow-hidden rounded-2xl border border-felines-border shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
              <MapShell compact />
            </div>
          </Reveal>
        </div>
      </section>

      {/* TNR population projection calculator */}
      <section className="bg-felines-surface py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <TnrProjectionCalculator />
          </Reveal>
        </div>
      </section>

      {/* Active help requests */}
      {activeHelpRequests.length > 0 && (
        <section className="bg-felines-surface py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Reveal>
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-felines-accent-hover">
                {t("impact.helpLabel")}
              </p>
              <h2 className="mt-3 text-3xl font-bold leading-tight text-felines-text-primary">
                {t("impact.helpHeadline")}
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
                      {getHelpRequestTypeIcon(request.type)} {getHelpRequestTypeLabel(request.type, t)}
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

      {/* Neutering needs */}
      {catsAwaitingNeutering > 0 && (
        <section className="bg-felines-background py-16">
          <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
            <Reveal>
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-felines-accent-hover">
                {t("impact.neuteringLabel")}
              </p>
              <p className="mt-3 text-4xl font-bold leading-tight text-felines-text-primary">
                {catsAwaitingNeutering}
              </p>
              <p className="mt-1 text-base text-felines-text-secondary">
                {catsAwaitingNeutering === 1 ? t("impact.neuteringCat") : t("impact.neuteringCats")}
              </p>
            </Reveal>
          </div>
        </section>
      )}

      {/* Colony health overview */}
      <section className="bg-felines-surface py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-felines-accent-hover">
              {t("impact.healthLabel")}
            </p>
            <h2 className="mt-3 text-3xl font-bold leading-tight text-felines-text-primary">
              {t("impact.healthHeadline")}
            </h2>
          </Reveal>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: t("impact.healthStatus.thriving"), value: healthCounts.thriving },
              { label: t("impact.healthStatus.stable"), value: healthCounts.stable },
              { label: t("impact.healthStatus.needs_attention"), value: healthCounts.needs_attention },
              { label: t("impact.healthStatus.at_risk"), value: healthCounts.at_risk },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <p className="text-3xl font-bold text-felines-text-primary">{item.value}</p>
                <p className="mt-1 text-xs text-felines-text-secondary">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent activity feed */}
      <section className="bg-felines-surface py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-felines-accent-hover">
              {t("impact.activityLabel")}
            </p>
            <h2 className="mt-3 text-3xl font-bold leading-tight text-felines-text-primary">
              {t("impact.activityHeadline")}
            </h2>
          </Reveal>

          {groupedActivity.length === 0 ? (
            <p className="mt-6 text-sm text-felines-text-secondary">{t("impact.activityEmpty")}</p>
          ) : (
            <ol className="mt-8 space-y-3">
              {groupedActivity.map((item, index) => (
                <Reveal key={`${item.kind}-${item.date}-${index}`} delayMs={Math.min(index, 10) * 40}>
                  <li className="flex items-center justify-between rounded-xl border border-felines-border bg-felines-background px-4 py-3 text-sm">
                    <span className="text-felines-text-primary">{describeActivity(item.kind)}</span>
                    <span className="flex items-center gap-2 text-xs text-felines-text-secondary">
                      {item.count > 1 && (
                        <span className="rounded-full bg-felines-accent/10 px-2 py-0.5 font-semibold text-felines-accent">
                          {item.count}×
                        </span>
                      )}
                      {item.date}
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
              {t("impact.educationLabel")}
            </p>
            <h2 className="mt-3 text-3xl font-bold leading-tight text-felines-text-primary">
              {t("impact.educationHeadline")}
            </h2>
          </Reveal>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            <Reveal>
              <p className="text-[40px] font-bold leading-none text-felines-accent">{articlesCount}</p>
              <p className="mt-2 text-sm text-felines-text-secondary">{t("impact.educationArticles")}</p>
            </Reveal>
            <Reveal delayMs={80}>
              <p className="text-[40px] font-bold leading-none text-felines-accent">
                {averageReadingTime} min
              </p>
              <p className="mt-2 text-sm text-felines-text-secondary">{t("impact.educationReadingTime")}</p>
            </Reveal>
            <Reveal delayMs={160}>
              <p className="text-lg font-semibold leading-tight text-felines-text-primary">
                {mostReadArticle
                  ? (language === "en" ? mostReadArticle.title_en ?? mostReadArticle.title : mostReadArticle.title)
                  : t("impact.educationNoArticles")}
              </p>
              <p className="mt-2 text-sm text-felines-text-secondary">{t("impact.educationMostRead")}</p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Caretaker recognition */}
      <section className="bg-felines-background py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <Reveal>
            <p className="text-[56px] font-bold leading-none text-felines-accent">
              {stats.total_caretakers}
            </p>
            <p className="mt-3 text-xl font-semibold text-felines-text-primary">
              {stats.total_caretakers === 1 ? t("impact.caretakerSingle") : t("impact.caretakerPlural")}
            </p>
            <p className="mx-auto mt-3 max-w-lg text-base leading-relaxed text-felines-text-secondary">
              {t("impact.caretakerThanks")}
            </p>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-felines-dark py-16">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-4 px-4 sm:px-6">
          <Link
            href="/map"
            className="rounded-full bg-felines-accent px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-felines-accent-hover"
          >
            {t("impact.ctaMap")}
          </Link>
          <Link
            href="/#aprender"
            className="rounded-full border-2 border-white px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-felines-dark"
          >
            {t("impact.ctaLearn")}
          </Link>
          <Link
            href="/stories"
            className="rounded-full border-2 border-white px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-felines-dark"
          >
            {t("impact.ctaStories")}
          </Link>
        </div>
      </section>
    </div>
  );
}
