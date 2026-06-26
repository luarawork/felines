// /colony/new route for Felines.
// Requires authentication. Renders the NewColonyForm client component,
// which lets a signed-in user register a colony with validation
// questions, a required photo, a map marker, and a name/narrative.
import NewColonyForm from "@/components/NewColonyForm";

export default function NewColonyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold text-felines-text-primary sm:text-3xl">
        Coloque essa colônia no mapa
      </h1>
      <p className="mt-2 text-sm text-felines-text-secondary">
        Com isso, qualquer vizinho consegue encontrar e ajudar a cuidar dela também.
      </p>
      <NewColonyForm />
    </div>
  );
}
