// Helpers for the public-safe `profiles` table (display name only — no
// email or other auth.users data is ever exposed through the API).
import { supabase } from "@/lib/supabaseClient";

export async function getDisplayName(userId: string): Promise<string | null> {
  const { data } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", userId)
    .maybeSingle();

  return data?.display_name ?? null;
}

// Creates the user's own profile row if it doesn't exist yet, since
// there's no database trigger wiring profiles to new signups.
export async function ensureOwnProfile(userId: string): Promise<void> {
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (!existing) {
    await supabase.from("profiles").insert({ id: userId });
  }
}

export async function updateOwnDisplayName(userId: string, displayName: string): Promise<boolean> {
  const { error } = await supabase
    .from("profiles")
    .update({ display_name: displayName.trim() || null })
    .eq("id", userId);

  return !error;
}

export async function getAvatarUrl(userId: string): Promise<string | null> {
  const { data } = await supabase
    .from("profiles")
    .select("avatar_url")
    .eq("id", userId)
    .maybeSingle();

  return data?.avatar_url ?? null;
}

export async function updateOwnAvatarUrl(userId: string, avatarUrl: string): Promise<boolean> {
  const { error } = await supabase.from("profiles").update({ avatar_url: avatarUrl }).eq("id", userId);
  return !error;
}
