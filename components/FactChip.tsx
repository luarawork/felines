// Small pill-shaped callout for an impactful data point inside an
// article body — meant to break up long paragraphs with a quick,
// scannable fact.
export default function FactChip({ text }: { text: string }) {
  return (
    <span
      className="inline-block rounded-full border px-3 py-1 text-sm"
      style={{ background: "#F9F6F2", borderColor: "#E8E4DF" }}
    >
      {text}
    </span>
  );
}
