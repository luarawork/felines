// /signup route for Felines.
"use client";
import { Suspense } from "react";
import SignupForm from "@/components/auth/SignupForm";
import { useLanguage } from "@/lib/i18n";

export default function SignupPage() {
  const { t } = useLanguage();
  return (
    <div className="mx-auto max-w-sm px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-bold text-felines-text-primary">{t("auth.signup.headline")}</h1>
      <p className="mt-2 text-sm text-felines-text-secondary">{t("auth.signup.sub")}</p>
      <Suspense fallback={null}>
        <SignupForm />
      </Suspense>
    </div>
  );
}
