// Personalization quiz shown on /learn once a user has read at least 3
// articles, and on /profile. No wrong answers — only the commitment
// question determines the resulting "neighbor profile" and its
// suggested first action. One question is shown at a time, advancing
// only once it's answered, since several options within the same
// question can share a profile value and selecting by that value alone
// used to highlight every option with the same profile at once.
"use client";

import { useState } from "react";
import Link from "next/link";
import { NEIGHBOR_PROFILES, QUIZ_QUESTIONS, type NeighborProfileKey } from "@/lib/quiz";

// Index of the question whose answer determines the resulting profile —
// see lib/quiz.ts for why only this one is scored.
const SCORING_QUESTION_INDEX = 1;

export default function Quiz({ onSkip }: { onSkip?: () => void }) {
  // Tracks which option index was picked per question — not the profile
  // value itself, since several options in the same question can share
  // a profile (selecting by value would highlight all of them at once).
  const [selectedIndexes, setSelectedIndexes] = useState<(number | null)[]>(
    QUIZ_QUESTIONS.map(() => null)
  );
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  function selectAnswer(questionIndex: number, optionIndex: number) {
    if (submitted) return;
    setSelectedIndexes((previous) => {
      const next = [...previous];
      next[questionIndex] = optionIndex;
      return next;
    });

    // Advance to the next question shortly after answering, so the
    // selection is visible for a beat before the transition.
    if (questionIndex < QUIZ_QUESTIONS.length - 1) {
      setTimeout(() => {
        setCurrentQuestion(questionIndex + 1);
        setAnimKey((key) => key + 1);
      }, 250);
    }
  }

  const allAnswered = selectedIndexes.every((answer) => answer !== null);
  const scoringOptionIndex = selectedIndexes[SCORING_QUESTION_INDEX];
  const resultProfileKey: NeighborProfileKey | null =
    scoringOptionIndex !== null
      ? QUIZ_QUESTIONS[SCORING_QUESTION_INDEX].options[scoringOptionIndex].profile
      : null;
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
          Ver o mapa
        </Link>
      </div>
    );
  }

  const question = QUIZ_QUESTIONS[currentQuestion];
  const selectedIndex = selectedIndexes[currentQuestion];
  const isLastQuestion = currentQuestion === QUIZ_QUESTIONS.length - 1;

  return (
    <div className="mt-4 rounded-xl border border-felines-border bg-felines-surface p-5">
      <h3 className="font-semibold text-felines-text-primary">Que tipo de vizinho você é?</h3>
      <p className="mt-1 text-xs text-felines-text-secondary">
        Não existe resposta errada — isso é só pra te ajudar a achar seu primeiro passo.
      </p>

      <div className="mt-3 flex gap-1.5">
        {QUIZ_QUESTIONS.map((quizQuestion, index) => (
          <span
            key={quizQuestion.question}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              index <= currentQuestion ? "bg-felines-accent" : "bg-felines-border"
            }`}
          />
        ))}
      </div>

      <div key={animKey} className="felines-step-in mt-4">
        <p className="text-sm font-medium text-felines-text-primary">
          {currentQuestion + 1}. {question.question}
        </p>
        <div className="mt-2 space-y-1">
          {question.options.map((option, optionIndex) => {
            const isSelected = selectedIndex === optionIndex;

            return (
              <button
                key={option.label}
                type="button"
                onClick={() => selectAnswer(currentQuestion, optionIndex)}
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

      <div className="mt-5 flex flex-wrap items-center gap-3">
        {currentQuestion > 0 && (
          <button
            onClick={() => {
              setCurrentQuestion((index) => index - 1);
              setAnimKey((key) => key + 1);
            }}
            className="text-sm font-medium text-felines-text-secondary hover:text-felines-accent"
          >
            ← Voltar
          </button>
        )}
        {isLastQuestion && allAnswered && (
          <button
            onClick={() => setSubmitted(true)}
            className="rounded-full bg-felines-accent px-4 py-2 text-sm font-medium text-white"
          >
            Ver meu perfil
          </button>
        )}
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
