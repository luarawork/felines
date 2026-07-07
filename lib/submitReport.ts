// Shared helper for submitting a community report through /api/reports
// instead of inserting into Supabase directly — every report-creating
// component uses this, so rate limiting (enforced server-side in the
// route handler) applies uniformly no matter which form the report came
// from.
import { supabase } from "@/lib/supabaseClient";

export type ReportSubmission = {
  colony_id?: string | null;
  type: string;
  description?: string | null;
  photo_url?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  related_report_id?: string | null;
  status?: string;
  // Site language at submission time — the API route uses this to
  // localize the resulting caretaker/follower notifications, since
  // those are generated server-side and have no other way to know
  // which language the reporting visitor was using.
  language?: "pt" | "en";
};

export async function submitReport(submission: ReportSubmission): Promise<{ error: string | null }> {
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;

  let response: Response;
  try {
    response = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...submission, accessToken }),
    });
  } catch {
    return { error: "O relato não foi enviado. Tenta de novo?" };
  }

  if (!response.ok) {
    const responseBody = await response.json().catch(() => null);
    return { error: responseBody?.error ?? "O relato não foi enviado. Tenta de novo?" };
  }

  return { error: null };
}
