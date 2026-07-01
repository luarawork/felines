// Courses and quizzes for the profile page quiz section.
// Each quiz is self-contained with questions and a passing score.
// "Cuidador Preparado" is the main course (linked to 5 learn articles).
// Additional quizzes cover identification, emergencies, and law.

export type CourseModule = {
  order: number;
  articleSlug: string;
  title: string;
  duration: string;
};

export const COURSE_MODULES: CourseModule[] = [
  {
    order: 1,
    articleSlug: "what-is-a-cat-colony",
    title: "O que é uma colônia de gatos",
    duration: "~3 min",
  },
  {
    order: 2,
    articleSlug: "castracao-reduz-conflitos",
    title: "Por que a castração resolve conflitos",
    duration: "~2 min",
  },
  {
    order: 3,
    articleSlug: "what-is-tnr-and-why-it-works",
    title: "O método TNR",
    duration: "~3 min",
  },
  {
    order: 4,
    articleSlug: "how-to-approach-a-stray-cat",
    title: "Como se aproximar de um gato de rua",
    duration: "~3 min",
  },
  {
    order: 5,
    articleSlug: "tornando-se-cuidador",
    title: "O que ninguém te conta antes de virar cuidador",
    duration: "~2 min",
  },
];

export type CourseQuestion = {
  question: string;
  options: string[];
  correctIndex: number;
};

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
};

export const STANDALONE_QUIZZES: StandaloneQuiz[] = [
  {
    id: "identificacao-felinos",
    title: "Identificação de felinos",
    description: "Feral, semi-feral ou socializado? Você sabe diferenciar?",
    icon: "🐱",
    passingScore: 3,
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
      },
    ],
  },
  {
    id: "emergencias-saude",
    title: "Emergências e saúde",
    description: "O que fazer quando um gato está ferido ou doente?",
    icon: "🏥",
    passingScore: 3,
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
      },
    ],
  },
  {
    id: "direitos-lei",
    title: "Direitos e legislação",
    description: "O que a lei diz sobre gatos de rua no Brasil?",
    icon: "⚖️",
    passingScore: 3,
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
      },
    ],
  },
];
