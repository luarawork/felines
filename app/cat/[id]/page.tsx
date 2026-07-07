// /cat/:id — public profile page for an individual cat.
// Shows the cat's basic info + health notes left by any signed-in
// user. Notes are public-readable (cat_notes_select_public policy)
// and anyone authenticated can add one.
import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import CatPageClient, { CatNotFoundNotice } from "@/components/colony/CatPageClient";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const dynamic = "force-dynamic";

type CatRow = {
  id: string;
  name: string | null;
  photo_url: string | null;
  castrated: boolean;
  last_seen: string | null;
  colony_id: string;
  colonies: { id: string; name: string } | null;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const { data } = await supabase
    .from("cats")
    .select("name, colonies(name)")
    .eq("id", id)
    .maybeSingle();

  const catName = (data as CatRow | null)?.name ?? "Gato";
  const colonyName = (data as CatRow | null)?.colonies?.name;
  const title = colonyName ? `${catName} — ${colonyName}` : catName;

  return { title: `${title} — Felines` };
}

export default async function CatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [{ data: catData }, { data: notesData }] = await Promise.all([
    supabase
      .from("cats")
      .select("id, name, photo_url, castrated, last_seen, colony_id, colonies(id, name)")
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("cat_notes")
      .select("id, body, health_status, created_at")
      .eq("cat_id", id)
      .order("created_at", { ascending: false }),
  ]);

  const cat = catData as CatRow | null;

  if (!cat) {
    return <CatNotFoundNotice />;
  }

  const colony = cat.colonies as { id: string; name: string } | null;
  const lastSeenDate = cat.last_seen
    ? new Date(cat.last_seen).toLocaleDateString("pt-BR")
    : null;

  return (
    <CatPageClient
      catId={id}
      catName={cat.name}
      photoUrl={cat.photo_url}
      castrated={cat.castrated}
      lastSeenDate={lastSeenDate}
      colony={colony}
      notes={notesData ?? []}
    />
  );
}
