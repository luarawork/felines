// /glossary route for Felines.
// Static reference page defining key terms used throughout the
// platform — linked from the footer and meant to be the landing spot
// the first time a term like "TNR" or "efeito vácuo" shows up elsewhere.
import GlossaryList from "@/components/GlossaryList";
import { GLOSSARY_TERMS } from "@/lib/glossary";

export default function GlossaryPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold text-felines-text-primary sm:text-3xl">Glossário</h1>
      <p className="mt-2 text-base text-felines-text-secondary">
        Termos usados pela plataforma, explicados em uma frase.
      </p>
      <GlossaryList terms={GLOSSARY_TERMS} />
    </div>
  );
}
