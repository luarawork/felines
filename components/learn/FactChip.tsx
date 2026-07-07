// Small pill-shaped callout for an impactful data point inside an
// article body — meant to break up long paragraphs with a quick,
// scannable fact.
export default function FactChip({ text }: { text: string }) {
  return (
    <span className="inline-block rounded-full border border-felines-border bg-felines-background px-3 py-1 text-sm">
      {text}
    </span>
  );
}
