// Banner shown at the top of a colony page when it has an active help
// request. "Posso ajudar" notifies the colony's caretakers (everyone
// but the responder, via respond_to_help_request — see migration 0050);
// "Ajuda recebida" and "Renovar" are caretaker-only actions on their own
// colony's request.
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useColonyAccessContext } from "@/components/ColonyAccessProvider";
import { getHelpRequestTypeIcon, getHelpRequestTypeLabel } from "@/lib/helpRequestTypes";

export type ActiveHelpRequest = {
  id: string;
  type: string;
  description: string;
  urgency: "normal" | "urgent";
};

export default function HelpRequestBanner({ request }: { request: ActiveHelpRequest }) {
  const router = useRouter();
  const { session, canManage } = useColonyAccessContext();
  const [responding, setResponding] = useState(false);
  const [responded, setResponded] = useState(false);
  const [resolving, setResolving] = useState(false);

  async function handleRespond() {
    if (!session) return;
    setResponding(true);
    const { error } = await supabase.rpc("respond_to_help_request", { p_help_request_id: request.id });
    setResponding(false);
    if (!error) setResponded(true);
  }

  async function handleResolve() {
    setResolving(true);
    await supabase
      .from("help_requests")
      .update({ status: "resolved", resolved_at: new Date().toISOString() })
      .eq("id", request.id);
    setResolving(false);
    router.refresh();
  }

  async function handleRenew() {
    await supabase
      .from("help_requests")
      .update({ expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() })
      .eq("id", request.id);
    router.refresh();
  }

  const isUrgent = request.urgency === "urgent";

  return (
    <div
      className={`mb-6 rounded-xl border px-4 py-3 text-sm ${
        isUrgent
          ? "border-felines-emergency bg-felines-emergency/10 text-felines-text-primary"
          : "border-felines-warning bg-felines-warning/10 text-felines-text-primary"
      }`}
    >
      <p className="font-medium">
        {getHelpRequestTypeIcon(request.type)} Essa colônia precisa de ajuda:{" "}
        {getHelpRequestTypeLabel(request.type)} — {request.description}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        {session && !canManage && (
          <button
            onClick={handleRespond}
            disabled={responding || responded}
            className="rounded-full bg-felines-accent px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-felines-accent-hover disabled:opacity-50"
          >
            {responded ? "Cuidador avisado ✓" : responding ? "Enviando..." : "Eu posso ajudar"}
          </button>
        )}
        {canManage && (
          <>
            <button
              onClick={handleResolve}
              disabled={resolving}
              className="rounded-full bg-felines-success px-3 py-1.5 text-xs font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50"
            >
              Ajuda recebida ✓
            </button>
            <button
              onClick={handleRenew}
              className="rounded-full border border-felines-border px-3 py-1.5 text-xs font-medium text-felines-text-secondary hover:border-felines-accent"
            >
              Renovar por mais 7 dias
            </button>
          </>
        )}
      </div>
    </div>
  );
}
