// Reassurance shown above report forms when the visitor isn't logged in.
"use client";
import { useLanguage } from "@/lib/i18n";

export default function AnonymousReportNotice() {
  const { t } = useLanguage();
  return (
    <p className="mb-3 flex items-center gap-2 text-sm text-felines-text-primary">
      <span className="text-felines-success-hover">✓</span>
      {t("auth.anonymousReport")}
    </p>
  );
}
