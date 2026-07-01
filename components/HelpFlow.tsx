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
import { submitReport } from "@/lib/submitReport";
import AnonymousReportNotice from "@/components/AnonymousReportNotice";
import MapMarkerPickerShell from "@/components/MapMarkerPickerShell";
import CreateAccountInvite from "@/components/CreateAccountInvite";
import LostCatForm from "@/components/LostCatForm";

type SituationKey =
  | "spotted"
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
// Order of the two-column grid (sm:grid-cols-2):
// col A: spotted, injured, kitten, missing, disease
// col B: conflict, abuse, threat, map_colony (special Link), other
const SITUATIONS: Situation[] = [
  // Row 1
  {
    key: "spotted",
    label: "👀 Avistei um gato",
    reportType: "sighting",
    guidance: [
      "Um avistamento isolado já ajuda — registre onde e quando você viu o gato.",
      "Se você costuma ver o mesmo gato (ou grupo de gatos) na região, isso pode ser uma colônia ainda não mapeada.",
    ],
    alert: "Viu o mesmo lugar mais de uma vez? Considere colocar essa colônia no mapa.",
  },
  {
    key: "conflict",
    label: "🏠 Estou em conflito com os gatos",
    reportType: null,
    guidance: [
      "Cheiro, barulho e sujeira costumam vir de colônias sem ninguém cuidando — castração e alimentação controlada resolvem boa parte disso.",
      "Remover ou afugentar os gatos quase sempre atrai um grupo novo pro mesmo lugar.",
    ],
    relatedArticleSlug: "cats-bothering-your-building",
    relatedArticleLabel: "Veja o que realmente funciona",
  },
  // Row 2
  {
    key: "injured",
    label: "🤕 Gato ferido ou doente",
    reportType: "injured_sick",
    guidance: [
      "Mantenha distância e evite tocar sem proteção. Um animal com dor pode morder até sendo manso.",
      "Se conseguir, cubra ele com uma caixa ou toalha. Isso evita que se machuque mais ou fuja.",
    ],
    alert: "Procure uma clínica veterinária ou abrigo de emergência perto de você.",
    relatedArticleSlug: "found-injured-cat-step-by-step",
    relatedArticleLabel: "Veja o passo a passo completo",
  },
  {
    key: "abuse",
    label: "⚠️ Suspeita de envenenamento ou maus-tratos",
    reportType: "suspected_abuse",
    guidance: [
      "Documente tudo que puder: fotos, vídeos com data visível, local e horário aproximado.",
      "Não confronte quem você suspeita. Sua segurança e a do animal vêm primeiro.",
    ],
    alert:
      "Você também pode ligar pro Disque Denúncia 181 (anônimo) ou pra Emergência 190. Maus-tratos a animais são crime pela Lei 9.605/98.",
    relatedArticleSlug: "how-to-report-animal-abuse",
    relatedArticleLabel: "Saiba como denunciar corretamente",
  },
  // Row 3
  {
    key: "kitten",
    label: "🐾 Filhote sozinho",
    reportType: "new_kitten",
    guidance: [
      "Filhote sozinho nem sempre é filhote abandonado. A mãe pode estar só caçando comida por aí.",
      "Observe de uma distância segura por algumas horas antes de fazer qualquer coisa.",
    ],
    relatedArticleSlug: "found-a-kitten-alone",
    relatedArticleLabel: "Veja o guia completo antes de agir",
  },
  {
    key: "threat",
    label: "🏗️ Obra ou risco de despejo perto de uma colônia",
    reportType: "threat_to_colony",
    guidance: [
      "Descubra os prazos (início da obra, data do despejo) o quanto antes. Isso define quanto tempo você tem.",
      "Procure o cuidador responsável pela colônia, se já tiver um cadastrado no mapa.",
    ],
    alert: "Avise cuidadores e vizinhos da região — junto, é mais fácil agir a tempo.",
  },
  // Row 4
  {
    key: "missing",
    label: "🔍 Gato desaparecido",
    reportType: "missing_cat",
    guidance: [
      "Avise os cuidadores de colônias próximas. Eles costumam reconhecer os gatos da região.",
      "Espalhe uma foto recente e características marcantes (cor, porte, coleira) pela vizinhança.",
    ],
    alert: "Dá uma olhada nas colônias próximas no mapa — gatos costumam ficar a poucos quarteirões de casa.",
  },
  // Row 4 col B: "Colocar uma colônia no mapa" is rendered as a special Link
  // after this item — key "map_colony" is a placeholder filtered out in render.
  // Row 5
  {
    key: "disease",
    label: "🦠 Surto de doença na colônia",
    reportType: "disease_outbreak",
    guidance: [
      "Evite contato direto com gatos doentes, e não deixe outros bichos domésticos se aproximarem.",
      "Anote quantos gatos parecem afetados e quais sintomas você está vendo.",
    ],
    alert: "Contate o centro de controle de zoonoses da sua região.",
  },
  {
    key: "other",
    label: "❓ Outro motivo",
    reportType: "sighting",
    guidance: [
      "Dá uma olhada no nosso guia pra entender melhor o comportamento dos gatos de rua.",
      "Se você viu algo que vale registrar, conta pra gente — isso ajuda quem está de olho na região.",
    ],
  },
];

