// Two-step "what should I do" wizard for the /help page.
// Step 1 asks what's happening, step 2 asks where, then shows tailored
// educational guidance and, when relevant, a way to submit a report
// directly from the flow — no login required, except for "Gato
// desaparecido", which opens the full LostCatForm and does require an
// account (so the owner can be identified for sighting replies).
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import AnonymousReportNotice from "@/components/AnonymousReportNotice";
import AddressAutocomplete from "@/components/AddressAutocomplete";
import CreateAccountInvite from "@/components/CreateAccountInvite";
import LostCatForm from "@/components/LostCatForm";

type SituationKey =
  | "injured"
  | "kitten"
  | "abuse"
  | "disease"
  | "conflict"
  | "missing"
  | "threat"
  | "other";

type Situation = {
  key: SituationKey;
  label: string;
  reportType: string | null;
  guidance: string[];
  /** A more urgent, specifically-worded note (hotlines, official channels). */
  alert?: string;
  /** Link to a relevant /learn article for deeper guidance. */
  relatedArticleSlug?: string;
  relatedArticleLabel?: string;
};

// What's happening? options, with the educational guidance shown for each
// and, when applicable, the reports.type used if the user submits a report.
const SITUATIONS: Situation[] = [
  {
    key: "injured",
    label: "🤕 Gato ferido ou doente",
    reportType: "injured_sick",
    guidance: [
      "Mantenha distância e evite tocar o gato sem proteção — animais feridos podem morder por dor ou medo.",
      "Se possível, cubra a área com uma caixa ou toalha para evitar que ele se machuque mais ou fuja.",
    ],
    alert: "Encontre uma clínica veterinária ou abrigo de emergência perto de você.",
    relatedArticleSlug: "found-injured-cat-step-by-step",
    relatedArticleLabel: "Veja o passo a passo completo",
  },
  {
    key: "kitten",
    label: "🐾 Filhote sozinho",
    reportType: "new_kitten",
    guidance: [
      "Filhotes sozinhos nem sempre estão abandonados — a mãe pode estar caçando comida nas proximidades.",
      "Observe de uma distância segura por algumas horas antes de qualquer intervenção.",
    ],
    relatedArticleSlug: "found-a-kitten-alone",
    relatedArticleLabel: "Veja o guia completo antes de agir",
  },
  {
    key: "abuse",
    label: "⚠️ Suspeita de envenenamento ou maus-tratos",
    reportType: "suspected_abuse",
    guidance: [
      "Documente o máximo possível: fotos, vídeos com data visível, localização e horário aproximado.",
      "Não confronte diretamente quem você suspeita — priorize sua segurança e a do animal.",
    ],
    alert:
      "Procure também contatar: Disque Denúncia 181 (anônimo) ou Emergência 190. Maus-tratos a animais são crime previsto na Lei 9.605/98.",
    relatedArticleSlug: "how-to-report-animal-abuse",
    relatedArticleLabel: "Saiba como denunciar corretamente",
  },
  {
    key: "disease",
    label: "🦠 Surto de doença na colônia",
    reportType: "disease_outbreak",
    guidance: [
      "Evite contato direto com gatos doentes e não permita que outros animais domésticos se aproximem.",
      "Anote quantos gatos parecem afetados e quais sintomas você observou.",
    ],
    alert: "Contate o Centro de Controle de Zoonoses (CCZ) da sua cidade.",
  },
  {
    key: "conflict",
    label: "🏠 Estou em conflito com os gatos",
    reportType: null,
    guidance: [
      "Cheiro, barulho e sujeira costumam vir de colônias sem cuidado — castração e alimentação controlada reduzem muito esses problemas.",
      "Evite remover ou afugentar os gatos: isso geralmente atrai novos gatos para o território vazio.",
    ],
    relatedArticleSlug: "cats-bothering-your-building",
    relatedArticleLabel: "Veja o que realmente funciona",
  },
  {
    key: "missing",
    label: "🔍 Gato desaparecido",
    reportType: "missing_cat",
    guidance: [
      "Avise os cuidadores de colônias próximas — eles costumam reconhecer os gatos da região.",
      "Espalhe uma foto recente e características marcantes (cor, porte, coleira) na vizinhança.",
    ],
    alert: "Confira as colônias próximas no mapa — gatos costumam ficar a poucos quarteirões.",
  },
  {
    key: "threat",
    label: "🏗️ Obra ou risco de despejo perto de uma colônia",
    reportType: "threat_to_colony",
    guidance: [
      "Identifique prazos (início de obra, data de despejo) o quanto antes — isso define a urgência da ação.",
      "Procure o cuidador responsável pela colônia, se houver um cadastrado no mapa.",
    ],
    alert: "Avise cuidadores e vizinhos da região para que a comunidade possa agir junto.",
  },
  {
    key: "other",
    label: "❓ Outro motivo",
    reportType: "sighting",
    guidance: [
      "Conte com o guia de aprendizado do Felines para entender melhor o comportamento dos gatos de rua.",
      "Se você avistou algo relevante, registre um relato para que a comunidade tenha visibilidade.",
    ],
  },
];

