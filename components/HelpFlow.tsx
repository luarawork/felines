// Two-step "what should I do" wizard for the /help page.
// Step 1 asks what's happening, step 2 asks where, then shows tailored
// educational guidance and, when relevant, a way to submit a report
// directly from the flow (no login required).
"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type SituationKey = "injured" | "kitten" | "conflict" | "missing" | "other";

type Situation = {
  key: SituationKey;
  label: string;
  reportType: string | null;
  guidance: string[];
};

// What's happening? options, with the educational guidance shown for each
// and, when applicable, the reports.type used if the user submits a report.
const SITUATIONS: Situation[] = [
  {
    key: "injured",
    label: "Gato ferido ou doente",
    reportType: "injured_sick",
    guidance: [
      "Mantenha distância e evite tocar o gato sem proteção — animais feridos podem morder por dor ou medo.",
      "Se possível, cubra a área com uma caixa ou toalha para evitar que ele se machuque mais ou fuja.",
      "Procure uma clínica veterinária ou ONG de proteção animal da região para orientação imediata.",
    ],
  },
  {
    key: "kitten",
    label: "Filhote sozinho",
    reportType: "new_kitten",
    guidance: [
      "Filhotes sozinhos nem sempre estão abandonados — a mãe pode estar caçando comida nas proximidades.",
      "Observe de uma distância segura por 1 a 2 horas antes de qualquer intervenção.",
      "Só remova o filhote do local se ele estiver visivelmente ferido, muito frio ou em risco imediato.",
    ],
  },
  {
    key: "conflict",
    label: "Estou em conflito com os gatos",
    reportType: null,
    guidance: [
      "Cheiro, barulho e sujeira costumam vir de colônias sem cuidado — castração e alimentação controlada reduzem muito esses problemas.",
      "Evite remover ou afugentar os gatos: isso geralmente atrai novos gatos para o território vazio.",
      "Veja se já existe um cuidador responsável pela colônia da sua rua no mapa do Felines.",
    ],
  },
  {
    key: "missing",
    label: "Gato desaparecido",
    reportType: "missing_cat",
    guidance: [
      "Avise os cuidadores de colônias próximas — eles costumam reconhecer os gatos da região.",
      "Espalhe uma foto recente e características marcantes (cor, porte, coleira) na vizinhança.",
      "Registre um relato para que outras pessoas que avistarem o gato possam confirmar.",
    ],
  },
  {
    key: "other",
    label: "Outro motivo",
    reportType: "sighting",
    guidance: [
      "Conte com o guia de aprendizado do Felines para entender melhor o comportamento dos gatos de rua.",
      "Se você avistou algo relevante, registre um relato para que a comunidade tenha visibilidade.",
    ],
  },
];

export default function HelpFlow() {
  const [step, setStep] = useState<1 | 2>(1);
  const [situation, setSituation] = useState<Situation | null>(null);
  const [location, setLocation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Sends a report using the situation's report type and the free-text location.
  async function handleSubmitReport() {
    if (!situation?.reportType) return;
    setSubmitting(true);
    const { error } = await supabase.from("reports").insert({
      type: situation.reportType,
      description: location ? `Localização informada: ${location}` : null,
      status: "open",
    });
    setSubmitting(false);
    if (!error) setSubmitted(true);
  }

  return (
    <div className="mt-8">
      {step === 1 && (
        <div>
          <h2 className="text-lg font-semibold text-felines-text-primary">
            1. O que está acontecendo?
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {SITUATIONS.map((option) => (
              <button
                key={option.key}
                onClick={() => {
                  setSituation(option);
                  setStep(2);
                }}
                className="rounded-xl border border-felines-border bg-felines-surface px-4 py-3 text-left text-sm font-medium text-felines-text-primary transition-colors hover:border-felines-accent"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && situation && (
        <div>
          <button
            onClick={() => setStep(1)}
            className="text-sm text-felines-text-secondary hover:text-felines-accent"
          >
            ← Voltar
          </button>

          <h2 className="mt-3 text-lg font-semibold text-felines-text-primary">
            2. Onde você está?
          </h2>
          <input
            type="text"
            value={location}
            onChange={(formEvent) => setLocation(formEvent.target.value)}
            placeholder="Bairro ou rua (opcional)"
            maxLength={200}
            className="mt-2 w-full rounded-md border border-felines-border bg-white px-3 py-2 text-sm"
          />

          <div className="mt-6 rounded-xl border border-felines-border bg-felines-surface p-5">
            <h3 className="font-semibold text-felines-text-primary">{situation.label}</h3>
            <ul className="mt-3 space-y-2">
              {situation.guidance.map((line) => (
                <li
                  key={line}
                  className="flex gap-2 text-sm leading-relaxed text-felines-text-secondary"
                >
                  <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-felines-success" />
                  {line}
                </li>
              ))}
            </ul>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              {situation.reportType && !submitted && (
                <button
                  onClick={handleSubmitReport}
                  disabled={submitting}
                  className="rounded-full bg-felines-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-felines-accent-hover disabled:opacity-50"
                >
                  {submitting ? "Enviando..." : "Registrar relato"}
                </button>
              )}
              {submitted && (
                <p className="text-sm text-felines-success">Relato registrado, obrigado.</p>
              )}
              <Link
                href="/learn"
                className="text-sm font-medium text-felines-accent hover:text-felines-accent-hover"
              >
                Aprender mais sobre o tema →
              </Link>
              <Link
                href="/map"
                className="text-sm font-medium text-felines-text-secondary hover:text-felines-accent"
              >
                Ver mapa de colônias →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
