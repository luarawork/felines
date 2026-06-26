// Personalization quiz shown on /learn once a user has read at least 3
// articles. No wrong answers — only the commitment question determines
// the resulting "neighbor profile" and its suggested first action.
"use client";

import { useState } from "react";
import Link from "next/link";
import { NEIGHBOR_PROFILES, QUIZ_QUESTIONS, type NeighborProfileKey } from "@/lib/quiz";

// Index of the question whose answer determines the resulting profile —
// see lib/quiz.ts for why only this one is scored.
const SCORING_QUESTION_INDEX = 1;

export default function Quiz({ onSkip }: { onSkip?: () => void }) {
  const [answers, setAnswers] = useState<(NeighborProfileKey | null)[]>(
    QUIZ_QUESTIONS.map(() => null)
  );
  const [submitted, setSubmitted] = useState(false);

  function selectAnswer(questionIndex: number, profile: NeighborProfileKey) {
    if (submitted) return;
    setAnswers((previous) => {
      const next = [...previous];
      next[questionIndex] = profile;
      return next;
    });
  }

  const allAnswered = answers.every((answer) => answer !== null);
  const resultProfileKey = answers[SCORING_QUESTION_INDEX];
  const resultProfile = resultProfileKey ? NEIGHBOR_PROFILES[resultProfileKey] : null;

  if (submitted && resultProfile) {
    return (
      <div className="mt-4 rounded-xl border border-felines-border bg-felines-surface p-5">
        <p className="text-sm font-medium text-felines-text-secondary">Seu perfil</p>
        <h3 className="mt-1 text-lg font-bold text-felines-text-primary">
          {resultProfile.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-felines-text-secondary">
          {resultProfile.description}
        </p>
        <p className="mt-3 text-sm font-medium text-felines-text-primary">
          Primeira ação sugerida: {resultProfile.firstAction}
        </p>
        <p className="mt-4 text-sm text-felines-text-secondary">
          Agora que você já sabe o que é uma colônia, quer ver se existe uma perto de você?
        </p>
        <Link
          href="/map"
          className="mt-2 inline-block rounded-full bg-felines-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-felines-accent-hover"
        >
          Ver o mapa →
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-xl border border-felines-border bg-felines-surface p-5">
      <h3 className="font-semibold text-felines-text-primary">Que tipo de vizinho você é?</h3>
      <p className="mt-1 text-xs text-felines-text-secondary">
        Não existe resposta errada — isso é só pra te ajudar a achar seu primeiro passo.
      </p>

      <div className="mt-4 space-y-5">
        {QUIZ_QUESTIONS.map((quizQuestion, questionIndex) => (
          <div key={quizQuestion.question}>
            <p className="text-sm font-medium text-felines-text-primary">
              {questionIndex + 1}. {quizQuestion.question}
            </p>
            <div className="mt-2 space-y-1">
              {quizQuestion.options.map((option) => {
                const isSelected = answers[questionIndex] === option.profile;

                return (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => selectAnswer(questionIndex, option.profile)}
                    className={`block w-full rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                      isSelected
                        ? "border-felines-accent text-felines-accent-hover"
                        : "border-felines-border"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          onClick={() => setSubmitted(true)}
          disabled={!allAnswered}
          className="rounded-full bg-felines-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          Ver meu perfil
        </button>
        <button
          onClick={onSkip}
          className="text-sm font-medium text-felines-text-secondary hover:text-felines-accent"
        >
          Fazer isso depois
        </button>
      </div>
    </div>
  );
}
