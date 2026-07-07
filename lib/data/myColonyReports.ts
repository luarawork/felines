// Finds open reports for colonies a given user created or caretakes.
// Used to notify caretakers about new reports on their own colonies,
// both as a count badge in the nav and as a full list on /profile.
import { supabase } from "@/lib/supabaseClient";

export type MyColonyReport = {
  id: string;
  colony_id: string;
  colony_name: string;
  type: string;
  description: string | null;
  created_at: string;
};

export type OwnReport = {
  id: string;
  colony_id: string | null;
  colony_name: string | null;
  type: string;
  status: "open" | "resolved";
  created_at: string;
};

// Returns the ids of colonies the user created or is a linked caretaker of.
async function getMyColonyIds(userId: string): Promise<string[]> {
  const [{ data: createdColonies }, { data: caretakerLinks }] = await Promise.all([
    supabase.from("colonies").select("id").eq("created_by", userId),
    supabase.from("caretakers").select("colony_id").eq("user_id", userId),
  ]);

  const colonyIds = new Set<string>();
  createdColonies?.forEach((row) => colonyIds.add(row.id));
  caretakerLinks?.forEach((row) => colonyIds.add(row.colony_id));

  return Array.from(colonyIds);
}

// Returns open reports for the user's own colonies, newest first.
export async function getOpenReportsForMyColonies(userId: string): Promise<MyColonyReport[]> {
  const colonyIds = await getMyColonyIds(userId);
  if (colonyIds.length === 0) return [];

  const { data } = await supabase
    .from("reports")
    .select("id, colony_id, type, description, created_at, colonies(name)")
    .eq("status", "open")
    .in("colony_id", colonyIds)
    .order("created_at", { ascending: false });

  if (!data) return [];

  return data.map((row) => ({
    id: row.id,
    colony_id: row.colony_id,
    colony_name: (row.colonies as unknown as { name: string } | null)?.name ?? "Colônia",
    type: row.type,
    description: row.description,
    created_at: row.created_at,
  }));
}

// Returns every report the user submitted themselves — on any colony,
// including ones they don't manage, and including reports they made
// while signed in but with no colony attached (a general sighting).
// `reports_select_authenticated` already grants authenticated users
// select on every row, so no RLS change is needed for this query.
export async function getOwnReports(userId: string): Promise<OwnReport[]> {
  const { data } = await supabase
    .from("reports")
    .select("id, colony_id, type, status, created_at, colonies(name)")
    .eq("created_by", userId)
    .order("created_at", { ascending: false });

  if (!data) return [];

  return data.map((row) => ({
    id: row.id,
    colony_id: row.colony_id,
    colony_name: (row.colonies as unknown as { name: string } | null)?.name ?? null,
    type: row.type,
    status: row.status,
    created_at: row.created_at,
  }));
}
