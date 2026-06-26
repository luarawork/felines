// Shared content source for the Felines educational guide.
// Defines the static articles used by /learn and /learn/:slug. Keeping
// the content here (instead of hardcoded in pages) makes it easy to add
// new articles and to compute related-article links and reading time.
//
// Body paragraphs starting with "### " are rendered as H3 subheadings
// (see app/learn/[slug]/page.tsx) — a lightweight convention instead of
// a full markdown parser, just enough to break long articles into
// scannable sections.
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
    slug: "what-is-a-cat-colony",
    level: 1,
    title: "O que é, exatamente, uma colônia de gatos?",
    summary: "Spoiler: não é só \"um monte de gatos\". Tem um padrão por trás, e ele importa.",
    body: [
      "Você passa pela mesma rua todo dia e sempre vê 3, 4, 5 gatos no mesmo terreno baldio. Eles não são sempre os mesmos gatos que você via há um ano — mas o lugar nunca fica vazio. Isso não é coincidência. É uma colônia.",
      "### O que faz um grupo de gatos virar uma colônia",
      "Uma colônia é um grupo de gatos de rua que vive de forma estável num território fixo — um terreno, um quintal, uma praça, um conjunto de quintais vizinhos. A diferença pro avistamento de um gato sozinho, de passagem, é a permanência: esses gatos voltam, têm um ponto de comida ou abrigo reconhecível, e geralmente alguém da vizinhança já sabe da existência deles, mesmo sem cuidar oficialmente.",
      "### Por que ali e não em outro lugar",
      "Colônias se formam onde existem três coisas ao mesmo tempo: comida (lixo, alguém que alimenta), abrigo (terreno vazio, vão de construção, embaixo de carros) e ausência de predadores grandes. Tire qualquer um dos três e a colônia tende a se mudar ou diminuir.",
      "Esse é o motivo de uma colônia conseguir se manter no mesmo lugar por anos, mesmo com gatos individuais indo e vindo: o território continua oferecendo o que eles precisam.",
      "### Por que vale identificar a colônia, não só o gato",
      "Quando você reconhece um grupo como colônia — e não apenas relata um gato isolado — fica muito mais fácil organizar castração, alimentação e cuidados de forma coordenada, em vez de tentar resolver as coisas gato por gato.",
    ],
    factChips: [
      "📊 Estima-se que existam mais de 10 milhões de gatos de rua só no Brasil",
      "📊 Um território com comida e abrigo raramente fica vazio por muito tempo",
    ],
  },
  {
    slug: "por-que-existem-gatos-de-rua",
    level: 1,
    title: "Por que os gatos sempre voltam pro mesmo lugar",
    summary: "Você já tentou se livrar de uma colônia e ela simplesmente... voltou? Tem uma explicação pra isso.",
    body: [
      "Tem uma pergunta que quase todo mundo que mora perto de uma colônia já fez: por que esses gatos estão aqui, e por que parece impossível eles irem embora de vez?",
      "### A resposta é mais simples do que parece",
      "Gatos de rua se organizam onde encontram território, comida e abrigo — geralmente perto de lixo exposto, terrenos vazios ou alguém que já alimenta, mesmo que informalmente. Eles não escolhem o lugar por acaso: o lugar oferece o que eles precisam pra sobreviver.",
      "### Por que remover não resolve",
      "Tirar os gatos de uma área sem mudar o que atraiu eles ali (a comida, o abrigo) deixa o território livre — e território livre com recursos disponíveis atrai um grupo novo rapidinho. É basicamente abrir vaga pra outra colônia se instalar.",
      "### O que de fato funciona",
      "A forma mais eficaz de reduzir o número de gatos de rua a longo prazo não é remoção. É castração. Sem fêmeas férteis entrando no ciclo, o grupo para de crescer e diminui naturalmente com o tempo.",
    ],
    factChips: [
      "📊 Comida, abrigo e ausência de predadores são os 3 fatores que sustentam uma colônia",
      "📊 Remover gatos sem resolver a causa costuma trazer um grupo novo — e maior — em poucos meses",
    ],
  },
  {
    slug: "castracao-reduz-conflitos",
    level: 1,
    title: "A castração resolve mais conflito do que qualquer reclamação",
    summary: "Cheiro forte, miado de madrugada, briga no telhado. Tem uma causa comum pra quase tudo isso.",
    body: [
      "Se tem uma coisa que gera reclamação de vizinho sobre gatos de rua, é cheiro de urina forte e miado de madrugada. A boa notícia: isso tem uma causa identificável, e ela tem solução.",
      "### Por que gatos não castrados causam tanto barulho",
      "Gatos inteiros (não castrados) marcam território com urina de cheiro bem mais forte, e brigam com frequência por causa de fêmeas. Essa combinação — cheiro + briga + miado — é a maior fonte de reclamação sobre colônias.",
      "### O que muda depois da castração",
      "Poucas semanas após castrados, o comportamento territorial cai bastante. Menos marcação, menos briga, menos miado de disputa. E a colônia para de crescer, porque não há mais reprodução.",
      "### O resultado, com o tempo",
      "Colônias castradas tendem a ficar mais estáveis e mais silenciosas, e a relação com a vizinhança ao redor melhora — não porque os gatos sumiram, mas porque o comportamento que causava o atrito praticamente desaparece.",
    ],
    factChips: [
      "📊 O comportamento territorial cai bastante poucas semanas depois da castração",
      "📊 Colônias castradas têm menos briga, menos miado noturno e menos cheiro de urina",
    ],
  },
  {
    slug: "why-removing-cats-doesnt-work",
    level: 1,
    title: "Por que remover os gatos nunca resolve de verdade",
    summary: "Cidades inteiras já tentaram isso, em diferentes décadas. O resultado foi sempre o mesmo.",
    body: [
      "Imagina gastar meses removendo uma colônia inteira de um terreno — e, um ano depois, encontrar o mesmo terreno com outro grupo de gatos, igual ou pior do que antes. Isso não é hipótese. Já aconteceu, repetidas vezes, em cidades de tamanhos e países diferentes.",
      "### O efeito vácuo",
      "Quando uma colônia é removida, o território não fica vazio por muito tempo. Comida, abrigo e ausência de predadores continuam ali, atraindo gatos novos. Isso tem nome: efeito vácuo.",
      "Em poucos meses, o território esvaziado costuma ser ocupado por outro grupo — muitas vezes maior e menos estável que o anterior, já que os recém-chegados ainda não estão castrados nem acostumados ao lugar.",
      "### O que a história já mostrou",
      "Diversas cidades, em diferentes continentes, tentaram programas de remoção em massa ao longo do século 20. Em praticamente todas, a população de gatos de rua voltou a crescer dentro de 1 a 2 anos.",
      "### O único método que funciona de verdade",
      "Castração em massa — conhecida como TNR (Trap-Neuter-Return, ou Captura-Castração-Devolução) — é a única estratégia que reduz a população de forma duradoura. Sem fêmeas férteis, o grupo para de crescer e diminui naturalmente com o tempo.",
    ],
    factChips: [
      "📊 Cidades que tentaram remoção em massa viram a população voltar ao normal em 1 a 2 anos",
      "📊 A Organização Mundial da Saúde recomenda TNR como método de controle populacional",
    ],
  },
  {
    slug: "what-is-tnr-and-why-it-works",
    level: 1,
    title: "TNR: as 3 letras que resolvem o problema de verdade",
    summary: "Capturar, castrar, devolver. Parece simples — e funciona melhor que qualquer alternativa.",
    body: [
      "Se você só vai lembrar de uma sigla depois de ler esse guia, que seja essa: TNR. É o método que realmente funciona pra estabilizar uma colônia, e qualquer pessoa pode ajudar a viabilizar.",
      "### O que significa",
      "TNR vem de Trap-Neuter-Return: capturar os gatos da colônia, castrar numa clínica veterinária, e devolver ao mesmo território de onde vieram.",
      "### Por que devolver, e não remover",
      "Diferente da remoção, o TNR mantém o território ocupado pelos gatos que já estão lá — só que agora incapazes de se reproduzir. Isso evita o efeito vácuo: não existe espaço vazio pra um grupo novo, não-castrado, ocupar.",
      "### O que acontece com o tempo",
      "A colônia para de crescer. As brigas territoriais diminuem. A marcação com urina cai bastante. E a população existente vai diminuindo naturalmente ao longo dos anos, sem nenhuma remoção forçada.",
      "### Onde você entra nisso",
      "Identificar uma colônia, viabilizar a castração junto a uma clínica ou campanha popular, e devolver os gatos ao mesmo lugar depois da recuperação — isso é TNR na prática, e não exige nenhum conhecimento técnico de veterinária.",
    ],
    factChips: [
      "📊 A Organização Mundial da Saúde recomenda TNR como método preferencial de controle populacional",
      "📊 Uma colônia totalmente castrada para de crescer dentro de uma geração",
    ],
  },
  {
    slug: "how-to-approach-a-stray-cat",
    level: 2,
    title: "Como se aproximar de um gato de rua sem ser mordido",
    summary: "A forma errada de se aproximar assusta o gato — e pode te custar um arranhão. Veja a certa.",
    body: [
      "Você vê um gato bonito, quer fazer carinho, e vai direto na cara dele. Resultado provável: ele foge, ou pior, arranha. A boa notícia é que existe uma forma de se aproximar que funciona muito melhor.",
      "### Primeiro, pergunte se ele quer companhia",
      "Nem todo gato de rua precisa ou quer aproximação humana. Antes de se aproximar, observe: ele está calmo, comendo, curioso — ou já em alerta, pronto pra fugir?",
      "### Como se aproximar, de verdade",
      "Vá devagar, de lado — nunca de frente, que parece ameaçador pra um gato. Evite olhar fixo e por muito tempo nos olhos dele. Abaixe-se pra ficar na altura do gato em vez de se inclinar por cima. Estenda a mão devagar e deixe ele decidir se aproximar, em vez de avançar você mesmo.",
      "### Como saber se ele é feral ou socializado",
      "Gatos ferais (que nunca tiveram contato humano) mantêm distância, não miam pedindo atenção, e fogem ao menor movimento brusco. Gatos socializados costumam miar, se aproximar por conta própria, e tolerar mais contato.",
      "### A regra que nunca muda",
      "Nunca persiga, agarre ou encurrale um gato de rua. Mesmo um gato manso pode morder ou arranhar por medo quando se sente sem rota de fuga.",
    ],
    factChips: [
      "📊 Abaixar-se à altura do gato reduz a sensação de ameaça muito mais do que se inclinar sobre ele",
      "📊 Gatos ferais fogem ao menor movimento brusco — gatos socializados toleram mais contato",
    ],
  },
  {
    slug: "how-to-report-animal-abuse",
    level: 3,
    title: "Maus-tratos são crime. Veja como denunciar direito",
    summary: "Documentar bem faz toda a diferença entre uma denúncia que vira investigação e uma que se perde.",
    body: [
      "Presenciar maus-tratos contra um animal é revoltante, e a primeira reação costuma ser confrontar quem fez. Não faça isso. Existe um caminho mais eficaz, e mais seguro pra você e pro animal.",
      "### Isso é crime, não só falta de educação",
      "Maus-tratos a animais são crime — agressão física, envenenamento, privação extrema de comida ou água, abandono, e qualquer ato que cause sofrimento evitável contam como maus-tratos perante a lei.",
      "### O que documentar antes de denunciar",
      "Fotos e vídeos com data visível. Localização exata. Horário aproximado dos fatos. Qualquer testemunha disposta a confirmar o que viu. Quanto mais detalhado, mais forte a denúncia.",
      "### Pra onde denunciar",
      "Você pode denunciar de forma anônima pelo Disque Denúncia 181, disponível na maioria dos estados. Em caso de flagrante ou risco imediato ao animal, ligue 190. Também é possível registrar boletim de ocorrência na Polícia Civil, o que costuma ser necessário pra abrir investigação formal.",
      "### Depois de denunciar",
      "O caso normalmente é investigado pela polícia ambiental ou civil. Nem todo caso termina em prisão imediata, mas o registro formal cria histórico — e isso importa, mesmo quando a resposta parece lenta.",
    ],
    factChips: [
      "📊 A Lei Sansão prevê pena de 2 a 5 anos de prisão para maus-tratos a cães e gatos",
      "📊 O Disque Denúncia 181 aceita denúncias anônimas na maioria dos estados",
    ],
  },
  {
    slug: "found-a-kitten-alone",
    level: 2,
    title: "Achou um filhote sozinho? Respire antes de agir",
    summary: "A regra mais importante aqui é a mais difícil de seguir: não fazer nada por algumas horas.",
    body: [
      "Você vê um filhote sozinho, miando, parecendo desamparado. O instinto é pegar e levar pra casa agora. Mas essa pode ser a pior coisa a fazer — pelo menos nas primeiras horas.",
      "### Por que esperar é a regra número 1",
      "A mãe gata geralmente está por perto, caçando comida, e pode levar horas pra voltar. Observe de uma distância segura por pelo menos 2 a 4 horas (ou até o anoitecer, se for de manhã) antes de fazer qualquer coisa. Filhotes limpos, aquecidos e calmos provavelmente já estão sendo cuidados normalmente.",
      "### Quando realmente é hora de agir",
      "Sinais de que o filhote precisa de ajuda imediata: está muito frio ao toque, chorando sem parar, sujo ou magro, com os olhos ainda fechados (menos de 2 semanas), e claramente sem nenhum adulto por perto há muitas horas.",
      "### Se precisar intervir",
      "Mantenha o filhote aquecido — uma toalha por baixo, não contato direto e prolongado — e procure orientação de uma ONG ou veterinário antes de alimentar. Filhotes muito jovens têm necessidades nutricionais bem específicas.",
      "### O erro que mais prejudica os filhotes",
      "Nunca dê leite de vaca: filhotes não digerem a lactose, e isso causa diarreia grave e desidratação. Se precisar alimentar antes de conseguir orientação, use só fórmula específica pra filhote de gato. E não leve o filhote pra casa só porque ele parece sozinho — separar um filhote saudável da mãe sem necessidade reduz muito a chance dele sobreviver bem.",
    ],
    factChips: [
      "📊 A maioria dos \"filhotes abandonados\" tem a mãe por perto, caçando comida",
      "📊 Leite de vaca causa diarreia grave em filhotes — eles não digerem lactose",
    ],
  },
  {
    slug: "found-injured-cat-step-by-step",
    level: 3,
    title: "Gato ferido na rua: 5 passos, sem complicar",
    summary: "Você não precisa ser especialista. Precisa só seguir a ordem certa.",
    body: [
      "Encontrar um gato ferido na rua mexe com qualquer pessoa. A vontade de ajudar é imediata — mas agir na ordem errada pode machucar mais o gato, ou machucar você. Aqui está o passo a passo.",
      "### Passo 1 — Avalie de longe",
      "Ele está consciente, reagindo a som ou movimento? Animais feridos podem morder ou arranhar por dor e medo, mesmo sendo normalmente dóceis. Não toque ainda.",
      "### Passo 2 — Contenha com cuidado",
      "Se for seguro, use uma caixa de papelão com furos de ventilação, ou uma toalha grossa pra envolver o gato — nunca as mãos descobertas. Cobrir a cabeça suavemente com a toalha tende a calmar o animal durante o transporte.",
      "### Passo 3 — Mantenha aquecido e em silêncio",
      "Gatos feridos perdem temperatura corporal rápido. Um ambiente quieto, sem luz forte ou ruído, ajuda bastante durante o trajeto.",
      "### Passo 4 — Procure ajuda profissional",
      "Ligue antes, se possível, avisando o tipo de ferimento — assim a equipe já se prepara. Muitas regiões têm clínicas populares ou ONGs com atendimento de urgência gratuito ou de baixo custo.",
      "### Passo 5 — Não improvise tratamento",
      "Não dê comida, água ou qualquer medicamento por conta própria. Isso pode complicar uma anestesia necessária, ou mascarar sintomas importantes pro diagnóstico.",
    ],
    factChips: [
      "📊 Cobrir a cabeça do gato suavemente com uma toalha tende a calmá-lo no transporte",
      "📊 Gatos feridos perdem temperatura corporal rápido — mantê-los aquecidos é prioridade",
    ],
  },
  {
    slug: "cats-bothering-your-building",
    level: 4,
    title: "Os gatos estão incomodando seu prédio? Isso aqui funciona de verdade",
    summary: "Cheiro, barulho e arranhão são problemas reais. A solução não é a que todo mundo tenta primeiro.",
    body: [
      "Cheiro de urina, miado de madrugada, arranhão na porta do prédio. Esses incômodos são reais, e ignorá-los não ajuda nem os vizinhos, nem os gatos. Mas a reação mais comum — tentar remover os gatos — quase nunca resolve.",
      "### Por que só remover não funciona",
      "Território vazio atrai gatos novos rapidamente — é o chamado efeito vácuo. O ciclo de incômodo só se repete, agora com um grupo recém-chegado e ainda não castrado.",
      "### O que funciona de fato",
      "A combinação de castração com alimentação controlada. Gatos castrados marcam território muito menos e brigam muito menos, e o grupo para de crescer. Comida em horário e local fixos, sem sobra exposta, reduz a atração de pragas e o mau cheiro.",
      "### Antes de reclamar pra administração",
      "Veja se já existe alguém cuidando dessa colônia — você pode checar no mapa do Felines. Falar direto com essa pessoa costuma resolver mais rápido do que abrir uma reclamação formal.",
      "### Pra pontos específicos",
      "Se o problema é um corredor ou uma varanda onde os gatos não deveriam ficar, repelentes ativados por movimento (ultrassom ou jato de água) afastam sem machucar — e sem afetar o resto da colônia.",
    ],
    factChips: [
      "📊 Território esvaziado por remoção costuma ser reocupado em poucos meses",
      "📊 Colônias totalmente castradas reduzem bastante o comportamento de marcação territorial",
    ],
  },
  {
    slug: "como-ajudar-sem-adotar",
    level: 2,
    title: "Você não precisa adotar nenhum gato pra fazer diferença",
    summary: "Não é sobre amar gatos. É sobre algumas ações pequenas, no momento certo.",
    body: [
      "Tem gente que evita se envolver com colônias porque pensa que isso significa adotar um gato, ou virar cuidador em tempo integral. Não é verdade. Tem várias formas de ajudar que cabem em qualquer rotina.",
      "### Relatar já ajuda mais do que parece",
      "Reportar gatos feridos, filhotes sozinhos, ou suspeita de maus-tratos ajuda quem já cuida da colônia a agir mais rápido, mesmo que você nunca toque em um gato.",
      "### Apoiar quem já cuida",
      "Ajudar financeiramente ou com ração quem já cuida de uma colônia tem mais impacto do que tentar cuidar do zero, sozinho.",
      "### Indicar é ajudar",
      "Conhece uma clínica de castração popular ou uma campanha gratuita? Passar essa informação pra um cuidador é uma contribuição simples e real.",
    ],
    factChips: [
      "📊 Apoiar um cuidador que já existe tem mais impacto do que tentar cuidar de uma colônia do zero",
      "📊 Relatar o que você vê ajuda cuidadores a agir mais rápido, mesmo sem você adotar nenhum gato",
    ],
  },
  {
    slug: "tornando-se-cuidador",
    level: 5,
    title: "O que ninguém te conta antes de virar cuidador",
    summary: "Cuidar de uma colônia é um compromisso de longo prazo. Aqui está o que esperar, de verdade.",
    body: [
      "Virar cuidador de uma colônia não é só \"dar comida de vez em quando\". É um compromisso que se estende por meses, às vezes anos — e vale entender isso antes de assumir.",
      "### O que o papel realmente envolve",
      "Um cuidador garante alimentação regular, observa a saúde dos gatos e organiza a castração da colônia ao longo do tempo. Não precisa ser perfeito desde o primeiro dia — precisa ser consistente.",
      "### A carta que conecta gerações de cuidadores",
      "Muitos cuidadores deixam uma carta pro próximo, com o histórico da colônia, hábitos de cada gato e contatos úteis. É uma forma de garantir que o cuidado continue mesmo quando alguém precisa parar.",
      "### Como começar",
      "Qualquer colônia já mapeada pode receber um novo cuidador vinculado direto pela página dela. Não tem processo de seleção — tem responsabilidade.",
    ],
    factChips: [
      "📊 Cuidadores podem deixar uma carta de transição com histórico e contatos pro próximo",
      "📊 Qualquer colônia mapeada pode receber um novo cuidador vinculado a qualquer momento",
    ],
  },
  {
    slug: "living-with-a-cat-colony",
    level: 4,
    title: "Convivendo bem com a colônia que mora perto de você",
    summary: "Morar perto de gatos de rua não precisa ser sinônimo de conflito.",
    body: [
      "Boa parte do atrito com colônias de gatos não vem dos gatos — vem da falta de informação. Cheiro, miado e briga costumam ter uma causa identificável, e tratável.",
      "### Comece descobrindo se já tem alguém cuidando",
      "Se a colônia perto de você já tem um cuidador vinculado, fale direto com essa pessoa. Ela pode ajustar pontos de alimentação, horários, ou reforçar a castração — geralmente mais rápido do que qualquer reclamação formal.",
      "### Se ninguém estiver cuidando ainda",
      "Considerar se tornar cuidador — mesmo que parcialmente, dividindo tarefas com vizinhos — costuma resolver mais rápido do que esperar a administração do prédio ou da rua fazer algo.",
      "### Pequenos ajustes que mudam tudo",
      "Comida em horário fixo e sem sobra exposta, água trocada com frequência, abrigo discreto. Isso reduz bastante o incômodo percebido, sem prejudicar os gatos.",
      "### O que convivência saudável não exige",
      "Você não precisa tocar, adotar ou remover nenhum gato pra que a relação com a vizinhança funcione bem. Respeitar o ritmo deles já é suficiente.",
    ],
    factChips: [
      "📊 Boa parte do incômodo com colônias tem solução prática, sem precisar remover os gatos",
      "📊 Falar com o cuidador responsável costuma resolver mais rápido do que abrir uma reclamação formal",
    ],
  },
  {
    slug: "small-actions-real-impact",
    level: 2,
    title: "Pequenas ações que realmente fazem diferença",
    summary: "Virar cuidador em tempo integral não é a única forma de importar pra uma colônia.",
    body: [
      "Existe uma ideia de que ajudar gatos de rua é tudo ou nada — ou você vira cuidador, ou não faz nada. Não é assim. Ações pequenas, feitas com regularidade, somam muito.",
      "### O que conta como ajuda real",
      "Confirmar um relato que você também viu. Deixar uma doação pontual de ração pra um cuidador conhecido. Avisar alguém sobre algo estranho na colônia. Tudo isso já é contribuição real.",
      "### Compartilhar também ajuda",
      "Mostrar a localização de uma colônia pra vizinhos ajuda a comunidade a se organizar mais rápido numa emergência.",
      "### Use o que você já sabe fazer",
      "Fotografia, design, contato com clínicas veterinárias — qualquer talento específico que você já tem vale mais oferecido a um cuidador do que tentar fazer tudo sozinho.",
      "### Consistência vence intensidade",
      "Uma ação pequena, repetida toda semana, costuma durar e ajudar mais do que um esforço grande que acontece uma vez só e não se repete.",
    ],
    factChips: [
      "📊 Confirmar relatos que você também viu ajuda a comunidade a priorizar casos reais",
      "📊 Contribuições pequenas e recorrentes tendem a durar mais que um esforço único e grande",
    ],
  },
  {
    slug: "how-to-help-injured-cat",
    level: 3,
    title: "O gato ferido sobreviveu ao resgate. E agora?",
    summary: "O primeiro socorro é só o começo. A parte que decide a recuperação vem depois.",
    body: [
      "Você já fez o resgate, o gato está com um veterinário. Ótimo — mas é aqui que muita gente desiste, achando que não pode fazer mais nada. Na verdade, ainda tem bastante coisa que ajuda.",
      "### O maior obstáculo costuma ser o custo",
      "Antes de assumir que não existe opção acessível, vale pesquisar clínicas populares, universidades com curso de veterinária e ONGs locais — muitas têm atendimento de baixo custo ou gratuito.",
      "### Você não precisa pagar tudo sozinho",
      "Procurar um cuidador já vinculado à colônia, ou uma ONG local, pra dividir custo ou logística costuma funcionar melhor do que desistir do caso por falta de recursos.",
      "### O acompanhamento depois do tratamento",
      "Gatos que voltam pra colônia precisam de algumas semanas de observação. Um cuidador vinculado pode registrar isso na linha do tempo da colônia, pra comunidade saber que o caso está sendo seguido.",
      "### O objetivo final",
      "Sempre que possível, tratar e devolver o gato ao território de origem — o mesmo princípio do TNR. Remover um gato ferido da colônia pra sempre raramente é necessário.",
    ],
    factChips: [
      "📊 Clínicas populares e universidades com curso de veterinária costumam ter atendimento de baixo custo",
      "📊 Sempre que possível, o objetivo é tratar e devolver o gato ao território de origem",
    ],
  },
  {
    slug: "stray-cats-in-brazil-the-numbers",
    level: 1,
    title: "Os números que mostram o tamanho real do problema",
    summary: "Alguns dados ajudam a entender por que castração em massa não é exagero — é necessidade.",
    body: [
      "É fácil pensar que o problema dos gatos de rua é só \"uns gatos demais no seu bairro\". Os números contam uma história bem maior.",
      "### A escala é global",
      "Estimativas apontam mais de 10 milhões de gatos de rua só no Brasil, parte de um total estimado de 480 milhões no mundo todo.",
      "### Os abrigos já não conseguem mais",
      "ONGs e abrigos já operam, em sua maioria, além da capacidade — estima-se cerca de 185 mil animais nessa situação, o que torna remoção e abrigamento em massa inviáveis como solução de longo prazo.",
      "### O conflito também é mensurável",
      "Cerca de 40% das pessoas já enfrentaram algum tipo de conflito com vizinhos envolvendo animais — boa parte desses casos está ligada a gatos de rua não castrados.",
      "### O que esses números significam na prática",
      "Não existe capacidade de abrigo suficiente pra remover gatos de rua em escala, e remoção isolada não resolve nada de forma duradoura. É por isso que castração em massa (TNR) é a recomendação, não remoção.",
    ],
    factChips: [
      "📊 Mais de 10 milhões de gatos de rua no Brasil, e 480 milhões no mundo",
      "📊 40% das pessoas já tiveram conflito com vizinhos envolvendo animais",
    ],
  },
  {
    slug: "common-myths-about-stray-cats",
    level: 1,
    title: "5 mitos sobre gatos de rua que vale desmontar agora",
    summary: "Algumas crenças populares não só estão erradas — elas pioram a situação.",
    body: [
      "Muita gente toma decisões sobre gatos de rua baseada em crenças que nunca foram verificadas. Vamos desmontar as mais comuns, uma por uma.",
      "### Mito 1: \"gato de rua é sempre doente ou perigoso\"",
      "Na realidade, a maioria evita contato humano por instinto, não por agressividade — e muitos estão tão saudáveis quanto um gato doméstico quando bem alimentados.",
      "### Mito 2: \"remover os gatos resolve o problema\"",
      "Décadas de tentativas em cidades diferentes mostram o contrário: território vazio é ocupado rapidamente por outro grupo, geralmente maior e ainda não castrado.",
      "### Mito 3: \"alimentar gatos de rua aumenta a população\"",
      "O que de fato aumenta a população é a falta de castração, não a comida. Colônias alimentadas e castradas tendem a ser estáveis, não crescentes.",
      "### Mito 4: \"filhote sozinho é filhote abandonado\"",
      "Na maioria das vezes, a mãe está por perto caçando comida. Agir rápido sem observar pode separar um filhote saudável da mãe sem necessidade nenhuma.",
      "### Mito 5: \"gato de rua não pode ser tocado, ponto final\"",
      "Gatos socializados (que já tiveram contato humano) toleram aproximação gradual. O que varia é o nível de socialização de cada um, não uma regra fixa pra todos.",
    ],
    factChips: [
      "📊 Alimentar gatos de rua não aumenta a população — a falta de castração que aumenta",
      "📊 A maioria dos filhotes \"abandonados\" tem a mãe por perto, caçando comida",
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