export default function HelpFlow({ onClose }: { onClose?: () => void }) {
  const [step, setStep] = useState<1 | 2>(1);
  const [situation, setSituation] = useState<Situation | null>(null);
  const [location, setLocation] = useState("");
  const [locationCoords, setLocationCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  // Lets a signed-out visitor explicitly choose to continue into
  // LostCatForm anyway (which then shows its own AuthRequiredNotice),
  // instead of only finding out login is required after already
  // opening the form.
  const [missingCatGuestConfirmed, setMissingCatGuestConfirmed] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setIsLoggedIn(!!data.session));
  }, []);

  // Sends a report using the situation's report type and the free-text location.
  async function handleSubmitReport() {
    if (!situation?.reportType) return;
    setSubmitting(true);
    const { error } = await supabase.from("reports").insert({
      type: situation.reportType,
      description: location ? `Localização informada: ${location}` : null,
      latitude: locationCoords?.lat ?? null,
      longitude: locationCoords?.lon ?? null,
      status: "open",
    });
    setSubmitting(false);
    if (!error) {
      setSubmitted(true);
      if (onClose) setTimeout(onClose, 1500);
    }
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
                  setMissingCatGuestConfirmed(false);
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

          {situation.key === "missing" ? (
            <div className="mt-3 rounded-xl border border-felines-border bg-felines-surface p-5">
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
              {situation.alert && (
                <p className="mt-3 rounded-md bg-felines-warning/10 px-3 py-2 text-sm text-felines-text-primary">
                  {situation.alert}
                </p>
              )}
              <div className="mt-5">
                {!isLoggedIn && !missingCatGuestConfirmed ? (
                  <div className="rounded-md bg-felines-warning/10 px-3 py-3 text-sm text-felines-text-primary">
                    <p>
                      ⚠️ Relatar um gato perdido exige uma conta, pra comunidade saber com quem
                      falar se o gato for encontrado.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-3">
                      <Link
                        href="/login?returnTo=/help"
                        className="rounded-full bg-felines-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-felines-accent-hover"
                      >
                        Entrar
                      </Link>
                      <button
                        onClick={() => setMissingCatGuestConfirmed(true)}
                        className="text-sm font-medium text-felines-text-secondary hover:text-felines-accent"
                      >
                        Continuar sem conta
                      </button>
                    </div>
                  </div>
                ) : (
                  <LostCatForm onSubmitted={onClose} />
                )}
              </div>
            </div>
          ) : (
            <>
              <h2 className="mt-3 text-lg font-semibold text-felines-text-primary">
                2. Onde você está?
              </h2>
              {situation.reportType && !isLoggedIn && <AnonymousReportNotice />}
              <div className="mt-2">
                <AddressAutocomplete
                  value={location}
                  onChange={(newValue) => {
                    setLocation(newValue);
                    setLocationCoords(null);
                  }}
                  onSelectLocation={(lat, lon) => setLocationCoords({ lat, lon })}
                />
              </div>

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

                {situation.alert && (
                  <p className="mt-3 rounded-md bg-felines-warning/10 px-3 py-2 text-sm text-felines-text-primary">
                    {situation.alert}
                  </p>
                )}

                {situation.relatedArticleSlug && (
                  <Link
                    href={`/learn/${situation.relatedArticleSlug}`}
                    className="mt-3 inline-block text-sm font-medium text-felines-accent hover:text-felines-accent-hover"
                  >
                    {situation.relatedArticleLabel ?? "Saiba mais"} →
                  </Link>
                )}

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
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-3">
                        <p className="text-sm text-felines-success">Relato registrado, obrigado.</p>
                        {onClose && (
                          <button
                            onClick={onClose}
                            className="text-sm font-medium text-felines-text-secondary hover:text-felines-accent"
                          >
                            Fechar
                          </button>
                        )}
                      </div>
                      {!isLoggedIn && <CreateAccountInvite />}
                    </div>
                  )}
                  <Link
                    href="/#aprender"
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
            </>
          )}
        </div>
      )}
    </div>
  );
}
