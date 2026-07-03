// Second half of the password-recovery flow: the email link from
// ForgotPasswordForm lands here with a recovery token in the URL.
// supabase-js auto-detects that token and fires a PASSWORD_RECOVERY
// auth event with a live (temporary) session — from that point on,
// updateUser({ password }) is enough to set the new password, no
// separate token handling needed on this end.
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useLanguage } from "@/lib/i18n";

export default function ResetPasswordForm() {
  const router = useRouter();
  const { t } = useLanguage();
  const [ready, setReady] = useState(false);
  const [linkValid, setLinkValid] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // If the link already established a recovery session by the time
    // this mounts (e.g. after a fast redirect), this catches it
    // immediately instead of waiting for the auth event below.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setLinkValid(true);
      setReady(true);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" && session) {
        setLinkValid(true);
        setReady(true);
      }
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  async function handleSubmit(formEvent: React.FormEvent) {
    formEvent.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError(t("auth.resetPassword.validationError"));
      return;
    }
    if (password !== confirmPassword) {
      setError(t("auth.resetPassword.mismatchError"));
      return;
    }

    setSubmitting(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setSubmitting(false);

    if (updateError) {
      setError(t("auth.resetPassword.error"));
      return;
    }

    setSubmitted(true);
    setTimeout(() => router.push("/login"), 2000);
  }

  if (!ready) return null;

  if (!linkValid) {
    return (
      <div className="mt-6 space-y-3">
        <p role="alert" className="rounded-lg border border-felines-emergency/30 bg-felines-emergency/5 px-4 py-3 text-sm text-felines-text-primary">
          {t("auth.resetPassword.invalidLink")}
        </p>
        <Link
          href="/forgot-password"
          className="block w-full rounded-full bg-felines-accent px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-felines-accent-hover"
        >
          {t("auth.resetPassword.requestNewLink")}
        </Link>
      </div>
    );
  }

  if (submitted) {
    return (
      <p className="mt-6 rounded-lg border border-felines-success/30 bg-felines-success/5 px-4 py-3 text-sm text-felines-text-primary">
        {t("auth.resetPassword.success")}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <div>
        <label htmlFor="reset-password" className="block text-sm font-medium text-felines-text-primary">
          {t("auth.resetPassword.passwordLabel")}
        </label>
        <input
          id="reset-password"
          type="password"
          value={password}
          onChange={(formEvent) => setPassword(formEvent.target.value)}
          required
          minLength={6}
          aria-describedby={error ? "reset-error" : undefined}
          className="mt-1 w-full rounded-md border border-felines-border bg-white px-3 py-3.5 text-sm"
        />
      </div>
      <div>
        <label htmlFor="reset-confirm-password" className="block text-sm font-medium text-felines-text-primary">
          {t("auth.resetPassword.confirmLabel")}
        </label>
        <input
          id="reset-confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(formEvent) => setConfirmPassword(formEvent.target.value)}
          required
          minLength={6}
          aria-describedby={error ? "reset-error" : undefined}
          className="mt-1 w-full rounded-md border border-felines-border bg-white px-3 py-3.5 text-sm"
        />
      </div>

      {error && <p id="reset-error" role="alert" className="text-sm text-felines-emergency">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        aria-busy={submitting}
        className="w-full rounded-full bg-felines-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-felines-accent-hover disabled:opacity-50"
      >
        {submitting ? t("auth.resetPassword.submitting") : t("auth.resetPassword.submit")}
      </button>
    </form>
  );
}
