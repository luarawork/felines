// Shared content source for the Felines educational guide.
// Defines the static articles used by /learn and /learn/:slug. Keeping
// the content here (instead of hardcoded in pages) makes it easy to add
// new articles and to compute related-article links by level.
export type ArticleLevel = 1 | 2 | 3;

export type Article = {
  slug: string;
  level: ArticleLevel;
  title: string;
  summary: string;
  body: string[];
};

export const ARTICLES: Article[] = [
  {
    slug: "por-que-existem-gatos-de-rua",
    level: 1,
    title: "Por que existem gatos de rua na minha vizinhança?",
    summary:
      "Entenda como colônias de gatos se formam e por que elas tendem a voltar mesmo depois de removidas.",
    body: [
      "Gatos de rua se organizam em colônias porque encontram território, comida e abrigo em um determinado local — geralmente perto de onde há descarte de lixo, terrenos vazios ou pessoas que alimentam.",
      "Remover os gatos de uma área sem resolver a causa (comida disponível, abrigo) costuma abrir espaço para que outra colônia ocupe o mesmo território rapidamente.",
      "A forma mais eficaz de reduzir o número de gatos de rua a longo prazo é a castração, não a remoção.",
    ],
  },
  {
    slug: "castracao-reduz-conflitos",
    level: 1,
    title: "Como a castração reduz conflitos com a vizinhança",
    summary:
      "Brigas, miados altos e cheiro forte de urina têm uma causa comum: gatos não castrados.",
    body: [
      "Gatos não castrados marcam território com urina de cheiro forte e brigam com frequência por fêmeas — isso é a maior fonte de reclamações da vizinhança.",
      "Depois da castração, o comportamento territorial cai drasticamente em poucas semanas, e a colônia para de crescer.",
      "Colônias castradas tendem a ser mais estáveis, silenciosas e fáceis de conviver com a comunidade ao redor.",
    ],
  },
  {
    slug: "como-ajudar-sem-adotar",
    level: 2,
    title: "Como ajudar uma colônia sem precisar adotar nenhum gato",
    summary:
      "Você não precisa amar gatos para ser parte da solução — pequenas ações já fazem diferença.",
    body: [
      "Reportar problemas (gatos feridos, filhotes sozinhos, suspeita de maus-tratos) pelo Felines já ajuda os cuidadores a agir mais rápido.",
      "Apoiar financeiramente ou com ração os cuidadores já existentes da sua região tem mais impacto do que tentar cuidar sozinho.",
      "Indicar clínicas de castração popular ou campanhas de castração gratuita para os cuidadores da sua região é uma forma simples de contribuir.",
    ],
  },
  {
    slug: "o-que-fazer-ao-encontrar-filhotes",
    level: 2,
    title: "O que fazer ao encontrar filhotes sozinhos",
    summary: "Nem todo filhote sozinho está abandonado — saiba quando agir e quando esperar.",
    body: [
      "A mãe geralmente sai para caçar comida e volta poucas horas depois — observe de longe antes de intervir.",
      "Só intervenha se os filhotes estiverem visivelmente doentes, feridos, muito frios ou em perigo imediato (via movimentada, por exemplo).",
      "Se precisar remover os filhotes, contate uma ONG ou cuidador experiente antes — cuidados neonatais exigem conhecimento específico.",
    ],
  },
  {
    slug: "tornando-se-cuidador",
    level: 3,
    title: "O que significa se tornar cuidador de uma colônia",
    summary: "Cuidar de uma colônia é um compromisso de longo prazo — entenda o que esperar.",
    body: [
      "Um cuidador garante alimentação regular, observa a saúde dos gatos e organiza a castração da colônia ao longo do tempo.",
      "Cuidadores costumam deixar uma 'carta' para o próximo cuidador, com o histórico da colônia, hábitos dos gatos e contatos úteis.",
      "Você pode se tornar cuidador de qualquer colônia já mapeada no Felines a partir da página da colônia.",
    ],
  },
];

export function getArticleBySlug(slug: string): Article | undefined {
  return ARTICLES.find((article) => article.slug === slug);
}
