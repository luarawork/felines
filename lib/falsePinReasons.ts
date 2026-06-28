// Reasons specific to "Report this pin" on the map — reuses the
// existing `flags` table (target_type: "colony") instead of a new
// table, since flags already supports exactly this shape (reason,
// optional details, optional anonymous created_by).
export const FALSE_PIN_REASONS: { value: string; label: string }[] = [
  { value: "never_seen_cats", label: "Nunca vi gatos aqui" },
  { value: "location_doesnt_exist", label: "Esse local não existe" },
  { value: "duplicate_colony", label: "Parece duplicado de outra colônia" },
  { value: "suspicious_harmful", label: "Conteúdo suspeito ou nocivo" },
];

export function getFalsePinReasonLabel(value: string): string {
  return FALSE_PIN_REASONS.find((reason) => reason.value === value)?.label ?? value;
}
