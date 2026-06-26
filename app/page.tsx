// Home page for Felines.
// Editorial marketing-style landing page (not the map) that introduces
// the project to the everyday citizen who is curious or in conflict
// with stray cats, and merges in the full /learn guide as an anchored
// section below. Alternates light/dark section backgrounds and uses
// scroll-reveal + count-up motion for an editorial, Meow-Metrics-style
// feel rather than a dense informational page.
import Link from "next/link";
import FirstVisitBanner from "@/components/FirstVisitBanner";
import LearnIndex from "@/components/LearnIndex";
import OpenHelpModalButton from "@/components/OpenHelpModalButton";
import Reveal from "@/components/Reveal";
import CountUpStat from "@/components/CountUpStat";
import CatHeroIllustration from "@/components/CatHeroIllustration";
import MapPreviewIllustration from "@/components/MapPreviewIllustration";
import { ARTICLES, getReadingTimeMinutes } from "@/lib/articles";

const STATS: { value: string; label: string }[] = [
  { value: "10M", label: "gatos de rua no Brasil" },
  { value: "480M", label: "gatos de rua no mundo" },
  { value: "185K", label: "animais em ONGs — capacidade esgotada" },
  { value: "40%", label: "dos brasileiros já tiveram conflito com vizinhos por animais" },
];

const ENTRY_CARDS: {
  href?: string;
  isHelp?: boolean;
  icon: string;
  label: string;
  title: string;
  description: string;
}[] = [
  {
    href: "/map",
    icon: "🗺️",
    label: "Explore",
    title: "Explorar o mapa",
    description: "Veja as colônias mapeadas perto de você e entenda quem cuida delas.",
  },
  {
    href: "#aprender",
    icon: "📖",
    label: "Aprenda",
    title: "Comecar a aprender",
    description: "Guias rápidos para entender o comportamento dos gatos de rua.",
  },
  {
    isHelp: true,
    icon: "🐾",
    label: "Não sabe por onde começar?",
    title: "Comece aqui",
    description: "Gato ferido, filhote sozinho ou conflito com a vizinhança? A gente te orienta.",
  },
];

const MAP_FEATURES = [
  "Localização aproximada das colônias, protegendo a privacidade dos gatos",
  "Avistamentos e emergências da comunidade em tempo real",
  "Status de castração e cuidadores vinculados a cada colônia",
];

