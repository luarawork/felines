// /cat/:id — public profile page for an individual cat.
// Shows the cat's basic info + health notes left by any signed-in
// user. Notes are public-readable (cat_notes_select_public policy)
// and anyone authenticated can add one.
import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import CatNotesSection from "@/components/CatNotesSection";

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
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <p className="text-felines-text-secondary">Gato não encontrado.</p>
        <Link
          href="/map"
          className="mt-4 inline-block text-sm font-medium text-felines-accent-hover hover:underline"
        >
          Ver o mapa →
        </Link>
      </div>
    );
  }

  const colony = cat.colonies as { id: string; name: string } | null;
  const lastSeenDate = cat.last_seen
    ? new Date(cat.last_seen).toLocaleDateString("pt-BR")
    : null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      {colony && (
        <Link
          href={`/colony/${colony.id}`}
          className="text-sm text-felines-text-secondary hover:text-felines-accent"
        >
          ← {colony.name}
        </Link>
      )}

      <div className="mt-5 flex gap-5">
        {cat.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cat.photo_url}
            alt={cat.name ?? "Foto do gato"}
            className="h-24 w-24 flex-shrink-0 rounded-2xl object-cover"
          />
        ) : (
          <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-2xl bg-felines-surface text-4xl">
            🐱
          </div>
        )}

        <div>
          <h1 className="text-2xl font-bold text-felines-text-primary">
            {cat.name ?? "Gato sem nome"}
          </h1>
          {colony && (
            <p className="mt-0.5 text-sm text-felines-text-secondary">{colony.name}</p>
          )}
          <div className="mt-2 flex flex-wrap gap-2">
            <span
              className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                cat.castrated
                  ? "border-felines-success/30 bg-felines-success/10 text-felines-success-hover"
                  : "border-felines-border text-felines-text-secondary"
              }`}
            >
              {cat.castrated ? "✓ Castrado" : "Não castrado"}
            </span>
            {lastSeenDate && (
              <span className="rounded-full border border-felines-border px-2.5 py-0.5 text-xs text-felines-text-secondary">
                Visto em {lastSeenDate}
              </span>
            )}
          </div>
        </div>
      </div>

      <CatNotesSection catId={id} initialNotes={notesData ?? []} />
    </div>
  );
}
