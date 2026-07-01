// /plants — reference page listing plants toxic to cats that commonly
// grow in Brazilian streets, lots, and gardens. Static content —
// no DB queries needed. Images are optional; each card falls back to
// a color-coded emoji badge when imageUrl is null.
import type { Metadata } from "next";
import Link from "next/link";
import { TOXIC_PLANTS, TOXICITY_LABELS, type ToxicityLevel } from "@/lib/toxicPlants";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Plantas tóxicas para gatos — Felines",
  description:
    "Guia visual das plantas mais comuns no Brasil que podem ser perigosas para gatos de rua.",
};

function ToxicityBadge({ level }: { level: ToxicityLevel }) {
  const meta = TOXICITY_LABELS[level];
  const colorMap: Record<ToxicityLevel, string> = {
    high: "border-felines-emergency/30 bg-felines-emergency/10 text-felines-emergency",
    moderate: "border-amber-300/40 bg-amber-50 text-amber-700",
    low: "border-felines-success/30 bg-felines-success/10 text-felines-success",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${colorMap[level]}`}
    >
      {meta.emoji} {meta.label}
    </span>
  );
}

export default function PlantsPage() {
  const highRisk = TOXIC_PLANTS.filter((p) => p.toxicityLevel === "high");
  const moderate = TOXIC_PLANTS.filter((p) => p.toxicityLevel === "moderate");
  const low = TOXIC_PLANTS.filter((p) => p.toxicityLevel === "low");

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <Link href="/" className="text-sm text-felines-text-secondary hover:text-felines-accent">
        ← Início
      </Link>

      <Reveal>
        <h1 className="mt-4 text-3xl font-bold text-felines-text-primary sm:text-4xl">
          Plantas tóxicas para gatos
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-felines-text-secondary">
          Muitas plantas comuns em calçadas, praças e terrenos baldios no Brasil podem intoxicar
          gatos — especialmente filhotes curiosos. Esta página é um guia rápido de identificação e
          primeiros sinais de intoxicação.
        </p>
      </Reveal>

      <Reveal delayMs={80}>
        <div className="mt-5 rounded-xl border border-felines-emergency/20 bg-felines-emergency/5 p-4 text-sm leading-relaxed text-felines-emergency">
          <strong>Em caso de suspeita de intoxicação:</strong> leve o gato a um veterinário o mais
          rápido possível. Não induza vômito sem orientação profissional. Se souber o nome da
          planta, leve uma amostra ou foto.
        </div>
      </Reveal>

      {/* Legend */}
      <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-felines-text-secondary">
        <span className="font-medium">Legenda:</span>
        {(["high", "moderate", "low"] as ToxicityLevel[]).map((level) => (
          <ToxicityBadge key={level} level={level} />
        ))}
      </div>

      {/* Plants grid */}
      {[
        { label: "Alta toxicidade", plants: highRisk, level: "high" as ToxicityLevel },
        { label: "Toxicidade moderada", plants: moderate, level: "moderate" as ToxicityLevel },
        { label: "Baixa toxicidade", plants: low, level: "low" as ToxicityLevel },
      ].map(
        (group) =>
          group.plants.length > 0 && (
            <section key={group.level} className="mt-12">
              <Reveal>
                <h2 className="text-xl font-bold text-felines-text-primary">{group.label}</h2>
              </Reveal>
              <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {group.plants.map((plant, index) => (
                  <Reveal key={plant.slug} delayMs={index * 60}>
                    <article className="flex h-full flex-col rounded-2xl border border-felines-border bg-felines-surface p-5">
                      {/* Image placeholder */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/images/plants/${plant.slug}.svg`}
                        alt={`Ilustração de ${plant.commonName}`}
                        className="mb-4 h-40 w-full rounded-xl object-cover"
                      />

                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-bold text-felines-text-primary">{plant.commonName}</p>
                            <p className="text-xs italic text-felines-text-secondary">
                              {plant.scientificName}
                            </p>
                          </div>
                          <ToxicityBadge level={plant.toxicityLevel} />
                        </div>

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-felines-text-secondary">
                            Partes tóxicas
                          </p>
                          <p className="text-xs text-felines-text-secondary">
                            {plant.toxicParts.join(", ")}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-felines-text-secondary">
                            Sintomas
                          </p>
                          <ul className="mt-0.5 space-y-0.5 text-xs text-felines-text-secondary">
                            {plant.symptoms.map((s) => (
                              <li key={s} className="flex items-start gap-1">
                                <span className="mt-0.5 text-felines-emergency">•</span>
                                {s}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-felines-text-secondary">
                            Início dos sintomas
                          </p>
                          <p className="text-xs text-felines-text-secondary">{plant.onsetTime}</p>
                        </div>

                        {plant.notes && (
                          <p className="rounded-lg bg-felines-background px-3 py-2 text-xs leading-relaxed text-felines-text-secondary">
                            ⚠️ {plant.notes}
                          </p>
                        )}
                      </div>
                    </article>
                  </Reveal>
                ))}
              </div>
            </section>
          )
      )}

      <Reveal>
        <div className="mt-14 rounded-xl border border-felines-border bg-felines-surface p-6 text-sm leading-relaxed text-felines-text-secondary">
          <p className="font-semibold text-felines-text-primary">
            Esta lista não é exaustiva.
          </p>
          <p className="mt-1">
            O Brasil tem centenas de espécies tóxicas. Sempre que tiver dúvida sobre uma planta,
            consulte um médico-veterinário. Em casos de emergência, o{" "}
            <Link href="/contacts" className="font-medium text-felines-accent-hover hover:underline">
              guia de contatos
            </Link>{" "}
            tem clínicas e ONGs cadastradas na sua cidade.
          </p>
        </div>
      </Reveal>
    </div>
  );
}