export default function Home() {
  const previewArticles = ARTICLES.slice(0, 3);

  return (
    <div>
      <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
        <FirstVisitBanner />
      </div>

      {/* Hero */}
      <section className="mx-auto flex min-h-[calc(100vh-65px)] max-w-6xl flex-col items-center gap-10 px-4 py-16 sm:px-6 lg:min-h-[80vh] lg:flex-row lg:py-24">
        <div className="flex-1 text-center lg:text-left">
          <Reveal>
            <h1 className="text-[40px] font-bold leading-[1.1] tracking-tight text-felines-text-primary sm:text-[52px] lg:text-[64px]">
              Entenda o que está acontecendo com os gatos da sua rua.
            </h1>
          </Reveal>
          <Reveal delayMs={120}>
            <p className="mx-auto mt-5 max-w-[520px] text-lg leading-relaxed text-felines-text-secondary lg:mx-0">
              Felines conecta vizinhos de Natal aos cuidadores de colônias de gatos de rua, com
              informação clara para quem quer entender e ajudar — sem precisar ser especialista.
            </p>
          </Reveal>
          <Reveal delayMs={240}>
            <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
              <Link
                href="/map"
                className="rounded-full bg-felines-accent px-7 py-3 text-base font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-felines-accent-hover active:scale-[0.97]"
              >
                Explorar o mapa →
              </Link>
              <Link
                href="#aprender"
                className="rounded-full px-7 py-3 text-base font-semibold text-felines-text-secondary transition-colors hover:text-felines-text-primary"
              >
                Comecar a aprender
              </Link>
            </div>
          </Reveal>
        </div>
        <Reveal delayMs={150} className="w-full flex-1">
          <div className="mx-auto max-w-sm drop-shadow-xl lg:max-w-none">
            <CatHeroIllustration />
          </div>
        </Reveal>
      </section>

      {/* Stats — dark section */}
      <section className="bg-felines-dark py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <p className="text-center text-xs font-semibold uppercase tracking-[0.1em] text-felines-text-secondary-on-dark lg:text-left">
              O tamanho do problema
            </p>
          </Reveal>
          <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
            {STATS.map((stat, index) => (
              <Reveal key={stat.label} delayMs={index * 100}>
                <div
                  className={`text-center sm:border-l sm:border-felines-border-on-dark sm:pl-6 sm:text-left ${
                    index === 0 ? "sm:border-l-0 sm:pl-0" : ""
                  }`}
                >
                  <p className="text-[44px] font-bold leading-none text-felines-accent sm:text-[56px]">
                    <CountUpStat value={stat.value} />
                  </p>
                  <p className="mt-2 text-sm text-felines-text-secondary-on-dark">{stat.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Entry cards */}
      <section className="bg-felines-background py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-felines-accent">
              Como podemos ajudar
            </p>
            <h2 className="mt-3 text-3xl font-bold leading-tight text-felines-text-primary sm:text-[40px]">
              Seja qual for o motivo que te trouxe aqui, você está no lugar certo.
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-5 sm:grid-cols-3">
            {ENTRY_CARDS.map((card, index) => {
              const content = (
                <>
                  <span className="text-4xl">{card.icon}</span>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-[0.1em] text-felines-accent">
                    {card.label}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-felines-text-primary">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-felines-text-secondary">
                    {card.description}
                  </p>
                  <span className="mt-4 inline-block text-sm font-medium text-felines-accent transition-transform duration-200 group-hover:translate-x-0.5">
                    Saiba mais →
                  </span>
                </>
              );

              return (
                <Reveal key={card.title} delayMs={index * 100}>
                  {card.isHelp ? (
                    <OpenHelpModalButton className="group flex h-full w-full flex-col rounded-2xl border border-felines-border bg-felines-surface p-7 text-left shadow-[0_2px_8px_rgba(0,0,0,0.05)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.10)]">
                      {content}
                    </OpenHelpModalButton>
                  ) : (
                    <Link
                      href={card.href as string}
                      className="group flex h-full flex-col rounded-2xl border border-felines-border bg-felines-surface p-7 shadow-[0_2px_8px_rgba(0,0,0,0.05)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.10)]"
                    >
                      {content}
                    </Link>
                  )}
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Education preview — dark section */}
      <section className="bg-felines-dark py-20">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-felines-text-secondary-on-dark">
              Guia de aprendizado
            </p>
            <h2 className="mt-3 text-3xl font-bold leading-tight text-white sm:text-[40px]">
              Entenda antes de agir.
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-felines-text-secondary-on-dark">
              Artigos curtos e diretos sobre comportamento de gatos de rua, castração e como agir
              em cada situação — sem precisar virar especialista antes de ajudar.
            </p>
            <Link
              href="#aprender"
              className="mt-6 inline-block rounded-full border-2 border-white px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-felines-dark"
            >
              Começar a aprender →
            </Link>
          </Reveal>

          <div className="space-y-3">
            {previewArticles.map((article, index) => (
              <Reveal key={article.slug} delayMs={index * 100}>
                <Link
                  href={`/learn/${article.slug}`}
                  className="block rounded-2xl border border-felines-border-on-dark bg-felines-dark-accent p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.25)]"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-felines-accent">
                    {getReadingTimeMinutes(article)} min de leitura
                  </p>
                  <p className="mt-1 font-semibold text-white">{article.title}</p>
                  <p className="mt-1 text-sm text-felines-text-secondary-on-dark">
                    {article.summary}
                  </p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Map preview */}
      <section className="bg-felines-surface py-20">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center">
          <Reveal className="order-2 lg:order-1">
            <div className="overflow-hidden rounded-2xl border border-felines-border shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
              <MapPreviewIllustration />
            </div>
          </Reveal>
          <Reveal className="order-1 lg:order-2">
            <h3 className="text-3xl font-bold leading-tight text-felines-text-primary">
              Veja o que está acontecendo perto de você.
            </h3>
            <ul className="mt-5 space-y-3">
              {MAP_FEATURES.map((feature) => (
                <li key={feature} className="flex gap-3 text-base text-felines-text-secondary">
                  <span className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-felines-success-light text-felines-success">
                    ✓
                  </span>
                  {feature}
                </li>
              ))}
            </ul>
            <Link
              href="/map"
              className="mt-6 inline-block rounded-full bg-felines-accent px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-felines-accent-hover"
            >
              Abrir o mapa →
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Social proof */}
      <section className="bg-felines-background py-20">
        <Reveal className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <p className="text-2xl font-semibold leading-relaxed text-felines-text-primary sm:text-3xl">
            “Colônias castradas e cuidadas por vizinhos próximos são, de longe, a forma mais
            estável de conviver com gatos de rua — sem conflito e sem crescimento descontrolado.”
          </p>
          <p className="mt-4 text-sm font-medium uppercase tracking-[0.1em] text-felines-text-secondary">
            Pesquisa de campo · TNR no Brasil
          </p>
        </Reveal>
      </section>

      {/* Educational guide, merged into the home page as its own
          sequence of alternating sections — one per theme — instead of
          a single dense list, so each topic gets the same visual
          weight as the rest of the page. */}
      <LearnIndex articles={ARTICLES} startDark />
    </div>
  );
}
