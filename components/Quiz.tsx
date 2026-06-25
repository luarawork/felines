// Short multiple-choice quiz shown on /learn once a user has read at
// least 3 articles. Purely client-side — no submission is stored, it's
// just a quick comprehension check to reinforce the guide's content.
"use client";

import { useState } from "react";
import { QUIZ_QUESTIONS } from "@/lib/quiz";

export default function Quiz() {
  const [answers, setAnswers] = useState<(number | null)[]>(
    QUIZ_QUESTIONS.map(() => null)
  );
  const [submitted, setSubmitted] = useState(false);

  function selectAnswer(questionIndex: number, optionIndex: number) {
    if (submitted) return;
    setAnswers((previous) => {
      const next = [...previous];
      next[questionIndex] = optionIndex;
      return next;
    });
  }

  const allAnswered = answers.every((answer) => answer !== null);
  const correctCount = answers.filter(
    (answer, index) => answer === QUIZ_QUESTIONS[index].correctIndex
  ).length;

  return (
    <div className="mt-4 rounded-xl border border-felines-border bg-felines-surface p-5">
      <h3 className="font-semibold text-felines-text-primary">Quiz rápido</h3>
      <div className="mt-4 space-y-5">
        {QUIZ_QUESTIONS.map((quizQuestion, questionIndex) => (
          <div key={quizQuestion.question}>
            <p className="text-sm font-medium text-felines-text-primary">
              {questionIndex + 1}. {quizQuestion.question}
            </p>
            <div className="mt-2 space-y-1">
              {quizQuestion.options.map((option, optionIndex) => {
                const isSelected = answers[questionIndex] === optionIndex;
                const isCorrect = optionIndex === quizQuestion.correctIndex;
                let stateClass = "border-felines-border";
                if (submitted && isSelected) {
                  stateClass = isCorrect
                    ? "border-felines-success text-felines-success"
                    : "border-felines-emergency text-felines-emergency";
                } else if (isSelected) {
                  stateClass = "border-felines-accent text-felines-accent";
                }

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => selectAnswer(questionIndex, optionIndex)}
                    className={`block w-full rounded-md border px-3 py-2 text-left text-sm transition-colors ${stateClass}`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {!submitted ? (
        <button
          onClick={() => setSubmitted(true)}
          disabled={!allAnswered}
          className="mt-5 rounded-full bg-felines-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          Conferir respostas
        </button>
      ) : (
        <p className="mt-5 text-sm font-medium text-felines-text-primary">
          Você acertou {correctCount} de {QUIZ_QUESTIONS.length} perguntas.
        </p>
      )}
    </div>
  );
}
