// API route for submitting a community report. This exists specifically
// to make server-side rate limiting possible: a client calling
// `supabase.from("reports").insert(...)` directly goes straight to
// Supabase's REST API and never touches this Next.js server at all, so
// no Next.js code could ever throttle it. Every report-submitting
// component (ReportButton, HelpFlow, QuickSightingForm, LostCatForm,
// SightingReportButton) posts here instead, via lib/submitReport.ts.
//
// This route is a thin relay, not a privilege escalation: it forwards
// the caller's own Supabase access token (if any) so RLS evaluates
// auth.uid() exactly as it would for a direct client call. Anonymous
// submissions go through the existing reports_insert_public policy,
// same as always.
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { checkRateLimit } from "@/lib/rateLimit";
import { REPORT_TYPES } from "@/lib/reportTypes";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const RATE_LIMIT_MESSAGE =
  "You've submitted several reports recently. Please wait a bit before reporting again — this helps us keep the map accurate.";

function getClientIp(request: NextRequest): string {
  // Vercel/Netlify and most reverse proxies set this; falls back to a
  // shared bucket if it's ever missing (e.g. local dev without a proxy
  // in front), which just means anonymous local testing shares one
  // limit — acceptable since it can't happen in production.
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() ?? "unknown";
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body.type !== "string") {
    return NextResponse.json({ error: "Dados do relato inválidos." }, { status: 400 });
  }

  if (!REPORT_TYPES.some((reportType) => reportType.value === body.type)) {
    return NextResponse.json({ error: "Tipo de relato inválido." }, { status: 400 });
  }

  const accessToken: string | undefined = body.accessToken;

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : undefined,
  });

  const { data: userData } = accessToken
    ? await supabase.auth.getUser(accessToken)
    : { data: { user: null } };
  const isAuthenticated = !!userData?.user;

  const rateLimitKey = isAuthenticated ? `user:${userData!.user!.id}` : `ip:${getClientIp(request)}`;
  const { allowed } = checkRateLimit(rateLimitKey, isAuthenticated);

  if (!allowed) {
    return NextResponse.json({ error: RATE_LIMIT_MESSAGE }, { status: 429 });
  }

  const { colony_id, type, description, photo_url, latitude, longitude, related_report_id, status } =
    body;

  const { data, error } = await supabase
    .from("reports")
    .insert({
      colony_id: colony_id ?? null,
      type,
      description: description ?? null,
      photo_url: photo_url ?? null,
      latitude: latitude ?? null,
      longitude: longitude ?? null,
      related_report_id: related_report_id ?? null,
      status: status ?? "open",
      created_by: isAuthenticated ? userData!.user!.id : null,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: "O relato não foi enviado. Tenta de novo?" }, { status: 400 });
  }

  // Notifies the colony's followers with a summary only, never the
  // free-text description — and only for signed-in reporters, since
  // notify_followers is granted to `authenticated`, not `anon` (an
  // anonymous caller could otherwise spam arbitrary fan-out messages to
  // every follower of any colony, since p_message has no server-side
  // content check beyond what we pass it here).
  if (isAuthenticated && colony_id) {
    await supabase.rpc("notify_followers", {
      p_colony_id: colony_id,
      p_type: "report_submitted",
      p_message: "Um novo relato foi feito em uma colônia que você segue.",
    });
  }

  return NextResponse.json({ data });
}
