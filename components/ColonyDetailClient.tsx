"use client";

import Link from "next/link";
import Reveal from "@/components/Reveal";
import EmptyState from "@/components/EmptyState";
import TimelinePhoto from "@/components/TimelinePhoto";
import ColonyMilestones from "@/components/ColonyMilestones";
import CatManager from "@/components/CatManager";
import CaretakerLetters from "@/components/CaretakerLetters";
import TimelineEventForm from "@/components/TimelineEventForm";
import ColonyTabs from "@/components/ColonyTabs";
import ShareStoryButton from "@/components/ShareStoryButton";
import HelpRequestButton from "@/components/HelpRequestButton";
import NeuteringRequestButton from "@/components/NeuteringRequestButton";
import ColonyActions from "@/components/ColonyActions";
import WeatherBanner from "@/components/WeatherBanner";
import ColonySettingsMenu from "@/components/ColonySettingsMenu";
import FollowColonyButton from "@/components/FollowColonyButton";
import ShareButton from "@/components/ShareButton";
import HelpRequestBanner from "@/components/HelpRequestBanner";
import NeuteringRequestBanner from "@/components/NeuteringRequestBanner";
import VerifyColonyButton from "@/components/VerifyColonyButton";
import ThankYouButton from "@/components/ThankYouButton";
import MarkCatSeenButton from "@/components/MarkCatSeenButton";
import FlagButton from "@/components/FlagButton";
import ColonyAccessProvider, { useColonyAccessContext } from "@/components/ColonyAccessProvider";
import AuthRequiredNotice from "@/components/AuthRequiredNotice";
import RotatingSingleFact from "@/components/RotatingSingleFact";
import ColonyStatsTab from "@/components/ColonyStatsTab";
import ActionThanksButton from "@/components/ActionThanksButton";
import CareReminders from "@/components/CareReminders";
import { useState } from "react";
import { useLanguage } from "@/lib/i18n";

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

type Caretaker = {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
};

