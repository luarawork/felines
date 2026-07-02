// /u/:id route for Felines.
// Public caretaker page: shows a display name, the colonies this person
// caretakes, the reports they've made, and the reports they've
// confirmed — type/status/date only, never the free-text description
// or photo. Anyone can view this — it exists to give caretakers
// visibility and trust, not to gate information. Styled with the same
// full-bleed section rhythm as /profile and the home page.
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import CaretakerPublicPageClient from "@/components/CaretakerPublicPageClient";

export default async function CaretakerPublicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, public_contact")
    .eq("id", id)
    .maybeSingle();

  if (!profile) notFound();

  const [
    { data: caretakerRows },
    { data: madeReportRows },
    { data: confirmationRows },
    { count: createdColonyCount },
    { count: feedingCount },
    { count: foodDonationCount },
    { count: thanksReceivedCount },
    { data: certRow },
  ] = await Promise.all([
    supabase
      .from("caretakers")
      .select("colonies(id, name, castration_status)")
      .eq("user_id", id),
    supabase
      .from("reports")
      .select("id, type, status, created_at")
      .eq("created_by", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("report_confirmations")
      .select("created_at, reports(id, type, status)")
      .eq("user_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("colonies")
      .select("id", { count: "exact", head: true })
      .eq("created_by", id),
    supabase
      .from("feedings")
      .select("id", { count: "exact", head: true })
      .eq("user_id", id),
    supabase
      .from("resource_posts")
      .select("id", { count: "exact", head: true })
      .eq("created_by", id)
      .eq("type", "offering")
      .eq("category", "food_supplies"),
    supabase
      .from("thanks")
      .select("id", { count: "exact", head: true })
      .eq("caretaker_user_id", id),
    supabase
      .from("caretaker_certifications")
      .select("id")
      .eq("user_id", id)
      .maybeSingle(),
  ]);

  const colonies = (caretakerRows ?? [])
    .map(
      (row) =>
        row.colonies as unknown as {
          id: string;
          name: string;
          castration_status: string;
        } | null
    )
    .filter((colony): colony is { id: string; name: string; castration_status: string } =>
      colony !== null
    );

  const badges: { icon: string; labelKey: string }[] = [];
  if (colonies.length > 0) badges.push({ icon: "🤝", labelKey: "profile.badges.caretaker" });
  if ((createdColonyCount ?? 0) > 0) badges.push({ icon: "🐾", labelKey: "profile.badges.registeredColony" });
  if ((feedingCount ?? 0) > 0) badges.push({ icon: "🍽️", labelKey: "profile.badges.fed" });
  if ((foodDonationCount ?? 0) > 0) badges.push({ icon: "🥫", labelKey: "profile.badges.donated" });
  if ((madeReportRows?.length ?? 0) > 0) badges.push({ icon: "🚨", labelKey: "profile.badges.reported" });
  if ((thanksReceivedCount ?? 0) > 0) badges.push({ icon: "🙏", labelKey: "profile.badges.thanked" });
  if (certRow) badges.push({ icon: "🎓", labelKey: "profile.badges.certified" });

  const confirmedReports = (confirmationRows ?? [])
    .map((row) => ({
      confirmedAt: row.created_at,
      report: row.reports as unknown as { id: string; type: string; status: string } | null,
    }))
    .filter((row): row is { confirmedAt: string; report: { id: string; type: string; status: string } } =>
      row.report !== null
    );

  return (
    <CaretakerPublicPageClient
      profileId={profile.id}
      displayName={profile.display_name}
      avatarUrl={profile.avatar_url}
      publicContact={profile.public_contact}
      colonies={colonies}
      badges={badges}
      madeReportRows={madeReportRows ?? []}
      confirmedReports={confirmedReports}
    />
  );
}
