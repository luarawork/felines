// Static catalogue of plants toxic to cats that commonly grow in
// Brazilian streets, vacant lots, and gardens. Each entry has a
// common name, scientific name, toxicity level, the parts that are
// toxic, symptom onset, and a list of symptoms. imageUrl is null
// until the asset is placed in /public/images/plants/; the page
// renders a color-coded emoji placeholder when it's absent.
export type ToxicityLevel = "high" | "moderate" | "low";

export type ToxicPlant = {
  slug: string;
  commonName: string;
  scientificName: string;
  toxicityLevel: ToxicityLevel;
  toxicParts: string[];
  symptoms: string[];
  onsetTime: string;
  imageUrl: string | null;
  notes?: string;
};

export const TOXIC_PLANTS: ToxicPlant[] = [
  {
    slug: "espirradeira",
    commonName: "Espirradeira",
    scientificName: "Nerium oleander",
    toxicityLevel: "high",
    toxicParts: ["folhas", "flores", "caules", "seiva"],
    symptoms: [
      "salivação excessiva",
      "vômitos",
      "diarreia",
      "tremores musculares",
      "arritmia cardíaca",
      "colapso",
    ],
    onsetTime: "30 minutos a 2 horas",
    imageUrl: null,
    notes:
      "Uma das plantas mais perigosas do Brasil. Muito comum em cercas vivas, calçadas e praças.",
  },
  {
    slug: "comigo-ninguem-pode",
    commonName: "Comigo-ninguém-pode",
    scientificName: "Dieffenbachia spp.",
    toxicityLevel: "high",
    toxicParts: ["folhas", "caules", "seiva"],
    symptoms: [
      "queimação intensa na boca e na garganta",
      "salivação excessiva",
      "dificuldade para engolir",
      "inchaço da língua e lábios",
      "vômitos",
    ],
    onsetTime: "imediato ao toque nas mucosas",
    imageUrl: null,
    notes:
      "Os cristais de oxalato de cálcio presentes na seiva causam ardência imediata. Pode obstruir as vias aéreas em casos graves.",
  },
  {
    slug: "lirio-da-paz",
    commonName: "Lírio-da-paz",
    scientificName: "Spathiphyllum spp.",
    toxicityLevel: "moderate",
    toxicParts: ["todas as partes da planta"],
    symptoms: [
      "salivação excessiva",
      "queimação na boca",
      "vômitos",
      "dificuldade para engolir",
    ],
    onsetTime: "até 2 horas",
    imageUrl: null,
  },
  {
    slug: "lirio-verdadeiro",
    commonName: "Lírio (verdadeiro)",
    scientificName: "Lilium spp.",
    toxicityLevel: "high",
    toxicParts: ["todas as partes — inclusive o pólen e a água do vaso"],
    symptoms: [
      "vômitos",
      "letargia",
      "perda de apetite",
      "insuficiência renal aguda",
    ],
    onsetTime: "0 a 12 horas (insuficiência renal em 24–72 h)",
    imageUrl: null,
    notes:
      "Especialmente perigoso para gatos. Mesmo pequenas quantidades podem causar insuficiência renal fatal. Lirio-da-paz (Spathiphyllum) não é Lilium e tem toxicidade menor.",
  },
  {
    slug: "aveloz",
    commonName: "Aveloz / Árvore-do-diabo",
    scientificName: "Euphorbia tirucalli",
    toxicityLevel: "high",
    toxicParts: ["látex (seiva branca)"],
    symptoms: [
      "queimação nos olhos e na pele",
      "conjuntivite",
      "cegueira temporária",
      "vômitos",
      "diarreia",
      "salivação",
    ],
    onsetTime: "imediato no contato com seiva",
    imageUrl: null,
    notes: "Muito comum em calçadas e terrenos baldios no Nordeste. O látex é extremamente irritante.",
  },
  {
    slug: "sete-sangrias",
    commonName: "Sete-sangrias",
    scientificName: "Cuphea carthagenensis",
    toxicityLevel: "low",
    toxicParts: ["folhas", "flores"],
    symptoms: ["irritação gastrointestinal leve", "vômitos ocasionais"],
    onsetTime: "1 a 4 horas",
    imageUrl: null,
  },
  {
    slug: "copo-de-leite",
    commonName: "Copo-de-leite",
    scientificName: "Zantedeschia aethiopica",
    toxicityLevel: "moderate",
    toxicParts: ["todas as partes da planta"],
    symptoms: [
      "queimação intensa na boca",
      "salivação excessiva",
      "vômitos",
      "dificuldade para engolir",
    ],
    onsetTime: "imediato a 2 horas",
    imageUrl: null,
    notes: "Também contém cristais de oxalato de cálcio, como a comigo-ninguém-pode.",
  },
  {
    slug: "boa-noite",
    commonName: "Boa-noite",
    scientificName: "Catharanthus roseus",
    toxicityLevel: "high",
    toxicParts: ["todas as partes da planta"],
    symptoms: [
      "vômitos",
      "diarreia",
      "depressão neurológica",
      "tremores",
      "convulsões",
    ],
    onsetTime: "30 minutos a 3 horas",
    imageUrl: null,
    notes: "Muito comum em canteiros de rua e jardins no Brasil inteiro.",
  },
  {
    slug: "samambaias-de-samambaia",
    commonName: "Samambaias (algumas espécies)",
    scientificName: "Pteridium aquilinum e Asparagus spp.",
    toxicityLevel: "moderate",
    toxicParts: ["folhas jovens", "brotos"],
    symptoms: ["vômitos", "diarreia", "letargia"],
    onsetTime: "2 a 6 horas",
    imageUrl: null,
    notes:
      "A samambaia-preta (Pteridium) é a mais preocupante em terrenos baldios. A samambaia-aspargo (Asparagus) é comum em jardins.",
  },
  {
    slug: "primavera",
    commonName: "Primavera / Buganvília",
    scientificName: "Bougainvillea spp.",
    toxicityLevel: "low",
    toxicParts: ["folhas", "seiva"],
    symptoms: ["irritação leve na pele", "dermatite de contato"],
    onsetTime: "contato direto",
    imageUrl: null,
    notes: "O risco principal é o contato com a seiva — ingestão raramente causa sintomas graves.",
  },
  {
    slug: "coroa-de-cristo",
    commonName: "Coroa-de-Cristo",
    scientificName: "Euphorbia milii",
    toxicityLevel: "moderate",
    toxicParts: ["látex (seiva branca)"],
    symptoms: [
      "queimação na boca",
      "salivação",
      "vômitos",
      "irritação cutânea",
    ],
    onsetTime: "imediato no contato com seiva",
    imageUrl: null,
    notes: "Muito presente em calçadas. Os espinhos também representam risco físico.",
  },
  {
    slug: "beladona-brasileira",
    commonName: "Beladona-brasileira / Sombra-de-touro",
    scientificName: "Brunfelsia spp.",
    toxicityLevel: "high",
    toxicParts: ["frutos", "flores", "folhas", "caules"],
    symptoms: [
      "vômitos",
      "tremores musculares",
      "ataxia (desequilíbrio)",
      "convulsões",
      "nistagmo (olhos em movimento involuntário)",
    ],
    onsetTime: "30 minutos a 2 horas",
    imageUrl: null,
  },
];

export function getPlantBySlug(slug: string): ToxicPlant | undefined {
  return TOXIC_PLANTS.find((plant) => plant.slug === slug);
}

export const TOXICITY_LABELS: Record<ToxicityLevel, { label: string; color: string; emoji: string }> = {
  high: { label: "Alta toxicidade", color: "felines-emergency", emoji: "🔴" },
  moderate: { label: "Toxicidade moderada", color: "felines-warning", emoji: "🟠" },
  low: { label: "Baixa toxicidade", color: "felines-success", emoji: "🟡" },
};
