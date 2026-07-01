// Email/password login form using Supabase Auth.
// Validates input client-side before calling Supabase, and redirects to
// the homepage on success.
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useLanguage } from "@/lib/i18n";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { t } = useLanguage();

  async function handleSubmit(formEvent: React.FormEvent) {
    formEvent.preventDefault();
    setError(null);

    if (!email.includes("@") || password.length < 6) {
      setError(t("auth.login.validationError"));
      return;
    }

    setSubmitting(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setSubmitting(false);

    if (signInError) {
      setError(t("auth.login.error"));
      return;
    }

    router.push(returnTo || "/map");
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <div>
        <label htmlFor="login-email" className="block text-sm font-medium text-felines-text-primary">
          {t("auth.login.emailLabel")}
        </label>
        <input
          id="login-email"
          type="email"
          value={email}
          onChange={(formEvent) => setEmail(formEvent.target.value)}
          required
          aria-describedby={error ? "login-error" : undefined}
          className="mt-1 w-full rounded-md border border-felines-border bg-white px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label htmlFor="login-password" className="block text-sm font-medium text-felines-text-primary">
          {t("auth.login.passwordLabel")}
        </label>
        <input
          id="login-password"
          type="password"
          value={password}
          onChange={(formEvent) => setPassword(formEvent.target.value)}
          required
          minLength={6}
          aria-describedby={error ? "login-error" : undefined}
          className="mt-1 w-full rounded-md border border-felines-border bg-white px-3 py-2 text-sm"
        />
      </div>

      {error && <p id="login-error" role="alert" className="text-sm text-felines-emergency">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        aria-busy={submitting}
        className="w-full rounded-full bg-felines-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-felines-accent-hover disabled:opacity-50"
      >
        {submitting ? t("auth.login.submitting") : t("auth.login.submit")}
      </button>

      <p className="text-center text-sm text-felines-text-secondary">
        {t("auth.login.noAccount")}{" "}
        <Link href="/signup" className="font-medium text-felines-accent-hover">
          {t("auth.login.signupLink")}
        </Link>
      </p>
    </form>
  );
}
