// Email/password signup form using Supabase Auth.
// Validates input client-side before calling Supabase.
"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(formEvent: React.FormEvent) {
    formEvent.preventDefault();
    setError(null);

    if (!email.includes("@") || password.length < 6) {
      setError("Coloca um e-mail válido e uma senha com pelo menos 6 caracteres.");
      return;
    }

    setSubmitting(true);
    const { error: signUpError } = await supabase.auth.signUp({ email, password });
    setSubmitting(false);

    if (signUpError) {
      setError("Não consegui criar sua conta. Tenta de novo?");
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <p className="mt-6 rounded-lg border border-felines-success bg-felines-success/10 px-4 py-3 text-sm text-felines-success">
        Quase lá! Confira seu e-mail e confirme a conta pra poder entrar.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <div>
        <label htmlFor="signup-email" className="block text-sm font-medium text-felines-text-primary">
          E-mail
        </label>
        <input
          id="signup-email"
          type="email"
          value={email}
          onChange={(formEvent) => setEmail(formEvent.target.value)}
          required
          className="mt-1 w-full rounded-md border border-felines-border bg-white px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label htmlFor="signup-password" className="block text-sm font-medium text-felines-text-primary">
          Senha
        </label>
        <input
          id="signup-password"
          type="password"
          value={password}
          onChange={(formEvent) => setPassword(formEvent.target.value)}
          required
          minLength={6}
          className="mt-1 w-full rounded-md border border-felines-border bg-white px-3 py-2 text-sm"
        />
      </div>

      {error && <p className="text-sm text-felines-emergency">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-full bg-felines-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-felines-accent-hover disabled:opacity-50"
      >
        {submitting ? "Criando conta..." : "Criar minha conta"}
      </button>

      <p className="text-center text-sm text-felines-text-secondary">
        Já tem conta por aqui?{" "}
        <Link href="/login" className="font-medium text-felines-accent-hover">
          Entrar
        </Link>
      </p>
    </form>
  );
}
