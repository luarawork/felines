// /u/:id route for Felines.
// Public caretaker page: shows a display name and the colonies this
// person caretakes, without exposing any private data (email, etc).
// Anyone can view this — it exists to give caretakers visibility and
// trust, not to gate information.
import { notFound } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default async function CaretakerPublicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name")
    .eq("id", id)
    .maybeSingle();

  if (!profile) notFound();

  const { data: caretakerRows } = await supabase
    .from("caretakers")
    .select("colonies(id, name, castration_status)")
    .eq("user_id", id);

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

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold text-felines-text-primary sm:text-3xl">
        {profile.display_name || "Cuidador da comunidade Felines"}
      </h1>
      <p className="mt-2 text-sm text-felines-text-secondary">
        Cuida de {colonies.length} {colonies.length === 1 ? "colônia" : "colônias"} no Felines.
      </p>

      {colonies.length > 0 && (
        <ul className="mt-6 space-y-2">
          {colonies.map((colony) => (
            <li key={colony.id}>
              <Link
                href={`/colony/${colony.id}`}
                className="block rounded-xl border border-felines-border bg-felines-surface p-4 transition-colors hover:border-felines-accent"
              >
                <span className="font-medium text-felines-text-primary">{colony.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
