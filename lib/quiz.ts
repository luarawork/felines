// Quiz questions shown on /learn once a user has read at least 3 articles.
// Kept separate from articles.ts since the quiz checks comprehension
// across topics rather than belonging to a single article.
export type QuizQuestion = {
  question: string;
  options: string[];
  correctIndex: number;
};

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    question: "Qual é a forma mais eficaz de reduzir o número de gatos de rua a longo prazo?",
    options: ["Remover os gatos do local", "Castração", "Parar de alimentar"],
    correctIndex: 1,
  },
  {
    question: "O que normalmente causa o cheiro forte e as brigas associadas a gatos de rua?",
    options: [
      "Gatos não castrados marcando território",
      "Falta de banho",
      "Comida deixada pela vizinhança",
    ],
    correctIndex: 0,
  },
  {
    question: "Encontrou filhotes sozinhos. Qual é o primeiro passo recomendado?",
    options: [
      "Levar para casa imediatamente",
      "Observar de longe antes de intervir",
      "Chamar a remoção dos filhotes",
    ],
    correctIndex: 1,
  },
];
