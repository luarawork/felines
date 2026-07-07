// Email/password signup form using Supabase Auth.
// Validates input client-side before calling Supabase.
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useLanguage } from "@/lib/i18n";
import { getSafeReturnTo } from "@/lib/security/safeReturnTo";

export default function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = getSafeReturnTo(searchParams.get("returnTo"));
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
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });
    setSubmitting(false);

    if (signUpError) {
      setError(t("auth.signup.error"));
      return;
    }

    // If email confirmation is disabled (project-dependent), signUp
    // returns an active session immediately — in that case there's no
    // "check your email" step, so honor returnTo right away instead of
    // showing a confirmation message that doesn't apply.
    if (signUpData.session) {
      router.push(returnTo || "/map");
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="mt-6 space-y-3">
        <p className="rounded-lg border border-felines-success bg-felines-success/10 px-4 py-3 text-sm text-felines-success-hover" role="status">
          {t("auth.signup.success")}
        </p>
        <p className="text-center text-sm text-felines-text-secondary">
          <Link
            href={returnTo ? `/login?returnTo=${encodeURIComponent(returnTo)}` : "/login"}
            className="font-medium text-felines-accent-hover"
          >
            {t("auth.signup.loginLink")}
          </Link>
        </p>
      </div>
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
          className="mt-1 w-full rounded-md border border-felines-border bg-white px-3 py-3.5 text-sm"
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
          className="mt-1 w-full rounded-md border border-felines-border bg-white px-3 py-3.5 text-sm"
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
        <Link
          href={returnTo ? `/login?returnTo=${encodeURIComponent(returnTo)}` : "/login"}
          className="font-medium text-felines-accent-hover"
        >
          {t("auth.signup.loginLink")}
        </Link>
      </p>
    </form>
  );
}
