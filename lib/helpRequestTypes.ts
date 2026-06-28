// Shared labels for help_requests.type, matching the database check
// constraint — used by the creation form, colony banner, map, and /impact.
export const HELP_REQUEST_TYPES: { value: string; label: string; icon: string }[] = [
  { value: "food_supplies", label: "Comida / suprimentos", icon: "🍽️" },
  { value: "foster_home", label: "Lar temporário", icon: "🏠" },
  { value: "vet_transport", label: "Transporte ao veterinário", icon: "🚗" },
  { value: "neutering_help", label: "Ajuda com castração", icon: "✂️" },
  { value: "backup_caretaker", label: "Cuidador de apoio", icon: "👤" },
  { value: "medication", label: "Medicamento ou suporte veterinário", icon: "💊" },
  { value: "other", label: "Outro", icon: "❓" },
];

export function getHelpRequestTypeLabel(value: string): string {
  return HELP_REQUEST_TYPES.find((type) => type.value === value)?.label ?? value;
}

export function getHelpRequestTypeIcon(value: string): string {
  return HELP_REQUEST_TYPES.find((type) => type.value === value)?.icon ?? "❓";
}
