// /curso — "Cuidador Preparado" mini-course.
// 5 existing learn articles in a fixed order + a 5-question quiz.
// Article completion is tracked via the existing knowledge_progress
// table. Certification is written by earn_caretaker_certification()
// (migration 0063) — a SECURITY DEFINER RPC so the client can't
// bypass the quiz and grant itself the badge directly.
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { COURSE_MODULES, COURSE_QUIZ, PASSING_SCORE } from "@/lib/caretakerCourse";

type Phase = "modules" | "quiz" | "result";

export default function CursoPage() {
  const [readSlugs, setReadSlugs] = useState<Set<string>>(new Set());
  const [certified, setCertified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Quiz state
  const [phase, setPhase] = useState<Phase>("modules");
  const [answers, setAnswers] = useState<(number | null)[]>(COURSE_QUIZ.map(() => null));
  const [currentQ, setCurrentQ] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  const allModulesRead = COURSE_MODULES.every((m) => readSlugs.has(m.articleSlug));

  useEffect(() => {
    async function load() {
      const { data: sessionData } = await supabase.auth.getSession();
      const uid = sessionData.session?.user.id ?? null;
      setUserId(uid);

      if (!uid) {
        setLoading(false);
        return;
      }

      const [{ data: progressRows }, { data: certRow }] = await Promise.all([
        supabase
          .from("knowledge_progress")
          .select("article_slug")
          .eq("user_id", uid)
          .in(
            "article_slug",
            COURSE_MODULES.map((m) => m.articleSlug)
          ),
        supabase
          .from("caretaker_certifications")
          .select("id")
          .eq("user_id", uid)
          .maybeSingle(),
      ]);

      setReadSlugs(new Set((progressRows ?? []).map((r) => r.article_slug)));
      setCertified(!!certRow);
      setLoading(false);
    }
    load();
  }, []);

  function selectAnswer(optionIndex: number) {
    const next = [...answers];
    next[currentQ] = optionIndex;
    setAnswers(next);

    if (currentQ < COURSE_QUIZ.length - 1) {
      setTimeout(() => setCurrentQ((q) => q + 1), 200);
    }
  }

  async function handleSubmitQuiz() {
    const correct = answers.reduce<number>(
      (total, answer, index) =>
        answer === COURSE_QUIZ[index].correctIndex ? total + 1 : total,
      0
    );
    setScore(correct);
    setPhase("result");

    if (correct >= PASSING_SCORE && userId) {
      setSubmitting(true);
      await supabase.rpc("earn_caretaker_certification");
      setCertified(true);
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center text-sm text-felines-text-secondary">
        Carregando seu progresso…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <Link href="/profile" className="text-sm text-felines-text-secondary hover:text-felines-accent">
        ← Meu perfil
      </Link>

      <h1 className="mt-4 text-3xl font-bold text-felines-text-primary">
        Cuidador Preparado
      </h1>
      <p className="mt-2 text-base text-felines-text-secondary">
        5 artigos curtos + 1 quiz. Quem termina ganha o badge{" "}
        <strong>🎓 Cuidador Preparado</strong> no perfil público.
      </p>

      {certified && (
        <div className="mt-4 rounded-xl border border-felines-success/30 bg-felines-success/10 px-5 py-4">
          <p className="font-semibold text-felines-success">
            🎓 Você já tem a certificação Cuidador Preparado!
          </p>
          <p className="mt-1 text-sm text-felines-text-secondary">
            O badge já aparece no seu perfil público.
          </p>
        </div>
      )}

      {/* Modules list */}
      {(phase === "modules" || certified) && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-felines-text-primary">Módulos</h2>
          <ol className="mt-4 space-y-3">
            {COURSE_MODULES.map((mod) => {
              const done = readSlugs.has(mod.articleSlug);
              return (
                <li key={mod.articleSlug}>
                  <Link
                    href={`/learn/${mod.articleSlug}`}
                    className={`flex items-center justify-between gap-3 rounded-xl border p-4 transition-all hover:-translate-y-0.5 ${
                      done
                        ? "border-felines-success/30 bg-felines-success/5"
                        : "border-felines-border bg-felines-surface hover:border-felines-accent"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          done
                            ? "bg-felines-success text-white"
                            : "bg-felines-background text-felines-text-secondary"
                        }`}
                      >
                        {done ? "✓" : mod.order}
                      </span>
                      <div>
                        <p className="font-medium text-felines-text-primary">{mod.title}</p>
                        <p className="text-xs text-felines-text-secondary">{mod.duration}</p>
                      </div>
                    </div>
                    <span className="text-xs text-felines-text-secondary">
                      {done ? "Lido ✓" : "Ler"}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>

          {!certified && (
            <div className="mt-6">
              {allModulesRead ? (
                <button
                  onClick={() => {
                    setPhase("quiz");
                    setCurrentQ(0);
                    setAnswers(COURSE_QUIZ.map(() => null));
                    setScore(null);
                  }}
                  className="rounded-full bg-felines-accent px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-felines-accent-hover"
                >
                  Fazer o quiz final
                </button>
              ) : (
                <p className="text-sm text-felines-text-secondary">
                  Leia todos os {COURSE_MODULES.length} módulos para desbloquear o quiz.
                </p>
              )}
            </div>
          )}

          {!userId && (
            <p className="mt-5 text-sm text-felines-text-secondary">
              <Link href="/login" className="font-medium text-felines-accent-hover hover:underline">
                Faça login
              </Link>{" "}
              para salvar seu progresso e ganhar o badge ao terminar.
            </p>
          )}
        </section>
      )}

      {/* Quiz */}
      {phase === "quiz" && (
        <section className="mt-8">
          <div className="mb-4 flex gap-1.5">
            {COURSE_QUIZ.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  i <= currentQ ? "bg-felines-accent" : "bg-felines-border"
                }`}
              />
            ))}
          </div>

          <div className="rounded-xl border border-felines-border bg-felines-surface p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-felines-text-secondary">
              Pergunta {currentQ + 1} de {COURSE_QUIZ.length}
            </p>
            <p className="mt-2 text-base font-medium text-felines-text-primary">
              {COURSE_QUIZ[currentQ].question}
            </p>
            <div className="mt-4 space-y-2">
              {COURSE_QUIZ[currentQ].options.map((option, optIndex) => (
                <button
                  key={optIndex}
                  type="button"
                  onClick={() => selectAnswer(optIndex)}
                  className={`block w-full rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
                    answers[currentQ] === optIndex
                      ? "border-felines-accent bg-felines-accent/5 font-medium text-felines-accent-hover"
                      : "border-felines-border text-felines-text-secondary hover:border-felines-accent/50"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>

            <div className="mt-5 flex items-center gap-3">
              {currentQ > 0 && (
                <button
                  onClick={() => setCurrentQ((q) => q - 1)}
                  className="text-sm text-felines-text-secondary hover:text-felines-accent"
                >
                  ← Voltar
                </button>
              )}
              {currentQ === COURSE_QUIZ.length - 1 &&
                answers.every((a) => a !== null) && (
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={submitting}
                    className="rounded-full bg-felines-accent px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {submitting ? "Salvando…" : "Ver resultado"}
                  </button>
                )}
            </div>
          </div>
        </section>
      )}

      {/* Result */}
      {phase === "result" && score !== null && (
        <section className="mt-8">
          {score >= PASSING_SCORE ? (
            <div className="rounded-xl border border-felines-success/30 bg-felines-success/10 p-7 text-center">
              <p className="text-5xl">🎓</p>
              <h2 className="mt-3 text-2xl font-bold text-felines-text-primary">
                Você é um Cuidador Preparado!
              </h2>
              <p className="mt-2 text-base text-felines-text-secondary">
                {score} de {COURSE_QUIZ.length} respostas corretas. Badge adicionado ao seu perfil.
              </p>
              <Link
                href="/profile"
                className="mt-5 inline-block rounded-full bg-felines-success px-6 py-2.5 text-sm font-semibold text-white"
              >
                Ver meu perfil
              </Link>
            </div>
          ) : (
            <div className="rounded-xl border border-felines-border bg-felines-surface p-7 text-center">
              <p className="text-5xl">📚</p>
              <h2 className="mt-3 text-xl font-bold text-felines-text-primary">
                Quase lá! {score} de {COURSE_QUIZ.length} corretas.
              </h2>
              <p className="mt-2 text-sm text-felines-text-secondary">
                Precisamos de pelo menos {PASSING_SCORE} acertos. Revise os módulos e tente de novo.
              </p>
              <button
                onClick={() => {
                  setPhase("quiz");
                  setCurrentQ(0);
                  setAnswers(COURSE_QUIZ.map(() => null));
                  setScore(null);
                }}
                className="mt-4 rounded-full border border-felines-border px-5 py-2 text-sm font-medium text-felines-text-secondary hover:border-felines-accent hover:text-felines-accent"
              >
                Tentar novamente
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
