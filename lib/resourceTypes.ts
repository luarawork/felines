// Shared values/icons for resource_posts.category, matching the database
// check constraint. Labels live in lib/i18n/pt.ts and lib/i18n/en.ts under
// `resourceTypes`, keyed by the same value strings below.
export const RESOURCE_CATEGORIES: { value: string; icon: string }[] = [
  { value: "food_supplies", icon: "🍽️" },
  { value: "equipment", icon: "📦" },
  { value: "transport", icon: "🚗" },
  { value: "medication", icon: "💊" },
  { value: "volunteer_time", icon: "🤝" },
  { value: "other", icon: "❓" },
];

export function getResourceCategoryLabel(value: string, t: (key: string) => string): string {
  return t(`resourceTypes.${value}`);
}

export function getResourceCategoryIcon(value: string): string {
  return RESOURCE_CATEGORIES.find((category) => category.value === value)?.icon ?? "❓";
}
