// Client component for /notifications. Redirects anonymous visitors to
// /login, loads the signed-in user's notifications, and marks them all
// as read once shown — there's no per-item read/unread toggle, since
// visiting the page is itself the "seen" signal.
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { dismissNotification, getNotifications, markAllRead, type Notification } from "@/lib/notifications";
import EmptyState from "@/components/EmptyState";
import { useLanguage } from "@/lib/i18n";

export default function NotificationsList() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    async function load() {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;

      if (!session) {
        router.push("/login?returnTo=/notifications");
        return;
      }

      setNotifications(await getNotifications(session.user.id));
      await markAllRead(session.user.id);
      setLoading(false);
    }

    load();
  }, [router]);

  async function handleDismiss(notificationId: string) {
    setNotifications((previous) => previous.filter((notification) => notification.id !== notificationId));
    await dismissNotification(notificationId);
  }

  if (loading) return null;

  if (notifications.length === 0) {
    return (
      <div className="mt-8">
        <EmptyState
          main={t("notificationsList.emptyMain")}
          sub={t("notificationsList.emptySub")}
          ctas={[{ label: t("notificationsList.emptyCta"), href: "/profile" }]}
        />
      </div>
    );
  }

  return (
    <ul className="mt-8 space-y-3">
      {notifications.map((notification) => (
        <li
          key={notification.id}
          className="flex items-start gap-3 rounded-xl border border-felines-border bg-felines-surface p-4"
        >
          <div className="flex-1">
            <p className="text-sm text-felines-text-primary">
              {/* (ref:<cat id>) is a hidden marker checkStaleCatsForCaretaker
                  uses to dedupe per-cat — not meant for the reader. */}
              {notification.message.replace(/\s*\(ref:[^)]+\)/, "")}
            </p>
            <div className="mt-2 flex items-center gap-2 text-xs text-felines-text-secondary">
              <span>
                {new Date(notification.created_at).toLocaleDateString(language === "en" ? "en-US" : "pt-BR")}
              </span>
              {notification.colony_id && (
                <>
                  <span>·</span>
                  <Link href={`/colony/${notification.colony_id}`} className="text-felines-accent-hover">
                    {t("notificationsList.viewColony")}
                  </Link>
                </>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleDismiss(notification.id)}
            aria-label={t("notificationsList.markRead")}
            title={t("notificationsList.markRead")}
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-felines-text-secondary transition-colors hover:bg-felines-background hover:text-felines-text-primary"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
              <path d="M16.7 5.3a1 1 0 0 1 0 1.4l-8 8a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.4L8 12.6l7.3-7.3a1 1 0 0 1 1.4 0Z" />
            </svg>
          </button>
        </li>
      ))}
    </ul>
  );
}
