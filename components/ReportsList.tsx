// Client component for /reports. Requires authentication to read (RLS
// restricts report status to authenticated users). Lets any signed-in
// user confirm a report (atomic increment via RPC, auto-resolving at 3
// confirmations) but only the colony's caretaker/creator can manually
// resolve it early. Also where lost-cat reports live, with sighting
// replies linked back to notify the owner in-app.
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import { getReportTypeLabel, REPORT_TYPES } from "@/lib/reportTypes";
import EmptyState from "@/components/EmptyState";
import FlagButton, { getFlagReasonLabel } from "@/components/FlagButton";
import SightingReportButton from "@/components/SightingReportButton";
import { useLanguage } from "@/lib/i18n";

type Report = {
  id: string;
  colony_id: string | null;
  type: string;
  description: string | null;
  photo_url: string | null;
  status: "open" | "resolved";
  confirmations: number;
  sensitive: boolean;
  created_by: string | null;
  related_report_id: string | null;
  created_at: string;
};

type Flag = {
  id: string;
  target_type: "colony" | "report" | "profile";
  target_id: string;
  reason: string;
  details: string | null;
  created_at: string;
  targetLabel: string;
  targetHref: string | null;
};

export default function ReportsList() {
  const { t } = useLanguage();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<Report[]>([]);
  const [myColonyIds, setMyColonyIds] = useState<Set<string>>(new Set());
  const [confirmedReportIds, setConfirmedReportIds] = useState<Set<string>>(new Set());
  const [showResolved, setShowResolved] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);
  const [highlightedReportId, setHighlightedReportId] = useState<string | null>(null);
  const [flags, setFlags] = useState<Flag[]>([]);
  const [authorNames, setAuthorNames] = useState<Record<string, string>>({});

  // Loads the auth session, the list of reports filtered by status, and
  // which colonies the current user can manage (to gate manual resolve).
  useEffect(() => {
    async function loadReports() {
      const { data: sessionData } = await supabase.auth.getSession();
      const currentSession = sessionData.session;
      setSession(currentSession);

      if (!currentSession) {
        setLoading(false);
        return;
      }

      const query = supabase
        .from("reports")
        .select(
          "id, colony_id, type, description, photo_url, status, confirmations, sensitive, created_by, related_report_id, created_at"
        )
        .order("created_at", { ascending: false });

      const { data } = showResolved ? await query : await query.eq("status", "open");
      if (data) setReports(data as Report[]);

      const [{ data: createdColonies }, { data: caretakerRows }, { data: myConfirmations }] =
        await Promise.all([
          supabase.from("colonies").select("id").eq("created_by", currentSession.user.id),
          supabase.from("caretakers").select("colony_id").eq("user_id", currentSession.user.id),
          supabase
            .from("report_confirmations")
            .select("report_id")
            .eq("user_id", currentSession.user.id),
        ]);

      const colonyIds = new Set<string>();
      createdColonies?.forEach((row) => colonyIds.add(row.id));
      caretakerRows?.forEach((row) => colonyIds.add(row.colony_id));
      setMyColonyIds(colonyIds);

      setConfirmedReportIds(new Set((myConfirmations ?? []).map((row) => row.report_id)));

      // reports.created_by references auth.users, not profiles, so it
      // can't be embedded in the reports query above — resolved here in
      // one batched lookup instead of one query per report.
      const authorIds = Array.from(
        new Set((data ?? []).map((report) => report.created_by).filter((id): id is string => !!id))
      );
      if (authorIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, display_name")
          .in("id", authorIds);
        const names: Record<string, string> = {};
        (profiles ?? []).forEach((profile) => {
          names[profile.id] = profile.display_name || t("colony.timeline.authorDefault");
        });
        setAuthorNames(names);
      }

      const { data: flagRows } = await supabase
        .from("flags")
        .select("id, target_type, target_id, reason, details, created_at")
        .order("created_at", { ascending: false });

      if (flagRows && flagRows.length > 0) {
        const colonyFlagIds = flagRows
          .filter((flag) => flag.target_type === "colony")
          .map((flag) => flag.target_id);
        const reportFlagIds = flagRows
          .filter((flag) => flag.target_type === "report")
          .map((flag) => flag.target_id);
        const profileFlagIds = flagRows
          .filter((flag) => flag.target_type === "profile")
          .map((flag) => flag.target_id);

        const [{ data: flaggedColonies }, { data: flaggedReports }, { data: flaggedProfiles }] =
          await Promise.all([
            colonyFlagIds.length > 0
              ? supabase.from("colonies").select("id, name").in("id", colonyFlagIds)
              : Promise.resolve({ data: [] as { id: string; name: string }[] }),
            reportFlagIds.length > 0
              ? supabase.from("reports").select("id, type").in("id", reportFlagIds)
              : Promise.resolve({ data: [] as { id: string; type: string }[] }),
            profileFlagIds.length > 0
              ? supabase.from("profiles").select("id, display_name").in("id", profileFlagIds)
              : Promise.resolve({ data: [] as { id: string; display_name: string | null }[] }),
          ]);

        setFlags(
          flagRows.map((flag) => {
            if (flag.target_type === "colony") {
              const colony = (flaggedColonies ?? []).find((row) => row.id === flag.target_id);
              return {
                ...flag,
                targetLabel: colony ? `${t("reportStatus.colonyLabel")} ${colony.name}` : t("reportStatus.colonyLabel"),
                targetHref: `/colony/${flag.target_id}`,
              };
            }
            if (flag.target_type === "profile") {
              const profile = (flaggedProfiles ?? []).find((row) => row.id === flag.target_id);
              return {
                ...flag,
                targetLabel: `${t("reportStatus.profileLabel")} ${profile?.display_name || t("colony.timeline.authorDefault")}`,
                targetHref: `/u/${flag.target_id}`,
              };
            }
            const report = (flaggedReports ?? []).find((row) => row.id === flag.target_id);
            return {
              ...flag,
              targetLabel: report ? `${t("reportStatus.reportLabel")} ${getReportTypeLabel(report.type, t)}` : t("reportStatus.reportLabel"),
              targetHref: `#report-${flag.target_id}`,
            };
          })
        );
      }

      setLoading(false);
    }

    loadReports();
  }, [showResolved, t]);

  // If we arrived here via a map popup's "Ver relato" link
  // (/reports#report-<id>), scroll to that report and highlight it
  // briefly so it's obvious which one was linked.
  useEffect(() => {
    if (loading || reports.length === 0) return;
    const hash = window.location.hash;
    if (!hash.startsWith("#report-")) return;

    const reportId = hash.replace("#report-", "");
    const element = document.getElementById(`report-${reportId}`);
    if (!element) return;

    element.scrollIntoView({ behavior: "smooth", block: "center" });
    // eslint-disable-next-line react-hooks/set-state-in-effect -- responding to the URL hash on mount, not deriving render state
    setHighlightedReportId(reportId);
    const timer = setTimeout(() => setHighlightedReportId(null), 3000);
    return () => clearTimeout(timer);
  }, [loading, reports]);

  // Confirms a report (atomic increment, auto-resolves at 3 confirmations).
  async function handleConfirm(reportId: string) {
    setError(null);
    const { error: rpcError } = await supabase.rpc("confirm_report", { p_report_id: reportId });

    if (rpcError) {
      setError(t("reportStatus.confirmError"));
      return;
    }

    setReports((previous) =>
      previous.map((report) => {
        if (report.id !== reportId) return report;
        const confirmations = report.confirmations + 1;
        return {
          ...report,
          confirmations,
          status: confirmations >= 3 ? ("resolved" as const) : report.status,
        };
      })
    );
    setConfirmedReportIds((previous) => new Set(previous).add(reportId));
  }

  // Marks a report as resolved manually. Only available to the colony's
  // creator/caretaker, checked both here and via the button's visibility.
  async function handleResolve(reportId: string) {
    setError(null);
    const { error: updateError } = await supabase
      .from("reports")
      .update({ status: "resolved" })
      .eq("id", reportId);

    if (updateError) {
      setError(t("reportStatus.resolveError"));
      return;
    }

    // Sensitive reports always leave a timeline trace when resolved —
    // confirm_report() already does this for the auto-resolve-at-3 path,
    // but manual resolution skipped it entirely until now, so a
    // caretaker resolving a sensitive report early left no record.
    const resolvedReport = reports.find((report) => report.id === reportId);
    if (resolvedReport?.sensitive && resolvedReport.colony_id && session) {
      await supabase.from("timeline_events").insert({
        colony_id: resolvedReport.colony_id,
        event_type: "report_resolved",
        description: `Relato sensível (${getReportTypeLabel(resolvedReport.type, t)}) resolvido manualmente.`,
        created_by: session.user.id,
      });
    }

    if (resolvedReport?.colony_id) {
      await supabase.rpc("recalculate_colony_health", { p_colony_id: resolvedReport.colony_id });
    }

    setReports((previous) =>
      previous.map((report) =>
        report.id === reportId ? { ...report, status: "resolved" as const } : report
      )
    );
  }

  if (loading) return (
    <p role="status" className="mt-8 text-sm text-felines-text-secondary">
      {t("reportStatus.loading")}
    </p>
  );

  if (!session) {
    return (
      <p className="mt-8 rounded-lg border border-felines-border bg-felines-surface px-4 py-3 text-sm text-felines-text-secondary">
        <Link href="/login?returnTo=/reports" className="font-medium text-felines-accent-hover">
          {t("reportStatus.loginPromptPre")}
        </Link>{" "}
        {t("reportStatus.loginPromptPost")}
      </p>
    );
  }

  const filteredReports = reports.filter(
    (report) => typeFilter === "all" || report.type === typeFilter
  );

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center gap-3">
        <select
          aria-label={t("reportStatus.filterLabel")}
          value={typeFilter}
          onChange={(formEvent) => setTypeFilter(formEvent.target.value)}
          className="rounded-md border border-felines-border bg-white px-3 py-1.5 text-sm"
        >
          <option value="all">{t("reportTypes.all")}</option>
          {REPORT_TYPES.map((reportType) => (
            <option key={reportType.value} value={reportType.value}>
              {getReportTypeLabel(reportType.value, t)}
            </option>
          ))}
        </select>

        <label className="flex items-center gap-2 text-sm text-felines-text-secondary">
          <input
            type="checkbox"
            checked={showResolved}
            onChange={(formEvent) => setShowResolved(formEvent.target.checked)}
          />
          {t("reportStatus.showResolved")}
        </label>
      </div>

      {error && <p role="alert" className="mt-2 text-sm text-felines-emergency">{error}</p>}

      {filteredReports.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            main={t("reportStatus.empty.main")}
            sub={t("reportStatus.empty.sub")}
            ctas={[{ label: t("reportStatus.empty.cta"), href: "/map" }]}
          />
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {filteredReports.map((report) => {
            const canManuallyResolve = !!report.colony_id && myColonyIds.has(report.colony_id);
            const isLostCat = report.type === "missing_cat";
            const isOwnLostCat = isLostCat && report.created_by === session.user.id;
            const sightings = isOwnLostCat
              ? reports.filter((candidate) => candidate.related_report_id === report.id)
              : [];

            return (
              <li
                key={report.id}
                id={`report-${report.id}`}
                className={`rounded-xl border bg-felines-surface p-4 transition-colors ${
                  highlightedReportId === report.id
                    ? "border-felines-accent ring-2 ring-felines-accent"
                    : "border-felines-border"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex gap-3">
                    {report.photo_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={report.photo_url}
                        alt={getReportTypeLabel(report.type, t)}
                        className="h-16 w-16 flex-shrink-0 rounded-lg object-cover"
                      />
                    )}
                    <div>
                      <p className="font-semibold text-felines-text-primary">
                        {getReportTypeLabel(report.type, t)}
                        {report.sensitive && (
                          <span className="ml-2 text-xs font-normal text-felines-emergency">
                            {t("reportStatus.sensitive")}
                          </span>
                        )}
                        {report.status === "resolved" && (
                          <span className="ml-2 text-xs font-normal text-felines-success-hover">
                            {t("reportStatus.resolved")}
                          </span>
                        )}
                      </p>
                      {report.description && (
                        <p className="mt-1 text-sm text-felines-text-secondary">
                          {report.description}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-felines-text-secondary">
                        {report.created_by ? (
                          <Link href={`/u/${report.created_by}`} className="text-felines-accent-hover">
                            {authorNames[report.created_by] ?? t("colony.timeline.authorDefault")}
                          </Link>
                        ) : (
                          t("reportStatus.anonymous")
                        )}{" "}
                        · {new Date(report.created_at).toLocaleDateString("pt-BR")} ·{" "}
                        {report.confirmations} {t("reportStatus.confirmations")}
                        {report.colony_id && (
                          <>
                            {" "}
                            ·{" "}
                            <Link
                              href={`/colony/${report.colony_id}`}
                              className="text-felines-accent-hover"
                            >
                              {t("reportStatus.viewColony")}
                            </Link>
                          </>
                        )}
                      </p>

                      {isLostCat && !isOwnLostCat && (
                        <div className="mt-2">
                          <SightingReportButton lostCatReportId={report.id} />
                        </div>
                      )}

                      {isOwnLostCat && sightings.length > 0 && (
                        <div className="mt-2 rounded-md bg-felines-success/10 p-2">
                          <p className="text-xs font-medium text-felines-success-hover">
                            {sightings.length}{" "}
                            {sightings.length === 1 ? t("reportStatus.sightingsCount") : t("reportStatus.sightingsCountPlural")}
                          </p>
                          {sightings.map((sighting) => (
                            <p key={sighting.id} className="mt-1 text-xs text-felines-text-secondary">
                              {sighting.description} ·{" "}
                              {new Date(sighting.created_at).toLocaleDateString("pt-BR")}
                            </p>
                          ))}
                        </div>
                      )}

                      <div className="mt-2">
                        <FlagButton targetType="report" targetId={report.id} />
                      </div>
                    </div>
                  </div>
                  {report.status === "open" && (
                    <div className="flex gap-2">
                      {report.created_by !== session.user.id && (
                        <button
                          onClick={() => handleConfirm(report.id)}
                          disabled={confirmedReportIds.has(report.id)}
                          title={t("reportStatus.confirmTitle")}
                          className="rounded-full border border-felines-accent px-3 py-1 text-xs font-medium text-felines-accent transition-colors hover:bg-felines-accent hover:text-white disabled:opacity-50"
                        >
                          {confirmedReportIds.has(report.id) ? t("reportStatus.alreadyConfirmed") : t("reportStatus.iAlsoSaw")}
                        </button>
                      )}
                      {canManuallyResolve && (
                        <button
                          onClick={() => handleResolve(report.id)}
                          className="rounded-full bg-felines-success px-3 py-1 text-xs font-medium text-white transition-colors hover:opacity-90"
                        >
                          {t("reportStatus.resolve")}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {flags.length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-bold text-felines-text-primary">
            {t("reportStatus.flagsTitle")}
          </h2>
          <ul className="mt-3 space-y-2">
            {flags.map((flag) => (
              <li
                key={flag.id}
                className="rounded-md border border-felines-warning/40 bg-felines-warning/5 px-3 py-2 text-sm"
              >
                <p className="font-medium text-felines-text-primary">
                  {flag.targetHref ? (
                    <Link href={flag.targetHref} className="text-felines-accent-hover">
                      {flag.targetLabel}
                    </Link>
                  ) : (
                    flag.targetLabel
                  )}{" "}
                  · {getFlagReasonLabel(flag.reason, t)}
                </p>
                {flag.details && (
                  <p className="mt-1 text-felines-text-secondary">{flag.details}</p>
                )}
                <p className="mt-1 text-xs text-felines-text-secondary">
                  {new Date(flag.created_at).toLocaleDateString("pt-BR")}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
