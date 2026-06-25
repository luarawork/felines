// Personalization quiz shown on /learn once a user has read at least 3
// articles. There are no wrong answers — each path leads to a "neighbor
// profile" with a suggested first action, not a score.
export type NeighborProfileKey = "observer" | "backup" | "guardian";

export type QuizOption = {
  label: string;
  profile: NeighborProfileKey;
};

export type QuizQuestion = {
  question: string;
  options: QuizOption[];
};

// Only the commitment question (Q2) determines the resulting profile —
// it's the most direct signal of how someone wants to participate. The
// other two questions exist to make the quiz feel personal, not to be
// scored.
export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    question: "Quando você vê gatos na sua rua, qual é a sua primeira sensação?",
    options: [
      { label: "Curiosidade — eu fico pensando quem cuida deles", profile: "observer" },
      { label: "Preocupação — eu me preocupo com o bem-estar deles", profile: "observer" },
      { label: "Incômodo — eles causam problemas no meu prédio", profile: "backup" },
      { label: "Neutro — nunca tinha pensado muito nisso", profile: "observer" },
    ],
  },
  {
    question: "Quanto tempo você poderia dedicar de verdade?",
    options: [
      { label: "Posso passar por ali e ver como eles estão de vez em quando", profile: "observer" },
      { label: "Posso ajudar quando alguém precisar de um apoio", profile: "backup" },
      { label: "Estou pronto para assumir um papel regular", profile: "guardian" },
    ],
  },
  {
    question: "O que parece mais natural pra você?",
    options: [
      { label: "Aprender mais antes de fazer qualquer coisa", profile: "observer" },
      { label: "Fazer uma pequena ação agora mesmo", profile: "backup" },
      { label: "Me conectar com quem já está ajudando", profile: "guardian" },
    ],
  },
];

export const NEIGHBOR_PROFILES: Record<
  NeighborProfileKey,
  { title: string; description: string; firstAction: string }
> = {
  observer: {
    title: "O Observador",
    description:
      "Você quer entender antes de agir — e isso já é um ótimo primeiro passo. Observar com atenção é o que permite identificar quando algo realmente precisa de ajuda.",
    firstAction: "Comece visitando o mapa para ver as colônias mapeadas perto de você.",
  },
  backup: {
    title: "O Apoio",
    description:
      "Você não precisa assumir uma colônia inteira para fazer diferença — pequenas ações de apoio, no momento certo, já ajudam muito quem já cuida.",
    firstAction: "Apoie um cuidador já existente: registre um relato quando notar algo, ou ofereça ração quando puder.",
  },
  guardian: {
    title: "O Guardião",
    description:
      "Você está pronto para um papel mais constante — e colônias inteiras dependem exatamente de pessoas dispostas a isso.",
    firstAction: "Veja as colônias já mapeadas e considere se tornar cuidador de uma delas.",
  },
};
