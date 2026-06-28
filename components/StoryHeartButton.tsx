// Heart reaction on a story card — anyone can react, no account
// required (same "anonymous-friendly" pattern as reports/flags). A
// signed-in user is deduplicated server-side (unique index on
// (story_id, user_id) where user_id is not null); an anonymous visitor
// has no stable identity to deduplicate against, so this only guards
// against obvious repeat clicks via localStorage — a UI nicety, not a
// security boundary.
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const STORAGE_KEY = "felines_hearted_stories";

function getHeartedStoryIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export default function StoryHeartButton({
  storyId,
  initialCount,
}: {
  storyId: string;
  initialCount: number;
}) {
  const [count, setCount] = useState(initialCount);
  const [hearted, setHearted] = useState(() => getHeartedStoryIds().includes(storyId));
  const [sending, setSending] = useState(false);

  async function handleHeart() {
    if (hearted || sending) return;
    setSending(true);

    const { data: sessionData } = await supabase.auth.getSession();
    const { error } = await supabase.from("story_reactions").insert({
      story_id: storyId,
      user_id: sessionData.session?.user.id ?? null,
    });

    setSending(false);
    if (error) return;

    setCount((previous) => previous + 1);
    setHearted(true);
    const heartedIds = getHeartedStoryIds();
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...heartedIds, storyId]));
  }

  return (
    <button
      onClick={handleHeart}
      disabled={hearted || sending}
      aria-label={hearted ? "Você já reagiu a essa história" : "Reagir a essa história"}
      className={`inline-flex items-center gap-1 text-xs transition-colors ${
        hearted ? "text-felines-emergency" : "text-felines-text-secondary hover:text-felines-emergency"
      }`}
    >
      <span aria-hidden="true">{hearted ? "❤️" : "🤍"}</span>
      {count > 0 && <span>{count}</span>}
    </button>
  );
}
