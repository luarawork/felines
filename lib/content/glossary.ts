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
  {
    term: "Alimentação controlada",
    definition:
      "Oferecer comida em horários e locais fixos, em vez de deixar restos espalhados — atrai menos pragas, facilita monitorar quem come e ajuda a notar rapidamente se um gato parou de aparecer.",
    relatedArticleSlugs: ["living-with-a-cat-colony"],
    term_en: "Controlled feeding",
    definition_en:
      "Offering food at fixed times and places, instead of leaving scraps scattered around — attracts fewer pests, makes it easier to monitor who's eating, and helps notice quickly if a cat stops showing up.",
  },
  {
    term: "Cio",
    definition:
      "Período fértil de uma fêmea não castrada, marcado por miados altos e frequentes, inquietação e tentativas de sair de casa — um dos principais motivos de conflito com vizinhos, resolvido pela castração.",
    term_en: "Heat (estrus)",
    definition_en:
      "The fertile period of an unneutered female, marked by loud, frequent meowing, restlessness, and attempts to escape outside — one of the main sources of conflict with neighbors, resolved by neutering.",
  },
  {
    term: "Ninhada",
    definition:
      "O grupo de filhotes nascidos de uma mesma gestação — uma fêmea não castrada pode ter várias ninhadas por ano, o que explica a velocidade com que uma colônia sem manejo cresce.",
    term_en: "Litter",
    definition_en:
      "The group of kittens born from a single pregnancy — an unneutered female can have several litters a year, which explains how quickly an unmanaged colony grows.",
  },
  {
    term: "Pós-operatório (castração)",
    definition:
      "Período de recuperação de alguns dias após a cirurgia de castração, em que o gato precisa de repouso, um local seco e tranquilo, e observação para sinais de infecção no ponto do corte.",
    relatedArticleSlugs: ["castracao-reduz-conflitos"],
    term_en: "Post-op recovery",
    definition_en:
      "The few days of recovery after neutering surgery, during which the cat needs rest, a dry and quiet spot, and monitoring for signs of infection at the incision site.",
  },
  {
    term: "Guarda responsável",
    definition:
      "O conjunto de deveres de quem tem ou cuida de um animal: alimentação adequada, vacinação, castração, e não abandoná-lo — vale tanto para gatos domésticos quanto para quem assume uma colônia.",
    term_en: "Responsible pet ownership",
    definition_en:
      "The set of duties owed by anyone who owns or cares for an animal: proper feeding, vaccination, neutering, and never abandoning it — applies to house cats and colony caretakers alike.",
  },
  {
    term: "Bem-estar animal",
    definition:
      "Conceito que avalia a qualidade de vida de um animal além da simples sobrevivência — inclui ausência de dor e fome, liberdade para expressar comportamentos naturais, e ausência de medo crônico.",
    term_en: "Animal welfare",
    definition_en:
      "A concept that evaluates an animal's quality of life beyond mere survival — includes freedom from pain and hunger, the ability to express natural behaviors, and freedom from chronic fear.",
  },
  {
    term: "Vacina antirrábica",
    definition:
      "Imunização contra a raiva, doença viral fatal transmissível a humanos — aplicada gratuitamente em campanhas do CCZ e recomendada para todo gato de colônia manejada.",
    term_en: "Rabies vaccine",
    definition_en:
      "Immunization against rabies, a fatal viral disease transmissible to humans — offered free during CCZ campaigns and recommended for every cat in a managed colony.",
  },
  {
    term: "Superpopulação felina",
    definition:
      "Situação em que o número de gatos numa área excede o que o ambiente sustenta de forma saudável — geralmente causada pela ausência de castração, e revertida com TNR consistente ao longo do tempo.",
    factChip: "📊 Uma fêmea não castrada pode gerar até 3 ninhadas por ano.",
    relatedArticleSlugs: ["stray-cats-in-brazil-the-numbers"],
    term_en: "Feline overpopulation",
    definition_en:
      "A situation where the number of cats in an area exceeds what the environment can healthily sustain — usually caused by a lack of neutering, and reversed with consistent TNR over time.",
    factChip_en: "📊 An unneutered female can produce up to 3 litters a year.",
  },
  {
    term: "Verificação comunitária",
    definition:
      "Selo que uma colônia cadastrada no Felines recebe quando 3 pessoas diferentes (que não sejam o criador do cadastro nem cuidadores vinculados) confirmam já ter visto os gatos naquele local.",
    term_en: "Community verification",
    definition_en:
      "A badge a colony registered on Felines earns once 3 different people (not the colony's creator or linked caretakers) confirm they've actually seen cats at that location.",
  },
  {
    term: "Índice de saúde da colônia",
    definition:
      "Pontuação de 0 a 100 calculada automaticamente pelo Felines a partir de alimentação recente, avistamentos, taxa de castração, ausência de relatos graves e presença de cuidadores vinculados.",
    term_en: "Colony health index",
    definition_en:
      "A 0-100 score automatically calculated by Felines from recent feeding activity, sightings, neutering rate, absence of serious open reports, and whether the colony has linked caretakers.",
  },
  {
    term: "Denúncia anônima",
    definition:
      "Relato feito sem se identificar — o Felines permite isso para a maioria dos tipos de relato, e o Disque Denúncia (181) e a DEPREMA também aceitam denúncias de maus-tratos sem identificação do denunciante.",
    relatedArticleSlugs: ["how-to-report-animal-abuse"],
    term_en: "Anonymous report",
    definition_en:
      "A report made without identifying yourself — Felines allows this for most report types, and channels like Disque Denúncia (181) also accept abuse reports without identifying the reporter.",
  },
  {
    term: "Relato sensível",
    definition:
      "Categoria de relato (suspeita de envenenamento, maus-tratos ou surto de doença) que o Felines mantém visível na linha do tempo da colônia mesmo depois de resolvido, por ser informação relevante a longo prazo.",
    term_en: "Sensitive report",
    definition_en:
      "A report category (suspected poisoning, abuse, or disease outbreak) that Felines keeps visible in the colony's timeline even after it's resolved, since it's relevant information long-term.",
  },
  {
    term: "Pino sinalizado",
    definition:
      "Um pino no mapa do Felines marcado por 3 ou mais pessoas como possivelmente falso (local que não existe, colônia duplicada, ou conteúdo suspeito) — aparece com um aviso, mas não é removido automaticamente.",
    term_en: "Flagged pin",
    definition_en:
      "A pin on the Felines map marked by 3 or more people as possibly false (a nonexistent location, a duplicate colony, or suspicious content) — shows a warning, but isn't automatically removed.",
  },
  {
    term: "Troca de recursos",
    definition:
      "Mural do Felines onde cuidadores oferecem ou procuram itens como ração, transporte e equipamentos — sem dinheiro envolvido, só combinação direta entre quem oferece e quem precisa.",
    term_en: "Resource exchange",
    definition_en:
      "A board on Felines where caretakers offer or request items like food, transport, and equipment — no money involved, just direct coordination between whoever's offering and whoever needs it.",
  },
];
