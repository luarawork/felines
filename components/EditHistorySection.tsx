// Collapsible "Edit history" shown below the colony edit form — the
// closest equivalent this app has to a dedicated "Edit tab" (editing
// is an explicit modal action, not a permanent tab, by earlier design;
// see EditColonyButton). Shows the last 10 "colony_edited" timeline
// events, newest first, each expandable to see the actual old/new value.
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { decodeColonyEdit, getFieldLabel } from "@/lib/colonyEditHistory";
import { useLanguage } from "@/lib/i18n";

type EditEntry = {
  id: string;
  createdAt: string;
  authorName: string;
  field: string;
  oldValue: string;
  newValue: string;
};

export default function EditHistorySection({ colonyId }: { colonyId: string }) {
  const { t, language } = useLanguage();
  const [entries, setEntries] = useState<EditEntry[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: eventRows } = await supabase
        .from("timeline_events")
        .select("id, created_at, created_by, description")
        .eq("colony_id", colonyId)
        .eq("event_type", "colony_edited")
        .order("created_at", { ascending: false })
        .limit(10);

      const decoded = (eventRows ?? [])
        .map((row) => {
          const payload = decodeColonyEdit(row.description);
          if (!payload) return null;
          return {
            id: row.id,
            createdAt: row.created_at,
            createdBy: row.created_by as string | null,
            field: payload.field,
            oldValue: payload.oldValue,
            newValue: payload.newValue,
          };
        })
        .filter((row): row is NonNullable<typeof row> => row !== null);

      const authorIds = Array.from(
        new Set(decoded.map((row) => row.createdBy).filter((id): id is string => !!id))
      );
      const { data: profiles } =
        authorIds.length > 0
          ? await supabase.from("profiles").select("id, display_name").in("id", authorIds)
          : { data: [] };

      setEntries(
        decoded.map((row) => ({
          id: row.id,
          createdAt: row.createdAt,
          authorName:
            (profiles ?? []).find((profile) => profile.id === row.createdBy)?.display_name ||
            t("nav.anonymousCommunityMember"),
          field: row.field,
          oldValue: row.oldValue,
          newValue: row.newValue,
        }))
      );
      setLoading(false);
    }

    load();
  }, [colonyId, t]);

  if (loading || entries.length === 0) return null;

  return (
    <div className="mt-6 border-t border-felines-border pt-4">
      <button
        onClick={() => setOpen((previous) => !previous)}
        className="text-sm font-medium text-felines-text-secondary hover:text-felines-text-primary"
      >
        {open ? "▲" : "▼"} {t("editHistory.toggle").replace("{count}", String(entries.length))}
      </button>

      {open && (
        <ul className="mt-3 space-y-2">
          {entries.map((entry) => {
            const isExpanded = expandedId === entry.id;
            return (
              <li key={entry.id} className="rounded-md border border-felines-border px-3 py-2 text-sm">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                  className="block w-full text-left"
                >
                  <span className="text-felines-text-primary">
                    {entry.authorName} {t("editHistory.changed")} {getFieldLabel(entry.field, t)}
                  </span>{" "}
                  <span className="text-xs text-felines-text-secondary">
                    {t("editHistory.on")} {new Date(entry.createdAt).toLocaleDateString(language === "en" ? "en-US" : "pt-BR")}
                  </span>
                </button>
                {isExpanded && (
                  <div className="mt-2 space-y-1 text-xs text-felines-text-secondary">
                    <p>
                      <span className="font-medium">{t("editHistory.before")}</span> {entry.oldValue || t("editHistory.empty")}
                    </p>
                    <p>
                      <span className="font-medium">{t("editHistory.after")}</span> {entry.newValue || t("editHistory.empty")}
                    </p>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
