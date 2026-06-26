// Small "Flag" link that opens a simple reason form and records a flag
// for later moderation review. No automated action happens — this just
// creates a row in the `flags` table. Anyone can flag, same as anyone
// can submit a report, since waiting for an account would defeat the
// point of flagging something harmful quickly.
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export const FLAG_REASONS: { value: string; label: string }[] = [
  { value: "fake_location", label: "Localização falsa" },
  { value: "harmful_content", label: "Conteúdo nocivo" },
  { value: "spam", label: "Spam" },
  { value: "other", label: "Outro" },
];

export function getFlagReasonLabel(value: string): string {
  return FLAG_REASONS.find((reason) => reason.value === value)?.label ?? value;
}

export default function FlagButton({
  targetType,
  targetId,
}: {
  targetType: "colony" | "report";
  targetId: string;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(FLAG_REASONS[0].value);
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(formEvent: React.FormEvent) {
    formEvent.preventDefault();
    setSubmitting(true);

    const { data: sessionData } = await supabase.auth.getSession();

    await supabase.from("flags").insert({
      target_type: targetType,
      target_id: targetId,
      reason,
      details: details.trim() || null,
      created_by: sessionData.session?.user.id ?? null,
    });

    setSubmitting(false);
    setSubmitted(true);
  }

  if (submitted) {
    return <p className="text-xs text-felines-text-secondary">Sinalização enviada.</p>;
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-felines-text-secondary underline hover:text-felines-emergency"
      >
        Sinalizar
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-2 max-w-xs rounded-md border border-felines-border bg-felines-surface p-3"
    >
      <label htmlFor="flag-reason" className="text-xs font-medium text-felines-text-primary">
        Por que você está sinalizando isso?
      </label>
      <select
        id="flag-reason"
        value={reason}
        onChange={(formEvent) => setReason(formEvent.target.value)}
        className="mt-1 w-full rounded-md border border-felines-border bg-white px-2 py-1 text-xs"
      >
        {FLAG_REASONS.map((flagReason) => (
          <option key={flagReason.value} value={flagReason.value}>
            {flagReason.label}
          </option>
        ))}
      </select>
      <textarea
        aria-label="Detalhes adicionais da denúncia"
        value={details}
        onChange={(formEvent) => setDetails(formEvent.target.value)}
        placeholder="Detalhes (opcional)"
        maxLength={300}
        rows={2}
        className="mt-2 w-full rounded-md border border-felines-border bg-white px-2 py-1 text-xs"
      />
      <div className="mt-2 flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-felines-emergency px-3 py-1 text-xs font-medium text-white disabled:opacity-50"
        >
          {submitting ? "Enviando..." : "Enviar"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs text-felines-text-secondary"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
