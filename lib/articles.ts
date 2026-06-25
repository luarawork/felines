// Shared content source for the Felines educational guide.
// Defines the static articles used by /learn and /learn/:slug. Keeping
// the content here (instead of hardcoded in pages) makes it easy to add
// new articles and to compute related-article links and reading time.
export type ArticleLevel = 1 | 2 | 3 | 4 | 5;

export type Article = {
  slug: string;
  level: ArticleLevel;
  title: string;
  summary: string;
  body: string[];
  factChips?: string[];
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
    slug: "why-removing-cats-doesnt-work",
    level: 1,
    title: "Por que remover os gatos não resolve nada",
    summary:
      "Cidades no mundo todo já tentaram remover colônias inteiras — e o problema sempre voltou. Entenda por quê.",
    body: [
      "Quando uma colônia é removida de um território, ele não fica vazio por muito tempo. Comida, abrigo e ausência de predadores continuam atraindo novos gatos — esse fenômeno é chamado de 'efeito vácuo'.",
      "Em poucos meses, um território esvaziado costuma ser ocupado por outra colônia, muitas vezes maior e menos estável do que a anterior, porque os gatos recém-chegados ainda não estão castrados nem habituados ao local.",
      "Cidades como Roma, Istambul e diversas cidades americanas tentaram programas de remoção em massa ao longo do século 20. Em todas elas, a população de gatos de rua voltou a crescer dentro de 1 a 2 anos.",
      "O único método que realmente reduz a população de gatos de rua de forma duradoura é a castração em massa — conhecida como TNR (Trap-Neuter-Return, ou Captura-Castração-Devolução). Sem fêmeas fertéis, a colônia para de crescer e diminui naturalmente ao longo dos anos.",
    ],
    factChips: [
      "📊 Cidades que tentaram remoção em massa viram a população voltar ao normal em 1 a 2 anos",
      "📊 TNR é o método recomendado pela Organização Mundial da Saúde para controle populacional de gatos de rua",
    ],
  },
  {
    slug: "what-is-tnr-and-why-it-works",
    level: 1,
    title: "O que é TNR e por que funciona",
    summary:
      "Captura, Castração, Devolução — o método mais simples e eficaz para estabilizar uma colônia.",
    body: [
      "TNR significa Trap-Neuter-Return: capturar os gatos da colônia, castrá-los em uma clínica veterinária e devolvê-los ao mesmo território de onde vieram.",
      "Diferente da remoção, o TNR mantém o território ocupado pelos gatos que já estão lá — só que agora incapazes de se reproduzir. Isso evita o efeito vácuo, já que não há espaço vazio para novos gatos ocuparem.",
      "Com o tempo, a colônia para de crescer, as brigas territoriais diminuem, o comportamento de marcação com urina cai bastante, e a população existente naturalmente diminui ao longo dos anos.",
      "A Organização Mundial da Saúde (OMS) recomenda o TNR como o método mais eficaz e humano de controle populacional de gatos de rua, em comparação com remoção ou eliminação.",
      "Na prática, isso significa que qualquer pessoa pode ajudar: identificar uma colônia, viabilizar a castração junto a uma clínica ou campanha popular, e devolver os gatos ao mesmo lugar depois da recuperação.",
    ],
    factChips: [
      "📊 A OMS recomenda TNR como método preferencial de controle populacional de gatos de rua",
      "📊 Uma colônia totalmente castrada para de crescer dentro de uma geração",
    ],
  },
  {
    slug: "how-to-approach-a-stray-cat",
    level: 2,
    title: "Como se aproximar de um gato de rua com segurança",
    summary:
      "Aproximação errada assusta o gato e pode resultar em mordida ou arranhão. Veja como fazer certo.",
    body: [
      "Nem todo gato de rua quer ou precisa de aproximação humana. Antes de se aproximar, observe: o gato está calmo, comendo, ou claramente em alerta e pronto para fugir?",
      "Se decidir se aproximar, faça isso devagar, de lado (nunca de frente, o que parece ameaçador para um gato), evitando contato visual direto e prolongado.",
      "Abaixe-se para ficar na altura do gato em vez de se inclinar por cima dele — isso reduz a sensação de ameaça. Estenda a mão devagar e deixe o gato decidir se aproximar de você, em vez de avançar sobre ele.",
      "Gatos ferais (nunca socializados com humanos) mantêm distância, não miam pedindo atenção e fogem ao menor movimento brusco. Gatos socializados ou semi-domesticados costumam miar, se aproximar sozinhos e tolerar mais contato.",
      "Nunca persiga, agarre ou encurrale um gato de rua — mesmo gatos socializados podem morder ou arranhar por medo quando se sentem sem rota de fuga.",
    ],
  },
  {
    slug: "how-to-report-animal-abuse",
    level: 3,
    title: "Como denunciar maus-tratos a animais",
    summary:
      "Maus-tratos a animais são crime no Brasil. Saiba o que documentar e para quem denunciar.",
    body: [
      "Maus-tratos a animais são crime previsto na Lei 9.605/98 (Lei de Crimes Ambientais) e foram endurecidos pela Lei Sansão (Lei 14.064/2020), que aumentou as penas para abuso e maus-tratos de cães e gatos.",
      "Conta como maus-tratos: agressão física, envenenamento, privação extrema de comida ou água, abandono, e qualquer ato que cause sofrimento evitável ao animal.",
      "Antes de denunciar, documente o máximo possível: fotos e vídeos com data visível, localização exata (endereço ou coordenadas), horário aproximado dos fatos, e qualquer testemunha disposta a confirmar o que viu.",
      "Você pode denunciar de forma anônima pelo Disque Denúncia 181, disponível na maioria dos estados brasileiros. Para flagrante ou risco imediato ao animal, ligue para a Polícia Militar pelo 190.",
      "Você também pode registrar um boletim de ocorrência na Polícia Civil, o que costuma ser necessário para que o caso avance como investigação formal.",
      "Depois de denunciar, o caso normalmente é investigado pela polícia ambiental ou civil. Nem todo caso resulta em prisão imediata, mas o registro formal cria histórico — importante mesmo que a resposta pareça lenta.",
    ],
    factChips: [
      "📊 A Lei Sansão (14.064/2020) prevê pena de 2 a 5 anos de prisão para maus-tratos a cães e gatos",
      "📊 O Disque Denúncia 181 aceita denúncias anônimas em quase todos os estados",
    ],
  },
  {
    slug: "found-a-kitten-alone",
    level: 2,
    title: "Encontrei um filhote sozinho — e agora?",
    summary:
      "A regra mais importante: espere e observe antes de agir. Nem todo filhote sozinho está abandonado.",
    body: [
      "A regra mais importante quando você encontra um filhote aparentemente sozinho é: espere e observe antes de intervir. A mãe gata geralmente está por perto, caçando comida, e pode levar horas para voltar.",
      "Observe de uma distância segura por pelo menos 2 a 4 horas (ou até o anoitecer, se for de manhã) antes de qualquer ação. Filhotes que parecem limpos, aquecidos e calmos provavelmente estão sendo cuidados normalmente.",
      "Sinais de que o filhote realmente precisa de ajuda imediata: está muito frio ao toque, chorando sem parar, sujo ou magro, com os olhos ainda fechados (menos de 2 semanas) e claramente sem nenhum adulto por perto há muitas horas.",
      "Se a intervenção for necessária, mantenha o filhote aquecido (toalha, não direto no corpo) e procure orientação de uma ONG ou veterinário antes de tentar alimentá-lo — filhotes muito jovens têm necessidades nutricionais específicas.",
      "Nunca dê leite de vaca a um filhote — ele não consegue digerir a lactose do leite de vaca, e isso pode causar diarreia grave e desidratação. Se precisar alimentar antes de conseguir orientação profissional, use apenas fórmula específica para filhotes de gato.",
      "Não leve o filhote para casa imediatamente só porque ele parece sozinho. Retirar um filhote saudável da mãe sem necessidade reduz drasticamente suas chances de sobrevivência comparado ao cuidado materno natural.",
    ],
    factChips: [
      "📊 A maioria dos 'filhotes abandonados' tem a mãe por perto, caçando comida",
      "📊 Leite de vaca causa diarreia em filhotes — eles não digerem lactose",
    ],
  },
  {
    slug: "found-injured-cat-step-by-step",
    level: 3,
    title: "Gato ferido: o que fazer, passo a passo",
    summary:
      "Cinco passos simples para ajudar um gato ferido sem se machucar ou piorar a situação dele.",
    body: [
      "Passo 1 — Avalie de longe: o gato está consciente e reagindo a estímulos (som, movimento)? Animais feridos podem morder ou arranhar por dor e medo, mesmo que normalmente sejam dóceis. Não toque ainda.",
      "Passo 2 — Se for seguro, contenha com cuidado: use uma caixa de papelão com furos de ventilação ou uma toalha grossa para envolver o gato, nunca as mãos descobertas. Cubrir a cabeça suavemente com a toalha tende a calmar o animal durante o transporte.",
      "Passo 3 — Mantenha aquecido e em silêncio: gatos feridos perdem temperatura corporal rapidamente. Mantenha-o em um ambiente quieto, sem luz forte ou ruído, durante o transporte.",
      "Passo 4 — Procure o veterinário ou abrigo mais próximo: ligue antes se possível, avisando o tipo de ferimento, para que a equipe já se prepare. Muitas cidades têm clínicas populares ou ONGs com atendimento de urgência gratuito ou de baixo custo.",
      "Passo 5 — Não dê comida, água ou qualquer medicamento por conta própria: isso pode complicar uma anestesia necessária ou mascarar sintomas importantes para o diagnóstico veterinário.",
    ],
  },
  {
    slug: "cats-bothering-your-building",
    level: 4,
    title: "Gatos incomodando seu prédio ou rua — o que realmente funciona",
    summary:
      "Cheiro, barulho e arranhões são problemas reais. Remover os gatos não resolve — veja o que resolve de fato.",
    body: [
      "Primeiro, reconhecendo o problema: cheiro de urina, miados durante a noite, arranhões em superfícies e brigas territoriais são incômodos reais, não imaginação de quem reclama. Ignorar isso não ajuda ninguém, nem os gatos.",
      "A reação mais comum — tentar remover os gatos do local — não funciona a longo prazo. Como explicamos no artigo sobre o efeito vácuo, território vazio atrai novos gatos rapidamente, e o ciclo de incômodo só se repete com uma colônia nova e ainda não castrada.",
      "O que funciona de fato é a combinação de castração (TNR) com manejo de alimentação: gatos castrados marcam território muito menos, brigam muito menos e a colônia para de crescer. Alimentação controlada (horário e local fixos, sem sobra de comida exposta) reduz atração de pragas e mau cheiro.",
      "Procure descobrir se já existe um cuidador responsável pela colônia da sua região — você pode verificar no mapa do Felines. Conversar diretamente com essa pessoa é, na maioria das vezes, mais eficaz do que reclamar para a administração do prédio.",
      "Para pontos específicos onde os gatos não devem ficar (um corredor, uma varanda), dispositivos repelentes ativados por movimento (ultrassom ou jato de água) são uma forma humanizada de afastar os gatos sem fazer mal a eles, sem afetar o restante da colônia.",
    ],
    factChips: [
      "📊 Território esvaziado por remoção costuma ser reocupado em poucos meses",
      "📊 Colônias totalmente castradas reduzem drasticamente comportamento de marcação territorial",
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
    level: 5,
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

// Estimated reading time in minutes, based on word count at an average
// reading speed of 200 words per minute. Always at least 1 minute.
export function getReadingTimeMinutes(article: Article): number {
  const wordCount = article.body.join(" ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(wordCount / 200));
}

// Up to two related articles: prefers the same level, falls back to
// nearby levels if there aren't enough.
export function getRelatedArticles(article: Article, limit = 2): Article[] {
  const sameLevel = ARTICLES.filter(
    (candidate) => candidate.level === article.level && candidate.slug !== article.slug
  );
  const others = ARTICLES.filter(
    (candidate) => candidate.level !== article.level && candidate.slug !== article.slug
  );
  return [...sameLevel, ...others].slice(0, limit);
}
