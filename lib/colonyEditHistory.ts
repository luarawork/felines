// Shared encode/decode for "colony_edited" timeline_events. The table
// only has a free-text `description` column, so the structured
// field/old/new payload needed for the expandable edit-history view is
// JSON-encoded into it — same embedding trick already used for the
// cat-unseen notification's "(ref:<cat id>)" marker.
export type ColonyEditField = "name" | "narrative" | "castration_status";

export type ColonyEditPayload = {
  field: ColonyEditField;
  oldValue: string;
  newValue: string;
};

export const FIELD_LABELS: Record<ColonyEditField, string> = {
  name: "nome",
  narrative: "narrativa",
  castration_status: "status de castração",
};

export function encodeColonyEdit(payload: ColonyEditPayload): string {
  return JSON.stringify(payload);
}

export function decodeColonyEdit(description: string | null): ColonyEditPayload | null {
  if (!description) return null;
  try {
    const parsed = JSON.parse(description);
    if (parsed && typeof parsed.field === "string") return parsed as ColonyEditPayload;
    return null;
  } catch {
    return null;
  }
}

export function getFieldLabel(field: string): string {
  return FIELD_LABELS[field as ColonyEditField] ?? field;
}
