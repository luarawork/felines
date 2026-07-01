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
  {
    term: "Gato semi-feral",
    definition:
      "Um gato no meio do caminho entre feral e socializado: tolera a presença de quem cuida dele regularmente, mas mantém distância de estranhos e raramente aceita contato físico.",
    relatedArticleSlugs: ["feral-semi-feral-e-socializado"],
  },
  {
    term: "Socialização",
    definition:
      "O processo de acostumar um gato (geralmente filhote) ao contato humano. Depende de exposição gradual e positiva numa janela de tempo limitada — depois dela, fica muito mais difícil.",
  },
  {
    term: "Manejo populacional",
    definition:
      "Conjunto de práticas (castração, alimentação controlada, monitoramento) usadas para manter uma colônia estável e saudável ao longo do tempo, em vez de deixá-la crescer sem controle ou tentar removê-la.",
  },
  {
    term: "Censo de colônia",
    definition:
      "Contagem periódica de quantos gatos vivem numa colônia, quantos já foram castrados e quantos são novos — usada para acompanhar a evolução do grupo e planejar próximas castrações.",
  },
  {
    term: "Filhote órfão",
    definition:
      "Um filhote sem a mãe por perto, seja por abandono real ou porque ela está temporariamente caçando comida. Antes de intervir, vale observar de longe por algumas horas para confirmar que ela não vai voltar.",
    relatedArticleSlugs: ["found-a-kitten-alone"],
  },
  {
    term: "Microchipagem",
    definition:
      "Implante de um chip subcutâneo com um código de identificação único, usado para recuperar gatos perdidos ou comprovar a propriedade de um animal.",
  },
  {
    term: "Ponta de orelha cortada (ear tip)",
    definition:
      "Um corte reto e pequeno na ponta de uma das orelhas, feito durante a cirurgia de castração — sinal visual universal de que aquele gato já foi castrado, mesmo de longe.",
    relatedArticleSlugs: ["castracao-reduz-conflitos"],
  },
  {
    term: "Zoonose",
    definition:
      "Doença que pode ser transmitida de animais para humanos (ou vice-versa) — raiva e toxoplasmose são exemplos relevantes para quem cuida de gatos de rua.",
  },
  {
    term: "Abandono de animal",
    definition:
      "Deixar um animal doméstico à própria sorte, sem dar continuidade aos cuidados básicos — é crime previsto na Lei 9.605/98, no mesmo nível que outras formas de maus-tratos.",
    relatedArticleSlugs: ["how-to-report-animal-abuse"],
  },
  {
    term: "Adestramento territorial",
    definition:
      "O comportamento natural de gatos de marcar e defender um território — explica por que remover um grupo de gatos de um lugar costuma só abrir espaço pra outro grupo (veja Efeito vácuo).",
  },
  {
    term: "Abrigo improvisado",
    definition:
      "Estrutura simples (caixa de isopor, casinha de madeira) montada para proteger gatos de rua do frio, calor ou chuva — uma das formas mais baratas e eficazes de ajudar uma colônia.",
  },
];
