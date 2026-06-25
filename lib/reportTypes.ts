// Shared report type labels, matching the `reports.type` check constraint
// in the database. Used by the report submission form and the reports
// confirmation/resolution list, so labels stay consistent everywhere.
export const REPORT_TYPES: { value: string; label: string }[] = [
  { value: "no_food_water", label: "Sem comida ou água" },
  { value: "injured_sick", label: "Gato ferido ou doente" },
  { value: "new_kitten", label: "Filhote novo" },
  { value: "missing_cat", label: "Gato desaparecido" },
  { value: "suspected_poisoning", label: "Suspeita de envenenamento" },
  { value: "suspected_abuse", label: "Suspeita de maus-tratos" },
  { value: "disease_outbreak", label: "Surto de doença" },
  { value: "threat_to_colony", label: "Ameaça à colônia" },
  { value: "sighting", label: "Avistamento" },
];

export function getReportTypeLabel(value: string): string {
  return REPORT_TYPES.find((reportType) => reportType.value === value)?.label ?? value;
}
