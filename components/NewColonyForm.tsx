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
import { buildSafeStoragePath, validatePhotoFile } from "@/lib/storage";
import AuthRequiredNotice from "@/components/AuthRequiredNotice";
import PhotoUploadButton from "@/components/PhotoUploadButton";
import QuickSightingForm from "@/components/QuickSightingForm";
import { useEscapeToClose } from "@/lib/useEscapeToClose";

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
  const [showSightingForm, setShowSightingForm] = useState(false);

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

  useEscapeToClose(showSightingForm, () => setShowSightingForm(false));

  async function handleSubmit(formEvent: React.FormEvent) {
    formEvent.preventDefault();
    setError(null);

    if (moreThanOneCat === null || seenFrequently === null || hasCareSigns === null) {
      setError("Responda as 4 perguntas ali acima antes de continuar.");
      return;
    }
    if (!moreThanOneCat || !seenFrequently) {
      setError("Isso soa mais como um avistamento. Dá uma olhada na sugestão acima.");
      return;
    }
    if (!canPhotoNow) {
      setError("Pra cadastrar, você precisa conseguir fotografar o local agora.");
      return;
    }
    if (!name.trim()) {
      setError("Dê um nome pra essa colônia.");
      return;
    }
    if (!photoFile) {
      setError("Falta a foto da colônia.");
      return;
    }
    const photoError = validatePhotoFile(photoFile);
    if (photoError) {
      setError(photoError);
      return;
    }
    if (!position) {
      setError("Toque no mapa pra marcar onde essa colônia fica.");
      return;
    }
    if (!session) return;

    setSubmitting(true);

    const filePath = buildSafeStoragePath(session.user.id, photoFile);
    const { error: uploadError } = await supabase.storage
      .from("colony-photos")
      .upload(filePath, photoFile);

    if (uploadError) {
      setSubmitting(false);
      setError("A foto não subiu. Tenta de novo?");
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
      setError("Algo deu errado e a colônia não foi cadastrada. Tenta de novo?");
      return;
    }

    // The person registering a colony is, in practice, its first
    // caretaker — without this row they'd show up as "not a caretaker"
    // of their own colony (no entry in "Quem cuida", no caretaker badge
    // on their profile/public page) despite colonies_update_caretaker
    // already treating created_by as equivalent to a caretaker link.
    await supabase.from("caretakers").insert({ colony_id: colony.id, user_id: session.user.id });

    await supabase.from("timeline_events").insert({
      colony_id: colony.id,
      event_type: "colony_created",
      description: "Colônia cadastrada no mapa.",
      created_by: session.user.id,
    });

    router.push(`/colony/${colony.id}`);
  }

  if (checkingSession) return null;

  if (!session) {
    return <AuthRequiredNotice />;
  }

  return (
    <>
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Validation questions */}
      <fieldset className="space-y-4 rounded-xl border border-felines-border bg-felines-surface p-4">
        <legend className="text-sm font-semibold text-felines-text-primary">
          Antes de continuar, 4 perguntas rápidas
        </legend>

        <ValidationQuestion
          question="Tem mais de um gato nesse lugar?"
          value={moreThanOneCat}
          onChange={setMoreThanOneCat}
        />
        <ValidationQuestion
          question="Você vê eles ali com frequência, sempre no mesmo lugar?"
          value={seenFrequently}
          onChange={setSeenFrequently}
        />

        {(moreThanOneCat === false || seenFrequently === false) && (
          <div className="rounded-md bg-felines-warning/10 px-3 py-2 text-sm text-felines-text-primary">
            <p>Pelo que você descreveu, isso parece mais um avistamento do que uma colônia.</p>
            <button
              type="button"
              onClick={() => setShowSightingForm(true)}
              className="mt-2 rounded-full border border-felines-accent px-3 py-1 text-xs font-medium text-felines-accent transition-colors hover:bg-felines-accent hover:text-white"
            >
              Relatar avistamento →
            </button>
          </div>
        )}

        <ValidationQuestion
          question="Já tem sinais de que alguém cuida deles? (potes de comida, água, abrigo pequeno)"
          value={hasCareSigns}
          onChange={setHasCareSigns}
        />
        <ValidationQuestion
          question="Você consegue tirar uma foto do local agora? É obrigatório pra cadastrar."
          value={canPhotoNow}
          onChange={setCanPhotoNow}
        />
      </fieldset>

      {/* Name and narrative */}
      <div>
        <label
          htmlFor="new-colony-name"
          className="block text-sm font-medium text-felines-text-primary"
        >
          Nome da colônia
        </label>
        <input
          id="new-colony-name"
          type="text"
          value={name}
          onChange={(formEvent) => setName(formEvent.target.value)}
          required
          maxLength={100}
          className="mt-1 w-full rounded-md border border-felines-border bg-white px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label
          htmlFor="new-colony-narrative"
          className="block text-sm font-medium text-felines-text-primary"
        >
          Narrativa
        </label>
        <textarea
          id="new-colony-narrative"
          value={narrative}
          onChange={(formEvent) => setNarrative(formEvent.target.value)}
          rows={4}
          maxLength={1000}
          placeholder="Como você conheceu esses gatos? O que eles costumam fazer?"
          className="mt-1 w-full rounded-md border border-felines-border bg-white px-3 py-2 text-sm"
        />
      </div>

      {/* Castration status */}
      <div>
        <label
          htmlFor="new-colony-castration"
          className="block text-sm font-medium text-felines-text-primary"
        >
          Quantos já são castrados?
        </label>
        <select
          id="new-colony-castration"
          value={castrationStatus}
          onChange={(formEvent) =>
            setCastrationStatus(formEvent.target.value as "none" | "partial" | "full")
          }
          className="mt-1 w-full rounded-md border border-felines-border bg-white px-3 py-2 text-sm"
        >
          <option value="none">Nenhum ainda</option>
          <option value="partial">Alguns sim, outros não</option>
          <option value="full">Todos castrados</option>
        </select>
      </div>

      {/* Photo upload */}
      <div>
        <label className="block text-sm font-medium text-felines-text-primary">
          Uma foto do local
        </label>
        <div className="mt-1">
          <PhotoUploadButton label="Escolher foto" file={photoFile} onChange={setPhotoFile} />
        </div>
      </div>

      {/* Map marker placement */}
      <div>
        <label className="block text-sm font-medium text-felines-text-primary">
          Onde exatamente
        </label>
        <p className="mt-1 text-xs text-felines-text-secondary">
          Toque ou arraste o pino até o ponto certo no mapa.
        </p>
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
        {submitting ? "Colocando no mapa..." : "Colocar no mapa"}
      </button>
    </form>

    {showSightingForm && (
        <div
          className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40 p-4"
          onClick={() => setShowSightingForm(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="sighting-modal-title"
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-felines-background p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <h2 id="sighting-modal-title" className="text-lg font-bold text-felines-text-primary">
                Relatar avistamento
              </h2>
              <button
                type="button"
                onClick={() => setShowSightingForm(false)}
                aria-label="Fechar"
                className="flex h-11 w-11 flex-shrink-0 items-center justify-center text-xl leading-none text-felines-text-secondary hover:text-felines-text-primary"
              >
                ×
              </button>
            </div>
            <div className="mt-4">
              <QuickSightingForm
                initialPosition={position}
                onClose={() => setShowSightingForm(false)}
              />
            </div>
          </div>
        </div>
      )}
    </>
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
