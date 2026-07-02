// "Relatórios" tab on the colony page: numbers and evolution over time
// for this one colony. Pure presentation over data already fetched
// server-side via the get_colony_* RPCs (app/colony/[id]/page.tsx) — no
// charting library in this project, so the two time-series charts are
// plain CSS bars rather than a canvas/SVG chart.
"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n";
import { getReportTypeLabel } from "@/lib/reportTypes";
import { computeMilestones, type TimelineEventLike } from "@/components/ColonyMilestones";
import { getUrgencyLabel } from "@/lib/neuteringRequestTypes";
import CountUpStat from "@/components/CountUpStat";

type Stats = {
  total_cats: number;
  cats_castrated: number;
  total_feedings: number;
  total_reports: number;
  total_reports_resolved: number;
  total_caretakers: number;
  total_timeline_events: number;
  total_weather_events: number;
  days_since_registered: number;
};

type WeeklyFeeding = { week_start: string; check_in_count: number };
type MonthlyReports = { month_start: string; report_count: number };
type ReportBreakdown = { report_type: string; report_count: number };
type MonthlyWeather = { month_start: string; event_count: number };
type NeuteringRequestRecord = {
  id: string;
  cats_count: number;
  urgency: "low" | "medium" | "high";
  status: "open" | "in_progress" | "completed";
  created_at: string;
};
type HealthBreakdown = {
  feeding_score: number;
  sighting_score: number;
  castration_score: number;
  reports_score: number;
  caretaker_score: number;
};

function BarChart({
  data,
  labelFormatter,
}: {
  data: { label: string; value: number }[];
  labelFormatter: (label: string) => string;
}) {
  const max = Math.max(1, ...data.map((item) => item.value));
  return (
    <div className="flex items-end gap-2" style={{ height: 120 }}>
      {data.map((item) => (
        <div key={item.label} className="flex flex-1 flex-col items-center gap-1">
          <div
            className="w-full rounded-t-sm bg-felines-accent"
            style={{ height: `${Math.max(4, (item.value / max) * 100)}%` }}
            title={`${item.value}`}
          />
          <span className="text-[10px] text-felines-text-secondary">{labelFormatter(item.label)}</span>
        </div>
      ))}
    </div>
  );
}

