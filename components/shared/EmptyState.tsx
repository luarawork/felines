// Shared empty-state layout used across the app — main message,
// optional sub-text, and one or two CTAs. Replaces generic "nothing
// here yet" placeholders with something specific and on-brand.
import Link from "next/link";

type EmptyStateCta = { label: string; href: string };

export default function EmptyState({
  main,
  sub,
  ctas,
  className = "",
}: {
  main: string;
  sub?: string;
  ctas?: EmptyStateCta[];
  className?: string;
}) {
  return (
    <div className={`rounded-xl border border-felines-border bg-felines-surface p-5 text-center ${className}`}>
      <p className="font-semibold text-felines-text-primary">{main}</p>
      {sub && <p className="mt-1 text-sm text-felines-text-secondary">{sub}</p>}
      {ctas && ctas.length > 0 && (
        <div className="mt-3 flex flex-wrap justify-center gap-3">
          {ctas.map((cta) => (
            <Link
              key={cta.href}
              href={cta.href}
              className="text-sm font-medium text-felines-accent hover:text-felines-accent-hover"
            >
              {cta.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
