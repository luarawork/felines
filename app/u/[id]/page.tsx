// /u/:id route for Felines.
// Public caretaker page: shows a display name, the colonies this person
// caretakes, the reports they've made, and the reports they've
// confirmed — type/status/date only, never the free-text description
// or photo. Anyone can view this — it exists to give caretakers
// visibility and trust, not to gate information.
import { notFound } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { getReportTypeLabel } from "@/lib/reportTypes";

export default async function CaretakerPublicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url")
    .eq("id", id)
    .maybeSingle();

  if (!profile) notFound();

  const { data: caretakerRows } = await supabase
    .from("caretakers")
    .select("colonies(id, name, castration_status)")
    .eq("user_id", id);

  const colonies = (caretakerRows ?? [])
    .map(
      (row) =>
        row.colonies as unknown as {
          id: string;
          name: string;
          castration_status: string;
        } | null
    )
    .filter((colony): colony is { id: string; name: string; castration_status: string } =>
      colony !== null
    );

  const { data: madeReportRows } = await supabase
    .from("reports")
    .select("id, type, status, created_at")
    .eq("created_by", id)
    .order("created_at", { ascending: false });

  const { data: confirmationRows } = await supabase
    .from("report_confirmations")
    .select("created_at, reports(id, type, status)")
    .eq("user_id", id)
    .order("created_at", { ascending: false });

  const confirmedReports = (confirmationRows ?? [])
    .map((row) => ({
      confirmedAt: row.created_at,
      report: row.reports as unknown as { id: string; type: string; status: string } | null,
    }))
    .filter((row): row is { confirmedAt: string; report: { id: string; type: string; status: string } } =>
      row.report !== null
    );

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="flex items-center gap-4">
        {profile.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.avatar_url}
            alt={profile.display_name ?? "Cuidador"}
            className="h-16 w-16 rounded-full object-cover"
          />
        ) : (
          <div className="h-16 w-16 rounded-full bg-felines-border" />
        )}
        <h1 className="text-2xl font-bold text-felines-text-primary sm:text-3xl">
          {profile.display_name || "Alguém da comunidade"}
        </h1>
      </div>
      <p className="mt-2 text-sm text-felines-text-secondary">
        Cuida de {colonies.length} {colonies.length === 1 ? "colônia" : "colônias"}.
      </p>

      {colonies.length > 0 && (
        <ul className="mt-6 space-y-2">
          {colonies.map((colony) => (
            <li key={colony.id}>
              <Link
                href={`/colony/${colony.id}`}
                className="block rounded-xl border border-felines-border bg-felines-surface p-4 transition-colors hover:border-felines-accent"
              >
                <span className="font-medium text-felines-text-primary">{colony.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <section className="mt-10">
        <h2 className="text-lg font-bold text-felines-text-primary">Relatos que fez</h2>
        {!madeReportRows || madeReportRows.length === 0 ? (
          <p className="mt-2 text-sm text-felines-text-secondary">Nenhum relato ainda.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {madeReportRows.map((report) => (
              <li
                key={report.id}
                className="flex items-center justify-between rounded-md border border-felines-border px-3 py-2 text-sm"
              >
                <span className="text-felines-text-primary">{getReportTypeLabel(report.type)}</span>
                <span className="text-xs text-felines-text-secondary">
                  {report.status === "resolved" ? "resolvido" : "aberto"} ·{" "}
                  {new Date(report.created_at).toLocaleDateString("pt-BR")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-bold text-felines-text-primary">Confirmações dadas</h2>
        {confirmedReports.length === 0 ? (
          <p className="mt-2 text-sm text-felines-text-secondary">Nenhuma confirmação ainda.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {confirmedReports.map((item) => (
              <li
                key={item.report.id + item.confirmedAt}
                className="flex items-center justify-between rounded-md border border-felines-border px-3 py-2 text-sm"
              >
                <span className="text-felines-text-primary">
                  {getReportTypeLabel(item.report.type)}
                </span>
                <span className="text-xs text-felines-text-secondary">
                  {new Date(item.confirmedAt).toLocaleDateString("pt-BR")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
