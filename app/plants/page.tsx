"use client";

// /plants — reference page listing plants toxic to cats that commonly
// grow in Brazilian streets, lots, and gardens. Static content —
// no DB queries needed. Images are optional; each card falls back to
// a color-coded emoji badge when imageUrl is null.
import Link from "next/link";
import { TOXIC_PLANTS, TOXICITY_LABELS, TOXICITY_LABELS_EN, localizeToxicPlant, type ToxicityLevel } from "@/lib/toxicPlants";
import Reveal from "@/components/Reveal";
import { useLanguage } from "@/lib/i18n";

function ToxicityBadge({ level, language }: { level: ToxicityLevel; language: "pt" | "en" }) {
  const meta = (language === "en" ? TOXICITY_LABELS_EN : TOXICITY_LABELS)[level];
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
  const { t, language } = useLanguage();
  const localizedPlants = TOXIC_PLANTS.map((plant) => localizeToxicPlant(plant, language));
  const highRisk = localizedPlants.filter((p) => p.toxicityLevel === "high");
  const moderate = localizedPlants.filter((p) => p.toxicityLevel === "moderate");
  const low = localizedPlants.filter((p) => p.toxicityLevel === "low");

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <Link href="/" className="text-sm text-felines-text-secondary hover:text-felines-accent">
        {t("plants.backHome")}
      </Link>

      <Reveal>
        <h1 className="mt-4 text-3xl font-bold text-felines-text-primary sm:text-4xl">
          {t("plants.title")}
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-felines-text-secondary">
          {t("plants.description")}
        </p>
      </Reveal>

      <Reveal delayMs={80}>
        <div className="mt-5 rounded-xl border border-felines-emergency/20 bg-felines-emergency/5 p-4 text-sm leading-relaxed text-felines-emergency">
          <strong>{t("plants.poisoningWarningTitle")}</strong> {t("plants.poisoningWarningBody")}
        </div>
      </Reveal>

      {/* Legend */}
      <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-felines-text-secondary">
        <span className="font-medium">{t("plants.legendLabel")}</span>
        {(["high", "moderate", "low"] as ToxicityLevel[]).map((level) => (
          <ToxicityBadge key={level} level={level} language={language} />
        ))}
      </div>

      {/* Plants grid */}
      {[
        { label: t("plants.toxicityHigh"), plants: highRisk, level: "high" as ToxicityLevel },
        { label: t("plants.toxicityModerate"), plants: moderate, level: "moderate" as ToxicityLevel },
        { label: t("plants.toxicityLow"), plants: low, level: "low" as ToxicityLevel },
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
                        alt={t("plants.illustrationAlt").replace("{name}", plant.commonName)}
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
                          <ToxicityBadge level={plant.toxicityLevel} language={language} />
                        </div>

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-felines-text-secondary">
                            {t("plants.toxicPartsLabel")}
                          </p>
                          <p className="text-xs text-felines-text-secondary">
                            {plant.toxicParts.join(", ")}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-felines-text-secondary">
                            {t("plants.symptomsLabel")}
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
                            {t("plants.onsetLabel")}
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
            {t("plants.disclaimerTitle")}
          </p>
          <p className="mt-1">
            {t("plants.disclaimerBody")}{" "}
            <Link href="/contacts" className="font-medium text-felines-accent-hover hover:underline">
              {t("plants.disclaimerLink")}
            </Link>{" "}
            {t("plants.disclaimerSuffix")}
          </p>
        </div>
      </Reveal>
    </div>
  );
}
