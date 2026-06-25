// Lets a colony's creator or a linked caretaker edit its narrative,
// castration status, and cover photo. Until now colonies could only be
// created, never updated, so a typo or outdated castration status had
// no way to be fixed through the app.
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

type CastrationStatus = "none" | "partial" | "full";

export default function EditColonyForm({
  colonyId,
  initialNarrative,
  initialCastrationStatus,
  initialCoverPhotoUrl,
}: {
  colonyId: string;
  initialNarrative: string | null;
  initialCastrationStatus: CastrationStatus;
  initialCoverPhotoUrl: string | null;
}) {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [canManage, setCanManage] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);

  const [narrative, setNarrative] = useState(initialNarrative ?? "");
  const [castrationStatus, setCastrationStatus] = useState<CastrationStatus>(
    initialCastrationStatus
  );
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Same creator/caretaker access check used by CatManager and TimelineEventForm.
  useEffect(() => {
    async function loadAccess() {
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

      setCheckingAccess(false);
    }

    loadAccess();
  }, [colonyId]);

  async function handleSubmit(formEvent: React.FormEvent) {
    formEvent.preventDefault();
    setError(null);
    setSaved(false);

    setSubmitting(true);

    let coverPhotoUrl = initialCoverPhotoUrl;
    if (photoFile) {
      const filePath = `${colonyId}/${Date.now()}-${photoFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("colony-photos")
        .upload(filePath, photoFile);

      if (uploadError) {
        setSubmitting(false);
        setError("Não foi possível enviar a nova foto.");
        return;
      }

      coverPhotoUrl = supabase.storage.from("colony-photos").getPublicUrl(filePath).data.publicUrl;
    }

    const { error: updateError } = await supabase
      .from("colonies")
      .update({
        narrative: narrative.trim() || null,
        castration_status: castrationStatus,
        cover_photo_url: coverPhotoUrl,
      })
      .eq("id", colonyId);

    setSubmitting(false);

    if (updateError) {
      setError("Não foi possível salvar as alterações.");
      return;
    }

    setPhotoFile(null);
    setSaved(true);
    router.refresh();
  }

  if (checkingAccess) return null;

  if (!session || !canManage) {
    return (
      <p className="text-sm text-felines-text-secondary">
        Apenas o criador ou um cuidador vinculado pode editar esta colônia.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
      <div>
        <label className="block text-sm font-medium text-felines-text-primary">Narrativa</label>
        <textarea
          value={narrative}
          onChange={(formEvent) => setNarrative(formEvent.target.value)}
          rows={4}
          maxLength={1000}
          className="mt-1 w-full rounded-md border border-felines-border bg-white px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-felines-text-primary">
          Situação de castração
        </label>
        <select
          value={castrationStatus}
          onChange={(formEvent) => setCastrationStatus(formEvent.target.value as CastrationStatus)}
          className="mt-1 w-full rounded-md border border-felines-border bg-white px-3 py-2 text-sm"
        >
          <option value="none">Nenhum gato castrado</option>
          <option value="partial">Castração parcial</option>
          <option value="full">Colônia totalmente castrada</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-felines-text-primary">
          Substituir foto de capa (opcional)
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(formEvent) => setPhotoFile(formEvent.target.files?.[0] ?? null)}
          className="mt-1 text-sm text-felines-text-secondary"
        />
      </div>

      {error && <p className="text-sm text-felines-emergency">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-full bg-felines-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-felines-accent-hover disabled:opacity-50"
      >
        {submitting ? "Salvando..." : saved ? "Salvo" : "Salvar alterações"}
      </button>
    </form>
  );
}
