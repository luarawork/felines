// Shared "do I manage this colony" state for the whole /colony/:id page.
// Without this, becoming a caretaker (in ColonyActions) had no way to
// tell sibling components (CatManager, EditColonyForm, TimelineEventForm)
// that access just changed — each used to check independently on mount
// only, so a brand-new caretaker had to manually reload the page before
// the edit controls would appear. Now any component can call
// refreshAccess() and every consumer re-checks immediately.
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

type ColonyAccessContextValue = {
  session: Session | null;
  canManage: boolean;
  checkingAccess: boolean;
  refreshAccess: () => void;
};

const ColonyAccessContext = createContext<ColonyAccessContextValue | null>(null);

export function useColonyAccessContext(): ColonyAccessContextValue {
  const context = useContext(ColonyAccessContext);
  if (!context) {
    throw new Error("useColonyAccessContext must be used within ColonyAccessProvider");
  }
  return context;
}

export default function ColonyAccessProvider({
  colonyId,
  children,
}: {
  colonyId: string;
  children: React.ReactNode;
}) {
  const [session, setSession] = useState<Session | null>(null);
  const [canManage, setCanManage] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

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
      } else {
        setCanManage(false);
      }

      setCheckingAccess(false);
    }

    loadAccess();
  }, [colonyId, reloadKey]);

  return (
    <ColonyAccessContext.Provider
      value={{
        session,
        canManage,
        checkingAccess,
        refreshAccess: () => setReloadKey((key) => key + 1),
      }}
    >
      {children}
    </ColonyAccessContext.Provider>
  );
}
