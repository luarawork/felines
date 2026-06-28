// Canonical site URL, used for Open Graph/canonical metadata and for
// building absolute share links. No production domain is deployed yet
// (see README's Roadmap) — falls back to localhost so metadata/share
// URLs still resolve correctly in local development.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
