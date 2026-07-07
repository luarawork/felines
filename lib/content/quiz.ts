// Personalization quiz shown on /learn once a user has read at least 3
// articles. There are no wrong answers — each path leads to a "neighbor
// profile" with a suggested first action, not a score.
export type NeighborProfileKey = "observer" | "backup" | "guardian";

export type QuizOption = {
  label: string;
  profile: NeighborProfileKey;
};

export type QuizQuestion = {
  question: string;
  options: QuizOption[];
};

// Only the commitment question (Q2) determines the resulting profile —
// it's the most direct signal of how someone wants to participate. The
// other two questions exist to make the quiz feel personal, not to be
// scored. Translated strings come from lib/i18n/{pt,en}.ts under
// "quizContent.*" — this function only assembles the structure, so `t`
// is a parameter rather than calling useLanguage() here (this file has
// no React context of its own).
export function getQuizQuestions(t: (key: string) => string): QuizQuestion[] {
  return [
    {
      question: t("quizContent.q1.question"),
      options: [
        { label: t("quizContent.q1.options.0"), profile: "observer" },
        { label: t("quizContent.q1.options.1"), profile: "observer" },
        { label: t("quizContent.q1.options.2"), profile: "backup" },
        { label: t("quizContent.q1.options.3"), profile: "observer" },
      ],
    },
    {
      question: t("quizContent.q2.question"),
      options: [
        { label: t("quizContent.q2.options.0"), profile: "observer" },
        { label: t("quizContent.q2.options.1"), profile: "backup" },
        { label: t("quizContent.q2.options.2"), profile: "guardian" },
      ],
    },
    {
      question: t("quizContent.q3.question"),
      options: [
        { label: t("quizContent.q3.options.0"), profile: "observer" },
        { label: t("quizContent.q3.options.1"), profile: "backup" },
        { label: t("quizContent.q3.options.2"), profile: "guardian" },
      ],
    },
  ];
}

export function getNeighborProfiles(
  t: (key: string) => string
): Record<NeighborProfileKey, { title: string; description: string; firstAction: string }> {
  return {
    observer: {
      title: t("quizContent.profiles.observer.title"),
      description: t("quizContent.profiles.observer.description"),
      firstAction: t("quizContent.profiles.observer.firstAction"),
    },
    backup: {
      title: t("quizContent.profiles.backup.title"),
      description: t("quizContent.profiles.backup.description"),
      firstAction: t("quizContent.profiles.backup.firstAction"),
    },
    guardian: {
      title: t("quizContent.profiles.guardian.title"),
      description: t("quizContent.profiles.guardian.description"),
      firstAction: t("quizContent.profiles.guardian.firstAction"),
    },
  };
}
