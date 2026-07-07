// /notifications route for Felines.
"use client";
import NotificationsList from "@/components/profile/NotificationsList";
import { useLanguage } from "@/lib/i18n";

export default function NotificationsPage() {
  const { t } = useLanguage();
  return (
    <section className="bg-felines-background py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h1 className="text-3xl font-bold leading-tight text-felines-text-primary sm:text-[40px]">
          {t("notifications.title")}
        </h1>
        <NotificationsList />
      </div>
    </section>
  );
}
