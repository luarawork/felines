// Reasons specific to "Report this pin" on the map — reuses the
// existing `flags` table (target_type: "colony") instead of a new
// table, since flags already supports exactly this shape (reason,
// optional details, optional anonymous created_by).
// Labels live in lib/i18n/pt.ts and lib/i18n/en.ts under `falsePinReasons`,
// keyed by the same value strings below.
export const FALSE_PIN_REASONS: { value: string }[] = [
  { value: "never_seen_cats" },
  { value: "location_doesnt_exist" },
  { value: "duplicate_colony" },
  { value: "suspicious_harmful" },
];

export function getFalsePinReasonLabel(value: string, t: (key: string) => string): string {
  return t(`falsePinReasons.${value}`);
}
