// Lets an authenticated visitor send a one-time "thank you" to a
// specific caretaker of a colony. Recorded in the `thanks` table (one
// per sender/caretaker/colony, enforced by a unique constraint) and
// mirrored into the colony's timeline so it shows up alongside other
// contributions. No notification system — the timeline entry is it.
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getDisplayName } from "@/lib/profile";
import { useLanguage } from "@/lib/i18n";

export default function ThankYouButton({
  colonyId,
  caretakerUserId,
  caretakerDisplayName,
}: {
  colonyId: string;
  caretakerUserId: string;
  caretakerDisplayName: string;
}) {
  const { t } = useLanguage();
  const [userId, setUserId] = useState<string | null>(null);
  const [alreadyThanked, setAlreadyThanked] = useState(false);
  const [sending, setSending] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function loadState() {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;

      if (!session) {
        setChecking(false);
        return;
      }

      setUserId(session.user.id);

      const { data: existingThanks } = await supabase
        .from("thanks")
        .select("id")
        .eq("colony_id", colonyId)
        .eq("caretaker_user_id", caretakerUserId)
        .eq("sender_user_id", session.user.id)
        .maybeSingle();

      setAlreadyThanked(!!existingThanks);
      setChecking(false);
    }

    loadState();
  }, [colonyId, caretakerUserId]);

  async function handleThank() {
    if (!userId || userId === caretakerUserId) return;
    setSending(true);

    const { error: insertError } = await supabase
      .from("thanks")
      .insert({ colony_id: colonyId, caretaker_user_id: caretakerUserId, sender_user_id: userId });

    if (insertError) {
      // Most likely the unique constraint — treat as already thanked.
      setAlreadyThanked(true);
      setSending(false);
      return;
    }

    const senderDisplayName = (await getDisplayName(userId)) || t("thankYou.aNeighbor");

    await supabase.from("timeline_events").insert({
      colony_id: colonyId,
      event_type: "thank_you",
      description: `${senderDisplayName} ${t("thankYou.thanked")} ${caretakerDisplayName} ${t("thankYou.forCaringSuffix")}.`,
      created_by: userId,
    });

    setAlreadyThanked(true);
    setSending(false);
  }

  if (checking || !userId || userId === caretakerUserId) return null;

  return (
    <button
      onClick={handleThank}
      disabled={alreadyThanked || sending}
      className="text-xs font-medium text-felines-accent hover:text-felines-accent-hover disabled:text-felines-text-secondary"
    >
      {alreadyThanked ? t("thankYou.thankedDone") : sending ? t("thankYou.sending") : t("thankYou.thankAction")}
    </button>
  );
}
