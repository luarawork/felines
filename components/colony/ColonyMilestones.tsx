// Horizontal strip of milestone cards shown above the main timeline
// feed — the colony's "highlight reel" instead of having to scroll
// through the full chronological history to find the meaningful firsts.
"use client";

import { useLanguage } from "@/lib/i18n";

export type TimelineEventLike = {
  event_type: string;
  created_at: string;
  photo_url: string | null;
};

export type Milestone = { emoji: string; label: string; date: Date };

const MS_PER_YEAR = 1000 * 60 * 60 * 24 * 365;

// Derives the colony's "highlight reel" from data already on the page —
// no separate query needed. Threshold milestones (5 cats, 10 check-ins)
// use the date of the event that crossed the threshold when available,
// falling back to now for colonies whose history predates that event
// type being logged. Exported so ColonyStatsTab can reuse it for the
// compact milestones list in the Reports tab, instead of recomputing
// the same logic twice.
export function computeMilestones(
  colonyCreatedAt: string,
  catCount: number,
  timelineEvents: TimelineEventLike[],
  t: (key: string) => string
): Milestone[] {
  const milestones: Milestone[] = [
    { emoji: "🎉", label: t("milestones.colonyRegistered"), date: new Date(colonyCreatedAt) },
  ];

  const ascending = [...timelineEvents].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const firstOf = (eventType: string) => ascending.find((event) => event.event_type === eventType);

  const firstCaretaker = firstOf("new_caretaker");
  if (firstCaretaker) {
    milestones.push({ emoji: "👤", label: t("milestones.firstCaretaker"), date: new Date(firstCaretaker.created_at) });
  }

  const firstCat = firstOf("new_cat");
  if (firstCat) {
    milestones.push({ emoji: "🐾", label: t("milestones.firstCat"), date: new Date(firstCat.created_at) });
  }

  const firstCastration = firstOf("cat_castrated");
  if (firstCastration) {
    milestones.push({ emoji: "✂️", label: t("milestones.firstCastration"), date: new Date(firstCastration.created_at) });
  }

  const firstThankYou = firstOf("thank_you");
  if (firstThankYou) {
    milestones.push({ emoji: "🙏", label: t("milestones.firstThankYou"), date: new Date(firstThankYou.created_at) });
  }

  const firstPhoto = ascending.find((event) => event.photo_url);
  if (firstPhoto) {
    milestones.push({ emoji: "📸", label: t("milestones.firstTimelinePhoto"), date: new Date(firstPhoto.created_at) });
  }

  const yearsSinceCreation = (Date.now() - new Date(colonyCreatedAt).getTime()) / MS_PER_YEAR;
  if (yearsSinceCreation >= 1) {
    const years = Math.floor(yearsSinceCreation);
    milestones.push({
      emoji: "🎂",
      label: (years === 1 ? t("milestones.yearsSingular") : t("milestones.yearsPlural")).replace(
        "{years}",
        String(years)
      ),
      date: new Date(colonyCreatedAt),
    });
  }

  if (catCount >= 5) {
    const fifthCatEvent = ascending.filter((event) => event.event_type === "new_cat")[4];
    milestones.push({
      emoji: "🏆",
      label: t("milestones.fiveCatsRegistered"),
      date: fifthCatEvent ? new Date(fifthCatEvent.created_at) : new Date(),
    });
  }

  const checkIns = ascending.filter((event) => event.event_type === "feeding" || event.event_type === "water");
  if (checkIns.length >= 10) {
    milestones.push({ emoji: "🏆", label: t("milestones.tenCheckIns"), date: new Date(checkIns[9].created_at) });
  }

  const firstResolved = firstOf("report_resolved");
  if (firstResolved) {
    milestones.push({ emoji: "🏆", label: t("milestones.firstReportResolved"), date: new Date(firstResolved.created_at) });
  }

  return milestones.sort((a, b) => a.date.getTime() - b.date.getTime());
}

function getPendingPlaceholders(t: (key: string) => string): { eventType: string; emoji: string; label: string }[] {
  return [
    { eventType: "new_caretaker", emoji: "👤", label: t("milestones.firstCaretaker") },
    { eventType: "new_cat", emoji: "🐾", label: t("milestones.firstCatNamed") },
    { eventType: "cat_castrated", emoji: "✂️", label: t("milestones.firstCastration") },
  ];
}

export default function ColonyMilestones({
  colonyCreatedAt,
  catCount,
  timelineEvents,
}: {
  colonyCreatedAt: string;
  catCount: number;
  timelineEvents: TimelineEventLike[];
}) {
  const { t, language } = useLanguage();
  const milestones = computeMilestones(colonyCreatedAt, catCount, timelineEvents, t);
  const achievedEventTypes = new Set(
    timelineEvents.map((event) => event.event_type).filter(Boolean)
  );
  const pending = getPendingPlaceholders(t).filter((placeholder) => !achievedEventTypes.has(placeholder.eventType));
  const dateLocale = language === "en" ? "en-US" : "pt-BR";

  return (
    <div className="mb-6">
      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-felines-accent-hover">
        {t("milestones.heading")}
      </p>
      <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
        {milestones.map((milestone, index) => (
          <div
            key={`${milestone.label}-${index}`}
            className="flex w-40 flex-shrink-0 flex-col gap-2 rounded-xl border border-felines-border border-l-4 border-l-felines-accent bg-felines-background p-4"
          >
            <span className="text-[48px] leading-none" aria-hidden="true">
              {milestone.emoji}
            </span>
            <p className="text-sm font-medium text-felines-text-primary">{milestone.label}</p>
            <p className="text-xs text-felines-text-secondary">
              {milestone.date.toLocaleDateString(dateLocale)}
            </p>
          </div>
        ))}
        {pending.map((placeholder) => (
          <div
            key={placeholder.eventType}
            className="flex w-40 flex-shrink-0 flex-col gap-2 rounded-xl border border-felines-border bg-felines-background p-4 opacity-50"
          >
            <span className="text-[48px] leading-none" aria-hidden="true">
              {placeholder.emoji}
            </span>
            <p className="text-sm font-medium text-felines-text-secondary">{placeholder.label}</p>
            <p className="text-xs text-felines-text-secondary">{t("milestones.comingSoon")}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
