// /stories route for Felines.
// Public wall of short stories caretakers share about their colonies —
// a special moment, a transformation, a cat that was adopted. Anyone
// can read and react; only linked caretakers can post (via
// ShareStoryButton on the colony page, gated by RLS on insert).
import type { Metadata } from "next";
import { supabase } from "@/lib/supabaseClient";
import StoriesGrid from "@/components/StoriesGrid";
import EmptyState from "@/components/EmptyState";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Histórias da comunidade — Felines",
  description: "Momentos especiais, transformações e adoções contados por quem cuida das colônias.",
  openGraph: {
    title: "Histórias da comunidade — Felines",
    description: "Momentos especiais, transformações e adoções contados por quem cuida das colônias.",
    url: "/stories",
    images: ["/images/hero-cat.png"],
  },
};

export type StoryWithMeta = {
  id: string;
  colonyId: string;
  colonyName: string;
  colonyCoverPhotoUrl: string | null;
  title: string;
  storyText: string;
  photoUrl: string | null;
  anonymous: boolean;
  authorId: string;
  authorName: string;
  createdAt: string;
  reactionCount: number;
};

export default async function StoriesPage() {
  const { data: storyRows } = await supabase
    .from("colony_stories")
    .select("id, colony_id, created_by, title, story_text, photo_url, anonymous, created_at")
    .order("created_at", { ascending: false });

  if (!storyRows || storyRows.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <h1 className="text-2xl font-bold text-felines-text-primary sm:text-3xl">
          Histórias da comunidade
        </h1>
        <div className="mt-8">
          <EmptyState
            main="Nenhuma história ainda. Seja a primeira pessoa a compartilhar um momento da sua colônia."
            ctas={[{ label: "Ver colônias no mapa", href: "/map" }]}
          />
        </div>
      </div>
    );
  }

  const colonyIds = Array.from(new Set(storyRows.map((row) => row.colony_id)));
  const authorIds = Array.from(new Set(storyRows.map((row) => row.created_by)));
  const storyIds = storyRows.map((row) => row.id);

  const [{ data: colonyRows }, { data: profileRows }, { data: reactionRows }] = await Promise.all([
    supabase.from("colonies").select("id, name, cover_photo_url").in("id", colonyIds),
    supabase.from("profiles").select("id, display_name").in("id", authorIds),
    supabase.from("story_reactions").select("story_id").in("story_id", storyIds),
  ]);

  const reactionCounts = new Map<string, number>();
  (reactionRows ?? []).forEach((row) => {
    reactionCounts.set(row.story_id, (reactionCounts.get(row.story_id) ?? 0) + 1);
  });

  const stories: StoryWithMeta[] = storyRows.map((row) => {
    const colony = (colonyRows ?? []).find((c) => c.id === row.colony_id);
    const profile = (profileRows ?? []).find((p) => p.id === row.created_by);
    return {
      id: row.id,
      colonyId: row.colony_id,
      colonyName: colony?.name ?? "Colônia",
      colonyCoverPhotoUrl: colony?.cover_photo_url ?? null,
      title: row.title,
      storyText: row.story_text,
      photoUrl: row.photo_url,
      anonymous: row.anonymous,
      authorId: row.created_by,
      authorName: row.anonymous ? "Cuidador anônimo" : profile?.display_name || "Alguém da comunidade",
      createdAt: row.created_at,
      reactionCount: reactionCounts.get(row.id) ?? 0,
    };
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-bold text-felines-text-primary sm:text-3xl">
        Histórias da comunidade
      </h1>
      <p className="mt-2 text-base text-felines-text-secondary">
        Momentos especiais contados por quem cuida das colônias.
      </p>
      <StoriesGrid stories={stories} />
    </div>
  );
}
