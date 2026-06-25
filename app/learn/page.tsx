// /learn route for Felines.
// Index of the educational guide, grouped into 3 progressive levels, with
// a knowledge progress bar for signed-in users and a quiz prompt once
// they've read at least 3 articles.
import LearnIndex from "@/components/LearnIndex";
import { ARTICLES } from "@/lib/articles";

export default function LearnPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold text-felines-text-primary sm:text-3xl">
        Guia de aprendizado
      </h1>
      <p className="mt-3 text-base text-felines-text-secondary">
        Conteúdo curto e direto para entender os gatos de rua da sua região, em 3 níveis.
      </p>
      <LearnIndex articles={ARTICLES} />
    </div>
  );
}
