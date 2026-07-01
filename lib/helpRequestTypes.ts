// Shared values/icons for help_requests.type, matching the database check
// constraint — used by the creation form, colony banner, map, and /impact.
// Labels live in lib/i18n/pt.ts and lib/i18n/en.ts under `helpRequestTypes`,
// keyed by the same value strings below.
export const HELP_REQUEST_TYPES: { value: string; icon: string }[] = [
  { value: "food_supplies", icon: "🍽️" },
  { value: "foster_home", icon: "🏠" },
  { value: "vet_transport", icon: "🚗" },
  { value: "neutering_help", icon: "✂️" },
  { value: "backup_caretaker", icon: "👤" },
  { value: "medication", icon: "💊" },
  { value: "other", icon: "❓" },
];

export function getHelpRequestTypeLabel(value: string, t: (key: string) => string): string {
  return t(`helpRequestTypes.${value}`);
}

export function getHelpRequestTypeIcon(value: string): string {
  return HELP_REQUEST_TYPES.find((type) => type.value === value)?.icon ?? "❓";
}
