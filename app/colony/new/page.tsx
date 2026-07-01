"use client";

// /colony/new route for Felines.
// Requires authentication. Renders the NewColonyForm client component,
// which lets a signed-in user register a colony with validation
// questions, a required photo, a map marker, and a name/narrative.
// Styled with the same light header + Reveal entrance used across the
// rest of the site, instead of a bare form dropped on a blank page.
import NewColonyForm from "@/components/NewColonyForm";
import Reveal from "@/components/Reveal";
import { useLanguage } from "@/lib/i18n";

export default function NewColonyPage() {
  const { t } = useLanguage();
  return (
    <section className="bg-felines-background py-16">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-felines-accent-hover">
            {t("newColony.pageLabel")}
          </p>
          <h1 className="mt-3 text-3xl font-bold leading-tight text-felines-text-primary sm:text-[40px]">
            {t("newColony.pageTitle")}
          </h1>
          <p className="mt-3 text-base leading-relaxed text-felines-text-secondary">
            {t("newColony.pageSub")}
          </p>
        </Reveal>

        <Reveal delayMs={100}>
          <div className="mt-8 rounded-2xl border border-felines-border bg-felines-surface p-6 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
            <NewColonyForm />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
