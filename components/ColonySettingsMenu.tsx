// Discreet gear-icon menu for the colony page's rare actions — edit
// colony details, become/stop caretaker. These happen at most once in
// a while per visitor, so they don't need to compete for space with
// the always-visible daily feed/water buttons.
"use client";

import { useState } from "react";
import EditColonyButton from "@/components/EditColonyButton";
import CaretakerToggleButton from "@/components/CaretakerToggleButton";
import { useColonyAccessContext } from "@/components/ColonyAccessProvider";
import { useEscapeToClose } from "@/lib/useEscapeToClose";
import { useLanguage } from "@/lib/i18n";

type CastrationStatus = "none" | "partial" | "full";

export default function ColonySettingsMenu({
  colonyId,
  initialName,
  initialNarrative,
  initialCastrationStatus,
  initialCoverPhotoUrl,
}: {
  colonyId: string;
  initialName: string;
  initialNarrative: string | null;
  initialCastrationStatus: CastrationStatus;
  initialCoverPhotoUrl: string | null;
}) {
  const { t } = useLanguage();
  const { session, checkingAccess } = useColonyAccessContext();
  const [open, setOpen] = useState(false);
  useEscapeToClose(open, () => setOpen(false));

  // Both menu items require a session (edit also requires canManage,
  // enforced inside EditColonyButton itself) — nothing to show a
  // signed-out visitor, so skip rendering the gear entirely for them.
  if (checkingAccess || !session) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={t("colony.settingsMenu")}
        aria-expanded={open}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-lg text-white backdrop-blur-sm transition-colors hover:bg-black/45"
      >
        ⋮
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[1900]" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-12 z-[2000] w-52 rounded-xl border border-felines-border bg-felines-surface p-1.5 shadow-lg">
            <EditColonyButton
              colonyId={colonyId}
              initialName={initialName}
              initialNarrative={initialNarrative}
              initialCastrationStatus={initialCastrationStatus}
              initialCoverPhotoUrl={initialCoverPhotoUrl}
              menuItem
            />
            <CaretakerToggleButton colonyId={colonyId} />
          </div>
        </>
      )}
    </div>
  );
}
