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
import { assertSafeStoragePath, buildSafeStoragePath, validatePhotoFile } from "@/lib/storage";
import AuthRequiredNotice from "@/components/AuthRequiredNotice";
import PhotoUploadButton from "@/components/PhotoUploadButton";
import QuickSightingForm from "@/components/QuickSightingForm";
import { useEscapeToClose } from "@/lib/useEscapeToClose";
import { useLanguage } from "@/lib/i18n";
import { reverseGeocodeCity } from "@/lib/geocode";

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
  const { t, language } = useLanguage();
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
  const [city, setCity] = useState("");
  const [cityLoading, setCityLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setCheckingSession(false);
    });

    // Pre-fills the marker position when arriving from a suggested-colony
    // popup on the map ("Cadastrar uma colônia aqui", ?lat=...&lng=...).
    // Read via window.location instead of useSearchParams so this client
    // component doesn't force its page into a Suspense boundary just for
    // an optional convenience prefill.
    const params = new URLSearchParams(window.location.search);
    const lat = parseFloat(params.get("lat") ?? "");
    const lng = parseFloat(params.get("lng") ?? "");
    if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
      // One-time read of the URL on mount, not state derived from
      // props/state — outside what this lint rule covers.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPosition([lat, lng]);
    }
  }, []);

  useEscapeToClose(showSightingForm, () => setShowSightingForm(false));

  async function handleSubmit(formEvent: React.FormEvent) {
    formEvent.preventDefault();
    setError(null);

    if (moreThanOneCat === null || seenFrequently === null || hasCareSigns === null) {
      setError(t("newColony.errAnswerAll"));
      return;
    }
    if (!moreThanOneCat || !seenFrequently) {
      setError(t("newColony.errNotColony"));
      return;
    }
    if (!canPhotoNow) {
      setError(t("newColony.errNeedPhoto"));
      return;
    }
    if (!name.trim()) {
      setError(t("newColony.errNeedName"));
      return;
    }
    if (!photoFile) {
      setError(t("newColony.errNeedPhotoFile"));
      return;
    }
    const photoError = validatePhotoFile(photoFile);
    if (photoError) {
      setError(photoError);
      return;
    }
    if (!position) {
      setError(t("newColony.errNeedMarker"));
      return;
    }
    if (!session) return;

    setSubmitting(true);

    const filePath = buildSafeStoragePath(session.user.id, photoFile);
    assertSafeStoragePath(filePath);
    const { error: uploadError } = await supabase.storage
      .from("colony-photos")
      .upload(filePath, photoFile);

    if (uploadError) {
      setSubmitting(false);
      setError(t("newColony.errPhotoUpload"));
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
        city: city.trim() || null,
      })
      .select("id")
      .single();

    setSubmitting(false);

    if (insertError || !colony) {
      setError(t("newColony.errInsert"));
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

    window.dispatchEvent(new CustomEvent("felines:colony-created"));
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
          {t("newColony.validationLegend")}
        </legend>

        <ValidationQuestion
          question={t("newColony.q1")}
          value={moreThanOneCat}
          onChange={setMoreThanOneCat}
          yesLabel={t("newColony.yes")}
          noLabel={t("newColony.no")}
        />
        <ValidationQuestion
          question={t("newColony.q2")}
          value={seenFrequently}
          onChange={setSeenFrequently}
          yesLabel={t("newColony.yes")}
          noLabel={t("newColony.no")}
        />

        {(moreThanOneCat === false || seenFrequently === false) && (
          <div className="rounded-md bg-felines-warning/10 px-3 py-2 text-sm text-felines-text-primary">
            <p>{t("newColony.sightingSuggestion")}</p>
            <button
              type="button"
              onClick={() => setShowSightingForm(true)}
              className="mt-2 rounded-full border border-felines-accent px-3 py-1 text-xs font-medium text-felines-accent-hover transition-colors hover:bg-felines-accent hover:text-white"
            >
              {t("newColony.sightingCta")}
            </button>
          </div>
        )}

        <ValidationQuestion
          question={t("newColony.q3")}
          value={hasCareSigns}
          onChange={setHasCareSigns}
          yesLabel={t("newColony.yes")}
          noLabel={t("newColony.no")}
        />
        <ValidationQuestion
          question={t("newColony.q4")}
          value={canPhotoNow}
          onChange={setCanPhotoNow}
          yesLabel={t("newColony.yes")}
          noLabel={t("newColony.no")}
        />
      </fieldset>

      {/* Name and narrative */}
      <div>
        <label
          htmlFor="new-colony-name"
          className="block text-sm font-medium text-felines-text-primary"
        >
          {t("newColony.nameLabel")} <span className="text-felines-emergency">*</span>
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
          {t("newColony.narrativeLabel")}
        </label>
        <textarea
          id="new-colony-narrative"
          value={narrative}
          onChange={(formEvent) => setNarrative(formEvent.target.value)}
          rows={4}
          maxLength={1000}
          placeholder={t("newColony.narrativePlaceholder")}
          className="mt-1 w-full rounded-md border border-felines-border bg-white px-3 py-2 text-sm"
        />
      </div>

      {/* Castration status */}
      <div>
        <label
          htmlFor="new-colony-castration"
          className="block text-sm font-medium text-felines-text-primary"
        >
          {t("newColony.castrationLabel")}
        </label>
        <select
          id="new-colony-castration"
          value={castrationStatus}
          onChange={(formEvent) =>
            setCastrationStatus(formEvent.target.value as "none" | "partial" | "full")
          }
          className="mt-1 w-full rounded-md border border-felines-border bg-white px-3 py-2 text-sm"
        >
          <option value="none">{t("newColony.castrationNone")}</option>
          <option value="partial">{t("newColony.castrationPartial")}</option>
          <option value="full">{t("newColony.castrationFull")}</option>
        </select>
      </div>

      {/* Photo upload */}
      <div>
        <label className="block text-sm font-medium text-felines-text-primary">
          {t("newColony.photoLabel")} <span className="text-felines-emergency">*</span>
        </label>
        <div className="mt-1">
          <PhotoUploadButton label="Escolher foto" file={photoFile} onChange={setPhotoFile} />
        </div>
      </div>

      {/* Map marker placement */}
      <div>
        <label className="block text-sm font-medium text-felines-text-primary">
          {t("newColony.locationLabel")} <span className="text-felines-emergency">*</span>
        </label>
        <p className="mt-1 text-xs text-felines-text-secondary">
          {t("newColony.locationHint")}
        </p>
        <div className="mt-2 h-64 w-full overflow-hidden rounded-xl border border-felines-border">
          <MapMarkerPickerShell
            position={position}
            onPick={async (lat, lng) => {
              setPosition([lat, lng]);
              setCityLoading(true);
              const detected = await reverseGeocodeCity(lat, lng, language);
              setCity(detected ?? "");
              setCityLoading(false);
            }}
          />
        </div>
      </div>

      {position && (
        <div>
          <label className="block text-sm font-medium text-felines-text-primary">
            {t("newColony.cityLabel")}
          </label>
          <p className="mt-1 text-xs text-felines-text-secondary">
            {t("newColony.cityHint")}
          </p>
          <input
            type="text"
            value={cityLoading ? t("newColony.cityLoading") : city}
            onChange={(e) => setCity(e.target.value)}
            disabled={cityLoading}
            placeholder="Ex: Natal"
            className="mt-2 w-full rounded-xl border border-felines-border bg-felines-background px-4 py-2 text-sm text-felines-text-primary placeholder:text-felines-text-secondary focus:outline-none focus:ring-2 focus:ring-felines-accent disabled:opacity-60"
          />
        </div>
      )}

      {error && <p role="alert" className="text-sm text-felines-emergency">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        aria-busy={submitting}
        className="w-full rounded-full bg-felines-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-felines-accent-hover disabled:opacity-50"
      >
        {submitting ? t("newColony.submitting") : t("newColony.submit")}
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
                {t("newColony.sightingModalTitle")}
              </h2>
              <button
                type="button"
                onClick={() => setShowSightingForm(false)}
                aria-label={t("common.close")}
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
  yesLabel,
  noLabel,
}: {
  question: string;
  value: boolean | null;
  onChange: (value: boolean) => void;
  yesLabel: string;
  noLabel: string;
}) {
  return (
    <div>
      <p className="text-sm text-felines-text-secondary">{question}</p>
      <div role="group" aria-label={question} className="mt-1 flex gap-2">
        <button
          type="button"
          onClick={() => onChange(true)}
          aria-pressed={value === true}
          className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
            value === true
              ? "border-felines-success bg-felines-success text-white"
              : "border-felines-border text-felines-text-secondary"
          }`}
        >
          {yesLabel}
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          aria-pressed={value === false}
          className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
            value === false
              ? "border-felines-emergency bg-felines-emergency text-white"
              : "border-felines-border text-felines-text-secondary"
          }`}
        >
          {noLabel}
        </button>
      </div>
    </div>
  );
}
