// Courses and quizzes for the profile page quiz section.
// Each quiz is self-contained with questions and a passing score.
// "Cuidador Preparado" is the main course (linked to 5 learn articles).
// Additional quizzes cover identification, emergencies, and law.

export type CourseModule = {
  order: number;
  articleSlug: string;
  title: string;
  duration: string;
  title_en?: string;
};

function localizeModule(mod: CourseModule, language: "pt" | "en"): CourseModule {
  if (language !== "en") return mod;
  return { ...mod, title: mod.title_en ?? mod.title };
}

export function localizeCourseModules(modules: CourseModule[], language: "pt" | "en"): CourseModule[] {
  return modules.map((mod) => localizeModule(mod, language));
}

export const COURSE_MODULES: CourseModule[] = [
  {
    order: 1,
    articleSlug: "what-is-a-cat-colony",
    title: "O que é uma colônia de gatos",
    duration: "~3 min",
    title_en: "What is a cat colony",
  },
  {
    order: 2,
    articleSlug: "castracao-reduz-conflitos",
    title: "Por que a castração resolve conflitos",
    duration: "~2 min",
    title_en: "Why neutering resolves conflicts",
  },
  {
    order: 3,
    articleSlug: "what-is-tnr-and-why-it-works",
    title: "O método TNR",
    duration: "~3 min",
    title_en: "The TNR method",
  },
  {
    order: 4,
    articleSlug: "how-to-approach-a-stray-cat",
    title: "Como se aproximar de um gato de rua",
    duration: "~3 min",
    title_en: "How to approach a stray cat",
  },
  {
    order: 5,
    articleSlug: "tornando-se-cuidador",
    title: "O que ninguém te conta antes de virar cuidador",
    duration: "~2 min",
    title_en: "What nobody tells you before becoming a caretaker",
  },
];

export type CourseQuestion = {
  question: string;
  options: string[];
  correctIndex: number;
  question_en?: string;
  options_en?: string[];
};

function localizeQuestion(q: CourseQuestion, language: "pt" | "en"): CourseQuestion {
  if (language !== "en") return q;
  return {
    ...q,
    question: q.question_en ?? q.question,
    options: q.options_en ?? q.options,
  };
}

export function localizeQuestions(questions: CourseQuestion[], language: "pt" | "en"): CourseQuestion[] {
  return questions.map((q) => localizeQuestion(q, language));
}

export const COURSE_QUIZ: CourseQuestion[] = [
  {
    question: "O que significa a sigla TNR?",
    options: [
      "Tratar, Nutrir, Recuperar",
      "Capturar, Castrar e Devolver ao território",
      "Testar, Notificar, Registrar",
      "Tirar, Neutralizar, Reagrupar",
    ],
    correctIndex: 1,
    question_en: "What does the acronym TNR stand for?",
    options_en: [
      "Treat, Nourish, Recover",
      "Trap, Neuter, and Return to the territory",
      "Test, Notify, Register",
      "Take out, Neutralize, Regroup",
    ],
  },
  {
    question: "O que acontece quando uma colônia é removida sem mudar o que a atraiu para o local?",
    options: [
      "O território fica vazio permanentemente",
      "A população de gatos da cidade diminui globalmente",
      "Um novo grupo ocupa o espaço — geralmente maior e não castrado",
      "Os gatos se dispersam e não formam nova colônia",
    ],
    correctIndex: 2,
    question_en: "What happens when a colony is removed without changing what attracted it there?",
    options_en: [
      "The territory stays empty permanently",
      "The city's overall cat population goes down",
      "A new group moves in — usually bigger and unneutered",
      "The cats scatter and never form a new colony",
    ],
  },
  {
    question: "Você encontra um filhote sozinho na rua. Qual é o primeiro passo correto?",
    options: [
      "Pegar e levar para casa imediatamente",
      "Alimentar com leite de vaca para manter as forças",
      "Observar de longe por pelo menos 2 a 4 horas antes de agir",
      "Ligar para o 190 e pedir remoção imediata",
    ],
    correctIndex: 2,
    question_en: "You find a kitten alone on the street. What's the correct first step?",
    options_en: [
      "Pick it up and take it home right away",
      "Feed it cow's milk to keep its strength up",
      "Watch from a distance for at least 2 to 4 hours before acting",
      "Call emergency services and request immediate removal",
    ],
  },
  {
    question: "Como identificar se um gato de rua é socializado (e não feral)?",
    options: [
      "Ele tem pelagem limpa e bem cuidada",
      "Ele se aproxima por conta própria e tolera toque",
      "Ele tem a ponta da orelha cortada",
      "Ele permanece no mesmo território por muito tempo",
    ],
    correctIndex: 1,
    question_en: "How can you tell if a street cat is socialized (rather than feral)?",
    options_en: [
      "It has a clean, well-groomed coat",
      "It approaches on its own and tolerates touch",
      "It has an ear-tip",
      "It stays in the same territory for a long time",
    ],
  },
  {
    question: "Qual é o principal benefício de castrar toda uma colônia?",
    options: [
      "Os gatos ficam mais dóceis e fáceis de manejar",
      "A colônia para de crescer e diminui naturalmente ao longo do tempo",
      "Os gatos ganham imunidade contra doenças",
      "A colônia se dispersa e deixa de existir rapidamente",
    ],
    correctIndex: 1,
    question_en: "What's the main benefit of neutering an entire colony?",
    options_en: [
      "The cats become gentler and easier to handle",
      "The colony stops growing and naturally shrinks over time",
      "The cats gain immunity to disease",
      "The colony scatters and quickly ceases to exist",
    ],
  },
];

