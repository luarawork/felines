// Renders the set of actions available on a colony page based on the
// visitor's access level. Anonymous visitors only see a prompt to log in;
// authenticated users can log a feeding or become a caretaker.
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

export default function ColonyActions({ colonyId }: { colonyId: string }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [feedingLogged, setFeedingLogged] = useState(false);
  const [caretakerJoined, setCaretakerJoined] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Load the current auth session once, on mount, to decide which actions to show.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoadingSession(false);
    });
  }, []);

  // Logs a feeding event for this colony by the signed-in user.
  async function handleLogFeeding() {
    if (!session) return;
    setActionError(null);
    const { error } = await supabase
      .from("feedings")
      .insert({ colony_id: colonyId, user_id: session.user.id });

    if (error) {
      setActionError("Não foi possível registrar a alimentação.");
      return;
    }
    setFeedingLogged(true);
  }

  // Links the signed-in user as a caretaker of this colony.
  async function handleBecomeCaretaker() {
    if (!session) return;
    setActionError(null);
    const { error } = await supabase
      .from("caretakers")
      .insert({ colony_id: colonyId, user_id: session.user.id });

    if (error) {
      setActionError("Não foi possível vincular você como cuidador.");
      return;
    }
    setCaretakerJoined(true);
  }

  if (loadingSession) return null;

  if (!session) {
    return (
      <p className="mt-6 rounded-lg border border-felines-border bg-felines-surface px-4 py-3 text-sm text-felines-text-secondary">
        <Link href="/login" className="font-medium text-felines-accent">
          Entre na sua conta
        </Link>{" "}
        para registrar alimentações ou se tornar cuidador desta colônia.
      </p>
    );
  }

  return (
    <div className="mt-6 flex flex-wrap gap-3">
      <button
        onClick={handleLogFeeding}
        disabled={feedingLogged}
        className="rounded-full bg-felines-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-felines-accent-hover disabled:opacity-50"
      >
        {feedingLogged ? "Alimentação registrada" : "Registrar alimentação"}
      </button>
      <button
        onClick={handleBecomeCaretaker}
        disabled={caretakerJoined}
        className="rounded-full border border-felines-accent px-4 py-2 text-sm font-medium text-felines-accent transition-colors hover:bg-felines-accent hover:text-white disabled:opacity-50"
      >
        {caretakerJoined ? "Você é cuidador" : "Tornar-se cuidador"}
      </button>
      {actionError && <p className="text-xs text-felines-emergency">{actionError}</p>}
    </div>
  );
}
