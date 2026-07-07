// Sends a Supabase password-recovery email. Always shows the same
// success message regardless of whether the email actually has an
// account — this avoids leaking which emails are registered (a common
// account-enumeration vector on "forgot password" forms).
"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { SITE_URL } from "@/lib/external/siteUrl";
import { useLanguage } from "@/lib/i18n";

export default function ForgotPasswordForm() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(formEvent: React.FormEvent) {
    formEvent.preventDefault();
    setError(null);

    if (!email.includes("@")) {
      setError(t("auth.forgotPassword.validationError"));
      return;
    }

    setSubmitting(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${SITE_URL}/reset-password`,
    });
    setSubmitting(false);

    // Supabase returns an error for malformed input, but not for an
    // email that simply has no account — same enumeration-safe
    // behavior carries through to the UI: show success either way
    // unless the request itself failed outright.
    if (resetError) {
      setError(t("auth.forgotPassword.error"));
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <p className="mt-6 rounded-lg border border-felines-success/30 bg-felines-success/5 px-4 py-3 text-sm text-felines-text-primary">
        {t("auth.forgotPassword.success")}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <div>
        <label htmlFor="forgot-email" className="block text-sm font-medium text-felines-text-primary">
          {t("auth.forgotPassword.emailLabel")}
        </label>
        <input
          id="forgot-email"
          type="email"
          value={email}
          onChange={(formEvent) => setEmail(formEvent.target.value)}
          required
          aria-describedby={error ? "forgot-error" : undefined}
          className="mt-1 w-full rounded-md border border-felines-border bg-white px-3 py-3.5 text-sm"
        />
      </div>

      {error && <p id="forgot-error" role="alert" className="text-sm text-felines-emergency">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        aria-busy={submitting}
        className="w-full rounded-full bg-felines-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-felines-accent-hover disabled:opacity-50"
      >
        {submitting ? t("auth.forgotPassword.submitting") : t("auth.forgotPassword.submit")}
      </button>

      <p className="text-center text-sm">
        <Link href="/login" className="font-medium text-felines-accent-hover">
          {t("auth.forgotPassword.backToLogin")}
        </Link>
      </p>
    </form>
  );
}
