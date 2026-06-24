// Home page for Felines.
// Educational landing page (not the map) that introduces the project to
// the everyday citizen who is curious or in conflict with stray cats, and
// routes them to the map, the learning guide, or the emergency help flow.
import Link from "next/link";

// Entry cards shown below the hero, each pointing to a key flow in the app.
const ENTRY_CARDS = [
  {
    href: "/map",
    title: "Explorar o mapa",
    description:
      "Veja as colônias de gatos mapeadas perto de você e entenda quem cuida delas.",
  },
  {
    href: "/learn",
    title: "Comecar a aprender",
    description:
      "Guias rápidos para entender o comportamento dos gatos de rua e como conviver bem com eles.",
  },
  {
    href: "/help",
    title: "Não sabe o que fazer? Comece aqui",
    description:
      "Encontrou um gato ferido, filhote sozinho ou está em conflito com a vizinhança? A gente te orienta.",
  },
];

// Short, scannable facts used to build trust and context quickly.
const QUICK_FACTS = [
  "Gatos castrados não geram novas ninhadas e tendem a ser mais tranquilos no território.",
  "Colônias bem cuidadas reduzem conflitos como barulho, cheiro e brigas territoriais.",
  "Alimentar um gato de rua sem cuidados de saúde pode, na prática, prejudicar a colônia.",
];

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      {/* Hero section */}
      <section className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-bold leading-tight text-felines-text-primary sm:text-4xl">
          Entenda o que está acontecendo com os gatos da sua rua.
        </h1>
        <p className="mt-4 text-base leading-relaxed text-felines-text-secondary sm:text-lg">
          Felines conecta vizinhos de Natal aos cuidadores de colônias de
          gatos de rua, com informação clara para quem não é necessariamente
          apaixonado por gatos, mas quer entender e ajudar.
        </p>
      </section>

      {/* Entry cards */}
      <section className="mt-12 grid gap-5 sm:grid-cols-3">
        {ENTRY_CARDS.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="flex flex-col rounded-xl border border-felines-border bg-felines-surface p-6 transition-colors hover:border-felines-accent"
          >
            <h2 className="text-lg font-bold text-felines-text-primary">
              {card.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-felines-text-secondary">
              {card.description}
            </p>
          </Link>
        ))}
      </section>

      {/* Quick facts */}
      <section className="mt-16 rounded-xl border border-felines-border bg-felines-surface p-6 sm:p-8">
        <h2 className="text-xl font-bold text-felines-text-primary">
          Fatos rápidos
        </h2>
        <ul className="mt-4 space-y-3">
          {QUICK_FACTS.map((fact) => (
            <li
              key={fact}
              className="flex gap-3 text-sm leading-relaxed text-felines-text-secondary"
            >
              <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-felines-success" />
              {fact}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
