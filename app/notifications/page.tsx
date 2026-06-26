// /notifications route for Felines.
// Requires authentication. Renders the NotificationsList client
// component, which lists the signed-in user's notifications and marks
// them all as read once viewed.
import NotificationsList from "@/components/NotificationsList";

export default function NotificationsPage() {
  return (
    <section className="bg-felines-background py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h1 className="text-3xl font-bold leading-tight text-felines-text-primary sm:text-[40px]">
          Notificações
        </h1>
        <NotificationsList />
      </div>
    </section>
  );
}
