// Reassurance shown above report forms when the visitor isn't logged
// in, so the lack of an account never feels like a blocker to reporting
// something urgent.
export default function AnonymousReportNotice() {
  return (
    <p className="mb-3 flex items-center gap-2 text-sm" style={{ color: "#2D2D2D" }}>
      <span style={{ color: "#6B8F6A" }}>✓</span>
      Não precisa de conta para fazer um relato. Só nos diga o que você viu.
    </p>
  );
}
