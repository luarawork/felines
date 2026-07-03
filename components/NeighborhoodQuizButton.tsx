// Self-contained trigger + modal for the neighborhood diagnosis quiz —
// helps a visitor figure out what's likely going on with cats near
// them, distinct from the identity-focused quiz on /profile (lib/quiz.ts).
// One question per screen with a felines-step-in transition on each
// advance, matching the pattern already used by the /profile quiz.
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  NEIGHBORHOOD_QUESTIONS,
  DIAGNOSES,
  diagnose,
  type AnswerKey,
} from "@/lib/neighborhoodQuiz";
import { useEscapeToClose } from "@/lib/useEscapeToClose";

export default function NeighborhoodQuizButton({
  triggerClassName,
  triggerLabel = "O que está acontecendo no seu bairro?",
}: {
  triggerClassName?: string;
  triggerLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [answers, setAnswers] = useState<AnswerKey[]>([]);

  function handleClose() {
    setOpen(false);
    setCurrentQuestion(0);
    setAnswers([]);
  }

  useEscapeToClose(open, handleClose);

  function selectAnswer(key: AnswerKey) {
    const nextAnswers = [...answers.slice(0, currentQuestion), key];
    setAnswers(nextAnswers);
    if (currentQuestion < NEIGHBORHOOD_QUESTIONS.length - 1) {
      setTimeout(() => {
        setCurrentQuestion((previous) => previous + 1);
        setAnimKey((key) => key + 1);
      }, 200);
    }
  }

  function handleStartOver() {
    setCurrentQuestion(0);
    setAnswers([]);
    setAnimKey((key) => key + 1);
  }

  const isComplete = answers.length === NEIGHBORHOOD_QUESTIONS.length;
  const diagnosisKey = isComplete ? diagnose(answers) : null;
  const diagnosis = diagnosisKey ? DIAGNOSES[diagnosisKey] : null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={
          triggerClassName ??
          "rounded-full border border-felines-accent px-4 py-2 text-sm font-medium text-felines-accent-hover transition-colors hover:bg-felines-accent hover:text-white"
        }
      >
        {triggerLabel}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40 p-4"
          onClick={handleClose}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="O que está acontecendo no seu bairro?"
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-felines-background p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div className="flex gap-1.5">
                {NEIGHBORHOOD_QUESTIONS.map((_, index) => (
                  <span
                    key={index}
                    className={`h-1.5 w-6 rounded-full ${
                      index <= currentQuestion && !isComplete
                        ? "bg-felines-accent"
                        : isComplete
                          ? "bg-felines-accent"
                          : "bg-felines-border"
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={handleClose}
                aria-label="Fechar"
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center text-xl leading-none text-felines-text-secondary hover:text-felines-text-primary"
              >
                ×
              </button>
            </div>

            {!isComplete ? (
              <div key={animKey} className="felines-step-in mt-5">
                {currentQuestion > 0 && (
                  <button
                    onClick={() => setCurrentQuestion((previous) => previous - 1)}
                    className="mb-3 text-sm text-felines-text-secondary hover:text-felines-accent"
                  >
                    ← Voltar
                  </button>
                )}
                <h2 className="text-lg font-semibold text-felines-text-primary">
                  {NEIGHBORHOOD_QUESTIONS[currentQuestion].question}
                </h2>
                <div className="mt-4 space-y-2">
                  {NEIGHBORHOOD_QUESTIONS[currentQuestion].options.map((option) => (
                    <button
                      key={option.key}
                      onClick={() => selectAnswer(option.key)}
                      className={`block w-full rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors ${
                        answers[currentQuestion] === option.key
                          ? "border-felines-accent bg-felines-accent-light text-felines-text-primary"
                          : "border-felines-border bg-felines-surface text-felines-text-primary hover:border-felines-accent"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              diagnosis && (
                <div className="mt-5">
                  <h2 className="text-xl font-bold text-felines-text-primary">{diagnosis.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-felines-text-secondary">
                    {diagnosis.explanation}
                  </p>
                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <Link
                      href={diagnosis.ctaHref}
                      onClick={handleClose}
                      className="rounded-full bg-felines-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-felines-accent-hover"
                    >
                      {diagnosis.ctaLabel}
                    </Link>
                    <button
                      onClick={handleStartOver}
                      className="text-sm font-medium text-felines-text-secondary hover:text-felines-accent"
                    >
                      Recomeçar
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </>
  );
}