export const PASSING_SCORE = 4; // minimum correct answers out of 5

// ---------------------------------------------------------------------------
// Standalone quizzes — shorter, no linked articles, no certification.
// Each appears as a quiz card in the profile's quiz section.
// ---------------------------------------------------------------------------

export type StandaloneQuiz = {
  id: string;
  title: string;
  description: string;
  icon: string;
  questions: CourseQuestion[];
  passingScore: number;
  title_en?: string;
  description_en?: string;
};

export function localizeStandaloneQuiz(quiz: StandaloneQuiz, language: "pt" | "en"): StandaloneQuiz {
  if (language !== "en") return quiz;
  return {
    ...quiz,
    title: quiz.title_en ?? quiz.title,
    description: quiz.description_en ?? quiz.description,
    questions: localizeQuestions(quiz.questions, language),
  };
}

export const STANDALONE_QUIZZES: StandaloneQuiz[] = [
  {
    id: "identificacao-felinos",
    title: "Identificação de felinos",
    description: "Feral, semi-feral ou socializado? Você sabe diferenciar?",
    icon: "🐱",
    passingScore: 3,
    title_en: "Cat identification",
    description_en: "Feral, semi-feral, or socialized? Can you tell them apart?",
    questions: [
      {
        question: "Um gato feral tipicamente...",
        options: [
          "Pede carinho e mia bastante",
          "Mantém distância e foge ao menor movimento brusco",
          "Fica parado e deixa tocar livremente",
          "Se aproxima para comer na mão",
        ],
        correctIndex: 1,
        question_en: "A feral cat typically...",
        options_en: [
          "Asks for petting and meows a lot",
          "Keeps its distance and flees at the slightest sudden move",
          "Stays still and lets itself be touched freely",
          "Approaches to eat out of your hand",
        ],
      },
      {
        question: "A ponta da orelha cortada (ear-tip) em um gato de rua indica que...",
        options: [
          "O gato sofreu um acidente",
          "O gato já foi castrado pelo método TNR",
          "O gato pertence a alguém",
          "O gato é mais agressivo que os outros",
        ],
        correctIndex: 1,
        question_en: "An ear-tip on a street cat indicates that...",
        options_en: [
          "The cat was in an accident",
          "The cat has already been neutered through TNR",
          "The cat belongs to someone",
          "The cat is more aggressive than others",
        ],
      },
      {
        question: "Como se aproximar corretamente de um gato semi-feral?",
        options: [
          "Avançar rápido para pegar antes que ele fuja",
          "Olhar fixo nos olhos para demonstrar confiança",
          "Ir devagar, de lado, deixando o gato decidir se aproximar",
          "Gritar o nome do gato para que ele te reconheça",
        ],
        correctIndex: 2,
        question_en: "What's the right way to approach a semi-feral cat?",
        options_en: [
          "Move in fast to grab it before it flees",
          "Stare directly into its eyes to show confidence",
          "Go slowly, from the side, and let the cat decide to approach",
          "Call the cat's name loudly so it recognizes you",
        ],
      },
      {
        question: "Um filhote nascido de mãe socializada, exposto a humanos desde o início...",
        options: [
          "Sempre será feral por herança genética",
          "Tende a se tornar socializado com facilidade",
          "Nunca aceitará toque humano",
          "Só pode ser socializado por veterinários",
        ],
        correctIndex: 1,
        question_en: "A kitten born to a socialized mother, exposed to humans from the start...",
        options_en: [
          "Will always be feral due to genetics",
          "Tends to become socialized easily",
          "Will never accept human touch",
          "Can only be socialized by veterinarians",
        ],
      },
    ],
  },
  {
    id: "emergencias-saude",
    title: "Emergências e saúde",
    description: "O que fazer quando um gato está ferido ou doente?",
    icon: "🏥",
    passingScore: 3,
    title_en: "Emergencies and health",
    description_en: "What should you do when a cat is injured or sick?",
    questions: [
      {
        question: "Ao encontrar um gato ferido, qual é o primeiro passo?",
        options: [
          "Pegar o gato com as mãos e examinar os ferimentos",
          "Dar água e comida para repor as energias",
          "Observar de longe antes de tocar — animais feridos podem morder",
          "Ligar para o vizinho mais próximo",
        ],
        correctIndex: 2,
        question_en: "When you find an injured cat, what's the first step?",
        options_en: [
          "Pick the cat up with your hands and examine the wounds",
          "Give it water and food to restore its energy",
          "Watch from a distance before touching — injured animals can bite",
          "Call the nearest neighbor",
        ],
      },
      {
        question: "Por que não se deve dar leite de vaca para filhotes de gato?",
        options: [
          "O leite tem colesterol alto demais",
          "Filhotes não digerem lactose — causa diarreia e desidratação",
          "O leite deixa o pelo opaco",
          "Filhotes não gostam do sabor",
        ],
        correctIndex: 1,
        question_en: "Why shouldn't you give cow's milk to kittens?",
        options_en: [
          "The milk has too much cholesterol",
          "Kittens can't digest lactose — it causes diarrhea and dehydration",
          "The milk dulls their fur",
          "Kittens don't like the taste",
        ],
      },
      {
        question: "Suspeita de envenenamento de um gato da colônia. O que fazer?",
        options: [
          "Tentar provocar vômito em casa",
          "Dar água com açúcar para diluir o veneno",
          "Levar imediatamente ao veterinário sem tentar tratar em casa",
          "Esperar 24 horas para ver se o gato melhora sozinho",
        ],
        correctIndex: 2,
        question_en: "You suspect a colony cat has been poisoned. What should you do?",
        options_en: [
          "Try to induce vomiting at home",
          "Give it sugar water to dilute the poison",
          "Take it to a vet immediately without trying to treat it at home",
          "Wait 24 hours to see if the cat improves on its own",
        ],
      },
      {
        question: "Como transportar um gato ferido com segurança?",
        options: [
          "Segurá-lo no colo sem nada em volta",
          "Colocá-lo em caixa ventilada ou envolver numa toalha grossa",
          "Prendê-lo numa sacola plástica",
          "Amarrar com cordão para evitar que escape",
        ],
        correctIndex: 1,
        question_en: "How do you safely transport an injured cat?",
        options_en: [
          "Hold it in your arms with nothing around it",
          "Place it in a ventilated box or wrap it in a thick towel",
          "Put it in a plastic bag",
          "Tie it with string so it can't escape",
        ],
      },
    ],
  },
  {
    id: "direitos-lei",
    title: "Direitos e legislação",
    description: "O que a lei diz sobre gatos de rua no Brasil?",
    icon: "⚖️",
    passingScore: 3,
    title_en: "Rights and legislation",
    description_en: "What does the law say about street cats in Brazil?",
    questions: [
      {
        question: "A Lei Sansão (Lei 14.064/2020) prevê para quem maltrata cães e gatos:",
        options: [
          "Multa de R$ 500",
          "Advertência verbal na delegacia",
          "Pena de 2 a 5 anos de prisão",
          "Proibição de ter animais por 1 ano",
        ],
        correctIndex: 2,
        question_en: "Brazil's Sansão Law (Law 14.064/2020) provides, for those who abuse dogs and cats:",
        options_en: [
          "A fine of R$ 500",
          "A verbal warning at the police station",
          "2 to 5 years in prison",
          "A 1-year ban on owning animals",
        ],
      },
      {
        question: "Remover e abandonar gatos de rua em outro bairro é:",
        options: [
          "Permitido, desde que seja em área verde",
          "Crime de abandono de animal, sujeito à Lei Sansão",
          "Tolerado se houver muitos gatos no local original",
          "Legal se feito por prefeitura ou ONG",
        ],
        correctIndex: 1,
        question_en: "Removing and abandoning street cats in another neighborhood is:",
        options_en: [
          "Allowed, as long as it's in a green area",
          "The crime of animal abandonment, subject to the Sansão Law",
          "Tolerated if there are too many cats in the original spot",
          "Legal if done by a city government or NGO",
        ],
      },
      {
        question: "Onde denunciar maus-tratos a animais de forma anônima na maioria dos estados?",
        options: [
          "Somente presencialmente na delegacia",
          "Disque Denúncia 181",
          "Procon — 151",
          "Anvisa — 0800-642-9782",
        ],
        correctIndex: 1,
        question_en: "Where can you report animal abuse anonymously in most Brazilian states?",
        options_en: [
          "Only in person at a police station",
          "The 181 anonymous tip line",
          "Procon consumer hotline — 151",
          "Anvisa health agency — 0800-642-9782",
        ],
      },
      {
        question: "O método TNR (Captura, Castração, Devolução) é recomendado por qual organização internacional?",
        options: [
          "FIFA",
          "Organização Mundial da Saúde (OMS)",
          "Banco Mundial",
          "Cruz Vermelha Internacional",
        ],
        correctIndex: 1,
        question_en: "The TNR method (Trap, Neuter, Return) is recommended by which international organization?",
        options_en: [
          "FIFA",
          "World Health Organization (WHO)",
          "The World Bank",
          "International Red Cross",
        ],
      },
    ],
  },
];
