// Shared hook: determines whether the signed-in user created a colony
// or is a linked caretaker of it. Used by every component that gates a
// management action (add/edit cats, timeline entries, colony edits) —
// previously this exact check was copy-pasted in three places.
"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

export function useColonyAccess(colonyId: string) {
  const [session, setSession] = useState<Session | null>(null);
  const [canManage, setCanManage] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);

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

  return { session, canManage, checkingAccess };
}
