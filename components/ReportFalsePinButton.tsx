// "Report this pin" — a minimal flag form shown in the map's colony
// popup, distinct from FlagButton (which is more verbose and used on
// the colony page itself). Reuses the `flags` table with target_type
// "colony" and a reason set specific to "this pin looks wrong", rather
// than a new table. Only shown to signed-in visitors.
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { FALSE_PIN_REASONS } from "@/lib/falsePinReasons";

export default function ReportFalsePinButton({ colonyId }: { colonyId: string }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(FALSE_PIN_REASONS[0].value);
  const [note, setNote] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setIsLoggedIn(!!data.session));
  }, []);

  async function handleSubmit(formEvent: React.FormEvent) {
    formEvent.preventDefault();
    setSubmitting(true);

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id ?? null;

    await supabase.from("flags").insert({
      target_type: "colony",
      target_id: colonyId,
      reason,
      details: note.trim() || null,
      created_by: anonymous ? null : userId,
    });

    setSubmitting(false);
    setSubmitted(true);
  }

  if (!isLoggedIn) return null;

  if (submitted) {
    return <p className="mt-2 text-xs text-felines-text-secondary">Sinalização enviada.</p>;
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-2 block text-xs text-felines-text-secondary underline hover:text-felines-emergency"
      >
        Sinalizar esse pin
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 max-w-[220px] space-y-1.5">
      <select
        aria-label="Motivo da sinalização"
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        className="w-full rounded-md border border-felines-border bg-white px-2 py-1 text-xs"
      >
        {FALSE_PIN_REASONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <textarea
        aria-label="Nota adicional (opcional)"
        value={note}
        onChange={(event) => setNote(event.target.value)}
        placeholder="Nota (opcional)"
        maxLength={100}
        rows={2}
        className="w-full rounded-md border border-felines-border bg-white px-2 py-1 text-xs"
      />
      <label className="flex items-center gap-1.5 text-xs text-felines-text-secondary">
        <input type="checkbox" checked={anonymous} onChange={(event) => setAnonymous(event.target.checked)} />
        Enviar anonimamente
      </label>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-felines-emergency px-2.5 py-1 text-xs font-medium text-white disabled:opacity-50"
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
