// Diagnostic quiz helping a visitor figure out what's likely going on
// with cats in their area — distinct from lib/quiz.ts (the "what kind
// of neighbor are you" identity quiz on /profile): this one is about
// the situation, not the person answering. Translated strings come from
// lib/i18n/{pt,en}.ts under "neighborhoodQuizContent.*" — these functions
// only assemble the structure, so `t` is a parameter rather than calling
// useLanguage() here (this file has no React context of its own).
export type AnswerKey = "A" | "B" | "C" | "D";

export type NeighborhoodQuestion = {
  question: string;
  options: { key: AnswerKey; label: string }[];
};

export function getNeighborhoodQuestions(t: (key: string) => string): NeighborhoodQuestion[] {
  return [
    {
      question: t("neighborhoodQuizContent.q1.question"),
      options: [
        { key: "A", label: t("neighborhoodQuizContent.q1.options.0") },
        { key: "B", label: t("neighborhoodQuizContent.q1.options.1") },
        { key: "C", label: t("neighborhoodQuizContent.q1.options.2") },
        { key: "D", label: t("neighborhoodQuizContent.q1.options.3") },
      ],
    },
    {
      question: t("neighborhoodQuizContent.q2.question"),
      options: [
        { key: "A", label: t("neighborhoodQuizContent.q2.options.0") },
        { key: "B", label: t("neighborhoodQuizContent.q2.options.1") },
        { key: "C", label: t("neighborhoodQuizContent.q2.options.2") },
        { key: "D", label: t("neighborhoodQuizContent.q2.options.3") },
      ],
    },
    {
      question: t("neighborhoodQuizContent.q3.question"),
      options: [
        { key: "A", label: t("neighborhoodQuizContent.q3.options.0") },
        { key: "B", label: t("neighborhoodQuizContent.q3.options.1") },
        { key: "C", label: t("neighborhoodQuizContent.q3.options.2") },
        { key: "D", label: t("neighborhoodQuizContent.q3.options.3") },
      ],
    },
    {
      question: t("neighborhoodQuizContent.q4.question"),
      options: [
        { key: "A", label: t("neighborhoodQuizContent.q4.options.0") },
        { key: "B", label: t("neighborhoodQuizContent.q4.options.1") },
        { key: "C", label: t("neighborhoodQuizContent.q4.options.2") },
        { key: "D", label: t("neighborhoodQuizContent.q4.options.3") },
      ],
    },
  ];
}

export type DiagnosisKey = "established" | "unregistered" | "conflict" | "unclear";

export type Diagnosis = {
  title: string;
  explanation: string;
  ctaLabel: string;
  ctaHref: string;
};

export function getDiagnoses(t: (key: string) => string): Record<DiagnosisKey, Diagnosis> {
  return {
    established: {
      title: t("neighborhoodQuizContent.diagnoses.established.title"),
      explanation: t("neighborhoodQuizContent.diagnoses.established.explanation"),
      ctaLabel: t("neighborhoodQuizContent.diagnoses.established.ctaLabel"),
      ctaHref: "/map",
    },
    unregistered: {
      title: t("neighborhoodQuizContent.diagnoses.unregistered.title"),
      explanation: t("neighborhoodQuizContent.diagnoses.unregistered.explanation"),
      ctaLabel: t("neighborhoodQuizContent.diagnoses.unregistered.ctaLabel"),
      ctaHref: "/colony/new",
    },
    conflict: {
      title: t("neighborhoodQuizContent.diagnoses.conflict.title"),
      explanation: t("neighborhoodQuizContent.diagnoses.conflict.explanation"),
      ctaLabel: t("neighborhoodQuizContent.diagnoses.conflict.ctaLabel"),
      ctaHref: "/learn/cats-bothering-your-building",
    },
    unclear: {
      title: t("neighborhoodQuizContent.diagnoses.unclear.title"),
      explanation: t("neighborhoodQuizContent.diagnoses.unclear.explanation"),
      ctaLabel: t("neighborhoodQuizContent.diagnoses.unclear.ctaLabel"),
      ctaHref: "/map",
    },
  };
}

// Priority order matters: a mentioned conflict (Q4) is treated as the
// most actionable signal regardless of how settled the group looks,
// since "is this colony mapped" matters less than "people are already
// upset about this" when both are true at once.
export function diagnose(answers: AnswerKey[]): DiagnosisKey {
  const [, regularlySeen, hasCaretaker, hasConflict] = answers;

  if (hasConflict === "A") return "conflict";

  const isSettledGroup = regularlySeen === "A" || regularlySeen === "B";
  const looksCaredFor = hasCaretaker === "A" || hasCaretaker === "B";

  if (isSettledGroup && looksCaredFor) return "established";
  if (isSettledGroup && !looksCaredFor) return "unregistered";
  return "unclear";
}
