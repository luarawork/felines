// /reset-password route for Felines — landing page for the password
// recovery email link sent from /forgot-password.
"use client";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import { useLanguage } from "@/lib/i18n";

export default function ResetPasswordPage() {
  const { t } = useLanguage();
  return (
    <div className="mx-auto max-w-sm px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-bold text-felines-text-primary">{t("auth.resetPassword.headline")}</h1>
      <p className="mt-2 text-sm text-felines-text-secondary">{t("auth.resetPassword.sub")}</p>
      <ResetPasswordForm />
    </div>
  );
}
