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
  title_en?: string;
  summary_en?: string;
  body_en?: string[];
  factChips_en?: string[];
  href?: string; // overrides /learn/slug when set (e.g. for dedicated sub-pages)
};

// Picks the English variant fields when language is "en", falling back to
// the Portuguese originals otherwise (and if an _en field is missing).
export function localizeArticle(article: Article, language: "pt" | "en"): Article {
  if (language !== "en") return article;
  return {
    ...article,
    title: article.title_en ?? article.title,
    summary: article.summary_en ?? article.summary,
    body: article.body_en ?? article.body,
    factChips: article.factChips_en ?? article.factChips,
  };
}

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
    title_en: "What exactly is a cat colony?",
    summary_en: "Spoiler: it's not just \"a bunch of cats.\" There's a pattern behind it, and it matters.",
    body_en: [
      "You walk down the same street every day and always see 3, 4, 5 cats on the same vacant lot. They're not always the same cats you saw a year ago — but the spot is never empty. That's not a coincidence. It's a colony.",
      "### What turns a group of cats into a colony",
      "A colony is a group of stray cats that lives in a stable way within a fixed territory — a lot, a backyard, a square, a cluster of neighboring yards. What sets it apart from spotting a lone cat passing through is permanence: these cats keep coming back, there's a recognizable food or shelter spot, and usually someone in the neighborhood already knows they're there, even without officially caring for them.",
      "### Why there, and not somewhere else",
      "Colonies form wherever three things exist at once: food (trash, someone feeding them), shelter (an empty lot, a construction gap, under parked cars), and no large predators. Remove any one of the three and the colony tends to move or shrink.",
      "That's why a colony can stay in the same spot for years, even as individual cats come and go: the territory keeps providing what they need.",
      "### Why it's worth identifying the colony, not just the cat",
      "When you recognize a group as a colony — instead of just reporting an isolated cat — it becomes much easier to organize neutering, feeding, and care in a coordinated way, rather than trying to solve things one cat at a time.",
    ],
    factChips_en: [
      "📊 An estimated 10+ million stray cats live in Brazil alone",
      "📊 A territory with food and shelter rarely stays empty for long",
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
    title_en: "Why cats always come back to the same spot",
    summary_en: "Ever tried to get rid of a colony and it just... came back? There's an explanation for that.",
    body_en: [
      "There's a question almost everyone who lives near a colony has asked: why are these cats here, and why does it seem impossible for them to ever really leave?",
      "### The answer is simpler than it looks",
      "Stray cats settle wherever they find territory, food, and shelter — usually near exposed trash, vacant lots, or someone who already feeds them, even informally. They don't pick the spot by chance: the place offers what they need to survive.",
      "### Why removal doesn't solve it",
      "Taking cats out of an area without changing what attracted them there (the food, the shelter) just frees up the territory — and a free territory with resources on offer attracts a new group fast. It's basically opening a vacancy for another colony to move in.",
      "### What actually works",
      "The most effective way to reduce the stray cat population long-term isn't removal. It's neutering. Without fertile females entering the cycle, the group stops growing and naturally shrinks over time.",
    ],
    factChips_en: [
      "📊 Food, shelter, and the absence of predators are the 3 factors that sustain a colony",
      "📊 Removing cats without addressing the cause usually brings in a new — and bigger — group within a few months",
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
    title_en: "Neutering resolves more conflict than any complaint ever will",
    summary_en: "Strong odor, howling at 3am, rooftop fights. There's one common cause behind almost all of it.",
    body_en: [
      "If there's one thing that generates neighbor complaints about street cats, it's strong urine smell and late-night howling. The good news: it has an identifiable cause, and that cause has a solution.",
      "### Why unneutered cats cause so much noise",
      "Intact (unneutered) cats mark territory with much stronger-smelling urine, and fight frequently over females. That combination — smell plus fighting plus howling — is the biggest source of complaints about colonies.",
      "### What changes after neutering",
      "A few weeks after being neutered, territorial behavior drops sharply. Less marking, less fighting, less mating-related howling. And the colony stops growing, since there's no more reproduction.",
      "### The result, over time",
      "Neutered colonies tend to become more stable and quieter, and the relationship with the surrounding neighborhood improves — not because the cats disappeared, but because the behavior that caused friction largely goes away.",
    ],
    factChips_en: [
      "📊 Territorial behavior drops sharply within a few weeks of neutering",
      "📊 Neutered colonies have less fighting, less nighttime howling, and less urine odor",
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
    title_en: "Why removing cats never actually solves anything",
    summary_en: "Entire cities have tried this, across different decades. The result was always the same.",
    body_en: [
      "Imagine spending months removing an entire colony from a lot — and, a year later, finding the same lot with another group of cats, just as bad or worse than before. This isn't hypothetical. It has happened, repeatedly, in cities of different sizes and different countries.",
      "### The vacuum effect",
      "When a colony is removed, the territory doesn't stay empty for long. Food, shelter, and the absence of predators are all still there, drawing in new cats. This has a name: the vacuum effect.",
      "Within a few months, the emptied territory tends to be occupied by another group — often bigger and less stable than the previous one, since the newcomers aren't neutered yet and aren't used to the place.",
      "### What history has already shown",
      "Several cities, on different continents, tried mass-removal programs throughout the 20th century. In nearly all of them, the stray cat population grew back within 1 to 2 years.",
      "### The one method that actually works",
      "Mass neutering — known as TNR (Trap-Neuter-Return) — is the only strategy that reduces the population in a lasting way. Without fertile females, the group stops growing and naturally shrinks over time.",
    ],
    factChips_en: [
      "📊 Cities that tried mass removal saw the population return to normal within 1 to 2 years",
      "📊 The World Health Organization recommends TNR as a population control method",
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
    title_en: "TNR: the 3 letters that actually solve the problem",
    summary_en: "Trap, neuter, return. Sounds simple — and it works better than any alternative.",
    body_en: [
      "If you only remember one acronym after reading this guide, make it this one: TNR. It's the method that actually works to stabilize a colony, and anyone can help make it happen.",
      "### What it stands for",
      "TNR stands for Trap-Neuter-Return: trap the colony's cats, neuter them at a vet clinic, and return them to the same territory they came from.",
      "### Why return them instead of removing them",
      "Unlike removal, TNR keeps the territory occupied by the cats already there — just now unable to reproduce. This avoids the vacuum effect: there's no empty space for a new, unneutered group to move into.",
      "### What happens over time",
      "The colony stops growing. Territorial fights decrease. Urine marking drops sharply. And the existing population gradually declines over the years, with no forced removal at all.",
      "### Where you come in",
      "Identifying a colony, arranging neutering with a clinic or a community campaign, and returning the cats to the same place after recovery — that's TNR in practice, and it requires no technical veterinary knowledge.",
    ],
    factChips_en: [
      "📊 The World Health Organization recommends TNR as the preferred population control method",
      "📊 A fully neutered colony stops growing within one generation",
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
    title_en: "How to approach a stray cat without getting bitten",
    summary_en: "Approaching the wrong way scares the cat off — and might cost you a scratch. Here's the right way.",
    body_en: [
      "You see a good-looking cat, want to pet it, and go straight for its face. Likely result: it runs, or worse, it scratches you. The good news is there's an approach that works much better.",
      "### First, ask if it wants company",
      "Not every street cat needs or wants human contact. Before approaching, watch: is it calm, eating, curious — or already on alert, ready to flee?",
      "### How to actually approach",
      "Go slowly, from the side — never head-on, which reads as threatening to a cat. Avoid staring directly into its eyes for too long. Crouch down to the cat's level instead of leaning over it. Extend your hand slowly and let it decide to close the distance, instead of you closing it yourself.",
      "### How to tell if it's feral or socialized",
      "Feral cats (that never had human contact) keep their distance, don't meow for attention, and flee at the slightest sudden movement. Socialized cats tend to meow, approach on their own, and tolerate more contact.",
      "### The rule that never changes",
      "Never chase, grab, or corner a street cat. Even a gentle cat can bite or scratch out of fear when it feels it has no way out.",
    ],
    factChips_en: [
      "📊 Crouching to the cat's level reduces the sense of threat far more than leaning over it",
      "📊 Feral cats flee at the slightest sudden movement — socialized cats tolerate more contact",
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
    title_en: "Animal abuse is a crime. Here's how to report it properly",
    summary_en: "Good documentation makes all the difference between a report that becomes an investigation and one that goes nowhere.",
    body_en: [
      "Witnessing animal abuse is infuriating, and the first instinct is usually to confront whoever did it. Don't. There's a more effective path — and a safer one, both for you and the animal.",
      "### This is a crime, not just bad manners",
      "Animal cruelty is a crime — physical assault, poisoning, extreme deprivation of food or water, abandonment, and any act causing avoidable suffering all count as abuse under the law.",
      "### What to document before reporting",
      "Photos and videos with a visible date. Exact location. Approximate time of the incident. Any witness willing to confirm what they saw. The more detailed, the stronger the report.",
      "### Where to report",
      "You can report anonymously through the local animal-cruelty tip line, available in most regions. In case of an incident in progress or immediate risk to the animal, call emergency services. You can also file a police report, which is usually necessary to open a formal investigation.",
      "### After reporting",
      "The case is normally investigated by environmental or civil police. Not every case ends in an immediate arrest, but the formal record creates a paper trail — and that matters, even when the response feels slow.",
    ],
    factChips_en: [
      "📊 Animal cruelty laws in Brazil provide for 2 to 5 years in prison for abuse of dogs and cats",
      "📊 Anonymous tip lines accept animal cruelty reports in most states",
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
    title_en: "Found a lone kitten? Take a breath before acting",
    summary_en: "The most important rule here is the hardest to follow: do nothing for a few hours.",
    body_en: [
      "You see a kitten alone, meowing, looking helpless. The instinct is to scoop it up and take it home right now. But that might be the worst thing to do — at least in the first few hours.",
      "### Why waiting is rule number one",
      "The mother cat is usually nearby, hunting for food, and can take hours to come back. Watch from a safe distance for at least 2 to 4 hours (or until nightfall, if it's morning) before doing anything. Clean, warm, calm kittens are probably already being cared for normally.",
      "### When it really is time to step in",
      "Signs the kitten needs immediate help: it's very cold to the touch, crying nonstop, dirty or thin, with eyes still closed (under 2 weeks old), and clearly without any adult around for many hours.",
      "### If you need to step in",
      "Keep the kitten warm — a towel underneath, not prolonged direct contact — and seek guidance from an NGO or vet before feeding. Very young kittens have very specific nutritional needs.",
      "### The mistake that hurts kittens the most",
      "Never give cow's milk: kittens can't digest lactose, and it causes severe diarrhea and dehydration. If you need to feed before getting guidance, use only kitten-specific formula. And don't take the kitten home just because it looks alone — separating a healthy kitten from its mother without need greatly reduces its chances of surviving well.",
    ],
    factChips_en: [
      "📊 Most \"abandoned kittens\" have a mother nearby, hunting for food",
      "📊 Cow's milk causes severe diarrhea in kittens — they can't digest lactose",
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
    title_en: "Injured cat on the street: 5 steps, no overthinking",
    summary_en: "You don't need to be an expert. You just need to follow the right order.",
    body_en: [
      "Finding an injured cat on the street shakes anyone up. The urge to help is immediate — but acting in the wrong order can hurt the cat more, or hurt you. Here's the step-by-step.",
      "### Step 1 — Assess from a distance",
      "Is it conscious, reacting to sound or movement? Injured animals can bite or scratch out of pain and fear, even if normally gentle. Don't touch yet.",
      "### Step 2 — Contain carefully",
      "If it's safe, use a cardboard box with ventilation holes, or a thick towel to wrap the cat — never bare hands. Gently covering the head with the towel tends to calm the animal during transport.",
      "### Step 3 — Keep it warm and quiet",
      "Injured cats lose body heat fast. A quiet environment, without bright light or noise, helps a lot during the trip.",
      "### Step 4 — Seek professional help",
      "Call ahead if possible, describing the type of injury — that way the team can prepare. Many areas have low-cost or free-of-charge emergency clinics or NGOs.",
      "### Step 5 — Don't improvise treatment",
      "Don't give food, water, or any medication on your own. That can complicate a necessary anesthesia, or mask symptoms important for diagnosis.",
    ],
    factChips_en: [
      "📊 Gently covering the cat's head with a towel tends to calm it during transport",
      "📊 Injured cats lose body heat fast — keeping them warm is a priority",
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
    title_en: "Cats bothering your building? Here's what actually works",
    summary_en: "Smell, noise, and scratching are real problems. The solution isn't the one most people try first.",
    body_en: [
      "Urine smell, howling at 3am, scratching at the building door. These annoyances are real, and ignoring them doesn't help either the neighbors or the cats. But the most common reaction — trying to remove the cats — almost never works.",
      "### Why removal alone doesn't work",
      "An empty territory attracts new cats fast — the so-called vacuum effect. The cycle of annoyance just repeats, now with a newly arrived, still-unneutered group.",
      "### What actually works",
      "The combination of neutering with controlled feeding. Neutered cats mark territory much less and fight much less, and the group stops growing. Food at a fixed time and place, without leftovers exposed, reduces pest attraction and bad odor.",
      "### Before complaining to building management",
      "Check whether someone is already caring for this colony — you can look it up on the Felines map. Talking directly to that person usually resolves things faster than filing a formal complaint.",
      "### For specific spots",
      "If the problem is a hallway or balcony where cats shouldn't be, motion-activated deterrents (ultrasonic or water spray) keep them away without hurting them — and without affecting the rest of the colony.",
    ],
    factChips_en: [
      "📊 Territory emptied by removal is usually reoccupied within a few months",
      "📊 Fully neutered colonies significantly reduce territorial marking behavior",
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
    title_en: "You don't need to adopt a single cat to make a difference",
    summary_en: "It's not about loving cats. It's about a few small actions, at the right moment.",
    body_en: [
      "Some people avoid getting involved with colonies because they think it means adopting a cat, or becoming a full-time caretaker. That's not true. There are several ways to help that fit into any routine.",
      "### Reporting already helps more than it seems",
      "Reporting injured cats, lone kittens, or suspected abuse helps whoever already cares for the colony act faster, even if you never touch a cat yourself.",
      "### Supporting existing caretakers",
      "Helping an existing caretaker financially or with food has more impact than trying to start caring for a colony from scratch, alone.",
      "### Pointing people in the right direction helps too",
      "Know a low-cost neutering clinic or a free campaign? Passing that information to a caretaker is a simple, real contribution.",
    ],
    factChips_en: [
      "📊 Supporting an existing caretaker has more impact than trying to care for a colony from scratch",
      "📊 Reporting what you see helps caretakers act faster, even without you adopting any cat",
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
    title_en: "What nobody tells you before you become a caretaker",
    summary_en: "Caring for a colony is a long-term commitment. Here's what to really expect.",
    body_en: [
      "Becoming a colony's caretaker isn't just \"feeding it once in a while.\" It's a commitment that stretches over months, sometimes years — and it's worth understanding that before taking it on.",
      "### What the role actually involves",
      "A caretaker ensures regular feeding, watches the cats' health, and organizes the colony's neutering over time. You don't need to be perfect from day one — you need to be consistent.",
      "### The letter that connects generations of caretakers",
      "Many caretakers leave a letter for the next person, with the colony's history, each cat's habits, and useful contacts. It's a way to keep the care going even when someone needs to step away.",
      "### How to get started",
      "Any already-mapped colony can get a new caretaker linked directly from its page. There's no selection process — there's responsibility.",
    ],
    factChips_en: [
      "📊 Caretakers can leave a handoff letter with history and contacts for the next person",
      "📊 Any mapped colony can get a new linked caretaker at any time",
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
    title_en: "Living well with the colony near you",
    summary_en: "Living near street cats doesn't have to mean conflict.",
    body_en: [
      "Most friction with cat colonies doesn't come from the cats — it comes from a lack of information. Smell, howling, and fighting usually have an identifiable, treatable cause.",
      "### Start by finding out if someone's already caring for it",
      "If the colony near you already has a linked caretaker, talk to that person directly. They can adjust feeding spots, timing, or reinforce neutering — usually faster than any formal complaint.",
      "### If no one is caring for it yet",
      "Considering becoming a caretaker — even partially, splitting tasks with neighbors — usually resolves things faster than waiting for building or street management to do something.",
      "### Small adjustments that change everything",
      "Food at a fixed time with no leftovers exposed, water changed often, discreet shelter. This significantly reduces perceived annoyance without harming the cats.",
      "### What healthy coexistence doesn't require",
      "You don't need to touch, adopt, or remove any cat for the relationship with the neighborhood to work well. Respecting their rhythm is already enough.",
    ],
    factChips_en: [
      "📊 Most colony-related annoyances have a practical solution that doesn't require removing the cats",
      "📊 Talking to the responsible caretaker usually resolves things faster than filing a formal complaint",
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
    title_en: "Small actions that really make a difference",
    summary_en: "Becoming a full-time caretaker isn't the only way to matter to a colony.",
    body_en: [
      "There's an idea that helping street cats is all-or-nothing — either you become a caretaker, or you do nothing. It's not like that. Small actions, done regularly, add up a lot.",
      "### What counts as real help",
      "Confirming a report you also witnessed. Making a one-time food donation to a caretaker you know. Letting someone know about something odd in the colony. All of that is real contribution.",
      "### Sharing helps too",
      "Showing neighbors where a colony is located helps the community organize faster in an emergency.",
      "### Use what you're already good at",
      "Photography, design, contacts at vet clinics — any specific skill you already have is worth more offered to a caretaker than trying to do everything alone.",
      "### Consistency beats intensity",
      "One small action, repeated every week, usually lasts and helps more than one big effort that happens once and never repeats.",
    ],
    factChips_en: [
      "📊 Confirming reports you also witnessed helps the community prioritize real cases",
      "📊 Small, recurring contributions tend to last longer than one big one-time effort",
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
    title_en: "The injured cat survived the rescue. Now what?",
    summary_en: "First aid is only the beginning. The part that decides recovery comes after.",
    body_en: [
      "You've already done the rescue, the cat is with a vet. Great — but this is where a lot of people give up, thinking there's nothing more they can do. Actually, there's still plenty that helps.",
      "### The biggest obstacle is usually cost",
      "Before assuming there's no affordable option, it's worth researching low-cost clinics, veterinary schools, and local NGOs — many offer low-cost or free care.",
      "### You don't have to pay for it all alone",
      "Reaching out to a caretaker already linked to the colony, or a local NGO, to split cost or logistics usually works better than giving up the case for lack of resources.",
      "### Follow-up after treatment",
      "Cats returning to the colony need a few weeks of observation. A linked caretaker can log this on the colony's timeline, so the community knows the case is being followed.",
      "### The end goal",
      "Whenever possible, treat and return the cat to its original territory — the same principle as TNR. Permanently removing an injured cat from the colony is rarely necessary.",
    ],
    factChips_en: [
      "📊 Low-cost clinics and veterinary schools often offer low-cost care",
      "📊 Whenever possible, the goal is to treat and return the cat to its home territory",
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
    title_en: "The numbers that show the real size of the problem",
    summary_en: "Some data helps explain why mass neutering isn't overkill — it's a necessity.",
    body_en: [
      "It's easy to think the stray cat problem is just \"a few too many cats in your neighborhood.\" The numbers tell a much bigger story.",
      "### The scale is global",
      "Estimates point to more than 10 million stray cats in Brazil alone, part of an estimated 480 million worldwide.",
      "### Shelters already can't keep up",
      "NGOs and shelters mostly already operate beyond capacity — an estimated 185,000 animals are in that situation, which makes mass removal and sheltering unfeasible as a long-term solution.",
      "### The conflict is measurable too",
      "About 40% of people have faced some kind of conflict with neighbors involving animals — a good portion of those cases are linked to unneutered street cats.",
      "### What these numbers mean in practice",
      "There isn't enough shelter capacity to remove street cats at scale, and isolated removal doesn't solve anything lastingly. That's why mass neutering (TNR) is the recommendation, not removal.",
    ],
    factChips_en: [
      "📊 More than 10 million stray cats in Brazil, and 480 million worldwide",
      "📊 40% of people have had conflict with neighbors involving animals",
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
    title_en: "5 myths about street cats worth debunking right now",
    summary_en: "Some popular beliefs aren't just wrong — they make the situation worse.",
    body_en: [
      "A lot of people make decisions about street cats based on beliefs that were never checked. Let's take down the most common ones, one by one.",
      "### Myth 1: \"street cats are always sick or dangerous\"",
      "In reality, most avoid human contact out of instinct, not aggression — and many are just as healthy as a house cat when well fed.",
      "### Myth 2: \"removing the cats solves the problem\"",
      "Decades of attempts in different cities show the opposite: an empty territory gets occupied quickly by another group, usually bigger and still unneutered.",
      "### Myth 3: \"feeding street cats increases the population\"",
      "What actually increases the population is the lack of neutering, not the food. Fed and neutered colonies tend to be stable, not growing.",
      "### Myth 4: \"a lone kitten is an abandoned kitten\"",
      "Most of the time, the mother is nearby hunting for food. Acting quickly without observing can needlessly separate a healthy kitten from its mother.",
      "### Myth 5: \"street cats can never be touched, period\"",
      "Socialized cats (that have had human contact) tolerate gradual approach. What varies is each cat's level of socialization, not a fixed rule for all of them.",
    ],
    factChips_en: [
      "📊 Feeding street cats doesn't increase the population — lack of neutering does",
      "📊 Most \"abandoned\" kittens have a mother nearby, hunting for food",
    ],
  },
  {
    slug: "plantas-toxicas",
    level: 3,
    href: "/plants",
    title: "Plantas tóxicas para gatos que crescem na rua",
    summary: "Espirradeira, comigo-ninguém-pode, boa-noite e outras 9 plantas comuns no Brasil que podem intoxicar gatos. Com ilustrações para identificação.",
    body: [],
    factChips: [
      "📊 A espirradeira (Nerium oleander) é uma das plantas mais perigosas e aparece em calçadas e praças",
      "📊 Intoxicação por lírio (Lilium spp.) pode causar insuficiência renal fatal em gatos em menos de 72h",
    ],
    title_en: "Toxic plants for cats that grow on the street",
    summary_en: "Oleander, dumbcane, periwinkle and 9 other plants common in Brazil that can poison cats. With illustrations for identification.",
    body_en: [],
    factChips_en: [
      "📊 Oleander (Nerium oleander) is one of the most dangerous plants and shows up on sidewalks and in public squares",
      "📊 Lily poisoning (Lilium spp.) can cause fatal kidney failure in cats in under 72 hours",
    ],
  },
  {
    slug: "feral-semi-feral-e-socializado",
    level: 1,
    title: "Feral, semi-feral ou socializado? O comportamento explica tudo",
    summary: "Nem todo gato de rua reage do mesmo jeito — e essa diferença muda completamente como ajudar.",
    body: [
      "Você já deve ter visto um gato de rua que some no primeiro movimento brusco, e outro que vem direto pedir comida. Não é sorte nem personalidade aleatória: é o nível de socialização de cada um, e ele muda o que funciona ou não na hora de ajudar.",
      "### Gato feral",
      "Nunca teve contato próximo com humanos, ou teve tão pouco que não criou nenhuma confiança. Mantém distância segura, não mia pedindo atenção, evita olhar nos olhos, e foge ao menor sinal de aproximação. Não é \"selvagem\" ou agressivo por natureza — é cauteloso, porque humano sempre representou risco pra ele.",
      "### Gato semi-feral",
      "Teve algum contato humano, geralmente indireto — cresceu perto de um ponto de alimentação, ou foi cuidado a distância por alguém da vizinhança. Tolera presença humana a uma certa distância, pode se aproximar pra comer quando a pessoa se afasta um pouco, mas raramente aceita toque direto.",
      "### Gato socializado",
      "Já teve convívio próximo e positivo com pessoas — pode ter sido domiciliado antes, ou nascido de mãe socializada e exposto a humanos desde filhote. Mia pedindo atenção, se aproxima por conta própria, e tolera contato físico, carinho e até colo.",
      "### Por que essa diferença importa na prática",
      "Tentar tocar ou capturar um gato feral do mesmo jeito que se faria com um socializado costuma assustar o animal e gerar risco de mordida ou arranhão — não por maldade, mas por puro instinto de defesa. Já um gato socializado pode até sofrer mais perdendo o convívio humano do que ficando na rua, o que muda a prioridade de ajuda (buscar adoção em vez de só TNR, por exemplo).",
      "### O nível de socialização não é fixo pra sempre",
      "Um filhote feral pode se tornar socializado com exposição gradual e positiva a humanos, especialmente nas primeiras semanas de vida. Já um adulto feral raramente muda muito — e isso é normal, não é falha de ninguém.",
    ],
    factChips: [
      "📊 O nível de socialização, não a espécie, é o que define como um gato de rua reage a humanos",
      "📊 Filhotes têm uma janela de algumas semanas em que a socialização é mais fácil de desenvolver",
    ],
    title_en: "Feral, semi-feral, or socialized? Behavior explains everything",
    summary_en: "Not every street cat reacts the same way — and that difference completely changes how to help.",
    body_en: [
      "You've probably seen one street cat that vanishes at the slightest sudden move, and another that comes straight up asking for food. It's not luck or random personality: it's each cat's level of socialization, and it changes what does or doesn't work when helping.",
      "### Feral cat",
      "Never had close contact with humans, or had so little that no trust was built. Keeps a safe distance, doesn't meow for attention, avoids eye contact, and flees at the smallest sign of approach. It's not \"wild\" or naturally aggressive — it's cautious, because humans have always represented risk to it.",
      "### Semi-feral cat",
      "Had some human contact, usually indirect — grew up near a feeding spot, or was cared for from a distance by someone in the neighborhood. Tolerates human presence at a certain distance, may approach to eat when the person steps back a bit, but rarely accepts direct touch.",
      "### Socialized cat",
      "Has already had close, positive contact with people — may have been a house cat before, or been born to a socialized mother and exposed to humans since kittenhood. Meows for attention, approaches on its own, and tolerates physical contact, petting, and even being held.",
      "### Why this difference matters in practice",
      "Trying to touch or capture a feral cat the same way you would a socialized one tends to scare the animal and creates a risk of biting or scratching — not out of malice, but pure defensive instinct. A socialized cat, on the other hand, may actually suffer more from losing human contact than from staying on the street, which changes the priority of help (seeking adoption instead of just TNR, for example).",
      "### The level of socialization isn't fixed forever",
      "A feral kitten can become socialized with gradual, positive exposure to humans, especially in the first weeks of life. A feral adult, on the other hand, rarely changes much — and that's normal, not anyone's failure.",
    ],
    factChips_en: [
      "📊 The level of socialization, not the species, is what determines how a street cat reacts to humans",
      "📊 Kittens have a window of a few weeks in which socialization is easier to develop",
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
  return Math.max(1, Math.round(wordCount / 130));
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
