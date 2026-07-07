// Recurring care reminders for a colony (feeding, water, health checks,
// or a custom task), scoped to caretakers/creator only — this is a
// private planning tool, not public-facing like the timeline. "Due"
// status is computed on read from last_done_at + frequency_days; there's
// no backend cron in this stack to push a notification when something
// becomes overdue (same limitation documented for help_requests'
// 7-day expiry), so a caretaker has to actually visit the colony page
// to see what's due.
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useColonyAccessContext } from "@/components/colony/ColonyAccessProvider";
import { useLanguage } from "@/lib/i18n";

type ReminderType = "feeding" | "water" | "health_check" | "shelter_check" | "custom";

type CareReminder = {
  id: string;
  type: ReminderType;
  custom_label: string | null;
  frequency_days: number;
  last_done_at: string;
};

const REMINDER_TYPES: ReminderType[] = ["feeding", "water", "health_check", "shelter_check", "custom"];

function daysUntilDue(reminder: CareReminder): number {
  const dueAt = new Date(reminder.last_done_at).getTime() + reminder.frequency_days * 24 * 60 * 60 * 1000;
  return Math.ceil((dueAt - Date.now()) / (24 * 60 * 60 * 1000));
}

export default function CareReminders({ colonyId }: { colonyId: string }) {
  const { t } = useLanguage();
  const { canManage, checkingAccess } = useColonyAccessContext();
  const [reminders, setReminders] = useState<CareReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [type, setType] = useState<ReminderType>("feeding");
  const [customLabel, setCustomLabel] = useState("");
  const [frequencyDays, setFrequencyDays] = useState(3);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    if (checkingAccess) return;
    if (!canManage) {
      // Resetting in response to a resolved access check, not deriving
      // render state from props — outside what this lint rule covers.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      const { data } = await supabase
        .from("care_reminders")
        .select("id, type, custom_label, frequency_days, last_done_at")
        .eq("colony_id", colonyId)
        .order("created_at", { ascending: true });

      if (!cancelled) {
        setReminders((data ?? []) as CareReminder[]);
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [colonyId, canManage, checkingAccess]);

  function labelFor(reminder: CareReminder): string {
    if (reminder.type === "custom") return reminder.custom_label ?? t("careReminders.types.custom");
    return t(`careReminders.types.${reminder.type}`);
  }

  async function handleSubmit(formEvent: React.FormEvent) {
    formEvent.preventDefault();
    setError(null);

    if (!frequencyDays || frequencyDays < 1 || frequencyDays > 365) {
      setError(t("careReminders.validationError"));
      return;
    }
    if (type === "custom" && !customLabel.trim()) {
      setError(t("careReminders.customLabelRequired"));
      return;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) return;

    setSubmitting(true);
    const { data: newRow, error: insertError } = await supabase
      .from("care_reminders")
      .insert({
        colony_id: colonyId,
        created_by: sessionData.session.user.id,
        type,
        custom_label: type === "custom" ? customLabel.trim() : null,
        frequency_days: frequencyDays,
      })
      .select("id, type, custom_label, frequency_days, last_done_at")
      .single();
    setSubmitting(false);

    if (insertError || !newRow) {
      setError(t("careReminders.insertError"));
      return;
    }

    setReminders((previous) => [...previous, newRow as CareReminder]);
    setType("feeding");
    setCustomLabel("");
    setFrequencyDays(3);
    setFormOpen(false);
  }

  async function handleMarkDone(reminderId: string) {
    setPendingId(reminderId);
    const nowIso = new Date().toISOString();
    const { error: updateError } = await supabase
      .from("care_reminders")
      .update({ last_done_at: nowIso })
      .eq("id", reminderId);
    setPendingId(null);

    if (updateError) {
      setError(t("careReminders.markDoneError"));
      return;
    }

    setReminders((previous) =>
      previous.map((reminder) => (reminder.id === reminderId ? { ...reminder, last_done_at: nowIso } : reminder))
    );
  }

  async function handleDelete(reminderId: string) {
    if (!confirm(t("careReminders.deleteConfirm"))) return;

    const { error: deleteError } = await supabase.from("care_reminders").delete().eq("id", reminderId);
    if (deleteError) {
      setError(t("careReminders.deleteError"));
      return;
    }

    setReminders((previous) => previous.filter((reminder) => reminder.id !== reminderId));
  }

  if (loading || checkingAccess || !canManage) return null;

  return (
    <div className="mt-6 rounded-xl border border-felines-border bg-felines-surface p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-felines-text-primary">{t("careReminders.sectionTitle")}</p>
          <p className="mt-0.5 max-w-md text-xs text-felines-text-secondary">{t("careReminders.sectionSub")}</p>
        </div>
        <button
          onClick={() => setFormOpen((previous) => !previous)}
          className="flex-shrink-0 rounded-full border border-felines-accent px-3 py-1.5 text-xs font-medium text-felines-accent-hover transition-colors hover:bg-felines-accent hover:text-white"
        >
          {formOpen ? t("careReminders.cancelBtn") : t("careReminders.addBtn")}
        </button>
      </div>

      {formOpen && (
        <form onSubmit={handleSubmit} className="mt-4 space-y-3 rounded-lg border border-felines-border bg-white p-3">
          <div>
            <label className="block text-xs font-medium text-felines-text-secondary">
              {t("careReminders.typeLabel")}
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as ReminderType)}
              className="mt-1 w-full rounded-md border border-felines-border bg-white px-3 py-3.5 text-sm"
            >
              {REMINDER_TYPES.map((value) => (
                <option key={value} value={value}>
                  {t(`careReminders.types.${value}`)}
                </option>
              ))}
            </select>
          </div>

          {type === "custom" && (
            <div>
              <label className="block text-xs font-medium text-felines-text-secondary">
                {t("careReminders.customLabelLabel")}
              </label>
              <input
                type="text"
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
                placeholder={t("careReminders.customLabelPlaceholder")}
                maxLength={60}
                className="mt-1 w-full rounded-md border border-felines-border bg-white px-3 py-3.5 text-sm"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-felines-text-secondary">
              {t("careReminders.frequencyLabel")}
            </label>
            <input
              type="number"
              value={frequencyDays}
              onChange={(e) => setFrequencyDays(Number(e.target.value))}
              min={1}
              max={365}
              className="mt-1 w-24 rounded-md border border-felines-border bg-white px-3 py-2 text-sm"
            />
          </div>

          {error && <p role="alert" className="text-sm text-felines-emergency">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            aria-busy={submitting}
            className="rounded-full bg-felines-accent px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
          >
            {submitting ? t("careReminders.submitting") : t("careReminders.submit")}
          </button>
        </form>
      )}

      {reminders.length === 0 && !formOpen ? (
        <p className="mt-3 text-sm text-felines-text-secondary">{t("careReminders.empty")}</p>
      ) : (
        <div className="mt-3 space-y-2">
          {reminders.map((reminder) => {
            const days = daysUntilDue(reminder);
            const isOverdue = days < 0;
            const isDueToday = days === 0;
            let statusLabel: string;
            let statusClass: string;
            if (isOverdue) {
              statusLabel = t("careReminders.overdueBy").replace("{days}", String(Math.abs(days)));
              statusClass = "border-felines-emergency bg-felines-emergency/10 text-felines-emergency";
            } else if (isDueToday) {
              statusLabel = t("careReminders.dueToday");
              statusClass = "border-felines-warning bg-felines-warning/10 text-felines-warning-hover";
            } else {
              statusLabel = t("careReminders.dueInDays").replace("{days}", String(days));
              statusClass = "border-felines-border bg-felines-background text-felines-text-secondary";
            }

            return (
              <div
                key={reminder.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-felines-border bg-white px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium text-felines-text-primary">
                    {labelFor(reminder)}{" "}
                    <span className="font-normal text-felines-text-secondary">
                      ({t("careReminders.every").replace("{days}", String(reminder.frequency_days))})
                    </span>
                  </p>
                  <span
                    className={`mt-1 inline-block rounded-full border px-2 py-0.5 text-[11px] font-medium ${statusClass}`}
                  >
                    {statusLabel}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleMarkDone(reminder.id)}
                    disabled={pendingId === reminder.id}
                    className="rounded-full bg-felines-accent px-3 py-1 text-xs font-medium text-white disabled:opacity-50"
                  >
                    {pendingId === reminder.id ? t("careReminders.markingDone") : t("careReminders.markDone")}
                  </button>
                  <button
                    onClick={() => handleDelete(reminder.id)}
                    className="rounded-full border border-felines-border px-3 py-1 text-xs font-medium text-felines-text-secondary hover:border-felines-emergency hover:text-felines-emergency"
                  >
                    {t("careReminders.delete")}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
