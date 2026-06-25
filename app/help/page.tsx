// /help route for Felines.
// Two-step emergency / guidance flow for someone who found a problem with
// a stray cat and doesn't know what to do. Step 1 asks what's happening,
// step 2 asks where, then shows contextual educational content and a
// quick way to submit a report.
import HelpFlow from "@/components/HelpFlow";

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold text-felines-text-primary sm:text-3xl">
        Não sabe o que fazer? A gente te orienta.
      </h1>
      <p className="mt-3 text-base text-felines-text-secondary">
        Responda duas perguntas rápidas e mostramos o que fazer agora.
      </p>
      <HelpFlow />
    </div>
  );
}
