// TNR population-impact projection for /impact. This is an
// order-of-magnitude planning estimate, not an epidemiological
// forecast — every assumption is stated explicitly and adjustable, and
// the methodology is disclosed inline (not hidden behind a single
// black-box number) so the projection can be sanity-checked by anyone,
// not taken on faith.
//
// Model: an unmanaged colony's net population growth rate (births
// minus natural mortality) is commonly estimated at roughly 15-25%/year
// in TNR field studies and municipal planning guidance (e.g. Levy et
// al.'s Alachua County field trial, and practitioner estimates from
// Alley Cat Allies/ASPCA); we default to 20%/year as a representative
// midpoint. TNR reduces the *effective* growth rate roughly in
// proportion to the fraction of the colony sterilized — a linear
// simplification (effective_rate = base_rate * (1 - sterilized_share))
// that slightly understates TNR's real-world effect (sterilizing one
// of a breeding pair already blocks that pairing entirely, a
// convexity this linear model doesn't capture) but keeps the formula
// auditable in one line, which matters more here than precision.
"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n";

const BASE_ANNUAL_GROWTH_RATE = 0.2; // 20%/year, unmanaged colony (see comment above)
const PROJECTION_YEARS = 2;
const DEFAULT_CATS_PER_COLONY = 8;

function projectPopulation(startingCats: number, annualGrowthRate: number, years: number): number {
  return startingCats * Math.pow(1 + annualGrowthRate, years);
}

export default function TnrProjectionCalculator() {
  const { t } = useLanguage();
  const [coloniesMapped, setColoniesMapped] = useState(100);
  const [catsPerColony, setCatsPerColony] = useState(DEFAULT_CATS_PER_COLONY);
  const [sterilizedPercent, setSterilizedPercent] = useState(50);
  const [showMethodology, setShowMethodology] = useState(false);

  const startingCats = coloniesMapped * catsPerColony;
  const sterilizedShare = sterilizedPercent / 100;
  const effectiveGrowthRate = BASE_ANNUAL_GROWTH_RATE * (1 - sterilizedShare);

  const baselineYear2 = projectPopulation(startingCats, BASE_ANNUAL_GROWTH_RATE, PROJECTION_YEARS);
  const withTnrYear2 = projectPopulation(startingCats, effectiveGrowthRate, PROJECTION_YEARS);
  const reductionPercent = baselineYear2 > 0 ? ((baselineYear2 - withTnrYear2) / baselineYear2) * 100 : 0;
  const isShrinking = effectiveGrowthRate < 0.001;

  return (
    <div className="rounded-2xl border border-felines-border bg-felines-surface p-5 sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-felines-accent-hover">
        {t("impact.projection.label")}
      </p>
      <h3 className="mt-1 text-lg font-bold text-felines-text-primary">{t("impact.projection.headline")}</h3>
      <p className="mt-1 text-sm text-felines-text-secondary">{t("impact.projection.sub")}</p>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-xs font-medium text-felines-text-secondary">
            {t("impact.projection.coloniesLabel")}
          </label>
          <input
            type="number"
            value={coloniesMapped}
            onChange={(e) => setColoniesMapped(Math.max(0, Number(e.target.value)))}
            min={0}
            max={10000}
            className="mt-1 w-full rounded-md border border-felines-border bg-white px-3 py-3.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-felines-text-secondary">
            {t("impact.projection.catsPerColonyLabel")}
          </label>
          <input
            type="number"
            value={catsPerColony}
            onChange={(e) => setCatsPerColony(Math.max(1, Number(e.target.value)))}
            min={1}
            max={100}
            className="mt-1 w-full rounded-md border border-felines-border bg-white px-3 py-3.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-felines-text-secondary">
            {t("impact.projection.sterilizedLabel")} ({sterilizedPercent}%)
          </label>
          <input
            type="range"
            value={sterilizedPercent}
            onChange={(e) => setSterilizedPercent(Number(e.target.value))}
            min={0}
            max={100}
            step={5}
            className="mt-2.5 w-full"
          />
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-felines-border bg-white p-3">
          <p className="text-xs text-felines-text-secondary">{t("impact.projection.startingLabel")}</p>
          <p className="mt-1 text-xl font-bold text-felines-text-primary">{Math.round(startingCats).toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-felines-border bg-white p-3">
          <p className="text-xs text-felines-text-secondary">
            {t("impact.projection.baselineLabel").replace("{years}", String(PROJECTION_YEARS))}
          </p>
          <p className="mt-1 text-xl font-bold text-felines-text-primary">{Math.round(baselineYear2).toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-felines-accent bg-felines-accent-light p-3">
          <p className="text-xs text-felines-text-secondary">
            {t("impact.projection.withTnrLabel").replace("{years}", String(PROJECTION_YEARS))}
          </p>
          <p className="mt-1 text-xl font-bold text-felines-text-primary">{Math.round(withTnrYear2).toLocaleString()}</p>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-felines-success/30 bg-felines-success/5 p-4">
        <p className="text-base font-semibold text-felines-text-primary">
          {isShrinking
            ? t("impact.projection.resultShrinking")
                .replace("{percent}", reductionPercent.toFixed(0))
                .replace("{years}", String(PROJECTION_YEARS))
            : t("impact.projection.resultReduction")
                .replace("{percent}", reductionPercent.toFixed(0))
                .replace("{years}", String(PROJECTION_YEARS))}
        </p>
      </div>

      <button
        onClick={() => setShowMethodology((previous) => !previous)}
        className="mt-4 text-xs font-medium text-felines-accent-hover"
      >
        {showMethodology ? t("impact.projection.hideMethodology") : t("impact.projection.showMethodology")}
      </button>

      {showMethodology && (
        <div className="mt-3 space-y-2 rounded-xl border border-felines-border bg-white p-4 text-xs leading-relaxed text-felines-text-secondary">
          <p>{t("impact.projection.methodologyIntro")}</p>
          <p>
            <strong className="text-felines-text-primary">{t("impact.projection.methodologyFormulaLabel")}</strong>{" "}
            {t("impact.projection.methodologyFormula")}
          </p>
          <p>{t("impact.projection.methodologyGrowthRate").replace("{rate}", String(BASE_ANNUAL_GROWTH_RATE * 100))}</p>
          <p>{t("impact.projection.methodologyLimitation")}</p>
          <p>
            {t("impact.projection.methodologyLearnMore")}{" "}
            <Link href="/learn/what-is-tnr-and-why-it-works" className="font-medium text-felines-accent-hover">
              {t("impact.projection.methodologyArticleLink")}
            </Link>
            {" · "}
            <Link href="/glossary" className="font-medium text-felines-accent-hover">
              {t("impact.projection.methodologyGlossaryLink")}
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
