// /u/:id route for Felines.
// Public caretaker page: shows a display name, the colonies this person
// caretakes, the reports they've made, and the reports they've
// confirmed — type/status/date only, never the free-text description
// or photo. Anyone can view this — it exists to give caretakers
// visibility and trust, not to gate information. Styled with the same
// full-bleed section rhythm as /profile and the home page.
import { notFound } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { getReportTypeLabel } from "@/lib/reportTypes";
import Reveal from "@/components/Reveal";

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
    <div>
      {/* Header */}
      <section className="bg-felines-background py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <div className="flex items-center gap-5">
              {profile.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatar_url}
                  alt={profile.display_name ?? "Cuidador"}
                  className="h-20 w-20 rounded-full object-cover shadow-[0_2px_8px_rgba(0,0,0,0.10)]"
                />
              ) : (
                <div className="h-20 w-20 rounded-full bg-felines-border" />
              )}
              <div>
                <h1 className="text-3xl font-bold leading-tight text-felines-text-primary sm:text-[40px]">
                  {profile.display_name || "Alguém da comunidade"}
                </h1>
                <p className="mt-1 text-sm text-felines-text-secondary">
                  Cuida de {colonies.length} {colonies.length === 1 ? "colônia" : "colônias"}.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Colonies */}
      <section className="bg-felines-surface py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-felines-accent-hover">
              Onde cuida
            </p>
            <h2 className="mt-3 text-3xl font-bold leading-tight text-felines-text-primary">
              Colônias
            </h2>
          </Reveal>

          {colonies.length === 0 ? (
            <p className="mt-6 text-sm text-felines-text-secondary">
              Ainda não cuida de nenhuma colônia.
            </p>
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
              Contribuições
            </p>
            <h2 className="mt-3 text-3xl font-bold leading-tight text-white">
              Relatos que fez
            </h2>
          </Reveal>

          {!madeReportRows || madeReportRows.length === 0 ? (
            <p className="mt-6 text-sm text-felines-text-secondary-on-dark">Nenhum relato ainda.</p>
          ) : (
            <ul className="mt-6 max-w-3xl space-y-3">
              {madeReportRows.map((report, index) => (
                <Reveal key={report.id} delayMs={Math.min(index, 8) * 60}>
                  <li className="flex items-center justify-between rounded-xl border border-felines-border-on-dark bg-felines-dark-accent px-4 py-3 text-sm">
                    <span className="text-white">{getReportTypeLabel(report.type)}</span>
                    <span className="text-xs text-felines-text-secondary-on-dark">
                      {report.status === "resolved" ? "resolvido" : "aberto"} ·{" "}
                      {new Date(report.created_at).toLocaleDateString("pt-BR")}
                    </span>
                  </li>
                </Reveal>
              ))}
            </ul>
          )}

          <Reveal delayMs={100}>
            <h2 className="mt-12 text-3xl font-bold leading-tight text-white">
              Confirmações dadas
            </h2>
          </Reveal>

          {confirmedReports.length === 0 ? (
            <p className="mt-6 text-sm text-felines-text-secondary-on-dark">
              Nenhuma confirmação ainda.
            </p>
          ) : (
            <ul className="mt-6 max-w-3xl space-y-3">
              {confirmedReports.map((item, index) => (
                <Reveal key={item.report.id + item.confirmedAt} delayMs={Math.min(index, 8) * 60}>
                  <li className="flex items-center justify-between rounded-xl border border-felines-border-on-dark bg-felines-dark-accent px-4 py-3 text-sm">
                    <span className="text-white">{getReportTypeLabel(item.report.type)}</span>
                    <span className="text-xs text-felines-text-secondary-on-dark">
                      {new Date(item.confirmedAt).toLocaleDateString("pt-BR")}
                    </span>
                  </li>
                </Reveal>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
