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
      "Você prefere entender antes de agir. Isso já é um ótimo primeiro passo — quem observa com atenção é quem nota quando algo realmente precisa de ajuda.",
    firstAction: "Comece dando uma olhada no mapa pra ver quais colônias já estão mapeadas perto de você.",
  },
  backup: {
    title: "O Apoio",
    description:
      "Você não precisa adotar uma colônia inteira pra fazer diferença. Um apoio pontual, na hora certa, já ajuda bastante quem está cuidando todos os dias.",
    firstAction: "Apoie um cuidador que já existe: registre um relato quando notar algo, ou ofereça ração quando puder.",
  },
  guardian: {
    title: "O Guardião",
    description:
      "Você está pronto pra um papel mais constante. E colônias inteiras só se sustentam porque alguém topa fazer exatamente isso.",
    firstAction: "Veja as colônias já mapeadas e veja se alguma delas faz sentido pra você cuidar.",
  },
};
