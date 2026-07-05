// Trigger + modal for editing a colony's own info (name, narrative,
// castration status, cover photo). Used to be a permanent tab sitting
// alongside Cats/Timeline/Letter — now it's an explicit action, only
// shown to whoever can actually manage the colony.
"use client";

import { useState } from "react";
import EditColonyForm from "@/components/EditColonyForm";
import { useColonyAccessContext } from "@/components/ColonyAccessProvider";
import { useEscapeToClose } from "@/lib/useEscapeToClose";
import { useLanguage } from "@/lib/i18n";

type CastrationStatus = "none" | "partial" | "full";

export default function EditColonyButton({
  colonyId,
  initialName,
  initialNarrative,
  initialCastrationStatus,
  initialCoverPhotoUrl,
  menuItem = false,
}: {
  colonyId: string;
  initialName: string;
  initialNarrative: string | null;
  initialCastrationStatus: CastrationStatus;
  initialCoverPhotoUrl: string | null;
  // Renders as a plain full-width row instead of a standalone pill
  // button, for use inside ColonySettingsMenu's dropdown.
  menuItem?: boolean;
}) {
  const { canManage, checkingAccess } = useColonyAccessContext();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  useEscapeToClose(open, () => setOpen(false));

  if (checkingAccess || !canManage) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={
          menuItem
            ? "block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-felines-text-secondary transition-colors hover:bg-felines-background hover:text-felines-text-primary"
            : "rounded-full border border-felines-border px-4 py-2 text-sm font-medium text-felines-text-secondary transition-colors hover:border-felines-accent hover:text-felines-accent-hover"
        }
      >
        {t("editColony.trigger")}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-colony-modal-title"
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-felines-background p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <h2 id="edit-colony-modal-title" className="text-lg font-bold text-felines-text-primary">
                Editar colônia
              </h2>
              <button
                onClick={() => setOpen(false)}
                aria-label={t("editColony.close")}
                className="flex h-11 w-11 flex-shrink-0 items-center justify-center text-xl leading-none text-felines-text-secondary hover:text-felines-text-primary"
              >
                ×
              </button>
            </div>
            <div className="mt-4">
              <EditColonyForm
                colonyId={colonyId}
                initialName={initialName}
                initialNarrative={initialNarrative}
                initialCastrationStatus={initialCastrationStatus}
                initialCoverPhotoUrl={initialCoverPhotoUrl}
                onSaved={() => setOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
