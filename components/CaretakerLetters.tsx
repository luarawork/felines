// Shows letters that caretakers have left for the next caretaker of a
// colony, and lets the signed-in user write/edit their own letter if
// they are a linked caretaker. Letters are visible to anyone, since
// they're meant to help future caretakers understand the colony's
// history, not as a private message between two people.
"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

type CaretakerLetter = {
  id: string;
  letter: string | null;
  created_at: string;
};

export default function CaretakerLetters({ colonyId }: { colonyId: string }) {
  const [session, setSession] = useState<Session | null>(null);
  const [letters, setLetters] = useState<CaretakerLetter[]>([]);
  const [ownCaretakerId, setOwnCaretakerId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function loadLetters() {
      const { data: sessionData } = await supabase.auth.getSession();
      const currentSession = sessionData.session;
      setSession(currentSession);

      const { data: caretakerRows } = await supabase
        .from("caretakers")
        .select("id, user_id, letter, created_at")
        .eq("colony_id", colonyId)
        .order("created_at", { ascending: false });

      if (caretakerRows) {
        setLetters(
          caretakerRows
            .filter((row) => row.letter && row.letter.trim().length > 0)
            .map((row) => ({ id: row.id, letter: row.letter, created_at: row.created_at }))
        );

        if (currentSession) {
          const ownRow = caretakerRows.find((row) => row.user_id === currentSession.user.id);
          if (ownRow) {
            setOwnCaretakerId(ownRow.id);
            setDraft(ownRow.letter ?? "");
          }
        }
      }

      setLoading(false);
    }

    loadLetters();
  }, [colonyId]);

  async function handleSave() {
    if (!ownCaretakerId) return;
    setSaving(true);
    setError(null);

    const { error: updateError } = await supabase
      .from("caretakers")
      .update({ letter: draft.trim() || null })
      .eq("id", ownCaretakerId);

    setSaving(false);

    if (updateError) {
      setError("A carta não foi salva. Tenta de novo?");
      return;
    }

    setSaved(true);
    setLetters((previous) => {
      const withoutOwn = previous.filter((letter) => letter.id !== ownCaretakerId);
      return draft.trim()
        ? [{ id: ownCaretakerId, letter: draft.trim(), created_at: new Date().toISOString() }, ...withoutOwn]
        : withoutOwn;
    });
  }

  if (loading) return null;

  return (
    <div>
      <p className="text-sm text-felines-text-secondary">
        Histórico, hábitos dos gatos e dicas de quem já passou por aqui antes.
      </p>

      {ownCaretakerId && (
        <div className="mt-4 rounded-xl border border-felines-border bg-felines-surface p-4">
          <label className="block text-sm font-medium text-felines-text-primary">
            Deixe sua marca pro próximo cuidador
          </label>
          <textarea
            value={draft}
            onChange={(formEvent) => {
              setDraft(formEvent.target.value);
              setSaved(false);
            }}
            rows={4}
            maxLength={2000}
            placeholder="O que você gostaria que a próxima pessoa soubesse sobre essa colônia?"
            className="mt-2 w-full rounded-md border border-felines-border bg-white px-3 py-2 text-sm"
          />
          {error && <p className="mt-2 text-sm text-felines-emergency">{error}</p>}
          <button
            onClick={handleSave}
            disabled={saving}
            className="mt-2 rounded-full bg-felines-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-felines-accent-hover disabled:opacity-50"
          >
            {saving ? "Salvando..." : saved ? "Salvo" : "Salvar carta"}
          </button>
        </div>
      )}

      {!session && letters.length === 0 && (
        <p className="mt-4 text-sm text-felines-text-secondary">
          Ninguém deixou uma carta por aqui ainda.
        </p>
      )}

      {letters.filter((letter) => letter.id !== ownCaretakerId).length > 0 && (
        <ul className="mt-4 space-y-3">
          {letters
            .filter((letter) => letter.id !== ownCaretakerId)
            .map((letter) => (
              <li
                key={letter.id}
                className="rounded-xl border border-felines-border bg-felines-surface p-4"
              >
                <p className="text-sm leading-relaxed text-felines-text-secondary whitespace-pre-wrap">
                  {letter.letter}
                </p>
                <p className="mt-2 text-xs text-felines-text-secondary">
                  {new Date(letter.created_at).toLocaleDateString("pt-BR")}
                </p>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
