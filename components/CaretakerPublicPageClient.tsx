// Client wrapper for /u/[id] — same reasoning as CatPageClient: the
// route itself is a server component (fetches everything in parallel),
// but rendering needs useLanguage(). Previously this whole page was
// hardcoded in Portuguese with no i18n at all.
"use client";

import Link from "next/link";
import ReportTypeLabel from "@/components/ReportTypeLabel";
import Reveal from "@/components/Reveal";
import FlagButton from "@/components/FlagButton";
import { useLanguage } from "@/lib/i18n";

type Badge = { icon: string; labelKey: string };
type Colony = { id: string; name: string };
type MadeReport = { id: string; type: string; status: string; created_at: string };
type ConfirmedReport = { confirmedAt: string; report: { id: string; type: string; status: string } };

export default function CaretakerPublicPageClient({
  profileId,
  displayName,
  avatarUrl,
  publicContact,
  colonies,
  badges,
  madeReportRows,
  confirmedReports,
}: {
  profileId: string;
  displayName: string | null;
  avatarUrl: string | null;
  publicContact: string | null;
  colonies: Colony[];
  badges: Badge[];
  madeReportRows: MadeReport[];
  confirmedReports: ConfirmedReport[];
}) {
  const { t } = useLanguage();

  return (
    <div>
      {/* Header */}
      <section className="bg-felines-background py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <div className="flex items-center gap-5">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt={displayName ?? t("publicProfile.avatarAlt")}
                  className="h-20 w-20 rounded-full object-cover shadow-[0_2px_8px_rgba(0,0,0,0.10)]"
                />
              ) : (
                <div className="h-20 w-20 rounded-full bg-felines-border" />
              )}
              <div>
                <h1 className="text-3xl font-bold leading-tight text-felines-text-primary sm:text-[40px]">
                  {displayName || t("publicProfile.anonymousName")}
                </h1>
                <p className="mt-1 text-sm text-felines-text-secondary">
                  {(colonies.length === 1 ? t("publicProfile.caresForColony") : t("publicProfile.caresForColonies")).replace(
                    "{count}",
                    String(colonies.length)
                  )}
                </p>
                {publicContact && (
                  <p className="mt-1 text-sm text-felines-text-secondary">📞 {publicContact}</p>
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Badges */}
      {badges.length > 0 && (
        <section className="bg-felines-surface py-12">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Reveal>
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-felines-accent-hover">
                {t("publicProfile.badgesLabel")}
              </p>
              <h2 className="mt-3 text-2xl font-bold text-felines-text-primary">{t("publicProfile.badgesTitle")}</h2>
            </Reveal>
            <div className="mt-6 flex flex-wrap gap-3">
              {badges.map((badge) => (
                <div
                  key={badge.labelKey}
                  className="flex items-center gap-2 rounded-2xl border border-felines-border bg-felines-background px-4 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.05)]"
                >
                  <span className="text-2xl">{badge.icon}</span>
                  <span className="text-sm font-medium text-felines-text-primary">{t(badge.labelKey)}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Colonies */}
      <section className="bg-felines-background py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-felines-accent-hover">
              {t("publicProfile.whereTheyCareLabel")}
            </p>
            <h2 className="mt-3 text-3xl font-bold leading-tight text-felines-text-primary">
              {t("publicProfile.coloniesTitle")}
            </h2>
          </Reveal>

          {colonies.length === 0 ? (
            <p className="mt-6 text-sm text-felines-text-secondary">{t("publicProfile.noColonies")}</p>
          ) : (
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {colonies.map((colony, index) => (
                <Reveal key={colony.id} delayMs={index * 80}>
                  <Link
                    href={`/colony/${colony.id}`}
                    className="block h-full rounded-2xl border border-felines-border bg-felines-background p-5 shadow-[0_2px_8px_rgba(0,0,0,0.05)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.10)]"
                  >
                    <p className="font-semibold text-felines-text-primary">{colony.name}</p>
                  </Link>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Activity — dark section, same rhythm as /profile's journey timeline */}
      <section className="bg-felines-dark py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-felines-text-secondary-on-dark">
              {t("publicProfile.contributionsLabel")}
            </p>
            <h2 className="mt-3 text-3xl font-bold leading-tight text-white">
              {t("publicProfile.reportsMadeTitle")}
            </h2>
          </Reveal>

          {madeReportRows.length === 0 ? (
            <p className="mt-6 text-sm text-felines-text-secondary-on-dark">{t("publicProfile.noReportsYet")}</p>
          ) : (
            <ul className="mt-6 max-w-3xl space-y-3">
              {madeReportRows.map((report, index) => (
                <Reveal key={report.id} delayMs={Math.min(index, 8) * 60}>
                  <li className="flex items-center justify-between rounded-xl border border-felines-border-on-dark bg-felines-dark-accent px-4 py-3 text-sm">
                    <span className="text-white"><ReportTypeLabel value={report.type} /></span>
                    <span className="text-xs text-felines-text-secondary-on-dark">
                      {report.status === "resolved" ? t("publicProfile.statusResolved") : t("publicProfile.statusOpen")} ·{" "}
                      {new Date(report.created_at).toLocaleDateString("pt-BR")}
                    </span>
                  </li>
                </Reveal>
              ))}
            </ul>
          )}

          <Reveal delayMs={100}>
            <h2 className="mt-12 text-3xl font-bold leading-tight text-white">
              {t("publicProfile.confirmationsGivenTitle")}
            </h2>
          </Reveal>

          {confirmedReports.length === 0 ? (
            <p className="mt-6 text-sm text-felines-text-secondary-on-dark">{t("publicProfile.noConfirmationsYet")}</p>
          ) : (
            <ul className="mt-6 max-w-3xl space-y-3">
              {confirmedReports.map((item, index) => (
                <Reveal key={item.report.id + item.confirmedAt} delayMs={Math.min(index, 8) * 60}>
                  <li className="flex items-center justify-between rounded-xl border border-felines-border-on-dark bg-felines-dark-accent px-4 py-3 text-sm">
                    <span className="text-white"><ReportTypeLabel value={item.report.type} /></span>
                    <span className="text-xs text-felines-text-secondary-on-dark">
                      {new Date(item.confirmedAt).toLocaleDateString("pt-BR")}
                    </span>
                  </li>
                </Reveal>
              ))}
            </ul>
          )}

          <div className="mt-12">
            <FlagButton targetType="profile" targetId={profileId} onDark />
          </div>
        </div>
      </section>
    </div>
  );
}
