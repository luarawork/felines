// Shared content source for /glossary. Kept separate from lib/articles.ts
// since terms are atomic definitions, not long-form content — but they
// link back to articles where one expands on the same idea.
export type GlossaryTerm = {
  term: string;
  definition: string;
  factChip?: string;
  relatedArticleSlugs?: string[];
  term_en?: string;
  definition_en?: string;
  factChip_en?: string;
};

// Picks the English variant fields when language is "en", falling back to
// the Portuguese originals otherwise (and if an _en field is missing).
export function localizeGlossaryTerm(entry: GlossaryTerm, language: "pt" | "en"): GlossaryTerm {
  if (language !== "en") return entry;
  return {
    ...entry,
    term: entry.term_en ?? entry.term,
    definition: entry.definition_en ?? entry.definition,
    factChip: entry.factChip_en ?? entry.factChip,
  };
}

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    term: "Gato de rua",
    definition:
      "Um gato que já foi doméstico (ou descende de um) e hoje vive ao ar livre, sem dono — mas pode tolerar contato humano em graus variados, dependendo de quanto convívio teve.",
    relatedArticleSlugs: ["por-que-existem-gatos-de-rua"],
    term_en: "Street cat",
    definition_en:
      "A cat that was once domestic (or descends from one) and now lives outdoors without an owner — but may tolerate human contact to varying degrees, depending on how much exposure it's had.",
  },
  {
    term: "Gato feral",
    definition:
      "Um gato nascido ao ar livre, com pouco ou nenhum contato humano — na prática, selvagem. Mantém distância, não mia pedindo atenção e foge ao menor sinal de aproximação.",
    factChip: "📊 Filhotes ferais têm uma janela de poucas semanas em que a socialização ainda é possível.",
    relatedArticleSlugs: ["feral-semi-feral-e-socializado", "how-to-approach-a-stray-cat"],
    term_en: "Feral cat",
    definition_en:
      "A cat born outdoors with little or no human contact — essentially wild. Keeps its distance, doesn't meow for attention, and flees at the slightest sign of approach.",
    factChip_en: "📊 Feral kittens have a window of a few weeks in which socialization is still possible.",
  },
  {
    term: "Colônia de gatos",
    definition:
      "Um grupo de gatos que vive de forma estável no mesmo território — um terreno, quintal ou praça — geralmente porque o lugar oferece comida, abrigo e ausência de predadores grandes.",
    relatedArticleSlugs: ["what-is-a-cat-colony"],
    term_en: "Cat colony",
    definition_en:
      "A group of cats that lives stably in the same territory — a lot, a backyard, or a square — usually because the place offers food, shelter, and no large predators.",
  },
  {
    term: "TNR",
    definition:
      "Trap-Neuter-Return (Captura-Castração-Devolução). O método recomendado pela Organização Mundial da Saúde para estabilizar de forma humanizada a população de gatos de rua: capturar, castrar e devolver ao mesmo território.",
    factChip: "📊 A OMS recomenda TNR como método preferencial de controle populacional de gatos de rua.",
    relatedArticleSlugs: ["what-is-tnr-and-why-it-works"],
    term_en: "TNR",
    definition_en:
      "Trap-Neuter-Return. The method recommended by the World Health Organization to humanely stabilize the street cat population: trap, neuter, and return to the same territory.",
    factChip_en: "📊 The WHO recommends TNR as the preferred method for controlling street cat populations.",
  },
  {
    term: "Cuidador",
    definition:
      "Uma pessoa que regularmente alimenta, observa e advoga por uma colônia de gatos — sem precisar de processo de seleção ou formação técnica, só consistência.",
    relatedArticleSlugs: ["tornando-se-cuidador"],
    term_en: "Caretaker",
    definition_en:
      "A person who regularly feeds, monitors, and advocates for a cat colony — no selection process or technical training needed, just consistency.",
  },
  {
    term: "Castração",
    definition:
      "Procedimento cirúrgico que impede um gato de se reproduzir. É a única intervenção com eficácia comprovada para estabilizar — e, com o tempo, reduzir — o tamanho de uma colônia.",
    relatedArticleSlugs: ["castracao-reduz-conflitos"],
    term_en: "Neutering",
    definition_en:
      "A surgical procedure that prevents a cat from reproducing. It's the only intervention proven effective at stabilizing — and, over time, reducing — the size of a colony.",
  },
  {
    term: "Efeito vácuo",
    definition:
      "Quando gatos são removidos de um território, o espaço não fica vazio por muito tempo: comida e abrigo continuam ali, atraindo um grupo novo — geralmente maior e ainda não castrado. É por isso que remoção não resolve a longo prazo.",
    factChip: "📊 Cidades que tentaram remoção em massa viram a população voltar ao normal em 1 a 2 anos.",
    relatedArticleSlugs: ["why-removing-cats-doesnt-work"],
    term_en: "Vacuum effect",
    definition_en:
      "When cats are removed from a territory, the space doesn't stay empty for long: food and shelter are still there, attracting a new group — usually bigger and still unneutered. That's why removal doesn't solve anything long-term.",
    factChip_en: "📊 Cities that tried mass removal saw the population return to normal within 1 to 2 years.",
  },
  {
    term: "CCZ",
    definition:
      "Centro de Controle de Zoonoses. O órgão municipal responsável pelo controle de zoonoses, incluindo o manejo de animais de rua — geralmente o canal certo para surtos de doença ou orientação oficial.",
    term_en: "Zoonosis Control Center",
    definition_en:
      "The municipal agency responsible for zoonosis control, including the management of street animals — usually the right channel for disease outbreaks or official guidance.",
  },
  {
    term: "Gato comunitário",
    definition:
      "Um gato de rua ou feral que faz parte de uma colônia reconhecida pela vizinhança — o termo usado, inclusive em algumas legislações municipais, para diferenciar esses animais de gatos perdidos ou abandonados isoladamente.",
    term_en: "Community cat",
    definition_en:
      "A street or feral cat that's part of a colony recognized by the neighborhood — a term used, including in some local ordinances, to distinguish these animals from cats that are simply lost or abandoned individually.",
  },
  {
    term: "Lei 9.605/98",
    definition:
      "Lei federal brasileira que criminaliza maus-tratos contra animais — agressão física, envenenamento, privação extrema de comida ou água, abandono, e qualquer ato que cause sofrimento evitável.",
    relatedArticleSlugs: ["how-to-report-animal-abuse"],
    term_en: "Federal Law 9.605/98",
    definition_en:
      "Brazilian federal law that criminalizes animal abuse — physical assault, poisoning, extreme deprivation of food or water, abandonment, and any act causing avoidable suffering.",
  },
  {
    term: "Lei Sansão (14.064/2020)",
    definition:
      "Lei brasileira que aumentou as penas para maus-tratos contra cães e gatos especificamente, prevendo de 2 a 5 anos de prisão.",
    factChip: "📊 A Lei Sansão prevê pena de 2 a 5 anos de prisão para maus-tratos a cães e gatos.",
    relatedArticleSlugs: ["how-to-report-animal-abuse"],
    term_en: "\"Sansão\" Law (14.064/2020)",
    definition_en:
      "Brazilian law that increased penalties specifically for abuse of dogs and cats, providing for 2 to 5 years in prison.",
    factChip_en: "📊 The \"Sansão\" Law provides for 2 to 5 years in prison for abuse of dogs and cats.",
  },
  {
    term: "Gato semi-feral",
    definition:
      "Um gato no meio do caminho entre feral e socializado: tolera a presença de quem cuida dele regularmente, mas mantém distância de estranhos e raramente aceita contato físico.",
    relatedArticleSlugs: ["feral-semi-feral-e-socializado"],
    term_en: "Semi-feral cat",
    definition_en:
      "A cat somewhere between feral and socialized: tolerates the presence of whoever cares for it regularly, but keeps its distance from strangers and rarely accepts physical contact.",
  },
  {
    term: "Socialização",
    definition:
      "O processo de acostumar um gato (geralmente filhote) ao contato humano. Depende de exposição gradual e positiva numa janela de tempo limitada — depois dela, fica muito mais difícil.",
    term_en: "Socialization",
    definition_en:
      "The process of getting a cat (usually a kitten) used to human contact. It depends on gradual, positive exposure within a limited time window — after which it becomes much harder.",
  },
  {
    term: "Manejo populacional",
    definition:
      "Conjunto de práticas (castração, alimentação controlada, monitoramento) usadas para manter uma colônia estável e saudável ao longo do tempo, em vez de deixá-la crescer sem controle ou tentar removê-la.",
    term_en: "Population management",
    definition_en:
      "A set of practices (neutering, controlled feeding, monitoring) used to keep a colony stable and healthy over time, instead of letting it grow unchecked or trying to remove it.",
  },
  {
    term: "Censo de colônia",
    definition:
      "Contagem periódica de quantos gatos vivem numa colônia, quantos já foram castrados e quantos são novos — usada para acompanhar a evolução do grupo e planejar próximas castrações.",
    term_en: "Colony census",
    definition_en:
      "A periodic count of how many cats live in a colony, how many are already neutered, and how many are new — used to track the group's evolution and plan future neutering rounds.",
  },
  {
    term: "Filhote órfão",
    definition:
      "Um filhote sem a mãe por perto, seja por abandono real ou porque ela está temporariamente caçando comida. Antes de intervir, vale observar de longe por algumas horas para confirmar que ela não vai voltar.",
    relatedArticleSlugs: ["found-a-kitten-alone"],
    term_en: "Orphaned kitten",
    definition_en:
      "A kitten without its mother nearby, whether from real abandonment or because she's temporarily out hunting for food. Before intervening, it's worth watching from a distance for a few hours to confirm she won't return.",
  },
  {
    term: "Microchipagem",
    definition:
      "Implante de um chip subcutâneo com um código de identificação único, usado para recuperar gatos perdidos ou comprovar a propriedade de um animal.",
    term_en: "Microchipping",
    definition_en:
      "The implantation of a subcutaneous chip with a unique identification code, used to recover lost cats or prove ownership of an animal.",
  },
  {
    term: "Ponta de orelha cortada (ear tip)",
    definition:
      "Um corte reto e pequeno na ponta de uma das orelhas, feito durante a cirurgia de castração — sinal visual universal de que aquele gato já foi castrado, mesmo de longe.",
    relatedArticleSlugs: ["castracao-reduz-conflitos"],
    term_en: "Ear-tip",
    definition_en:
      "A small, straight cut at the tip of one ear, made during neutering surgery — a universal visual sign that a cat has already been neutered, even from a distance.",
  },
  {
    term: "Zoonose",
    definition:
      "Doença que pode ser transmitida de animais para humanos (ou vice-versa) — raiva e toxoplasmose são exemplos relevantes para quem cuida de gatos de rua.",
    term_en: "Zoonosis",
    definition_en:
      "A disease that can be transmitted from animals to humans (or vice versa) — rabies and toxoplasmosis are relevant examples for anyone caring for street cats.",
  },
  {
    term: "Abandono de animal",
    definition:
      "Deixar um animal doméstico à própria sorte, sem dar continuidade aos cuidados básicos — é crime previsto na Lei 9.605/98, no mesmo nível que outras formas de maus-tratos.",
    relatedArticleSlugs: ["how-to-report-animal-abuse"],
    term_en: "Animal abandonment",
    definition_en:
      "Leaving a domestic animal to fend for itself, without continuing basic care — a crime under Federal Law 9.605/98, at the same level as other forms of abuse.",
  },
  {
    term: "Adestramento territorial",
    definition:
      "O comportamento natural de gatos de marcar e defender um território — explica por que remover um grupo de gatos de um lugar costuma só abrir espaço pra outro grupo (veja Efeito vácuo).",
    term_en: "Territorial behavior",
    definition_en:
      "The natural behavior of cats marking and defending a territory — it explains why removing a group of cats from a place usually just opens space for another group (see Vacuum effect).",
  },
  {
    term: "Abrigo improvisado",
    definition:
      "Estrutura simples (caixa de isopor, casinha de madeira) montada para proteger gatos de rua do frio, calor ou chuva — uma das formas mais baratas e eficazes de ajudar uma colônia.",
    term_en: "Improvised shelter",
    definition_en:
      "A simple structure (a styrofoam box, a small wooden house) built to protect street cats from cold, heat, or rain — one of the cheapest and most effective ways to help a colony.",
  },
];
