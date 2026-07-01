// Email/password signup form using Supabase Auth.
// Validates input client-side before calling Supabase.
"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useLanguage } from "@/lib/i18n";

export default function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { t } = useLanguage();

  async function handleSubmit(formEvent: React.FormEvent) {
    formEvent.preventDefault();
    setError(null);

    if (!email.includes("@") || password.length < 6) {
      setError(t("auth.signup.validationError"));
      return;
    }

    setSubmitting(true);
    const { error: signUpError } = await supabase.auth.signUp({ email, password });
    setSubmitting(false);

    if (signUpError) {
      setError(t("auth.signup.error"));
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <p className="mt-6 rounded-lg border border-felines-success bg-felines-success/10 px-4 py-3 text-sm text-felines-success">
        {t("auth.signup.success")}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <div>
        <label htmlFor="signup-email" className="block text-sm font-medium text-felines-text-primary">
          {t("auth.signup.emailLabel")}
        </label>
        <input
          id="signup-email"
          type="email"
          value={email}
          onChange={(formEvent) => setEmail(formEvent.target.value)}
          required
          aria-describedby={error ? "signup-error" : undefined}
          className="mt-1 w-full rounded-md border border-felines-border bg-white px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label htmlFor="signup-password" className="block text-sm font-medium text-felines-text-primary">
          {t("auth.signup.passwordLabel")}
        </label>
        <input
          id="signup-password"
          type="password"
          value={password}
          onChange={(formEvent) => setPassword(formEvent.target.value)}
          required
          minLength={6}
          aria-describedby={error ? "signup-error" : undefined}
          className="mt-1 w-full rounded-md border border-felines-border bg-white px-3 py-2 text-sm"
        />
      </div>

      {error && <p id="signup-error" role="alert" className="text-sm text-felines-emergency">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        aria-busy={submitting}
        className="w-full rounded-full bg-felines-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-felines-accent-hover disabled:opacity-50"
      >
        {submitting ? t("auth.signup.submitting") : t("auth.signup.submit")}
      </button>

      <p className="text-center text-sm text-felines-text-secondary">
        {t("auth.signup.hasAccount")}{" "}
        <Link href="/login" className="font-medium text-felines-accent-hover">
          {t("auth.signup.loginLink")}
        </Link>
      </p>
    </form>
  );
}
