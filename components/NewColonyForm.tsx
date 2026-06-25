// Colony registration form for /colony/new.
// Requires authentication. Walks the user through validation questions
// (to discourage low-quality submissions), a required photo upload, map
// marker placement, and the name/narrative fields, then inserts the new
// colony row with both exact and blurred coordinates.
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import MapMarkerPickerShell from "@/components/MapMarkerPickerShell";
import AuthRequiredNotice from "@/components/AuthRequiredNotice";

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

  const [moreThanOneCat, setMoreThanOneCat] = useState<boolean | null>(null);
  const [seenFrequently, setSeenFrequently] = useState<boolean | null>(null);
  const [hasCareSigns, setHasCareSigns] = useState<boolean | null>(null);
  const [canPhotoNow, setCanPhotoNow] = useState<boolean | null>(null);

  const [name, setName] = useState("");
  const [narrative, setNarrative] = useState("");
  const [castrationStatus, setCastrationStatus] = useState<"none" | "partial" | "full">("none");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [position, setPosition] = useState<[number, number] | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setCheckingSession(false);
    });
  }, []);

  async function handleSubmit(formEvent: React.FormEvent) {
    formEvent.preventDefault();
    setError(null);

    if (moreThanOneCat === null || seenFrequently === null || hasCareSigns === null) {
      setError("Responda as perguntas de validação antes de continuar.");
      return;
    }
    if (!moreThanOneCat || !seenFrequently) {
      setError("Isso pode ser um avistamento em vez de uma colônia. Veja a sugestão acima.");
      return;
    }
    if (!canPhotoNow) {
      setError("É necessário poder fotografar o local agora para cadastrar a colônia.");
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

  if (!session) {
    return (
      <div className="mt-6">
        <AuthRequiredNotice />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
      {/* Validation questions */}
      <fieldset className="space-y-4 rounded-xl border border-felines-border bg-felines-surface p-4">
        <legend className="text-sm font-semibold text-felines-text-primary">
          Antes de cadastrar
        </legend>

        <ValidationQuestion
          question="Há mais de um gato nesse local?"
          value={moreThanOneCat}
          onChange={setMoreThanOneCat}
        />
        <ValidationQuestion
          question="Você os vê com frequência no mesmo lugar?"
          value={seenFrequently}
          onChange={setSeenFrequently}
        />

        {(moreThanOneCat === false || seenFrequently === false) && (
          <p className="rounded-md bg-felines-warning/10 px-3 py-2 text-sm text-felines-text-primary">
            Isso pode ser um avistamento em vez de uma colônia.{" "}
            <Link href="/help" className="font-medium text-felines-accent">
              Quer registrar um avistamento em vez disso?
            </Link>
          </p>
        )}

        <ValidationQuestion
          question="Há sinais de que alguém já cuida deles? (potes de comida, água, abrigos pequenos)"
          value={hasCareSigns}
          onChange={setHasCareSigns}
        />
        <ValidationQuestion
          question="Você consegue fotografar o local agora? (obrigatório para cadastrar)"
          value={canPhotoNow}
          onChange={setCanPhotoNow}
        />
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

// A single yes/no validation question with two toggle buttons. Using
// explicit Yes/No buttons (rather than a checkbox) lets "no" be a real,
// trackable answer instead of just "unchecked".
function ValidationQuestion({
  question,
  value,
  onChange,
}: {
  question: string;
  value: boolean | null;
  onChange: (value: boolean) => void;
}) {
  return (
    <div>
      <p className="text-sm text-felines-text-secondary">{question}</p>
      <div className="mt-1 flex gap-2">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
            value === true
              ? "border-felines-success bg-felines-success text-white"
              : "border-felines-border text-felines-text-secondary"
          }`}
        >
          Sim
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
            value === false
              ? "border-felines-emergency bg-felines-emergency text-white"
              : "border-felines-border text-felines-text-secondary"
          }`}
        >
          Não
        </button>
      </div>
    </div>
  );
}
