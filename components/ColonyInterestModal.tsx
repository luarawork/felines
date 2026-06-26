// Gate shown from the map's "Ver colônia" action — instead of going
// straight to the colony page, this asks whether the visitor actually
// wants to look after that colony, since the detailed page (cats,
// timeline, exact-ish narrative) is meant for people who'd realistically
// become caretakers, not casual browsing. Anyone who says no, or who
// isn't actually nearby, is told the detail page is caretaker-only and
// stays on the map.
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEscapeToClose } from "@/lib/useEscapeToClose";

type Step = "interest" | "proximity" | "denied";

export default function ColonyInterestModal({
  colonyId,
  onClose,
}: {
  colonyId: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("interest");
  useEscapeToClose(true, onClose);

  function goToColony() {
    router.push(`/colony/${colonyId}`);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="colony-interest-title"
        className="w-full max-w-sm rounded-xl bg-felines-background p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <h2 id="colony-interest-title" className="text-lg font-bold text-felines-text-primary">
            Antes de ver os detalhes
          </h2>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center text-xl leading-none text-felines-text-secondary hover:text-felines-text-primary"
          >
            ×
          </button>
        </div>

        {step === "interest" && (
          <>
            <p className="mt-3 text-sm text-felines-text-secondary">
              Você tem interesse em se tornar cuidador dessa colônia?
            </p>
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setStep("proximity")}
                className="rounded-full bg-felines-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-felines-accent-hover"
              >
                Sim
              </button>
              <button
                onClick={() => setStep("denied")}
                className="rounded-full border border-felines-border px-4 py-2 text-sm font-medium text-felines-text-secondary transition-colors hover:border-felines-accent hover:text-felines-accent-hover"
              >
                Não
              </button>
            </div>
          </>
        )}

        {step === "proximity" && (
          <>
            <p className="mt-3 text-sm text-felines-text-secondary">
              Você mora perto, ou passa por esse local com frequência?
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <button
                onClick={goToColony}
                className="rounded-full bg-felines-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-felines-accent-hover"
              >
                Moro perto
              </button>
              <button
                onClick={goToColony}
                className="rounded-full border border-felines-accent px-4 py-2 text-sm font-medium text-felines-accent transition-colors hover:bg-felines-accent hover:text-white"
              >
                Passo com frequência
              </button>
              <button
                onClick={() => setStep("denied")}
                className="rounded-full border border-felines-border px-4 py-2 text-sm font-medium text-felines-text-secondary transition-colors hover:border-felines-accent hover:text-felines-accent-hover"
              >
                Nenhuma das opções
              </button>
            </div>
          </>
        )}

        {step === "denied" && (
          <p className="mt-3 text-sm text-felines-text-secondary">
            O detalhamento dessa colônia é só para quem cuida dela. Se isso mudar, volte aqui
            quando quiser.
          </p>
        )}
      </div>
    </div>
  );
}
