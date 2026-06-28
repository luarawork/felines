// Banner on the colony page when there's an open/in-progress neutering
// request. Caretakers can move it forward; marking it "completed" also
// logs a timeline event, since cats_count cats actually getting
// neutered is itself a meaningful colony milestone worth recording.
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useColonyAccessContext } from "@/components/ColonyAccessProvider";
import { URGENCY_LABELS } from "@/lib/neuteringRequestTypes";

export type ActiveNeuteringRequest = {
  id: string;
  cats_count: number;
  urgency: "low" | "medium" | "high";
  status: "open" | "in_progress" | "completed";
};

export default function NeuteringRequestBanner({
  request,
  colonyId,
}: {
  request: ActiveNeuteringRequest;
  colonyId: string;
}) {
  const router = useRouter();
  const { session, canManage } = useColonyAccessContext();
  const [updating, setUpdating] = useState(false);

  async function handleMarkInProgress() {
    setUpdating(true);
    await supabase
      .from("neutering_requests")
      .update({ status: "in_progress", updated_at: new Date().toISOString() })
      .eq("id", request.id);
    setUpdating(false);
    router.refresh();
  }

  async function handleMarkCompleted() {
    if (!session) return;
    setUpdating(true);
    await supabase
      .from("neutering_requests")
      .update({ status: "completed", updated_at: new Date().toISOString() })
      .eq("id", request.id);

    await supabase.from("timeline_events").insert({
      colony_id: colonyId,
      event_type: "neutering_completed",
      description: `✂️ ${request.cats_count} ${
        request.cats_count === 1 ? "gato castrado" : "gatos castrados"
      } — pedido de castração concluído.`,
      created_by: session.user.id,
    });

    setUpdating(false);
    router.refresh();
  }

  return (
    <div className="mb-6 rounded-xl border border-felines-border bg-felines-accent-light px-4 py-3 text-sm">
      <p className="font-medium text-felines-text-primary">
        ✂️ Castração necessária para {request.cats_count}{" "}
        {request.cats_count === 1 ? "gato" : "gatos"} — urgência {URGENCY_LABELS[request.urgency]}
        {request.status === "in_progress" && " · em andamento"}
      </p>
      {canManage && (
        <div className="mt-2 flex flex-wrap gap-3">
          {request.status === "open" && (
            <button
              onClick={handleMarkInProgress}
              disabled={updating}
              className="rounded-full border border-felines-border px-3 py-1.5 text-xs font-medium text-felines-text-secondary hover:border-felines-accent disabled:opacity-50"
            >
              Marcar como em andamento
            </button>
          )}
          <button
            onClick={handleMarkCompleted}
            disabled={updating}
            className="rounded-full bg-felines-success px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            Castração concluída ✓
          </button>
        </div>
      )}
    </div>
  );
}
