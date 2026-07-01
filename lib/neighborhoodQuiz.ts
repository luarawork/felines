// Diagnostic quiz helping a visitor figure out what's likely going on
// with cats in their area — distinct from lib/quiz.ts (the "what kind
// of neighbor are you" identity quiz on /profile): this one is about
// the situation, not the person answering.
export type AnswerKey = "A" | "B" | "C" | "D";

export type NeighborhoodQuestion = {
  question: string;
  options: { key: AnswerKey; label: string }[];
};

export const NEIGHBORHOOD_QUESTIONS: NeighborhoodQuestion[] = [
  {
    question: "Quantos gatos você costuma ver no mesmo lugar?",
    options: [
      { key: "A", label: "Só um ou dois, de vez em quando" },
      { key: "B", label: "Um grupo pequeno — de 3 a 6 gatos" },
      { key: "C", label: "Um grupo maior — 7 ou mais" },
      { key: "D", label: "Nunca prestei muita atenção" },
    ],
  },
  {
    question: "Você vê os mesmos gatos com frequência, no mesmo lugar?",
    options: [
      { key: "A", label: "Sim, sempre os mesmos" },
      { key: "B", label: "Às vezes — alguns conhecidos, outros novos" },
      { key: "C", label: "Parecem diferentes a cada vez" },
      { key: "D", label: "Não tenho certeza" },
    ],
  },
  {
    question: "Tem alguém que parece alimentar ou cuidar deles?",
    options: [
      { key: "A", label: "Sim, já vi alguém deixando comida" },
      { key: "B", label: "Tem potes de comida, mas nunca vi quem deixa" },
      { key: "C", label: "Nenhum sinal de que alguém cuida" },
      { key: "D", label: "Não sei" },
    ],
  },
  {
    question: "Já houve algum conflito ou reclamação sobre os gatos?",
    options: [
      { key: "A", label: "Sim, vizinhos já reclamaram" },
      { key: "B", label: "Alguma tensão, mas nada grave" },
      { key: "C", label: "Nenhum conflito que eu saiba" },
      { key: "D", label: "Não ouvi nada sobre isso" },
    ],
  },
];

export type DiagnosisKey = "established" | "unregistered" | "conflict" | "unclear";

export type Diagnosis = {
  title: string;
  explanation: string;
  ctaLabel: string;
  ctaHref: string;
};

export const DIAGNOSES: Record<DiagnosisKey, Diagnosis> = {
  established: {
    title: "Isso parece uma colônia já estabelecida",
    explanation:
      "Você provavelmente está vendo uma colônia que já tem alguém de olho nela. Isso é uma boa notícia — significa que já existe cuidado acontecendo, mesmo que discreto.",
    ctaLabel: "Descobrir se ela já está mapeada",
    ctaHref: "/map",
  },
  unregistered: {
    title: "Isso pode ser uma colônia ainda não registrada",
    explanation:
      "Esses gatos parecem ter se estabelecido ali, mas ninguém está acompanhando oficialmente. Eles podem precisar de apoio — e você pode ser a pessoa que começa isso.",
    ctaLabel: "Seja o primeiro a mapear essa colônia",
    ctaHref: "/colony/new",
  },
  conflict: {
    title: "Isso parece uma situação de conflito",
    explanation:
      "Conflitos de vizinhança envolvendo gatos são mais comuns do que parece — e têm soluções reais, que não passam por remover os gatos.",
    ctaLabel: "Veja o que realmente funciona",
    ctaHref: "/learn/cats-bothering-your-building",
  },
  unclear: {
    title: "Ainda é difícil saber",
    explanation: "Sem problema. O mapa pode te ajudar a descobrir o que já existe perto de você.",
    ctaLabel: "Explorar o que tem na sua área",
    ctaHref: "/map",
  },
};

// Priority order matters: a mentioned conflict (Q4) is treated as the
// most actionable signal regardless of how settled the group looks,
// since "is this colony mapped" matters less than "people are already
// upset about this" when both are true at once.
export function diagnose(answers: AnswerKey[]): DiagnosisKey {
  const [, regularlySeen, hasCaretaker, hasConflict] = answers;

  if (hasConflict === "A") return "conflict";

  const isSettledGroup = regularlySeen === "A" || regularlySeen === "B";
  const looksCaredFor = hasCaretaker === "A" || hasCaretaker === "B";

  if (isSettledGroup && looksCaredFor) return "established";
  if (isSettledGroup && !looksCaredFor) return "unregistered";
  return "unclear";
}
