// Report button shown on colony and map pages.
// Lets anyone (no login required) open a small inline form and submit a
// report tied to a colony. Reports are insert-only for the public; reading
// full report status requires authentication (enforced by RLS).
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { REPORT_TYPES } from "@/lib/reportTypes";
import AnonymousReportNotice from "@/components/AnonymousReportNotice";

export default function ReportButton({ colonyId }: { colonyId: string }) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState(REPORT_TYPES[0].value);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setIsLoggedIn(!!data.session));
  }, []);

  // Validates and submits the report to Supabase.
  async function handleSubmit(formEvent: React.FormEvent) {
    formEvent.preventDefault();
    setError(null);

    if (!type) {
      setError("Selecione o tipo de relato.");
      return;
    }

    setSubmitting(true);
    const { error: insertError } = await supabase.from("reports").insert({
      colony_id: colonyId,
      type,
      description: description.trim() || null,
      status: "open",
    });
    setSubmitting(false);

    if (insertError) {
      setError("Não foi possível enviar o relato. Tente novamente.");
      return;
    }

    setSubmitted(true);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-full border border-felines-emergency px-4 py-2 text-sm font-medium text-felines-emergency transition-colors hover:bg-felines-emergency hover:text-white"
      >
        Fazer um relato
      </button>
    );
  }

  if (submitted) {
    return (
      <p className="rounded-lg border border-felines-success bg-felines-success/10 px-4 py-3 text-sm text-felines-success">
        Relato enviado. Obrigado por ajudar a colônia.
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm rounded-xl border border-felines-border bg-felines-surface p-4"
    >
      {!isLoggedIn && <AnonymousReportNotice />}

      <label className="block text-xs font-medium text-felines-text-secondary">
        Tipo de relato
      </label>
      <select
        value={type}
        onChange={(formEvent) => setType(formEvent.target.value)}
        className="mt-1 w-full rounded-md border border-felines-border bg-white px-3 py-2 text-sm"
      >
        {REPORT_TYPES.map((reportType) => (
          <option key={reportType.value} value={reportType.value}>
            {reportType.label}
          </option>
        ))}
      </select>

      <label className="mt-3 block text-xs font-medium text-felines-text-secondary">
        Descrição (opcional)
      </label>
      <textarea
        value={description}
        onChange={(formEvent) => setDescription(formEvent.target.value)}
        maxLength={500}
        rows={3}
        className="mt-1 w-full rounded-md border border-felines-border bg-white px-3 py-2 text-sm"
      />

      {error && <p className="mt-2 text-xs text-felines-emergency">{error}</p>}

      <div className="mt-3 flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-felines-emergency px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {submitting ? "Enviando..." : "Enviar relato"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-full px-4 py-2 text-sm font-medium text-felines-text-secondary"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