export default function ColonyStatsTab({
  stats,
  weeklyFeedings,
  monthlyReports,
  reportBreakdown,
  monthlyWeather,
  neuteringRequests,
  healthScore,
  healthStatus,
  healthBreakdown,
  colonyCreatedAt,
  timelineEvents,
}: {
  stats: Stats;
  weeklyFeedings: WeeklyFeeding[];
  monthlyReports: MonthlyReports[];
  reportBreakdown: ReportBreakdown[];
  monthlyWeather: MonthlyWeather[];
  neuteringRequests: NeuteringRequestRecord[];
  healthScore: number;
  healthStatus: string;
  healthBreakdown: HealthBreakdown;
  colonyCreatedAt: string;
  timelineEvents: TimelineEventLike[];
}) {
  const { t, language } = useLanguage();
  const dateLocale = language === "en" ? "en-US" : "pt-BR";
  const [showHealthBreakdown, setShowHealthBreakdown] = useState(false);
  const milestones = computeMilestones(colonyCreatedAt, stats.total_cats, timelineEvents, t);
  const castrationPercent =
    stats.total_cats > 0 ? Math.round((stats.cats_castrated / stats.total_cats) * 100) : 0;

  const SUMMARY_CARDS = [
    { label: t("colony.statsTab.catsRegistered"), value: String(stats.total_cats) },
    { label: t("colony.statsTab.catsCastrated"), value: `${stats.cats_castrated} (${castrationPercent}%)` },
    { label: t("colony.statsTab.feedingCheckIns"), value: String(stats.total_feedings) },
    { label: t("colony.statsTab.reportsSubmitted"), value: String(stats.total_reports) },
    { label: t("colony.statsTab.reportsResolved"), value: String(stats.total_reports_resolved) },
    { label: t("colony.statsTab.daysSinceRegistered"), value: String(stats.days_since_registered) },
    { label: t("colony.statsTab.currentCaretakers"), value: String(stats.total_caretakers) },
    { label: t("colony.statsTab.timelineEvents"), value: String(stats.total_timeline_events) },
    { label: t("colony.statsTab.weatherEvents"), value: String(stats.total_weather_events) },
  ];

  return (
    <div className="space-y-10">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {SUMMARY_CARDS.map((card) => (
          <div key={card.label} className="rounded-xl border border-felines-border bg-felines-surface p-4">
            <p className="text-2xl font-bold text-felines-text-primary">
              <CountUpStat value={card.value} />
            </p>
            <p className="mt-1 text-xs text-felines-text-secondary">{card.label}</p>
          </div>
        ))}
      </div>

      <div>
        <div
          role="group"
          aria-label={t("colony.statsTab.healthAriaLabel")
            .replace("{status}", t(`colony.health.${healthStatus}`))
            .replace("{score}", String(healthScore))}
          className="flex flex-wrap items-center gap-3"
        >
          <p className="text-2xl font-bold text-felines-text-primary" aria-hidden="true">
            {healthScore}<span className="text-sm font-medium text-felines-text-secondary">/100</span>
          </p>
          <span className="rounded-full bg-felines-accent-light px-3 py-1 text-xs font-semibold text-felines-accent-hover" aria-hidden="true">
            {t(`colony.health.${healthStatus}`)}
          </span>
        </div>
        <p className="mt-1 text-xs text-felines-text-secondary max-w-xl">
          {t("colony.statsTab.healthExplainer")}
        </p>
        <button
          type="button"
          onClick={() => setShowHealthBreakdown((previous) => !previous)}
          aria-expanded={showHealthBreakdown}
          className="mt-3 flex items-center gap-1 text-xs font-semibold text-felines-accent-hover transition-colors hover:text-felines-accent"
        >
          {showHealthBreakdown ? t("colony.statsTab.hideBreakdown") : t("colony.statsTab.showBreakdown")}
          <span aria-hidden="true">{showHealthBreakdown ? "▲" : "▼"}</span>
        </button>
        {showHealthBreakdown && (
        <div className="felines-step-in mt-4 space-y-4">
          {[
            {
              label: t("colony.statsTab.factors.feeding.label"),
              weight: 30,
              value: healthBreakdown.feeding_score,
              max: 30,
              how: t("colony.statsTab.factors.feeding.how"),
            },
            {
              label: t("colony.statsTab.factors.sighting.label"),
              weight: 25,
              value: healthBreakdown.sighting_score,
              max: 25,
              how: t("colony.statsTab.factors.sighting.how"),
            },
            {
              label: t("colony.statsTab.factors.castration.label"),
              weight: 20,
              value: healthBreakdown.castration_score,
              max: 20,
              how: t("colony.statsTab.factors.castration.how"),
            },
            {
              label: t("colony.statsTab.factors.reports.label"),
              weight: 15,
              value: healthBreakdown.reports_score,
              max: 15,
              how: t("colony.statsTab.factors.reports.how"),
            },
            {
              label: t("colony.statsTab.factors.caretaker.label"),
              weight: 10,
              value: healthBreakdown.caretaker_score,
              max: 10,
              how: t("colony.statsTab.factors.caretaker.how"),
            },
          ].map((factor) => (
            <div key={factor.label}>
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-felines-text-primary">
                  {factor.label} <span className="font-normal text-felines-text-secondary">({factor.weight}%)</span>
                </span>
                <span className="tabular-nums text-felines-text-secondary">
                  {Math.round(factor.value * 10) / 10}/{factor.max}
                </span>
              </div>
              <div
                role="progressbar"
                aria-valuenow={Math.round(factor.value * 10) / 10}
                aria-valuemin={0}
                aria-valuemax={factor.max}
                aria-label={factor.label}
                className="mt-1 h-2 w-full rounded-full bg-felines-border"
              >
                <div
                  className="h-2 rounded-full bg-felines-accent"
                  style={{ width: `${Math.max(2, (factor.value / factor.max) * 100)}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-felines-text-secondary">{factor.how}</p>
            </div>
          ))}
        </div>
        )}
      </div>

      <div>
        <p className="text-sm font-semibold text-felines-text-primary">
          {t("colony.statsTab.castrationSummary")
            .replace("{castrated}", String(stats.cats_castrated))
            .replace("{total}", String(stats.total_cats))
            .replace("{percent}", String(castrationPercent))}
        </p>
        <div
          role="progressbar"
          aria-valuenow={castrationPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={t("colony.statsTab.castrationProgressAriaLabel").replace("{percent}", String(castrationPercent))}
          className="mt-2 h-3 w-full rounded-full bg-felines-border"
        >
          <div
            className="h-3 rounded-full bg-felines-success transition-all duration-700 ease-out"
            style={{ width: `${castrationPercent}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-felines-text-secondary">
          {t("colony.statsTab.castrationFooter")}
        </p>
      </div>

      <div className="grid gap-8 sm:grid-cols-2">
        <div>
          <p className="text-sm font-semibold text-felines-text-primary">
            {t("colony.statsTab.weeklyFeedingsTitle")}
          </p>
          <div className="mt-4">
            <BarChart
              data={weeklyFeedings.map((week) => ({ label: week.week_start, value: week.check_in_count }))}
              labelFormatter={(label) =>
                new Date(label).toLocaleDateString(dateLocale, { day: "2-digit", month: "2-digit" })
              }
            />
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-felines-text-primary">{t("colony.statsTab.monthlyReportsTitle")}</p>
          <div className="mt-4">
            <BarChart
              data={monthlyReports.map((month) => ({ label: month.month_start, value: month.report_count }))}
              labelFormatter={(label) => new Date(label).toLocaleDateString(dateLocale, { month: "short" })}
            />
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-felines-text-primary">
            {t("colony.statsTab.monthlyWeatherTitle")}
          </p>
          <p className="mt-1 text-xs text-felines-text-secondary">
            {t("colony.statsTab.monthlyWeatherSub")}
          </p>
          <div className="mt-4">
            <BarChart
              data={monthlyWeather.map((month) => ({ label: month.month_start, value: month.event_count }))}
              labelFormatter={(label) => new Date(label).toLocaleDateString(dateLocale, { month: "short" })}
            />
          </div>
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-felines-text-primary">{t("colony.statsTab.reportBreakdownTitle")}</p>
        {reportBreakdown.length === 0 ? (
          <p className="mt-2 text-sm text-felines-text-secondary">{t("colony.statsTab.reportBreakdownEmpty")}</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {reportBreakdown.map((row) => {
              const max = Math.max(...reportBreakdown.map((r) => r.report_count));
              const percent = Math.round((row.report_count / max) * 100);
              return (
                <li key={row.report_type}>
                  <div className="flex items-center justify-between text-xs text-felines-text-secondary">
                    <span>{getReportTypeLabel(row.report_type, t)}</span>
                    <span>{row.report_count}</span>
                  </div>
                  <div className="mt-1 h-2 w-full rounded-full bg-felines-border">
                    <div
                      className="h-2 rounded-full bg-felines-accent"
                      style={{ width: `${Math.max(4, percent)}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {neuteringRequests.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-felines-text-primary">{t("colony.statsTab.neuteringRequestsTitle")}</p>
          <ul className="mt-3 space-y-2">
            {neuteringRequests.map((request) => (
              <li
                key={request.id}
                className="flex items-center justify-between rounded-md border border-felines-border px-3 py-2 text-sm"
              >
                <span className="text-felines-text-primary">
                  ✂️ {request.cats_count}{" "}
                  {request.cats_count === 1 ? t("colony.statsTab.catSingular") : t("colony.statsTab.catPlural")} ·{" "}
                  {getUrgencyLabel(request.urgency, t)}
                </span>
                <span className="text-xs text-felines-text-secondary">
                  {request.status === "completed"
                    ? t("colony.statsTab.status.completed")
                    : request.status === "in_progress"
                      ? t("colony.statsTab.status.in_progress")
                      : t("colony.statsTab.status.open")}{" "}
                  · {new Date(request.created_at).toLocaleDateString(dateLocale)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <p className="text-sm font-semibold text-felines-text-primary">{t("milestones.heading")}</p>
        <ul className="mt-3 space-y-2">
          {milestones.map((milestone, index) => (
            <li
              key={`${milestone.label}-${index}`}
              className="flex items-center justify-between rounded-md border border-felines-border bg-felines-surface px-3 py-2 text-sm"
            >
              <span className="text-felines-text-primary">
                {milestone.emoji} {milestone.label}
              </span>
              <span className="text-xs text-felines-text-secondary">
                {milestone.date.toLocaleDateString(dateLocale)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
