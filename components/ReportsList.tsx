// Client component for /reports. Requires authentication to read (RLS
// restricts report status to authenticated users). Lets any signed-in
// user confirm a report (atomic increment via RPC) or mark it resolved.
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import { getReportTypeLabel } from "@/lib/reportTypes";

type Report = {
  id: string;
  colony_id: string | null;
  type: string;
  description: string | null;
  status: "open" | "resolved";
  confirmations: number;
  created_at: string;
};

export default function ReportsList() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<Report[]>([]);
  const [showResolved, setShowResolved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Loads the auth session, then the list of reports filtered by status.
  useEffect(() => {
    async function loadReports() {
      const { data: sessionData } = await supabase.auth.getSession();
      setSession(sessionData.session);

      if (!sessionData.session) {
        setLoading(false);
        return;
      }

      const query = supabase
        .from("reports")
        .select("id, colony_id, type, description, status, confirmations, created_at")
        .order("created_at", { ascending: false });

      const { data } = showResolved ? await query : await query.eq("status", "open");

      if (data) setReports(data as Report[]);
      setLoading(false);
    }

    loadReports();
  }, [showResolved]);

  // Confirms a report (atomic increment) without changing its status.
  async function handleConfirm(reportId: string) {
    setError(null);
    const { error: rpcError } = await supabase.rpc("confirm_report", { p_report_id: reportId });

    if (rpcError) {
      setError("Não foi possível confirmar o relato.");
      return;
    }

    setReports((previous) =>
      previous.map((report) =>
        report.id === reportId ? { ...report, confirmations: report.confirmations + 1 } : report
      )
    );
  }

  // Marks a report as resolved.
  async function handleResolve(reportId: string) {
    setError(null);
    const { error: updateError } = await supabase
      .from("reports")
      .update({ status: "resolved" })
      .eq("id", reportId);

    if (updateError) {
      setError("Não foi possível marcar o relato como resolvido.");
      return;
    }

    setReports((previous) =>
      previous.map((report) =>
        report.id === reportId ? { ...report, status: "resolved" as const } : report
      )
    );
  }

  if (loading) return null;

  if (!session) {
    return (
      <p className="mt-8 rounded-lg border border-felines-border bg-felines-surface px-4 py-3 text-sm text-felines-text-secondary">
        <Link href="/login" className="font-medium text-felines-accent">
          Entre na sua conta
        </Link>{" "}
        para ver e confirmar relatos.
      </p>
    );
  }

  return (
    <div className="mt-6">
      <label className="flex items-center gap-2 text-sm text-felines-text-secondary">
        <input
          type="checkbox"
          checked={showResolved}
          onChange={(formEvent) => setShowResolved(formEvent.target.checked)}
        />
        Mostrar relatos já resolvidos
      </label>

      {error && <p className="mt-2 text-sm text-felines-emergency">{error}</p>}

      {reports.length === 0 ? (
        <p className="mt-6 text-sm text-felines-text-secondary">Nenhum relato encontrado.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {reports.map((report) => (
            <li
              key={report.id}
              className="rounded-xl border border-felines-border bg-felines-surface p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-felines-text-primary">
                    {getReportTypeLabel(report.type)}
                    {report.status === "resolved" && (
                      <span className="ml-2 text-xs font-normal text-felines-success">
                        resolvido
                      </span>
                    )}
                  </p>
                  {report.description && (
                    <p className="mt-1 text-sm text-felines-text-secondary">
                      {report.description}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-felines-text-secondary">
                    {new Date(report.created_at).toLocaleDateString("pt-BR")} ·{" "}
                    {report.confirmations} confirmação(ões)
                    {report.colony_id && (
                      <>
                        {" "}
                        ·{" "}
                        <Link
                          href={`/colony/${report.colony_id}`}
                          className="text-felines-accent"
                        >
                          ver colônia
                        </Link>
                      </>
                    )}
                  </p>
                </div>
                {report.status === "open" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleConfirm(report.id)}
                      className="rounded-full border border-felines-accent px-3 py-1 text-xs font-medium text-felines-accent transition-colors hover:bg-felines-accent hover:text-white"
                    >
                      Confirmar
                    </button>
                    <button
                      onClick={() => handleResolve(report.id)}
                      className="rounded-full bg-felines-success px-3 py-1 text-xs font-medium text-white transition-colors hover:opacity-90"
                    >
                      Resolver
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