export default function HelpFlow({ onClose }: { onClose?: () => void }) {
  const [step, setStep] = useState<1 | 2>(1);
  const [situation, setSituation] = useState<Situation | null>(null);
  const [locationCoords, setLocationCoords] = useState<[number, number] | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  // Lets a signed-out visitor explicitly choose to continue into
  // LostCatForm anyway (which then shows its own AuthRequiredNotice),
  // instead of only finding out login is required after already
  // opening the form.
  const [missingCatGuestConfirmed, setMissingCatGuestConfirmed] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setIsLoggedIn(!!data.session));
  }, []);

  // Sends a report using the situation's report type and the marked location.
  async function handleSubmitReport() {
    if (!situation?.reportType) return;
    setSubmitting(true);
    setReportError(null);
    const { error } = await submitReport({
      type: situation.reportType,
      latitude: locationCoords?.[0] ?? null,
      longitude: locationCoords?.[1] ?? null,
      status: "open",
    });
    setSubmitting(false);
    if (error) {
      setReportError(error);
    } else {
      setSubmitted(true);
      if (onClose) setTimeout(onClose, 1500);
    }
  }

  return (
    <div className="mt-8">
      {step === 1 && (
        <div>
          <h2 className="text-lg font-semibold text-felines-text-primary">
            O que está acontecendo?
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {SITUATIONS.flatMap((option, index) => {
              const btn = (
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
              );
              // "Colocar uma colônia no mapa" sits at column-B of row 4,
              // right after "Gato desaparecido" (index 6, 0-based).
              if (index === 6) {
                return [
                  btn,
                  <Link
                    key="map_colony"
                    href="/colony/new"
                    onClick={onClose}
                    className="rounded-xl border border-felines-border bg-felines-surface px-4 py-3 text-left text-sm font-medium text-felines-text-primary transition-colors hover:border-felines-accent"
                  >
                    📍 Colocar uma colônia no mapa
                  </Link>,
                ];
              }
              return [btn];
            })}
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
                      ⚠️ Pra cadastrar um gato perdido, você precisa de uma conta. Assim, quem
                      encontrar o gato sabe com quem falar.
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
                Onde fica?
              </h2>
              {situation.reportType && !isLoggedIn && <AnonymousReportNotice />}
              <p className="mt-2 text-xs text-felines-text-secondary">
                Toque ou arraste o pino até o local.
              </p>
              <div className="mt-2 h-48 w-full overflow-hidden rounded-xl border border-felines-border">
                <MapMarkerPickerShell
                  position={locationCoords}
                  onPick={(lat, lng) => setLocationCoords([lat, lng])}
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
                    onClick={onClose}
                    className="mt-3 inline-block text-sm font-medium text-felines-accent hover:text-felines-accent-hover"
                  >
                    {situation.relatedArticleLabel ?? "Saiba mais"}
                  </Link>
                )}

                {reportError && !submitted && (
                  <p className="mt-3 text-sm text-felines-emergency">{reportError}</p>
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
                        <p className="text-sm text-felines-success">
                          Relato registrado. Valeu por avisar.
                        </p>
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
                    onClick={onClose}
                    className="rounded-full border border-felines-accent px-4 py-2 text-sm font-medium text-felines-accent transition-colors hover:bg-felines-accent hover:text-white"
                  >
                    Entender melhor isso
                  </Link>
                  <Link
                    href="/map"
                    onClick={onClose}
                    className="rounded-full border border-felines-border px-4 py-2 text-sm font-medium text-felines-text-secondary transition-colors hover:border-felines-accent hover:text-felines-accent"
                  >
                    Ver colônias no mapa
                  </Link>
                  <Link
                    href="/colony/new"
                    onClick={onClose}
                    className="rounded-full border border-felines-border px-4 py-2 text-sm font-medium text-felines-text-secondary transition-colors hover:border-felines-accent hover:text-felines-accent"
                  >
                    Colocar uma colônia no mapa
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
