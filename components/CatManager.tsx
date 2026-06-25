// Lets a colony's creator or a linked caretaker manage its named cats:
// add a new cat (with optional photo), toggle castration status, and
// remove a cat. Hidden entirely for visitors who aren't authorized to
// manage the colony — RLS would block the mutation anyway, but checking
// here avoids showing controls that would just fail.
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

type ManagedCat = {
  id: string;
  name: string | null;
  photo_url: string | null;
  castrated: boolean;
};

export default function CatManager({ colonyId }: { colonyId: string }) {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [canManage, setCanManage] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);

  const [cats, setCats] = useState<ManagedCat[]>([]);

  const [name, setName] = useState("");
  const [castrated, setCastrated] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Determines whether the signed-in user created this colony or is a
  // linked caretaker, and loads the current cat list for management.
  useEffect(() => {
    async function loadAccessAndCats() {
      const { data: sessionData } = await supabase.auth.getSession();
      const currentSession = sessionData.session;
      setSession(currentSession);

      if (currentSession) {
        const [{ data: colony }, { data: caretakerLink }] = await Promise.all([
          supabase.from("colonies").select("created_by").eq("id", colonyId).single(),
          supabase
            .from("caretakers")
            .select("id")
            .eq("colony_id", colonyId)
            .eq("user_id", currentSession.user.id)
            .maybeSingle(),
        ]);

        setCanManage(colony?.created_by === currentSession.user.id || !!caretakerLink);
      }

      const { data: catRows } = await supabase
        .from("cats")
        .select("id, name, photo_url, castrated")
        .eq("colony_id", colonyId)
        .order("created_at", { ascending: false });

      if (catRows) setCats(catRows as ManagedCat[]);
      setCheckingAccess(false);
    }

    loadAccessAndCats();
  }, [colonyId]);

  // Adds a new cat to the colony, uploading the photo first if provided.
  async function handleAddCat(formEvent: React.FormEvent) {
    formEvent.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Informe o nome do gato.");
      return;
    }
    if (!session) return;

    setSubmitting(true);

    let photoUrl: string | null = null;
    if (photoFile) {
      const filePath = `cats/${colonyId}/${Date.now()}-${photoFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("colony-photos")
        .upload(filePath, photoFile);

      if (uploadError) {
        setSubmitting(false);
        setError("Não foi possível enviar a foto do gato.");
        return;
      }

      photoUrl = supabase.storage.from("colony-photos").getPublicUrl(filePath).data.publicUrl;
    }

    const { data: newCat, error: insertError } = await supabase
      .from("cats")
      .insert({
        colony_id: colonyId,
        name: name.trim(),
        castrated,
        photo_url: photoUrl,
        last_seen: new Date().toISOString(),
      })
      .select("id, name, photo_url, castrated")
      .single();

    setSubmitting(false);

    if (insertError || !newCat) {
      setError("Não foi possível adicionar o gato.");
      return;
    }

    setCats((previous) => [newCat as ManagedCat, ...previous]);
    setName("");
    setCastrated(false);
    setPhotoFile(null);
    router.refresh();
  }

  // Toggles a cat's castration status.
  async function handleToggleCastrated(cat: ManagedCat) {
    const { error: updateError } = await supabase
      .from("cats")
      .update({ castrated: !cat.castrated })
      .eq("id", cat.id);

    if (updateError) {
      setError("Não foi possível atualizar o gato.");
      return;
    }

    setCats((previous) =>
      previous.map((item) => (item.id === cat.id ? { ...item, castrated: !item.castrated } : item))
    );
    router.refresh();
  }

  // Removes a cat from the colony.
  async function handleRemoveCat(catId: string) {
    const { error: deleteError } = await supabase.from("cats").delete().eq("id", catId);

    if (deleteError) {
      setError("Não foi possível remover o gato.");
      return;
    }

    setCats((previous) => previous.filter((item) => item.id !== catId));
    router.refresh();
  }

  if (checkingAccess || !canManage) return null;

  return (
    <section className="mt-10 rounded-xl border border-felines-border bg-felines-surface p-5">
      <h2 className="text-lg font-bold text-felines-text-primary">Gerenciar gatos</h2>

      <form onSubmit={handleAddCat} className="mt-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs font-medium text-felines-text-secondary">Nome</label>
          <input
            type="text"
            value={name}
            onChange={(formEvent) => setName(formEvent.target.value)}
            maxLength={100}
            className="mt-1 rounded-md border border-felines-border bg-white px-3 py-2 text-sm"
          />
        </div>
        <label className="flex items-center gap-2 pb-2 text-sm text-felines-text-secondary">
          <input
            type="checkbox"
            checked={castrated}
            onChange={(formEvent) => setCastrated(formEvent.target.checked)}
          />
          Castrado
        </label>
        <div>
          <label className="block text-xs font-medium text-felines-text-secondary">
            Foto (opcional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(formEvent) => setPhotoFile(formEvent.target.files?.[0] ?? null)}
            className="mt-1 text-sm text-felines-text-secondary"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-felines-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-felines-accent-hover disabled:opacity-50"
        >
          {submitting ? "Adicionando..." : "Adicionar gato"}
        </button>
      </form>

      {error && <p className="mt-2 text-sm text-felines-emergency">{error}</p>}

      {cats.length > 0 && (
        <ul className="mt-5 space-y-2">
          {cats.map((cat) => (
            <li
              key={cat.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-felines-border px-3 py-2 text-sm"
            >
              <span className="font-medium text-felines-text-primary">
                {cat.name ?? "Sem nome"}
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleToggleCastrated(cat)}
                  className="text-felines-accent hover:text-felines-accent-hover"
                >
                  {cat.castrated ? "Marcar como não castrado" : "Marcar como castrado"}
                </button>
                <button
                  onClick={() => handleRemoveCat(cat.id)}
                  className="text-felines-emergency hover:underline"
                >
                  Remover
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
