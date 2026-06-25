// Colony registration form for /colony/new.
// Requires authentication. Walks the user through validation questions
// (to discourage low-quality submissions), a required photo upload, map
// marker placement, and the name/narrative fields, then inserts the new
// colony row with both exact and blurred coordinates.
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import MapMarkerPickerShell from "@/components/MapMarkerPickerShell";

// Location blur protects cats from malicious users who could use exact
// coordinates to find and harm animals. Both blur levels are computed
// once, here, at registration time — never recomputed on the fly from
// the client, so a colony's approximate pin stays stable across visits.
// Wide blur (~500m) is shown to anonymous visitors.
function blurCoordinateWide(value: number) {
  return value + (Math.random() - 0.5) * 0.01;
}

// Closer blur (~100m) is shown to authenticated users who aren't (yet)
// a caretaker of this colony.
function blurCoordinateNear(value: number) {
  return value + (Math.random() - 0.5) * 0.002;
}

export default function NewColonyForm() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  const [seenMultipleTimes, setSeenMultipleTimes] = useState(false);
  const [hasFixedSpot, setHasFixedSpot] = useState(false);

  const [name, setName] = useState("");
  const [narrative, setNarrative] = useState("");
  const [castrationStatus, setCastrationStatus] = useState<"none" | "partial" | "full">("none");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [position, setPosition] = useState<[number, number] | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.push("/login");
        return;
      }
      setSession(data.session);
      setCheckingSession(false);
    });
  }, [router]);

  async function handleSubmit(formEvent: React.FormEvent) {
    formEvent.preventDefault();
    setError(null);

    if (!seenMultipleTimes || !hasFixedSpot) {
      setError("Confirme as duas perguntas de validação antes de continuar.");
      return;
    }
    if (!name.trim()) {
      setError("Informe um nome para a colônia.");
      return;
    }
    if (!photoFile) {
      setError("Envie uma foto da colônia.");
      return;
    }
    if (!position) {
      setError("Clique no mapa para marcar a localização exata da colônia.");
      return;
    }
    if (!session) return;

    setSubmitting(true);

    const filePath = `${session.user.id}/${Date.now()}-${photoFile.name}`;
    const { error: uploadError } = await supabase.storage
      .from("colony-photos")
      .upload(filePath, photoFile);

    if (uploadError) {
      setSubmitting(false);
      setError("Não foi possível enviar a foto. Tente novamente.");
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("colony-photos")
      .getPublicUrl(filePath);

    const [latitude, longitude] = position;

    const { data: colony, error: insertError } = await supabase
      .from("colonies")
      .insert({
        name: name.trim(),
        narrative: narrative.trim() || null,
        latitude,
        longitude,
        latitude_blurred: blurCoordinateWide(latitude),
        longitude_blurred: blurCoordinateWide(longitude),
        latitude_blurred_near: blurCoordinateNear(latitude),
        longitude_blurred_near: blurCoordinateNear(longitude),
        castration_status: castrationStatus,
        cover_photo_url: publicUrlData.publicUrl,
        created_by: session.user.id,
      })
      .select("id")
      .single();

    setSubmitting(false);

    if (insertError || !colony) {
      setError("Não foi possível cadastrar a colônia. Tente novamente.");
      return;
    }

    router.push(`/colony/${colony.id}`);
  }

  if (checkingSession) return null;

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
      {/* Validation questions */}
      <fieldset className="space-y-2 rounded-xl border border-felines-border bg-felines-surface p-4">
        <legend className="text-sm font-semibold text-felines-text-primary">
          Antes de cadastrar
        </legend>
        <label className="flex items-start gap-2 text-sm text-felines-text-secondary">
          <input
            type="checkbox"
            checked={seenMultipleTimes}
            onChange={(formEvent) => setSeenMultipleTimes(formEvent.target.checked)}
            className="mt-1"
          />
          Já vi esses gatos pelo menos 3 vezes nesse local.
        </label>
        <label className="flex items-start gap-2 text-sm text-felines-text-secondary">
          <input
            type="checkbox"
            checked={hasFixedSpot}
            onChange={(formEvent) => setHasFixedSpot(formEvent.target.checked)}
            className="mt-1"
          />
          Eles parecem ter um local fixo onde dormem ou se alimentam.
        </label>
      </fieldset>

      {/* Name and narrative */}
      <div>
        <label className="block text-sm font-medium text-felines-text-primary">
          Nome da colônia
        </label>
        <input
          type="text"
          value={name}
          onChange={(formEvent) => setName(formEvent.target.value)}
          required
          maxLength={100}
          className="mt-1 w-full rounded-md border border-felines-border bg-white px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-felines-text-primary">Narrativa</label>
        <textarea
          value={narrative}
          onChange={(formEvent) => setNarrative(formEvent.target.value)}
          rows={4}
          maxLength={1000}
          placeholder="Conte um pouco sobre a história e os hábitos dessa colônia."
          className="mt-1 w-full rounded-md border border-felines-border bg-white px-3 py-2 text-sm"
        />
      </div>

      {/* Castration status */}
      <div>
        <label className="block text-sm font-medium text-felines-text-primary">
          Situação de castração
        </label>
        <select
          value={castrationStatus}
          onChange={(formEvent) =>
            setCastrationStatus(formEvent.target.value as "none" | "partial" | "full")
          }
          className="mt-1 w-full rounded-md border border-felines-border bg-white px-3 py-2 text-sm"
        >
          <option value="none">Nenhum gato castrado</option>
          <option value="partial">Castração parcial</option>
          <option value="full">Colônia totalmente castrada</option>
        </select>
      </div>

      {/* Photo upload */}
      <div>
        <label className="block text-sm font-medium text-felines-text-primary">
          Foto da colônia
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(formEvent) => setPhotoFile(formEvent.target.files?.[0] ?? null)}
          required
          className="mt-1 w-full text-sm text-felines-text-secondary"
        />
      </div>

      {/* Map marker placement */}
      <div>
        <label className="block text-sm font-medium text-felines-text-primary">
          Localização exata (clique no mapa)
        </label>
        <div className="mt-2 h-64 w-full overflow-hidden rounded-xl border border-felines-border">
          <MapMarkerPickerShell
            position={position}
            onPick={(lat, lng) => setPosition([lat, lng])}
          />
        </div>
      </div>

      {error && <p className="text-sm text-felines-emergency">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-full bg-felines-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-felines-accent-hover disabled:opacity-50"
      >
        {submitting ? "Cadastrando..." : "Cadastrar colônia"}
      </button>
    </form>
  );
}
