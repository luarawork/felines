// Lets anyone — no account required, same as any other report — say
// "I saw this cat" on a lost-cat report, marking where, with an
// optional note. Creates a new sighting report linked back to the
// original via related_report_id, which is how the owner finds out:
// there's no email/push notification system, so this is surfaced
// in-app on /reports instead (see the "Avistamentos" list there).
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import AddressAutocomplete from "@/components/AddressAutocomplete";

export default function SightingReportButton({ lostCatReportId }: { lostCatReportId: string }) {
  const [open, setOpen] = useState(false);
  const [location, setLocation] = useState("");
  const [locationCoords, setLocationCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(formEvent: React.FormEvent) {
    formEvent.preventDefault();
    setSubmitting(true);

    const { data: sessionData } = await supabase.auth.getSession();

    const { error } = await supabase.from("reports").insert({
      type: "sighting",
      description: note.trim()
        ? `Possível avistamento do gato perdido: ${note.trim()}`
        : "Possível avistamento do gato perdido.",
      related_report_id: lostCatReportId,
      latitude: locationCoords?.lat ?? null,
      longitude: locationCoords?.lon ?? null,
      status: "open",
      created_by: sessionData.session?.user.id ?? null,
    });

    setSubmitting(false);
    if (!error) setSubmitted(true);
  }

  if (submitted) {
    return <p className="text-xs text-felines-success">Obrigado! O dono será avisado.</p>;
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-full border border-felines-accent px-3 py-1 text-xs font-medium text-felines-accent transition-colors hover:bg-felines-accent hover:text-white"
      >
        Avistei esse gato
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-2 max-w-xs rounded-md border border-felines-border bg-white p-3"
    >
      <label className="block text-xs font-medium text-felines-text-secondary">Onde você viu</label>
      <AddressAutocomplete
        value={location}
        onChange={(newValue) => {
          setLocation(newValue);
          setLocationCoords(null);
        }}
        onSelectLocation={(lat, lon) => setLocationCoords({ lat, lon })}
      />
      <label className="mt-2 block text-xs font-medium text-felines-text-secondary">
        Nota (opcional)
      </label>
      <textarea
        value={note}
        onChange={(formEvent) => setNote(formEvent.target.value)}
        rows={2}
        maxLength={300}
        className="mt-1 w-full rounded-md border border-felines-border bg-white px-2 py-1 text-sm"
      />
      <div className="mt-2 flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-felines-accent px-3 py-1 text-xs font-medium text-white disabled:opacity-50"
        >
          {submitting ? "Enviando..." : "Enviar"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-xs text-felines-text-secondary">
          Cancelar
        </button>
      </div>
    </form>
  );
}
