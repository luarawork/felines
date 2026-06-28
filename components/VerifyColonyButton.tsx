// "I've seen cats here ✓" — lets a non-caretaker confirm a colony is
// real. Shows the running count and, once verified, the date. Caretakers
// and the colony's creator never see this (they're assumed to have
// already seen the cats — also enforced server-side, see migration
// 0054's insert policy).
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useColonyAccessContext } from "@/components/ColonyAccessProvider";

export default function VerifyColonyButton({
  colonyId,
  verifiedStatus,
  verifiedAt,
}: {
  colonyId: string;
  verifiedStatus: "unverified" | "community_verified";
  verifiedAt: string | null;
}) {
  const { session, canManage, checkingAccess } = useColonyAccessContext();
  const [count, setCount] = useState(0);
  const [hasVerified, setHasVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      const { count: totalCount } = await supabase
        .from("colony_verifications")
        .select("id", { count: "exact", head: true })
        .eq("colony_id", colonyId);
      setCount(totalCount ?? 0);

      if (session) {
        const { count: ownCount } = await supabase
          .from("colony_verifications")
          .select("id", { count: "exact", head: true })
          .eq("colony_id", colonyId)
          .eq("user_id", session.user.id);
        setHasVerified((ownCount ?? 0) > 0);
      }

      setLoading(false);
    }

    load();
  }, [colonyId, session]);

  async function handleVerify() {
    if (!session || submitting) return;
    setSubmitting(true);
    const { error } = await supabase
      .from("colony_verifications")
      .insert({ colony_id: colonyId, user_id: session.user.id });
    setSubmitting(false);

    if (!error) {
      setHasVerified(true);
      setCount((previous) => previous + 1);
    }
  }

  if (verifiedStatus === "community_verified") {
    return (
      <p className="text-xs font-medium text-felines-success">
        ✓ Verificada pela comunidade
        {verifiedAt && ` em ${new Date(verifiedAt).toLocaleDateString("pt-BR")}`}
      </p>
    );
  }

  if (checkingAccess || loading || canManage) return null;

  if (!session) {
    return (
      <p className="text-xs text-felines-text-secondary">
        ⏳ Aguardando verificação da comunidade ({count}/3 confirmações)
      </p>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleVerify}
        disabled={hasVerified || submitting}
        className="text-xs font-medium text-felines-accent-hover hover:underline disabled:no-underline disabled:opacity-60"
      >
        {hasVerified ? "Você já confirmou ✓" : "Eu já vi gatos aqui ✓"}
      </button>
      <span className="text-xs text-felines-text-secondary">({count}/3 confirmações)</span>
    </div>
  );
}
