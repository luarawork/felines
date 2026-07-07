// Shown after an anonymous report is submitted successfully. Without an
// account there's no way for the reporter to track what happens to their
// own report afterward, so this nudges them toward signing up right when
// they've just shown they care about a specific case.
"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n";

export default function CreateAccountInvite() {
  const { t } = useLanguage();

  return (
    <p className="mt-2 text-xs text-felines-text-secondary">
      {t("createAccountInvite.prompt")}{" "}
      <Link href="/signup" className="font-medium text-felines-accent-hover">
        {t("createAccountInvite.cta")}
      </Link>{" "}
      {t("createAccountInvite.suffix")}
    </p>
  );
}
