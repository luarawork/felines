// Shared content source for /glossary. Kept separate from lib/articles.ts
// since terms are atomic definitions, not long-form content — but they
// link back to articles where one expands on the same idea.
export type GlossaryTerm = {
  term: string;
  definition: string;
  factChip?: string;
  relatedArticleSlugs?: string[];
};

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    term: "Gato de rua",
    definition:
      "Um gato que já foi doméstico (ou descende de um) e hoje vive ao ar livre, sem dono — mas pode tolerar contato humano em graus variados, dependendo de quanto convívio teve.",
    relatedArticleSlugs: ["por-que-existem-gatos-de-rua"],
  },
  {
    term: "Gato feral",
    definition:
      "Um gato nascido ao ar livre, com pouco ou nenhum contato humano — na prática, selvagem. Mantém distância, não mia pedindo atenção e foge ao menor sinal de aproximação.",
    factChip: "📊 Filhotes ferais têm uma janela de poucas semanas em que a socialização ainda é possível.",
    relatedArticleSlugs: ["feral-semi-feral-e-socializado", "how-to-approach-a-stray-cat"],
  },
  {
    term: "Colônia de gatos",
    definition:
      "Um grupo de gatos que vive de forma estável no mesmo território — um terreno, quintal ou praça — geralmente porque o lugar oferece comida, abrigo e ausência de predadores grandes.",
    relatedArticleSlugs: ["what-is-a-cat-colony"],
  },
  {
    term: "TNR",
    definition:
      "Trap-Neuter-Return (Captura-Castração-Devolução). O método recomendado pela Organização Mundial da Saúde para estabilizar de forma humanizada a população de gatos de rua: capturar, castrar e devolver ao mesmo território.",
    factChip: "📊 A OMS recomenda TNR como método preferencial de controle populacional de gatos de rua.",
    relatedArticleSlugs: ["what-is-tnr-and-why-it-works"],
  },
  {
    term: "Cuidador",
    definition:
      "Uma pessoa que regularmente alimenta, observa e advoga por uma colônia de gatos — sem precisar de processo de seleção ou formação técnica, só consistência.",
    relatedArticleSlugs: ["tornando-se-cuidador"],
  },
  {
    term: "Castração",
    definition:
      "Procedimento cirúrgico que impede um gato de se reproduzir. É a única intervenção com eficácia comprovada para estabilizar — e, com o tempo, reduzir — o tamanho de uma colônia.",
    relatedArticleSlugs: ["castracao-reduz-conflitos"],
  },
  {
    term: "Efeito vácuo",
    definition:
      "Quando gatos são removidos de um território, o espaço não fica vazio por muito tempo: comida e abrigo continuam ali, atraindo um grupo novo — geralmente maior e ainda não castrado. É por isso que remoção não resolve a longo prazo.",
    factChip: "📊 Cidades que tentaram remoção em massa viram a população voltar ao normal em 1 a 2 anos.",
    relatedArticleSlugs: ["why-removing-cats-doesnt-work"],
  },
  {
    term: "CCZ",
    definition:
      "Centro de Controle de Zoonoses. O órgão municipal responsável pelo controle de zoonoses, incluindo o manejo de animais de rua — geralmente o canal certo para surtos de doença ou orientação oficial.",
  },
  {
    term: "Gato comunitário",
    definition:
      "Um gato de rua ou feral que faz parte de uma colônia reconhecida pela vizinhança — o termo usado, inclusive em algumas legislações municipais, para diferenciar esses animais de gatos perdidos ou abandonados isoladamente.",
  },
  {
    term: "Lei 9.605/98",
    definition:
      "Lei federal brasileira que criminaliza maus-tratos contra animais — agressão física, envenenamento, privação extrema de comida ou água, abandono, e qualquer ato que cause sofrimento evitável.",
    relatedArticleSlugs: ["how-to-report-animal-abuse"],
  },
  {
    term: "Lei Sansão (14.064/2020)",
    definition:
      "Lei brasileira que aumentou as penas para maus-tratos contra cães e gatos especificamente, prevendo de 2 a 5 anos de prisão.",
    factChip: "📊 A Lei Sansão prevê pena de 2 a 5 anos de prisão para maus-tratos a cães e gatos.",
    relatedArticleSlugs: ["how-to-report-animal-abuse"],
  },
];
