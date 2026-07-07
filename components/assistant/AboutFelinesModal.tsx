// Explainer modal — the reality of street cats, what Felines does,
// and how it helps both people and cats. Triggered from the "clique
// aqui" link in FirstVisitBanner, but self-contained so it could be
// opened from anywhere.
"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n";
import { useEscapeToClose } from "@/lib/useEscapeToClose";

// Split out as a hook so callers whose trigger lives inside inline text
// (e.g. a <p>) can render the trigger button in place and the dialog
// itself as a sibling — the dialog's markup (divs, headings, lists)
// is invalid as a descendant of <p> and breaks hydration otherwise.
export function useAboutFelinesModal() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  useEscapeToClose(open, () => setOpen(false));

  const modal = open && (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40 p-4"
      onClick={() => setOpen(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="about-felines-title"
        tabIndex={-1}
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-felines-background p-6 shadow-xl outline-none"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="about-felines-title" className="text-2xl font-bold text-felines-text-primary">
              {t("common.aboutFelines.title")}
            </h2>
            <p className="mt-1 text-sm text-felines-text-secondary">
              {t("common.aboutFelines.subtitle")}
            </p>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label={t("common.close")}
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center text-2xl leading-none text-felines-text-secondary hover:text-felines-text-primary"
          >
            ×
          </button>
        </div>

        <div className="mt-6 space-y-6">
          <section>
            <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-felines-accent-hover">
              {t("common.aboutFelines.realityTitle")}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-felines-text-primary">
              {t("common.aboutFelines.realityBody")}
            </p>
          </section>

          <section>
            <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-felines-accent-hover">
              {t("common.aboutFelines.whatIsTitle")}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-felines-text-primary">
              {t("common.aboutFelines.whatIsBody")}
            </p>
          </section>

          <section>
            <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-felines-accent-hover">
              {t("common.aboutFelines.featuresTitle")}
            </h3>
            <ul className="mt-2 space-y-2 text-sm leading-relaxed text-felines-text-primary">
              <li>{t("common.aboutFelines.feature1")}</li>
              <li>{t("common.aboutFelines.feature2")}</li>
              <li>{t("common.aboutFelines.feature3")}</li>
              <li>{t("common.aboutFelines.feature4")}</li>
            </ul>
          </section>

          <section>
            <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-felines-accent-hover">
              {t("common.aboutFelines.howWeHelpTitle")}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-felines-text-primary">
              {t("common.aboutFelines.howWeHelpBody")}
            </p>
          </section>

          <Link
            href="/map"
            onClick={() => setOpen(false)}
            className="mt-2 inline-block rounded-full bg-felines-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-felines-accent-hover"
          >
            {t("common.aboutFelines.cta")}
          </Link>
        </div>
      </div>
    </div>
  );

  return { openModal: () => setOpen(true), modal };
}

export default function AboutFelinesModal({
  trigger,
}: {
  // Render-prop so the caller controls exactly what the trigger looks
  // like (a link, a button, whatever fits the surrounding content).
  // Only safe to use outside inline text elements like <p> — see
  // useAboutFelinesModal's note above for why.
  trigger: (open: () => void) => React.ReactNode;
}) {
  const { openModal, modal } = useAboutFelinesModal();
  return (
    <>
      {trigger(openModal)}
      {modal}
    </>
  );
}
