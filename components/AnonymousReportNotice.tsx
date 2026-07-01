// Reassurance shown above report forms when the visitor isn't logged in.
"use client";
import { useLanguage } from "@/lib/i18n";

export default function AnonymousReportNotice() {
  const { t } = useLanguage();
  return (
    <p className="mb-3 flex items-center gap-2 text-sm" style={{ color: "#2D2D2D" }}>
      <span style={{ color: "#6B8F6A" }}>✓</span>
      {t("auth.anonymousReport")}
    </p>
  );
}
