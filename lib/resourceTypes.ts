// Shared labels for resource_posts.category, matching the database
// check constraint.
export const RESOURCE_CATEGORIES: { value: string; label: string; icon: string }[] = [
  { value: "food_supplies", label: "Comida / suprimentos", icon: "🍽️" },
  { value: "equipment", label: "Equipamento (caixas, potes, abrigos)", icon: "📦" },
  { value: "transport", label: "Transporte", icon: "🚗" },
  { value: "medication", label: "Medicamento / suprimentos veterinários", icon: "💊" },
  { value: "volunteer_time", label: "Tempo voluntário", icon: "🤝" },
  { value: "other", label: "Outro", icon: "❓" },
];

export function getResourceCategoryLabel(value: string): string {
  return RESOURCE_CATEGORIES.find((category) => category.value === value)?.label ?? value;
}

export function getResourceCategoryIcon(value: string): string {
  return RESOURCE_CATEGORIES.find((category) => category.value === value)?.icon ?? "❓";
}
