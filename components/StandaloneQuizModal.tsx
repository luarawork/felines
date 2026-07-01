"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import type { StandaloneQuiz } from "@/lib/caretakerCourse";
import { useEscapeToClose } from "@/lib/useEscapeToClose";
import { useLanguage } from "@/lib/i18n";

export default function StandaloneQuizModal({ quiz }: { quiz: StandaloneQuiz }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<(number | null)[]>(
    Array(quiz.questions.length).fill(null)
  );
  const [submitted, setSubmitted] = useState(false);

  useEscapeToClose(open, () => setOpen(false));

  function handleOpen() {
    setCurrentIndex(0);
    setSelected(Array(quiz.questions.length).fill(null));
    setSubmitted(false);
    setOpen(true);
  }

  const correctCount = submitted
    ? selected.filter((ans, i) => ans === quiz.questions[i].correctIndex).length
    : 0;
  const passed = correctCount >= quiz.passingScore;
  const current = quiz.questions[currentIndex];
  const allAnswered = selected.every((ans) => ans !== null);

  return (
    <>
      <button
        onClick={handleOpen}
        className="flex w-full flex-col rounded-xl border border-felines-border bg-felines-surface p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-felines-accent hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
      >
        <span className="text-2xl" aria-hidden="true">{quiz.icon}</span>
        <p className="mt-2 font-semibold text-felines-text-primary">{quiz.title}</p>
        <p className="mt-1 text-xs text-felines-text-secondary">{quiz.description}</p>
        <p className="mt-3 text-xs font-medium text-felines-accent-hover">
          {quiz.questions.length} {t("standaloneQuiz.questions")}
        </p>
      </button>

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-[2500] flex items-center justify-center bg-black/50 p-4"
            onClick={() => setOpen(false)}
          >
            <div
              role="dialog"
              aria-modal="true"
              className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-felines-background shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-2xl">{quiz.icon}</span>
                    <h2 className="mt-1 text-lg font-bold text-felines-text-primary">{quiz.title}</h2>
                  </div>
                  <button
                    onClick={() => setOpen(false)}
                    aria-label={t("common.close")}
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center text-lg text-felines-text-secondary hover:text-felines-text-primary"
                  >
                    ×
                  </button>
                </div>

                {!submitted ? (
                  <>
                    {/* Progress */}
                    <div className="mt-4 flex items-center gap-3">
                      <div className="h-1.5 flex-1 rounded-full bg-felines-border">
                        <div
                          className="h-1.5 rounded-full bg-felines-accent transition-all duration-500"
                          style={{
                            width: `${((currentIndex + 1) / quiz.questions.length) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-felines-text-secondary">
                        {currentIndex + 1}/{quiz.questions.length}
                      </span>
                    </div>

                    <p className="mt-5 font-medium text-felines-text-primary">{current.question}</p>

                    <div className="mt-4 space-y-2">
                      {current.options.map((option, idx) => {
                        const isSelected = selected[currentIndex] === idx;
                        return (
                          <button
                            key={idx}
                            onClick={() => {
                              const next = [...selected];
                              next[currentIndex] = idx;
                              setSelected(next);
                            }}
                            className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
                              isSelected
                                ? "border-felines-accent bg-felines-accent-light font-medium text-felines-accent-hover"
                                : "border-felines-border text-felines-text-primary hover:border-felines-accent"
                            }`}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-5 flex justify-between gap-3">
                      {currentIndex > 0 && (
                        <button
                          onClick={() => setCurrentIndex((i) => i - 1)}
                          className="rounded-full border border-felines-border px-4 py-2 text-sm text-felines-text-secondary hover:border-felines-accent"
                        >
                          {t("standaloneQuiz.previous")}
                        </button>
                      )}
                      <div className="ml-auto">
                        {currentIndex < quiz.questions.length - 1 ? (
                          <button
                            onClick={() => setCurrentIndex((i) => i + 1)}
                            disabled={selected[currentIndex] === null}
                            className="rounded-full bg-felines-accent px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-felines-accent-hover disabled:opacity-40"
                          >
                            {t("standaloneQuiz.next")}
                          </button>
                        ) : (
                          <button
                            onClick={() => setSubmitted(true)}
                            disabled={!allAnswered}
                            className="rounded-full bg-felines-accent px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-felines-accent-hover disabled:opacity-40"
                          >
                            {t("standaloneQuiz.seeResult")}
                          </button>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="mt-5">
                    <div
                      className={`rounded-xl p-5 text-center ${
                        passed
                          ? "bg-felines-success/10 border border-felines-success/30"
                          : "bg-felines-warning/10 border border-felines-warning/30"
                      }`}
                    >
                      <p className="text-3xl font-bold text-felines-text-primary">
                        {correctCount}/{quiz.questions.length}
                      </p>
                      <p className="mt-1 font-semibold text-felines-text-primary">
                        {passed ? t("standaloneQuiz.passed") : t("standaloneQuiz.almostThere")}
                      </p>
                    </div>

                    <div className="mt-4 space-y-3">
                      {quiz.questions.map((q, i) => {
                        const isCorrect = selected[i] === q.correctIndex;
                        return (
                          <div key={i} className="rounded-lg border border-felines-border p-3 text-sm">
                            <p className="font-medium text-felines-text-primary">{q.question}</p>
                            <p
                              className={`mt-1 text-xs ${
                                isCorrect ? "text-felines-success" : "text-felines-emergency"
                              }`}
                            >
                              {isCorrect ? "✓ " : `✗ ${t("standaloneQuiz.answerPrefix")} `}
                              {q.options[q.correctIndex]}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <button
                        onClick={() => {
                          setCurrentIndex(0);
                          setSelected(Array(quiz.questions.length).fill(null));
                          setSubmitted(false);
                        }}
                        className="rounded-full border border-felines-border px-5 py-2 text-sm font-medium text-felines-text-secondary hover:border-felines-accent"
                      >
                        {t("standaloneQuiz.tryAgain")}
                      </button>
                      <button
                        onClick={() => setOpen(false)}
                        className="rounded-full bg-felines-accent px-5 py-2 text-sm font-semibold text-white hover:bg-felines-accent-hover"
                      >
                        {t("common.close")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
