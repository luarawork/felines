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
  commonName_en?: string;
  toxicParts_en?: string[];
  symptoms_en?: string[];
  onsetTime_en?: string;
  notes_en?: string;
};

// Picks the English variant fields when language is "en", falling back to
// the Portuguese originals otherwise (and if an _en field is missing).
export function localizeToxicPlant(plant: ToxicPlant, language: "pt" | "en"): ToxicPlant {
  if (language !== "en") return plant;
  return {
    ...plant,
    commonName: plant.commonName_en ?? plant.commonName,
    toxicParts: plant.toxicParts_en ?? plant.toxicParts,
    symptoms: plant.symptoms_en ?? plant.symptoms,
    onsetTime: plant.onsetTime_en ?? plant.onsetTime,
    notes: plant.notes_en ?? plant.notes,
  };
}

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
    commonName_en: "Oleander",
    toxicParts_en: ["leaves", "flowers", "stems", "sap"],
    symptoms_en: [
      "excessive drooling",
      "vomiting",
      "diarrhea",
      "muscle tremors",
      "cardiac arrhythmia",
      "collapse",
    ],
    onsetTime_en: "30 minutes to 2 hours",
    notes_en:
      "One of the most dangerous plants in Brazil. Very common in hedges, sidewalks, and public squares.",
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
    commonName_en: "Dumbcane",
    toxicParts_en: ["leaves", "stems", "sap"],
    symptoms_en: [
      "intense burning in mouth and throat",
      "excessive drooling",
      "difficulty swallowing",
      "swelling of tongue and lips",
      "vomiting",
    ],
    onsetTime_en: "immediate on contact with mucous membranes",
    notes_en:
      "The calcium oxalate crystals in the sap cause immediate burning. Can obstruct the airway in severe cases.",
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
    commonName_en: "Peace lily",
    toxicParts_en: ["all parts of the plant"],
    symptoms_en: [
      "excessive drooling",
      "burning in the mouth",
      "vomiting",
      "difficulty swallowing",
    ],
    onsetTime_en: "up to 2 hours",
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
    commonName_en: "True lily",
    toxicParts_en: ["all parts — including pollen and vase water"],
    symptoms_en: [
      "vomiting",
      "lethargy",
      "loss of appetite",
      "acute kidney failure",
    ],
    onsetTime_en: "0 to 12 hours (kidney failure within 24–72 h)",
    notes_en:
      "Especially dangerous for cats. Even small amounts can cause fatal kidney failure. Peace lily (Spathiphyllum) is not a true Lilium and is much less toxic.",
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
    commonName_en: "Pencil cactus / Firestick plant",
    toxicParts_en: ["latex (white sap)"],
    symptoms_en: [
      "burning in eyes and skin",
      "conjunctivitis",
      "temporary blindness",
      "vomiting",
      "diarrhea",
      "drooling",
    ],
    onsetTime_en: "immediate on contact with sap",
    notes_en: "Very common on sidewalks and vacant lots in Brazil's Northeast. The latex is extremely irritating.",
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
    commonName_en: "Cuphea / Tarweed",
    toxicParts_en: ["leaves", "flowers"],
    symptoms_en: ["mild gastrointestinal irritation", "occasional vomiting"],
    onsetTime_en: "1 to 4 hours",
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
    commonName_en: "Calla lily",
    toxicParts_en: ["all parts of the plant"],
    symptoms_en: [
      "intense burning in the mouth",
      "excessive drooling",
      "vomiting",
      "difficulty swallowing",
    ],
    onsetTime_en: "immediate to 2 hours",
    notes_en: "Also contains calcium oxalate crystals, like dumbcane.",
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
    commonName_en: "Madagascar periwinkle",
    toxicParts_en: ["all parts of the plant"],
    symptoms_en: [
      "vomiting",
      "diarrhea",
      "neurological depression",
      "tremors",
      "seizures",
    ],
    onsetTime_en: "30 minutes to 3 hours",
    notes_en: "Very common in street planters and gardens across Brazil.",
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
    commonName_en: "Ferns (some species)",
    toxicParts_en: ["young leaves", "shoots"],
    symptoms_en: ["vomiting", "diarrhea", "lethargy"],
    onsetTime_en: "2 to 6 hours",
    notes_en:
      "Bracken fern (Pteridium) is the biggest concern on vacant lots. Asparagus fern (Asparagus) is common in gardens.",
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
    commonName_en: "Bougainvillea",
    toxicParts_en: ["leaves", "sap"],
    symptoms_en: ["mild skin irritation", "contact dermatitis"],
    onsetTime_en: "direct contact",
    notes_en: "The main risk is contact with the sap — ingestion rarely causes serious symptoms.",
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
    commonName_en: "Crown of thorns",
    toxicParts_en: ["latex (white sap)"],
    symptoms_en: [
      "burning in the mouth",
      "drooling",
      "vomiting",
      "skin irritation",
    ],
    onsetTime_en: "immediate on contact with sap",
    notes_en: "Very common on sidewalks. The thorns also pose a physical risk.",
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
    commonName_en: "Brazilian raintree / Yesterday-today-and-tomorrow",
    toxicParts_en: ["fruit", "flowers", "leaves", "stems"],
    symptoms_en: [
      "vomiting",
      "muscle tremors",
      "ataxia (loss of balance)",
      "seizures",
      "nystagmus (involuntary eye movement)",
    ],
    onsetTime_en: "30 minutes to 2 hours",
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

export const TOXICITY_LABELS_EN: Record<ToxicityLevel, { label: string; color: string; emoji: string }> = {
  high: { label: "High toxicity", color: "felines-emergency", emoji: "🔴" },
  moderate: { label: "Moderate toxicity", color: "felines-warning", emoji: "🟠" },
  low: { label: "Low toxicity", color: "felines-success", emoji: "🟡" },
};
