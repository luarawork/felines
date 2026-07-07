// /login route for Felines.
"use client";
import { Suspense } from "react";
import LoginForm from "@/components/auth/LoginForm";
import { useLanguage } from "@/lib/i18n";

export default function LoginPage() {
  const { t } = useLanguage();
  return (
    <div className="mx-auto max-w-sm px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-bold text-felines-text-primary">{t("auth.login.headline")}</h1>
      <p className="mt-2 text-sm text-felines-text-secondary">{t("auth.login.sub")}</p>
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
