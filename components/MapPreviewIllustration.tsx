// Simple decorative mock of the map for the home page's map-preview
// section — stylized streets and pins rather than a real screenshot, so
// it reads intentionally as an illustration matching the rest of the
// page instead of a stale, soon-outdated capture of the real map.
export default function MapPreviewIllustration({ label }: { label: string }) {
  return (
    <svg viewBox="0 0 480 360" className="h-full w-full" role="img" aria-label={label}>
      <rect width="480" height="360" rx="20" fill="#F2F2F2" />
      <path d="M0 90 H480" stroke="#E8E4DF" strokeWidth="10" />
      <path d="M0 240 H480" stroke="#E8E4DF" strokeWidth="10" />
      <path d="M140 0 V360" stroke="#E8E4DF" strokeWidth="10" />
      <path d="M340 0 V360" stroke="#E8E4DF" strokeWidth="10" />

      <circle cx="140" cy="90" r="12" fill="#B66119" />
      <circle cx="140" cy="90" r="22" fill="#B66119" opacity="0.15" />
      <circle cx="240" cy="160" r="12" fill="#B66119" />
      <circle cx="240" cy="160" r="22" fill="#B66119" opacity="0.15" />
      <circle cx="340" cy="240" r="8" fill="#6B6B6B" />
      <circle cx="100" cy="200" r="8" fill="#6B6B6B" />
      <circle cx="380" cy="100" r="12" fill="#C0392B" />
      <circle cx="380" cy="100" r="22" fill="#C0392B" opacity="0.15" />
    </svg>
  );
}
