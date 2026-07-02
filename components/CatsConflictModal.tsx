"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useEscapeToClose } from "@/lib/useEscapeToClose";
import { createPortal } from "react-dom";
import { useLanguage } from "@/lib/i18n";

export default function CatsConflictModal() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  // Drives the enter transition: mounts hidden, then flips to the
  // "-in" classes a frame later so the opacity/translate change is
  // actually animated instead of applied before first paint.
  const [entered, setEntered] = useState(false);

  function handleClose() {
    setOpen(false);
    setEntered(false);
  }

  useEscapeToClose(open, handleClose);

  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(frame);
  }, [open]);

  const vacuumEffect = t("catsConflict.vacuumEffect");
  const [removalBodyBefore, removalBodyAfter] = t("catsConflict.vacuumBody").split("{vacuumEffect}");

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full border border-felines-border bg-felines-surface px-4 py-2 text-sm text-felines-text-secondary shadow-sm transition-all hover:border-felines-accent hover:text-felines-accent"
      >
        <span>😤</span>
        <span>{t("catsConflict.trigger")}</span>
      </button>

      {open &&
        createPortal(
          <div
            className={`felines-modal-backdrop fixed inset-0 z-[2500] flex items-center justify-center bg-black/50 p-4 ${
              entered ? "felines-modal-backdrop-in" : ""
            }`}
            onClick={handleClose}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="cats-conflict-title"
              className={`felines-modal-panel max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-felines-background p-7 shadow-2xl ${
                entered ? "felines-modal-panel-in" : ""
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4">
                <h2
                  id="cats-conflict-title"
                  className="text-xl font-bold text-felines-text-primary"
                >
                  {t("catsConflict.title")}
                </h2>
                <button
                  onClick={handleClose}
                  aria-label={t("catsConflict.close")}
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center text-xl text-felines-text-secondary hover:text-felines-text-primary"
                >
                  ×
                </button>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-felines-text-secondary">
                {t("catsConflict.intro")}
              </p>

              <div className="mt-5 space-y-4">
                <div className="rounded-xl border border-felines-border bg-felines-surface p-4">
                  <p className="font-semibold text-felines-text-primary">
                    {t("catsConflict.vacuumTitle")}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-felines-text-secondary">
                    {removalBodyBefore}
                    <strong>{vacuumEffect}</strong>
                    {removalBodyAfter}
                  </p>
                </div>

                <div className="rounded-xl border border-felines-border bg-felines-surface p-4">
                  <p className="font-semibold text-felines-text-primary">
                    {t("catsConflict.lawTitle")}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-felines-text-secondary">
                    {t("catsConflict.lawBody")}
                  </p>
                </div>

                <div className="rounded-xl border border-felines-success/30 bg-felines-success/5 p-4">
                  <p className="font-semibold text-felines-text-primary">
                    {t("catsConflict.worksTitle")}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-felines-text-secondary">
                    {t("catsConflict.worksBody")}
                  </p>
                  <p className="mt-2 text-sm text-felines-text-secondary">
                    {t("catsConflict.worksSub")}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3 sm:flex-nowrap">
                <Link
                  href="/map"
                  onClick={handleClose}
                  className="rounded-full bg-felines-accent px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-felines-accent-hover"
                >
                  {t("catsConflict.seeCaretakers")}
                </Link>
                <Link
                  href="/learn/why-removing-cats-doesnt-work"
                  onClick={handleClose}
                  className="rounded-full border border-felines-border px-5 py-2 text-sm font-medium text-felines-text-secondary transition-colors hover:border-felines-accent hover:text-felines-accent"
                >
                  {t("catsConflict.readMoreVacuum")}
                </Link>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
