// "I've seen cats here ✓" — lets a non-caretaker confirm a colony is
// real. Shows the running count and, once verified, the date. Caretakers
// and the colony's creator never see this (they're assumed to have
// already seen the cats — also enforced server-side, see migration
// 0054's insert policy).
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useColonyAccessContext } from "@/components/colony/ColonyAccessProvider";
import { useLanguage } from "@/lib/i18n";

export default function VerifyColonyButton({
  colonyId,
  verifiedStatus,
  verifiedAt,
}: {
  colonyId: string;
  verifiedStatus: "unverified" | "community_verified";
  verifiedAt: string | null;
}) {
  const { t, language } = useLanguage();
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
    const dateLocale = language === "en" ? "en-US" : "pt-BR";
    return (
      <p className="text-xs font-medium text-felines-success-hover">
        {t("verifyColony.communityVerified")}
        {verifiedAt &&
          ` ${t("verifyColony.verifiedOn").replace(
            "{date}",
            new Date(verifiedAt).toLocaleDateString(dateLocale)
          )}`}
      </p>
    );
  }

  if (checkingAccess || loading || canManage) return null;

  if (!session) {
    return (
      <p className="text-xs text-felines-text-secondary">
        ⏳ {t("verifyColony.awaitingVerification")} {t("verifyColony.confirmationsCount").replace("{count}", String(count))}
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
        {hasVerified ? t("verifyColony.alreadyConfirmed") : t("verifyColony.iSawCatsHere")}
      </button>
      <span className="text-xs text-felines-text-secondary">
        {t("verifyColony.confirmationsCount").replace("{count}", String(count))}
      </span>
    </div>
  );
}
