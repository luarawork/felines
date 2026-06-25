// Pool of real impact numbers shown on the home page, with a link to
// each source — rotated a few at a time instead of all shown at once,
// so the home page can grow this list without becoming a wall of stats.
export type QuickFact = {
  value: string;
  label: string;
  sourceLabel: string;
  sourceUrl: string;
};

export const QUICK_FACTS: QuickFact[] = [
  {
    value: "10 milhões",
    label: "de gatos de rua no Brasil",
    sourceLabel: "OMS",
    sourceUrl: "https://www.who.int/",
  },
  {
    value: "480 milhões",
    label: "de gatos de rua no mundo",
    sourceLabel: "World Animal Foundation",
    sourceUrl: "https://worldanimalfoundation.org/",
  },
  {
    value: "185 mil",
    label: "animais em ONGs — capacidade já esgotada",
    sourceLabel: "Instituto Pet Brasil",
    sourceUrl: "https://institutopetbrasil.com/",
  },
  {
    value: "40%",
    label: "dos brasileiros já tiveram conflito com vizinhos envolvendo animais",
    sourceLabel: "IBGE",
    sourceUrl: "https://www.ibge.gov.br/",
  },
  {
    value: "1 geração",
    label: "é o tempo para uma colônia totalmente castrada parar de crescer",
    sourceLabel: "OMS",
    sourceUrl: "https://www.who.int/",
  },
  {
    value: "1 a 2 anos",
    label: "é o tempo médio para a população de gatos voltar ao normal após remoção em massa",
    sourceLabel: "World Animal Foundation",
    sourceUrl: "https://worldanimalfoundation.org/",
  },
];
