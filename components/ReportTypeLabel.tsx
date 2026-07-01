// Tiny client component so server components (e.g. app/u/[id]/page.tsx)
// can render a localized report type label without becoming client
// components themselves.
"use client";

import { getReportTypeLabel } from "@/lib/reportTypes";
import { useLanguage } from "@/lib/i18n";

export default function ReportTypeLabel({ value }: { value: string }) {
  const { t } = useLanguage();
  return <>{getReportTypeLabel(value, t)}</>;
}
