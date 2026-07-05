// Shared "did you know" fact chips shown on colony pages (all 15) and,
// as a shorter subset, in the map's empty-state ("no colonies in view")
// panel — general background on street cats, not specific to any one
// colony, but useful context for a first-time visitor. Translated
// strings come from lib/i18n/{pt,en}.ts under "colonyFactChips.*"; this
// function only assembles the list, so `t` is a parameter rather than
// calling useLanguage() here (this file has no React context of its own).
export function getColonyFactChips(t: (key: string) => string): string[] {
  return Array.from({ length: 15 }, (_, i) => t(`colonyFactChips.${i}`));
}

// The map's empty-state panel only has room for a handful — reuses the
// same translated indices the map previously kept as its own duplicate
// list, instead of maintaining a second copy of the same facts.
const MAP_EMPTY_STATE_INDICES = [0, 3, 5, 7, 4, 12];

export function getMapEmptyStateFacts(t: (key: string) => string): string[] {
  const all = getColonyFactChips(t);
  return MAP_EMPTY_STATE_INDICES.map((i) => all[i]);
}
