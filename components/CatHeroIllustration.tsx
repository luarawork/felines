// Clean, simple SVG illustration of a street cat for the hero — used in
// place of field photography, which isn't available as a project asset
// yet. Flat shapes only, on-brand terracotta, so it reads as an
// intentional illustration rather than a placeholder.
export default function CatHeroIllustration() {
  return (
    <svg
      viewBox="0 0 480 480"
      className="h-full w-full"
      role="img"
      aria-label="Ilustração de um gato de rua sentado"
    >
      <circle cx="240" cy="240" r="220" fill="#FDF0EB" />
      <ellipse cx="240" cy="340" rx="120" ry="80" fill="#C4704F" />
      <path d="M150 220 L180 120 L210 220 Z" fill="#C4704F" />
      <path d="M330 220 L300 120 L270 220 Z" fill="#C4704F" />
      <path d="M160 200 L182 145 L200 200 Z" fill="#A85A3A" />
      <path d="M320 200 L298 145 L280 200 Z" fill="#A85A3A" />
      <circle cx="240" cy="230" r="95" fill="#C4704F" />
      <circle cx="205" cy="220" r="10" fill="#2D2D2D" />
      <circle cx="275" cy="220" r="10" fill="#2D2D2D" />
      <path d="M232 248 L248 248 L240 260 Z" fill="#2D2D2D" />
      <path
        d="M240 262 Q220 280 195 270"
        stroke="#2D2D2D"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M240 262 Q260 280 285 270"
        stroke="#2D2D2D"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <line x1="160" y1="225" x2="100" y2="215" stroke="#2D2D2D" strokeWidth="2" />
      <line x1="160" y1="240" x2="100" y2="245" stroke="#2D2D2D" strokeWidth="2" />
      <line x1="320" y1="225" x2="380" y2="215" stroke="#2D2D2D" strokeWidth="2" />
      <line x1="320" y1="240" x2="380" y2="245" stroke="#2D2D2D" strokeWidth="2" />
      <path
        d="M345 320 Q400 300 390 220"
        stroke="#C4704F"
        strokeWidth="22"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
