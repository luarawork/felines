// "Relatórios" tab on the colony page: numbers and evolution over time
// for this one colony. Pure presentation over data already fetched
// server-side via the get_colony_* RPCs (app/colony/[id]/page.tsx) — no
// charting library in this project, so the two time-series charts are
// plain CSS bars rather than a canvas/SVG chart.
import { getReportTypeLabel } from "@/lib/reportTypes";
import { computeMilestones, type TimelineEventLike } from "@/components/ColonyMilestones";
import { URGENCY_LABELS } from "@/lib/neuteringRequestTypes";

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

const HEALTH_STATUS_LABELS: Record<string, string> = {
  thriving: "🟢 Próspera",
  stable: "🟡 Estável",
  needs_attention: "🟠 Precisa de atenção",
  at_risk: "🔴 Em risco",
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
  const milestones = computeMilestones(colonyCreatedAt, stats.total_cats, timelineEvents);
  const castrationPercent =
    stats.total_cats > 0 ? Math.round((stats.cats_castrated / stats.total_cats) * 100) : 0;

  const SUMMARY_CARDS = [
    { label: "Gatos cadastrados", value: stats.total_cats },
    { label: "Gatos castrados", value: `${stats.cats_castrated} (${castrationPercent}%)` },
    { label: "Check-ins de alimentação", value: stats.total_feedings },
    { label: "Relatos enviados", value: stats.total_reports },
    { label: "Relatos resolvidos", value: stats.total_reports_resolved },
    { label: "Dias desde o cadastro", value: stats.days_since_registered },
    { label: "Cuidadores atuais", value: stats.total_caretakers },
    { label: "Eventos na linha do tempo", value: stats.total_timeline_events },
    { label: "Eventos climáticos", value: stats.total_weather_events },
  ];

  return (
    <div className="space-y-10">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {SUMMARY_CARDS.map((card) => (
          <div key={card.label} className="rounded-xl border border-felines-border bg-felines-surface p-4">
            <p className="text-2xl font-bold text-felines-text-primary">{card.value}</p>
            <p className="mt-1 text-xs text-felines-text-secondary">{card.label}</p>
          </div>
        ))}
      </div>

      <div>
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm font-semibold text-felines-text-primary">
            Índice de saúde: {healthScore}/100 — {HEALTH_STATUS_LABELS[healthStatus] ?? healthStatus}
          </p>
        </div>
        <p className="mt-1 text-xs text-felines-text-secondary max-w-xl">
          Calculado automaticamente a partir de 5 fatores: frequência de alimentação registrada, avistamentos recentes dos gatos, porcentagem de castração, ausência de relatos graves abertos e cobertura de cuidadores. Atualizado a cada nova ação na colônia.
        </p>
        <div className="mt-4 space-y-4">
          {[
            {
              label: "Alimentação recente",
              weight: 30,
              value: healthBreakdown.feeding_score,
              max: 30,
              how: "Sobe com cada check-in de alimentação registrado nos últimos 30 dias. Chega a 30 com 10 ou mais check-ins no período.",
            },
            {
              label: "Gatos vistos recentemente",
              weight: 25,
              value: healthBreakdown.sighting_score,
              max: 25,
              how: "Baseado em avistamentos e relatos de gatos nos últimos 7 dias. Chega a 25 quando pelo menos 3 gatos foram vistos no período.",
            },
            {
              label: "Taxa de castração",
              weight: 20,
              value: healthBreakdown.castration_score,
              max: 20,
              how: "Proporcional ao percentual de gatos cadastrados que já foram castrados. 100% de castração vale 20 pontos.",
            },
            {
              label: "Ausência de relatos graves",
              weight: 15,
              value: healthBreakdown.reports_score,
              max: 15,
              how: "Começa em 15. Perde pontos por cada relato grave (envenenamento, maus-tratos, surto de doença) ainda sem resolução.",
            },
            {
              label: "Cobertura de cuidadores",
              weight: 10,
              value: healthBreakdown.caretaker_score,
              max: 10,
              how: "Vale 10 se a colônia tiver pelo menos um cuidador vinculado, 0 se não tiver nenhum.",
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
              <div className="mt-1 h-2 w-full rounded-full bg-felines-border">
                <div
                  className="h-2 rounded-full bg-felines-accent"
                  style={{ width: `${Math.max(2, (factor.value / factor.max) * 100)}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-felines-text-secondary">{factor.how}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-felines-text-primary">
          {stats.cats_castrated} de {stats.total_cats} gatos castrados ({castrationPercent}%)
        </p>
        <div className="mt-2 h-3 w-full rounded-full bg-felines-border">
          <div
            className="h-3 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${castrationPercent}%`, backgroundColor: "#6B8F6A" }}
          />
        </div>
        <p className="mt-2 text-xs text-felines-text-secondary">
          Colônias totalmente castradas estabilizam a população com o tempo.
        </p>
      </div>

      <div className="grid gap-8 sm:grid-cols-2">
        <div>
          <p className="text-sm font-semibold text-felines-text-primary">
            Check-ins de alimentação por semana
          </p>
          <div className="mt-4">
            <BarChart
              data={weeklyFeedings.map((week) => ({ label: week.week_start, value: week.check_in_count }))}
              labelFormatter={(label) =>
                new Date(label).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
              }
            />
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-felines-text-primary">Relatos por mês</p>
          <div className="mt-4">
            <BarChart
              data={monthlyReports.map((month) => ({ label: month.month_start, value: month.report_count }))}
              labelFormatter={(label) => new Date(label).toLocaleDateString("pt-BR", { month: "short" })}
            />
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-felines-text-primary">
            Eventos climáticos por mês
          </p>
          <p className="mt-1 text-xs text-felines-text-secondary">
            Calor extremo, frio extremo ou chuva forte registrados automaticamente.
          </p>
          <div className="mt-4">
            <BarChart
              data={monthlyWeather.map((month) => ({ label: month.month_start, value: month.event_count }))}
              labelFormatter={(label) => new Date(label).toLocaleDateString("pt-BR", { month: "short" })}
            />
          </div>
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-felines-text-primary">Tipos de relato mais comuns</p>
        {reportBreakdown.length === 0 ? (
          <p className="mt-2 text-sm text-felines-text-secondary">Nenhum relato registrado ainda.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {reportBreakdown.map((row) => {
              const max = Math.max(...reportBreakdown.map((r) => r.report_count));
              const percent = Math.round((row.report_count / max) * 100);
              return (
                <li key={row.report_type}>
                  <div className="flex items-center justify-between text-xs text-felines-text-secondary">
                    <span>{getReportTypeLabel(row.report_type)}</span>
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
          <p className="text-sm font-semibold text-felines-text-primary">Pedidos de castração</p>
          <ul className="mt-3 space-y-2">
            {neuteringRequests.map((request) => (
              <li
                key={request.id}
                className="flex items-center justify-between rounded-md border border-felines-border px-3 py-2 text-sm"
              >
                <span className="text-felines-text-primary">
                  ✂️ {request.cats_count} {request.cats_count === 1 ? "gato" : "gatos"} ·{" "}
                  {URGENCY_LABELS[request.urgency]}
                </span>
                <span className="text-xs text-felines-text-secondary">
                  {request.status === "completed"
                    ? "Concluído"
                    : request.status === "in_progress"
                      ? "Em andamento"
                      : "Aberto"}{" "}
                  · {new Date(request.created_at).toLocaleDateString("pt-BR")}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <p className="text-sm font-semibold text-felines-text-primary">Milestones</p>
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
                {milestone.date.toLocaleDateString("pt-BR")}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
