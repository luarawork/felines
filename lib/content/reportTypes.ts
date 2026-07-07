// Shared report type values, matching the `reports.type` check constraint
// in the database. Used by the report submission form and the reports
// confirmation/resolution list, so labels stay consistent everywhere.
// Labels live in lib/i18n/pt.ts and lib/i18n/en.ts under `reportTypes`,
// keyed by the same value strings below.
export const REPORT_TYPES: { value: string }[] = [
  { value: "no_food_water" },
  { value: "injured_sick" },
  { value: "new_kitten" },
  { value: "missing_cat" },
  { value: "suspected_poisoning" },
  { value: "suspected_abuse" },
  { value: "disease_outbreak" },
  { value: "threat_to_colony" },
  { value: "sighting" },
];

export function getReportTypeLabel(value: string, t: (key: string) => string): string {
  return t(`reportTypes.${value}`);
}
