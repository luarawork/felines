// Shows letters that caretakers have left for the next caretaker of a
// colony, and lets the signed-in user write/edit their own letter if
// they are a linked caretaker. Letters are visible to anyone, since
// they're meant to help future caretakers understand the colony's
// history, not as a private message between two people.
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import { useLanguage } from "@/lib/i18n";

type CaretakerLetter = {
  id: string;
  userId: string;
  letter: string | null;
  created_at: string;
};

type LetterHistoryEntry = {
  id: string;
  description: string | null;
  created_at: string;
  userId: string;
};

export default function CaretakerLetters({ colonyId }: { colonyId: string }) {
  const { t } = useLanguage();
  const [session, setSession] = useState<Session | null>(null);
  const [letters, setLetters] = useState<CaretakerLetter[]>([]);
  const [history, setHistory] = useState<LetterHistoryEntry[]>([]);
  const [authorNames, setAuthorNames] = useState<Record<string, string>>({});
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

      const [{ data: caretakerRows }, { data: historyRows }] = await Promise.all([
        supabase
          .from("caretakers")
          .select("id, user_id, letter, created_at")
          .eq("colony_id", colonyId)
          .order("created_at", { ascending: false }),
        supabase
          .from("timeline_events")
          .select("id, description, created_at, created_by")
          .eq("colony_id", colonyId)
          .eq("event_type", "caretaker_letter_updated")
          .order("created_at", { ascending: false }),
      ]);

      if (caretakerRows) {
        setLetters(
          caretakerRows
            .filter((row) => row.letter && row.letter.trim().length > 0)
            .map((row) => ({
              id: row.id,
              userId: row.user_id,
              letter: row.letter,
              created_at: row.created_at,
            }))
        );

        if (currentSession) {
          const ownRow = caretakerRows.find((row) => row.user_id === currentSession.user.id);
          if (ownRow) {
            setOwnCaretakerId(ownRow.id);
            setDraft(ownRow.letter ?? "");
          }
        }
      }

      const historyWithAuthor = (historyRows ?? [])
        .filter((row) => row.created_by)
        .map((row) => ({
          id: row.id,
          description: row.description,
          created_at: row.created_at,
          userId: row.created_by as string,
        }));
      setHistory(historyWithAuthor);

      // Names for both the current letters and the history entries —
      // one batched lookup instead of one query per author.
      const authorIds = new Set<string>([
        ...(caretakerRows ?? []).map((row) => row.user_id),
        ...historyWithAuthor.map((row) => row.userId),
      ]);
      if (authorIds.size > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, display_name")
          .in("id", Array.from(authorIds));
        const names: Record<string, string> = {};
        (profiles ?? []).forEach((profile) => {
          names[profile.id] = profile.display_name || t("colony.caretakerLetter.community");
        });
        setAuthorNames(names);
      }

      setLoading(false);
    }

    loadLetters();
  }, [colonyId, t]);

  async function handleSave() {
    if (!ownCaretakerId || !session) return;
    setSaving(true);
    setError(null);

    const { error: updateError } = await supabase
      .from("caretakers")
      .update({ letter: draft.trim() || null })
      .eq("id", ownCaretakerId);

    if (updateError) {
      setSaving(false);
      setError(t("colony.caretakerLetter.saveError"));
      return;
    }

    // Every save leaves a permanent trace in the timeline, instead of
    // silently overwriting the previous version — that history is the
    // whole point of a "carta de quem cuidou antes".
    const { data: historyRow } = await supabase
      .from("timeline_events")
      .insert({
        colony_id: colonyId,
        event_type: "caretaker_letter_updated",
        description: draft.trim() || t("colony.caretakerLetter.letterRemoved"),
        created_by: session.user.id,
      })
      .select("id, description, created_at, created_by")
      .single();

    setSaving(false);
    setSaved(true);

    if (historyRow) {
      setHistory((previous) => [
        {
          id: historyRow.id,
          description: historyRow.description,
          created_at: historyRow.created_at,
          userId: historyRow.created_by,
        },
        ...previous,
      ]);
    }

    setLetters((previous) => {
      const withoutOwn = previous.filter((letter) => letter.id !== ownCaretakerId);
      return draft.trim()
        ? [
            {
              id: ownCaretakerId,
              userId: session.user.id,
              letter: draft.trim(),
              created_at: new Date().toISOString(),
            },
            ...withoutOwn,
          ]
        : withoutOwn;
    });
  }

  if (loading) return null;

  return (
    <div>
      <p className="text-sm text-felines-text-secondary">
        {t("colony.caretakerLetter.intro")}
      </p>

      {ownCaretakerId && (
        <div className="mt-4 rounded-xl border border-felines-border bg-felines-surface p-4">
          <label className="block text-sm font-medium text-felines-text-primary">
            {t("colony.caretakerLetter.yourLetterLabel")}
          </label>
          <textarea
            value={draft}
            onChange={(formEvent) => {
              setDraft(formEvent.target.value);
              setSaved(false);
            }}
            rows={4}
            maxLength={2000}
            placeholder={t("colony.caretakerLetter.letterPlaceholder")}
            className="mt-2 w-full rounded-md border border-felines-border bg-white px-3 py-2 text-sm"
          />
          {error && <p role="alert" className="mt-2 text-sm text-felines-emergency">{error}</p>}
          <button
            onClick={handleSave}
            disabled={saving}
            className="mt-2 rounded-full bg-felines-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-felines-accent-hover disabled:opacity-50"
          >
            {saving ? t("colony.caretakerLetter.saving") : saved ? t("colony.caretakerLetter.saved") : t("colony.caretakerLetter.save")}
          </button>
        </div>
      )}

      {letters.length === 0 && history.length === 0 && (
        <p className="mt-4 text-sm text-felines-text-secondary">
          {t("colony.caretakerLetter.noLetters")}
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
                  <Link href={`/u/${letter.userId}`} className="text-felines-accent-hover">
                    {authorNames[letter.userId] ?? t("colony.caretakerLetter.community")}
                  </Link>{" "}
                  · {new Date(letter.created_at).toLocaleDateString("pt-BR")}
                </p>
              </li>
            ))}
        </ul>
      )}

      {history.length > 0 && (
        <div className="mt-8">
          <p className="text-sm font-medium text-felines-text-primary">{t("colony.caretakerLetter.historyTitle")}</p>
          <ul className="mt-3 space-y-3">
            {history.map((entry) => (
              <li
                key={entry.id}
                className="rounded-xl border border-felines-border px-4 py-3 text-sm"
              >
                <p className="leading-relaxed text-felines-text-secondary whitespace-pre-wrap">
                  {entry.description}
                </p>
                <p className="mt-2 text-xs text-felines-text-secondary">
                  <Link href={`/u/${entry.userId}`} className="text-felines-accent-hover">
                    {authorNames[entry.userId] ?? t("colony.caretakerLetter.community")}
                  </Link>{" "}
                  · {new Date(entry.created_at).toLocaleDateString("pt-BR")}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
