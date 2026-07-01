// Client component for the cat notes section on /cat/:id.
// Public read, authenticated write. Health status is optional — a
// user can leave a plain observation without a health rating.
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useEscapeToClose } from "@/lib/useEscapeToClose";

type Note = {
  id: string;
  body: string;
  health_status: string | null;
  created_at: string;
};

const HEALTH_OPTIONS = [
  { value: "good", label: "🟢 Bem", color: "text-felines-success border-felines-success/30 bg-felines-success/10" },
  { value: "concerning", label: "🟠 Atenção", color: "text-amber-600 border-amber-300/40 bg-amber-50" },
  { value: "serious", label: "🔴 Grave", color: "text-felines-emergency border-felines-emergency/30 bg-felines-emergency/10" },
];

function HealthBadge({ status }: { status: string | null }) {
  if (!status) return null;
  const opt = HEALTH_OPTIONS.find((o) => o.value === status);
  if (!opt) return null;
  return (
    <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${opt.color}`}>
      {opt.label}
    </span>
  );
}

export default function CatNotesSection({
  catId,
  initialNotes,
}: {
  catId: string;
  initialNotes: Note[];
}) {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [body, setBody] = useState("");
  const [healthStatus, setHealthStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  useEscapeToClose(formOpen, () => setFormOpen(false));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!body.trim()) {
      setError("Escreva uma observação antes de enviar.");
      return;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      setError("Você precisa estar logado para deixar uma anotação.");
      return;
    }

    setSubmitting(true);
    const { data: newNote, error: insertError } = await supabase
      .from("cat_notes")
      .insert({
        cat_id: catId,
        created_by: sessionData.session.user.id,
        body: body.trim(),
        health_status: healthStatus,
      })
      .select("id, body, health_status, created_at")
      .single();

    setSubmitting(false);

    if (insertError || !newNote) {
      setError("Não foi possível salvar a anotação. Tenta de novo?");
      return;
    }

    setNotes((prev) => [newNote as Note, ...prev]);
    setBody("");
    setHealthStatus(null);
    setFormOpen(false);
  }

  return (
    <section className="mt-10">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-felines-text-primary">
          Anotações da comunidade
        </h2>
        {!formOpen && (
          <button
            onClick={() => setFormOpen(true)}
            className="rounded-full border border-felines-border px-4 py-1.5 text-sm text-felines-text-secondary transition-colors hover:border-felines-accent hover:text-felines-accent"
          >
            + Adicionar observação
          </button>
        )}
      </div>

      {formOpen && (
        <form
          onSubmit={handleSubmit}
          className="mt-4 space-y-3 rounded-xl border border-felines-accent/30 bg-felines-surface p-5"
        >
          <div>
            <label className="block text-xs font-medium text-felines-text-secondary">
              Observação
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="Ex: Estava mancando da pata dianteira direita. Vi às 14h perto do portão."
              className="mt-1 w-full rounded-lg border border-felines-border bg-white px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-felines-text-secondary">
              Estado de saúde aparente (opcional)
            </label>
            <div className="mt-1 flex flex-wrap gap-2">
              {HEALTH_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setHealthStatus(healthStatus === opt.value ? null : opt.value)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    healthStatus === opt.value
                      ? opt.color
                      : "border-felines-border text-felines-text-secondary"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {error && <p role="alert" className="text-sm text-felines-emergency">{error}</p>}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              aria-busy={submitting}
              className="rounded-full bg-felines-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {submitting ? "Salvando…" : "Salvar observação"}
            </button>
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="text-sm text-felines-text-secondary hover:text-felines-text-primary"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {notes.length === 0 ? (
        <p className="mt-4 text-sm text-felines-text-secondary">
          Nenhuma anotação ainda. Se você viu esse gato, conta como ele estava.
        </p>
      ) : (
        <ol className="mt-5 space-y-3">
          {notes.map((note) => (
            <li
              key={note.id}
              className="rounded-xl border border-felines-border bg-felines-surface px-4 py-3"
            >
              <div className="flex items-center justify-between gap-2">
                {note.health_status && <HealthBadge status={note.health_status} />}
                <span className="ml-auto text-xs text-felines-text-secondary">
                  {new Date(note.created_at).toLocaleDateString("pt-BR")}
                </span>
              </div>
              <p className="mt-1 text-sm text-felines-text-primary">{note.body}</p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
