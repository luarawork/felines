// /reports route for Felines.
// Lets signed-in users see open reports, confirm ones they've also
// witnessed, and mark them resolved once handled. Reading report status
// requires authentication (enforced by RLS) since it's more sensitive
// than the public, blurred map view.
import ReportsList from "@/components/ReportsList";

export default function ReportsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold text-felines-text-primary sm:text-3xl">Relatos</h1>
      <p className="mt-2 text-sm text-felines-text-secondary">
        Confirme relatos que você também viu e marque como resolvidos os que já foram atendidos.
      </p>
      <ReportsList />
    </div>
  );
}
