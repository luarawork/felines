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

// Translated strings come from lib/i18n/{pt,en}.ts under
// "editHistory.fields.*" — `t` is a parameter since this file has no
// React context of its own.
export function getFieldLabel(field: string, t: (key: string) => string): string {
  const key = `editHistory.fields.${field}`;
  const translated = t(key);
  return translated === key ? field : translated;
}
