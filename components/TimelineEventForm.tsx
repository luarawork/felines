// Lets a colony's creator or a linked caretaker add an entry to the
// collective timeline (e.g. a castration round, a health issue, a new
// cat joining). Hidden for everyone else, since timeline_events can only
// be inserted by an authenticated user per RLS.
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

// Common timeline event types. The column has no check constraint, so
// these are just suggestions to keep entries consistent.
const EVENT_TYPES = [
  { value: "castration_round", label: "Rodada de castração" },
  { value: "health_issue", label: "Problema de saúde" },
  { value: "new_cat", label: "Novo gato na colônia" },
  { value: "feeding_change", label: "Mudança na alimentação" },
  { value: "relocation", label: "Mudança de local" },
  { value: "other", label: "Outro" },
];

export default function TimelineEventForm({ colonyId }: { colonyId: string }) {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [canManage, setCanManage] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);

  const [eventType, setEventType] = useState(EVENT_TYPES[0].value);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Same creator/caretaker check used by CatManager, kept local since
  // each component needs it independently for its own access gate.
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

    if (!session) return;

    setSubmitting(true);
    const { error: insertError } = await supabase.from("timeline_events").insert({
      colony_id: colonyId,
      event_type: eventType,
      description: description.trim() || null,
      created_by: session.user.id,
    });
    setSubmitting(false);

    if (insertError) {
      setError("Não foi possível adicionar o evento.");
      return;
    }

    setDescription("");
    setSubmitted(true);
    router.refresh();
  }

  if (checkingAccess || !canManage) return null;

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 rounded-xl border border-felines-border bg-felines-surface p-4"
    >
      <p className="text-sm font-semibold text-felines-text-primary">
        Adicionar evento à linha do tempo
      </p>

      <div className="mt-3 flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs font-medium text-felines-text-secondary">Tipo</label>
          <select
            value={eventType}
            onChange={(formEvent) => {
              setEventType(formEvent.target.value);
              setSubmitted(false);
            }}
            className="mt-1 rounded-md border border-felines-border bg-white px-3 py-2 text-sm"
          >
            {EVENT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-xs font-medium text-felines-text-secondary">
            Descrição (opcional)
          </label>
          <input
            type="text"
            value={description}
            onChange={(formEvent) => {
              setDescription(formEvent.target.value);
              setSubmitted(false);
            }}
            maxLength={300}
            className="mt-1 w-full rounded-md border border-felines-border bg-white px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-felines-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-felines-accent-hover disabled:opacity-50"
        >
          {submitting ? "Adicionando..." : "Adicionar"}
        </button>
      </div>

      {error && <p className="mt-2 text-sm text-felines-emergency">{error}</p>}
      {submitted && <p className="mt-2 text-sm text-felines-success">Evento adicionado.</p>}
    </form>
  );
}
