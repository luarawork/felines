// Short, fun cat facts shown by the floating cat assistant
// (components/FelinesAssistant.tsx). Each entry is bilingual so the
// assistant can read the visitor's current language directly, the same
// way the rest of the app's static content is translated.
export type CatCuriosity = {
  id: string;
  label_pt: string;
  label_en: string;
  message_pt: string;
  message_en: string;
};

export const catCuriosities: CatCuriosity[] = [
  {
    id: "meow",
    label_pt: "Você sabia?",
    label_en: "Did you know?",
    message_pt:
      "Gatos adultos quase não miam uns para os outros — o miado é uma linguagem que eles desenvolveram quase só para se comunicar com humanos.",
    message_en:
      "Adult cats barely meow at each other — meowing is a language they developed almost exclusively to communicate with humans.",
  },
  {
    id: "clowder",
    label_pt: "Você sabia?",
    label_en: "Did you know?",
    message_pt:
      "Um grupo de gatos tem nome: em inglês se chama \"clowder\". Em uma colônia, esse grupo geralmente é formado por fêmeas aparentadas.",
    message_en:
      "A group of cats has a name: a \"clowder\". In a colony, that group is usually made up of related females.",
  },
  {
    id: "sounds",
    label_pt: "Você sabia?",
    label_en: "Did you know?",
    message_pt:
      "Gatos conseguem fazer mais de 100 sons diferentes — cães ficam com cerca de 10. Cada colônia tem, literalmente, seu próprio dialeto.",
    message_en:
      "Cats can make over 100 different sounds — dogs manage about 10. Every colony literally has its own dialect.",
  },
  {
    id: "cheeks",
    label_pt: "Você sabia?",
    label_en: "Did you know?",
    message_pt:
      "Quando um gato esfrega a bochecha em você, ele está deixando um cheiro que diz \"esse humano é meu\". É um dos maiores elogios que ele pode fazer.",
    message_en:
      "When a cat rubs its cheek on you, it's leaving a scent that says \"this human is mine\". It's one of the highest compliments a cat can give.",
  },
  {
    id: "domestication",
    label_pt: "Você sabia?",
    label_en: "Did you know?",
    message_pt:
      "Diferente de outros animais domésticos, ninguém domesticou o gato — eles escolheram viver perto de humanos, atraídos pelos roedores nos primeiros celeiros de grãos.",
    message_en:
      "Unlike most domestic animals, no one domesticated the cat — they chose to live near humans, drawn in by the rodents in the earliest grain stores.",
  },
  {
    id: "purr",
    label_pt: "Você sabia?",
    label_en: "Did you know?",
    message_pt:
      "O ronronar dos gatos vibra numa frequência entre 25 e 150 Hz — uma faixa associada, em estudos, à cicatrização de ossos e tecidos.",
    message_en:
      "A cat's purr vibrates at a frequency between 25 and 150 Hz — a range studies have associated with bone and tissue healing.",
  },
  {
    id: "whiskers",
    label_pt: "Você sabia?",
    label_en: "Did you know?",
    message_pt:
      "Os bigodes de um gato são, em geral, tão largos quanto o corpo dele — é assim que ele sabe, sem olhar, se cabe por um vão.",
    message_en:
      "A cat's whiskers are usually about as wide as its body — that's how it knows, without looking, whether it fits through a gap.",
  },
  {
    id: "sleep",
    label_pt: "Você sabia?",
    label_en: "Did you know?",
    message_pt:
      "Gatos dormem entre 12 e 16 horas por dia. Não é preguiça: é economia de energia herdada de quando cada caçada exigia um gasto enorme.",
    message_en:
      "Cats sleep 12 to 16 hours a day. It's not laziness — it's energy conservation inherited from a time when every hunt cost a lot of energy.",
  },
];

export function getCuriosityById(id: string): CatCuriosity | undefined {
  return catCuriosities.find((c) => c.id === id);
}

export function getRandomCuriosity(exclude: string[] = []): CatCuriosity {
  const available = catCuriosities.filter((c) => !exclude.includes(c.id));
  const pool = available.length > 0 ? available : catCuriosities;
  return pool[Math.floor(Math.random() * pool.length)];
}
