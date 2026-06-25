// Small pill badge shown on colony map popups to explain why the pin
// isn't at the exact location. Location blur protects cats from
// malicious users who could use exact coordinates to find and harm
// animals — so the badge exists to make that tradeoff visible, not to
// apologize for it.
export type LocationAccessLevel = 1 | 2 | 3;

const BADGE_TEXT: Record<1 | 2, string> = {
  1: "Entre para ver mais perto",
  2: "Torne-se cuidador para ver a localização exata",
};

export default function LocationBlurBadge({ level }: { level: LocationAccessLevel }) {
  if (level === 3) return null;

  return (
    <span
      className="mt-2 inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium"
      style={{ background: "#FEF9EC", color: "#E8A838" }}
    >
      🔒 {BADGE_TEXT[level]}
    </span>
  );
}