type ColonyStats = {
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

type HealthBreakdown = {
  feeding_score: number;
  sighting_score: number;
  castration_score: number;
  reports_score: number;
  caretaker_score: number;
};

// System-generated events rendered with lighter styling.
const SYSTEM_EVENT_TYPES = new Set(["extreme_heat", "extreme_cold", "heavy_rain", "colony_edited"]);

export default function ColonyDetailClient({
  colony,
  cats,
  timelineEvents,
  caretakers,
  activeHelpRequest,
  activeNeuteringRequest,
  neuteringHistoryRows,
  hasFalsePinWarning,
  colonyStats,
  weeklyFeedingRows,
  monthlyReportRows,
  reportBreakdownRows,
  monthlyWeatherRows,
  healthBreakdown,
  colonyFactChips,
}: {
  colony: {
    id: string;
    name: string;
    narrative: string | null;
    castration_status: string;
    cover_photo_url: string | null;
    latitude_blurred: number;
    longitude_blurred: number;
    created_at: string;
    verified_status: string | null;
    verified_at: string | null;
    health_status: string;
    health_score: number;
  };
  cats: Cat[];
  timelineEvents: TimelineEvent[];
  caretakers: Caretaker[];
  activeHelpRequest: { id: string; type: string; description: string | null; urgency: "normal" | "urgent" } | null;
  activeNeuteringRequest: { id: string; cats_count: number; urgency: string; status: string } | null;
  neuteringHistoryRows: unknown[];
  hasFalsePinWarning: boolean;
  colonyStats: ColonyStats;
  weeklyFeedingRows: unknown[];
  monthlyReportRows: unknown[];
  reportBreakdownRows: unknown[];
  monthlyWeatherRows: unknown[];
  healthBreakdown: HealthBreakdown;
  colonyFactChips: string[];
}) {
  const { t } = useLanguage();
  const [now] = useState(() => Date.now());

  function eventTypeLabel(eventType: string): string {
    const translated = t(`colony.eventTypes.${eventType}`);
    // t() returns the key path unchanged when not found — fall back to humanised key
    return translated === `colony.eventTypes.${eventType}`
      ? eventType.replace(/_/g, " ")
      : translated;
  }

  const uncastratedCats = cats.filter((cat) => !cat.castrated);
  const totalCats = cats.length;
  const castratedCount = cats.filter((cat) => cat.castrated).length;

  const catsSection = (
    <>
      {totalCats === 0 ? (
        <EmptyState
          main={t("colony.cats.empty.main")}
          sub={t("colony.cats.empty.sub")}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {cats.map((cat, index) => {
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
                      alt={cat.name ?? t("colony.cats.photoAlt")}
                      loading="lazy"
                      className="h-32 w-full rounded-xl object-cover"
                    />
                  ) : (
                    <div className="h-32 w-full rounded-xl bg-felines-border" />
                  )}
                  <p className="mt-3 font-semibold text-felines-text-primary">
                    {cat.name ?? t("colony.cats.noName")}
                  </p>
                  <p className="text-xs text-felines-text-secondary">
                    {cat.castrated ? t("colony.cats.castrated") : t("colony.cats.notCastrated")}
                    {cat.last_seen &&
                      ` · ${t("colony.cats.seen")} ${new Date(cat.last_seen).toLocaleDateString("pt-BR")}`}
                  </p>
                  {isStale && (
                    <>
                      <p className="mt-1 text-xs text-felines-warning-hover">
                        {t("colony.catsStaleSuffix").replace("{name}", cat.name ?? t("colony.cats.noName"))}
                      </p>
                      <MarkCatSeenButton catId={cat.id} catName={cat.name ?? t("colony.cats.noName")} colonyId={colony.id} />
                    </>
                  )}
                </div>
              </Reveal>
            );
          })}
        </div>
      )}
      <CatManager colonyId={colony.id} />
    </>
  );

  const needsSection = (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-felines-text-primary">
          {t("colony.needs.castrationStatus")}
        </p>
        {totalCats === 0 ? (
          <p className="mt-2 text-sm text-felines-text-secondary">
            {t("colony.needs.noCats")}
          </p>
        ) : (
          <>
            <div className="mt-2 h-3 w-full max-w-sm rounded-full bg-felines-border">
              <div
                className="h-3 rounded-full bg-felines-success transition-all duration-700 ease-out"
                style={{ width: `${Math.round((castratedCount / totalCats) * 100)}%` }}
              />
            </div>
            <p className="mt-1 text-sm text-felines-text-secondary">
              {t("colony.castratedCount")
                .replace("{count}", String(castratedCount))
                .replace("{total}", String(totalCats))}
            </p>
            {uncastratedCats.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-medium text-felines-text-secondary uppercase tracking-wide">
                  {t("colony.needs.stillNeed")}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {uncastratedCats.map((cat) => (
                    <span
                      key={cat.id}
                      className="rounded-full border border-felines-warning bg-felines-warning/10 px-3 py-1 text-xs font-medium text-felines-warning-hover"
                    >
                      {cat.name ?? t("colony.cats.noName")}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-xs text-felines-text-secondary">
                  {t("colony.needs.uncastratedNudge")}{" "}
                  <Link
                    href="/learn/what-is-tnr-and-why-it-works"
                    className="font-medium text-felines-accent-hover hover:text-felines-accent"
                  >
                    {t("common.learnMore")}
                  </Link>
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {activeNeuteringRequest && (
        <div className="rounded-xl border border-felines-accent/30 bg-felines-accent-light p-4">
          <p className="text-sm font-semibold text-felines-text-primary">
            {t("colony.needs.activeNeutering")}
          </p>
          <p className="mt-1 text-sm text-felines-text-secondary">
            {activeNeuteringRequest.cats_count} {t("colony.needs.neuteringAwaiting")} ·{" "}
            {t("colony.needs.urgency")} {t(`colony.urgency.${activeNeuteringRequest.urgency}`)}
          </p>
        </div>
      )}

      {activeHelpRequest && (
        <div className="rounded-xl border border-felines-emergency/30 bg-felines-emergency/5 p-4">
          <p className="text-sm font-semibold text-felines-text-primary">
            {t("colony.needs.activeHelp")}
          </p>
          <p className="mt-1 text-sm text-felines-text-secondary">
            {activeHelpRequest.description || activeHelpRequest.type}
          </p>
        </div>
      )}

      {!activeNeuteringRequest && !activeHelpRequest && uncastratedCats.length === 0 && totalCats > 0 && (
        <div className="rounded-xl border border-felines-success/30 bg-felines-success/5 p-4">
          <p className="font-semibold text-felines-success-hover">{t("colony.needs.allGood")}</p>
          <p className="mt-1 text-sm text-felines-text-secondary">
            {t("colony.needs.allGoodSub")}
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-3 pt-2">
        <NeuteringRequestButton colonyId={colony.id} />
        <HelpRequestButton colonyId={colony.id} />
      </div>

      <CareReminders colonyId={colony.id} />
    </div>
  );

  const hasNoTimelineEntriesEver = timelineEvents.length === 0;
  const mostRecentEventDate = timelineEvents[0]?.created_at
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
        catCount={cats.length}
        timelineEvents={timelineEvents}
      />

      <TimelineEventForm colonyId={colony.id} />

      <div className="mt-3">
        <ShareStoryButton colonyId={colony.id} />
      </div>

      {hasNoTimelineEntriesEver && (
        <div className="mt-4">
          <EmptyState
            main={t("colony.timeline.empty.main")}
            sub={t("colony.timeline.empty.sub")}
            ctas={[{ label: t("colony.timeline.empty.cta"), href: "#colony-report-button" }]}
          />
        </div>
      )}

      {hasStaleUpdates && (
        <div className="mt-4">
          <EmptyState
            main={t("colony.timeline.stale.main")}
            ctas={[{ label: t("colony.timeline.stale.cta"), href: "#colony-report-button" }]}
          />
        </div>
      )}

      {timelineEvents.length > 0 && (
        <ol className="mt-4 space-y-4 border-l-2 border-felines-accent pl-5">
          {timelineEvents.map((event, index) => (
            <Reveal key={event.id} delayMs={Math.min(index, 8) * 60}>
              <li>
                <div
                  className={`rounded-xl border p-4 ${
                    SYSTEM_EVENT_TYPES.has(event.event_type)
                      ? "border-felines-border/60 bg-felines-surface/60"
                      : "border-felines-border bg-felines-surface"
                  }`}
                >
                  <p
                    className={`text-sm font-medium ${
                      SYSTEM_EVENT_TYPES.has(event.event_type)
                        ? "text-felines-text-secondary"
                        : "text-felines-text-primary"
                    }`}
                  >
                    {eventTypeLabel(event.event_type)}
                  </p>
                  {event.description && event.event_type !== "colony_edited" && (
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
                            {caretakers.find((c) => c.userId === event.created_by)?.displayName
                              ?? t("colony.timeline.authorDefault")}
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

  const castrationBadge = (() => {
    if (cats.length === 0) {
      return t(`colony.castration.${colony.castration_status}`) || colony.castration_status;
    }
    if (castratedCount === 0) return t("colony.noCatsCastrated");
    if (castratedCount === cats.length) return t("colony.allCatsCastrated");
    return t("colony.castratedCount")
      .replace("{count}", String(castratedCount))
      .replace("{total}", String(cats.length));
  })();

  return (
    <div>
      <ColonyAccessProvider colonyId={colony.id}>
      <ColonyAccessGate colonyName={colony.name}>
        {/* Hero */}
        <div className="relative h-72 w-full sm:h-80">
          {colony.cover_photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={colony.cover_photo_url}
              alt={`${colony.name}`}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 h-full w-full bg-felines-dark" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <div className="absolute right-4 top-4">
            <ColonySettingsMenu
              colonyId={colony.id}
              initialName={colony.name}
              initialNarrative={colony.narrative}
              initialCastrationStatus={colony.castration_status as "none" | "partial" | "full"}
              initialCoverPhotoUrl={colony.cover_photo_url}
            />
          </div>
          <div className="absolute inset-x-0 bottom-0 mx-auto max-w-4xl px-4 pb-6 sm:px-6">
            <h1 className="text-3xl font-bold leading-tight text-white sm:text-[40px]">
              {colony.name}
            </h1>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="inline-block rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-felines-text-primary">
                {castrationBadge}
              </span>
              <span className="inline-block rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-felines-text-primary">
                {t(`colony.health.${colony.health_status}`) || colony.health_status}
              </span>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
          {hasFalsePinWarning && (
            <div className="mb-6 rounded-xl border border-felines-emergency bg-felines-emergency/10 px-4 py-3 text-sm text-felines-text-primary">
              {t("colony.falsePinWarning")}
            </div>
          )}
          {activeHelpRequest && (
            <HelpRequestBanner
              request={{ ...activeHelpRequest, description: activeHelpRequest.description ?? "" }}
            />
          )}
          {activeNeuteringRequest && (
            <NeuteringRequestBanner
              request={
                activeNeuteringRequest as unknown as {
                  id: string;
                  cats_count: number;
                  urgency: "low" | "medium" | "high";
                  status: "open" | "in_progress" | "completed";
                }
              }
              colonyId={colony.id}
            />
          )}

          <div className="mb-6">
            <WeatherBanner
              lat={colony.latitude_blurred}
              lon={colony.longitude_blurred}
              locationName={colony.name}
            />
          </div>

          {caretakers.length > 0 && (
            <Reveal>
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-felines-accent-hover">
                {t("colony.caretakersLabel")}
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
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-felines-text-primary">
                {colony.narrative}
              </p>
            )}

            <div className="mt-4">
              <RotatingSingleFact facts={colonyFactChips} />
            </div>
          </Reveal>

          <ColonyActions colonyId={colony.id} />

          <ColonyTabs
            tabs={[
              { id: "timeline", labelKey: "colony.tabs.timeline", label: "Linha do tempo", content: timelineSection },
              { id: "cats",     labelKey: "colony.tabs.cats",     label: "Gatos",           content: catsSection },
              { id: "needs",    labelKey: "colony.tabs.needs",    label: "Necessidades",    content: needsSection },
              {
                id: "reports",
                labelKey: "colony.tabs.reports",
                label: "Relatórios",
                content: (
                  <ColonyStatsTab
                    stats={colonyStats}
                    weeklyFeedings={weeklyFeedingRows as Parameters<typeof ColonyStatsTab>[0]["weeklyFeedings"]}
                    monthlyReports={monthlyReportRows as Parameters<typeof ColonyStatsTab>[0]["monthlyReports"]}
                    reportBreakdown={reportBreakdownRows as Parameters<typeof ColonyStatsTab>[0]["reportBreakdown"]}
                    monthlyWeather={monthlyWeatherRows as Parameters<typeof ColonyStatsTab>[0]["monthlyWeather"]}
                    neuteringRequests={neuteringHistoryRows as Parameters<typeof ColonyStatsTab>[0]["neuteringRequests"]}
                    healthScore={colony.health_score}
                    healthStatus={colony.health_status}
                    healthBreakdown={healthBreakdown}
                    colonyCreatedAt={colony.created_at}
                    timelineEvents={timelineEvents}
                  />
                ),
              },
              {
                id: "letter",
                labelKey: "colony.tabs.letter",
                label: "Carta de quem cuidou antes",
                content: <CaretakerLetters colonyId={colony.id} />,
              },
            ]}
            footer={
              <div className="mt-8 space-y-4 border-t border-felines-border pt-6">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-felines-accent-hover">
                  {t("colony.communityLabel")}
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <FollowColonyButton colonyId={colony.id} />
                  <ShareButton title={`${colony.name} — Felines`} />
                </div>
                <VerifyColonyButton
                  colonyId={colony.id}
                  verifiedStatus={(colony.verified_status ?? "unverified") as "unverified" | "community_verified"}
                  verifiedAt={colony.verified_at}
                />
                <FlagButton targetType="colony" targetId={colony.id} />
              </div>
            }
          />
        </div>
      </ColonyAccessGate>
      </ColonyAccessProvider>
    </div>
  );
}

// Colony pages are otherwise fully server-rendered and public — this
// is the one place access actually gets enforced, and it has to happen
// client-side (like every other auth check in this app) since there's
// no cookie-based SSR session, only a browser-held one. Without this,
// anyone with a link (or a search result) could view full colony
// details — cats, timeline, caretakers — without ever signing in.
function ColonyAccessGate({ colonyName, children }: { colonyName: string; children: React.ReactNode }) {
  const { session, checkingAccess } = useColonyAccessContext();
  const { t } = useLanguage();

  if (checkingAccess) return null;

  if (!session) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <p className="text-2xl" aria-hidden="true">🔒</p>
        <h1 className="mt-3 text-xl font-bold text-felines-text-primary">
          {t("colony.loginRequiredTitle").replace("{name}", colonyName)}
        </h1>
        <p className="mt-2 text-sm text-felines-text-secondary">{t("colony.loginRequiredBody")}</p>
        <div className="mt-5">
          <AuthRequiredNotice />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
