"use client";

import { useState } from "react";
import Link from "next/link";
import { useEscapeToClose } from "@/lib/useEscapeToClose";
import { createPortal } from "react-dom";

export default function CatsConflictModal() {
  const [open, setOpen] = useState(false);

  useEscapeToClose(open, () => setOpen(false));

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full border border-felines-border bg-felines-surface px-4 py-2 text-sm text-felines-text-secondary shadow-sm transition-all hover:border-felines-accent hover:text-felines-accent"
      >
        <span>😤</span>
        <span>Quer se livrar dos gatos da sua rua? Leia isso antes</span>
      </button>

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-[2500] flex items-center justify-center bg-black/50 p-4"
            onClick={() => setOpen(false)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="cats-conflict-title"
              className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-felines-background p-7 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4">
                <h2
                  id="cats-conflict-title"
                  className="text-xl font-bold text-felines-text-primary"
                >
                  Quer se livrar dos gatos? A gente entende.
                </h2>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Fechar"
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center text-xl text-felines-text-secondary hover:text-felines-text-primary"
                >
                  ×
                </button>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-felines-text-secondary">
                Cheiro de urina, miado de madrugada, arranhão no carro. Esses incômodos são reais e ninguém precisa aguentar em silêncio. Mas existe algo importante que a maioria não sabe antes de tentar resolver o problema:
              </p>

              <div className="mt-5 space-y-4">
                <div className="rounded-xl border border-felines-border bg-felines-surface p-4">
                  <p className="font-semibold text-felines-text-primary">
                    🔄 Remover os gatos não funciona de verdade
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-felines-text-secondary">
                    Cidades inteiras já tentaram isso, em décadas diferentes, em vários países. O resultado foi sempre o mesmo: o território esvaziado atrai um grupo novo em poucos meses — geralmente maior e não castrado. Isso tem nome: <strong>efeito vácuo</strong>. Enquanto houver comida e abrigo no local, sempre haverá gatos.
                  </p>
                </div>

                <div className="rounded-xl border border-felines-border bg-felines-surface p-4">
                  <p className="font-semibold text-felines-text-primary">
                    ⚖️ Maltratar é crime no Brasil
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-felines-text-secondary">
                    A Lei Sansão (Lei 14.064/2020) prevê pena de 2 a 5 anos de prisão por maus-tratos a cães e gatos — isso inclui envenenamento, agressão física e abandono em condição de sofrimento. Não é só o certo a fazer; é obrigação legal.
                  </p>
                </div>

                <div className="rounded-xl border border-felines-success/30 bg-felines-success/5 p-4">
                  <p className="font-semibold text-felines-text-primary">
                    ✅ O que realmente funciona
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-felines-text-secondary">
                    A castração em massa — método TNR (Captura, Castração, Devolução) — é a única estratégia que reduz a população de forma duradoura. Gatos castrados brigam menos, cheiram menos e o grupo para de crescer. Com o tempo, a colônia diminui naturalmente, sem conflito.
                  </p>
                  <p className="mt-2 text-sm text-felines-text-secondary">
                    Muitos bairros já têm alguém cuidando da colônia perto de você. Falar com esse cuidador costuma resolver muito mais rápido do que uma reclamação formal.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3 sm:flex-nowrap">
                <Link
                  href="/map"
                  onClick={() => setOpen(false)}
                  className="rounded-full bg-felines-accent px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-felines-accent-hover"
                >
                  Ver cuidadores no mapa
                </Link>
                <Link
                  href="/learn/why-removing-cats-doesnt-work"
                  onClick={() => setOpen(false)}
                  className="rounded-full border border-felines-border px-5 py-2 text-sm font-medium text-felines-text-secondary transition-colors hover:border-felines-accent hover:text-felines-accent"
                >
                  Ler mais sobre o efeito vácuo
                </Link>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
