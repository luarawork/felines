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
