// Client component for /notifications. Redirects anonymous visitors to
// /login, loads the signed-in user's notifications, and marks them all
// as read once shown — there's no per-item read/unread toggle, since
// visiting the page is itself the "seen" signal.
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { getNotifications, markAllRead, type Notification } from "@/lib/notifications";
import EmptyState from "@/components/EmptyState";

export default function NotificationsList() {
  const router = useRouter();
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

  if (loading) return null;

  if (notifications.length === 0) {
    return (
      <div className="mt-8">
        <EmptyState
          main="Nenhuma notificação por aqui ainda."
          sub="Quando uma colônia que você cuida enfrentar frio ou calor extremo, você vai saber por aqui."
          ctas={[{ label: "Ver suas colônias", href: "/profile" }]}
        />
      </div>
    );
  }

  return (
    <ul className="mt-8 space-y-3">
      {notifications.map((notification) => (
        <li
          key={notification.id}
          className="rounded-xl border border-felines-border bg-felines-surface p-4"
        >
          <p className="text-sm text-felines-text-primary">
            {/* (ref:<cat id>) is a hidden marker checkStaleCatsForCaretaker
                uses to dedupe per-cat — not meant for the reader. */}
            {notification.message.replace(/\s*\(ref:[^)]+\)/, "")}
          </p>
          <div className="mt-2 flex items-center gap-2 text-xs text-felines-text-secondary">
            <span>{new Date(notification.created_at).toLocaleDateString("pt-BR")}</span>
            {notification.colony_id && (
              <>
                <span>·</span>
                <Link href={`/colony/${notification.colony_id}`} className="text-felines-accent-hover">
                  ver colônia
                </Link>
              </>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
