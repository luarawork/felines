// Small pill-shaped callout for an impactful data point inside an
// article body — meant to break up long paragraphs with a quick,
// scannable fact.
export default function FactChip({ text }: { text: string }) {
  return (
    <span
      className="inline-block border"
      style={{
        background: "#F9F6F2",
        borderColor: "#E8E4DF",
        borderWidth: "1px",
        borderRadius: "20px",
        padding: "4px 12px",
        fontSize: "14px",
      }}
    >
      {text}
    </span>
  );
}
