// Home page for Felines.
"use client";
import Image from "next/image";
import Link from "next/link";
import FirstVisitBanner from "@/components/shared/FirstVisitBanner";
import LearnIndex from "@/components/learn/LearnIndex";
import OpenHelpModalButton from "@/components/assistant/OpenHelpModalButton";
import Reveal from "@/components/shared/Reveal";
import CountUpStat from "@/components/impact/CountUpStat";
import MapPreviewIllustration from "@/components/map/MapPreviewIllustration";
import ArticleCard from "@/components/learn/ArticleCard";
import NeighborhoodQuizButton from "@/components/learn/NeighborhoodQuizButton";
import CatsConflictModal from "@/components/colony/CatsConflictModal";
import { ARTICLES } from "@/lib/content/articles";
import { useLanguage } from "@/lib/i18n";

const STAT_VALUES = ["10M", "480M", "185K", "40%"];

export default function Home() {
  const { t, language } = useLanguage();
  const previewArticles = ARTICLES.slice(0, 3);
  const documentationUrl =
    language === "en"
      ? "https://bronzed-longship-a0f.notion.site/Felines-Documentation-EN-392f091b2b7481ff9a45e3b8b06f3993?source=copy_link"
      : "https://bronzed-longship-a0f.notion.site/Felines-Documenta-o-392f091b2b7481048a73e27049a939cb?source=copy_link";

  const statLabels: string[] = [
    t("home.stats.0"),
    t("home.stats.1"),
    t("home.stats.2"),
    t("home.stats.3"),
  ];

  const mapFeatures: string[] = [
    t("home.mapFeatures.0"),
    t("home.mapFeatures.1"),
    t("home.mapFeatures.2"),
  ];

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
              {t("home.heroHeadline")}
            </h1>
          </Reveal>
          <Reveal delayMs={120}>
            <p className="mx-auto mt-5 max-w-[520px] text-lg leading-relaxed text-felines-text-secondary lg:mx-0">
              {t("home.heroSub")}
            </p>
          </Reveal>
          <Reveal delayMs={200}>
            <div className="mt-6 flex justify-center lg:justify-start">
              <CatsConflictModal />
            </div>
          </Reveal>

          <Reveal delayMs={240}>
            <div className="mt-6 flex flex-wrap justify-center gap-3 lg:justify-start">
              <Link
                href="/map"
                className="rounded-full bg-felines-accent px-7 py-3 text-base font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-felines-accent-hover active:scale-[0.97]"
              >
                {t("home.heroCta1")}
              </Link>
              <Link
                href="#aprender"
                className="rounded-full px-7 py-3 text-base font-semibold text-felines-text-secondary transition-colors hover:text-felines-text-primary"
              >
                {t("home.heroCta2")}
              </Link>
            </div>
          </Reveal>
        </div>
        <Reveal delayMs={150} className="w-full flex-1">
          <div className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-full drop-shadow-xl lg:max-w-md">
            <Image
              src="/images/hero-cat.png"
              alt={t("home.heroImageAlt")}
              fill
              priority
              className="object-cover"
            />
          </div>
        </Reveal>
      </section>

      {/* Stats — dark section */}
      <section className="bg-felines-dark py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <p className="text-center text-xs font-semibold uppercase tracking-[0.1em] text-felines-text-secondary-on-dark lg:text-left">
              {t("home.whyLabel")}
            </p>
          </Reveal>
          <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
            {STAT_VALUES.map((value, index) => (
              <Reveal key={value} delayMs={index * 100}>
                <div
                  className={`text-center sm:border-l sm:border-felines-border-on-dark sm:pl-6 sm:text-left ${
                    index === 0 ? "sm:border-l-0 sm:pl-0" : ""
                  }`}
                >
                  <p className="text-[44px] font-bold leading-none text-felines-accent sm:text-[56px]">
                    <CountUpStat value={value} />
                  </p>
                  <p className="mt-2 text-sm text-felines-text-secondary-on-dark">{statLabels[index]}</p>
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
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-felines-accent-hover">
              {t("home.howLabel")}
            </p>
            <h2 className="mt-3 text-3xl font-bold leading-tight text-felines-text-primary sm:text-[40px]">
              {t("home.howHeadline")}
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-5 sm:grid-cols-3">
            {(["explore", "learn", "act"] as const).map((key, index) => {
              const card = {
                explore: { href: "/map", isHelp: false, icon: "🗺️" },
                learn: { href: "#aprender", isHelp: false, icon: "📖" },
                act: { href: undefined, isHelp: true, icon: "🐾" },
              }[key];

              const content = (
                <>
                  <span className="text-4xl" aria-hidden="true">{card.icon}</span>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-[0.1em] text-felines-accent-hover">
                    {t(`home.cards.${key}.label`)}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-felines-text-primary">
                    {t(`home.cards.${key}.title`)}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-felines-text-secondary">
                    {t(`home.cards.${key}.desc`)}
                  </p>
                  <span className="mt-4 inline-block text-sm font-medium text-felines-accent-hover transition-transform duration-200 group-hover:translate-x-0.5">
                    {t("home.cards.learnMore")}
                  </span>
                </>
              );

              return (
                <Reveal key={key} delayMs={index * 100}>
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

      {/* Neighborhood diagnosis quiz CTA */}
      <section className="bg-felines-surface py-16">
        <Reveal className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-felines-accent-hover">
            {t("home.quizLabel")}
          </p>
          <h2 className="mt-3 text-2xl font-bold leading-tight text-felines-text-primary sm:text-3xl">
            {t("home.quizHeadline")}
          </h2>
          <div className="mt-6">
            <NeighborhoodQuizButton
              triggerClassName="rounded-full bg-felines-accent px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-felines-accent-hover"
              triggerLabel={t("home.quizCta")}
            />
          </div>
        </Reveal>
      </section>

      {/* Education preview — dark section */}
      <section className="bg-felines-dark py-20">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-felines-text-secondary-on-dark">
              {t("home.guideLabel")}
            </p>
            <h2 className="mt-3 text-3xl font-bold leading-tight text-white sm:text-[40px]">
              {t("home.guideHeadline")}
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-felines-text-secondary-on-dark">
              {t("home.guideSub")}
            </p>
            <Link
              href="#aprender"
              className="mt-6 inline-block rounded-full border-2 border-white px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-felines-dark"
            >
              {t("home.guideCta")}
            </Link>
          </Reveal>

          <div className="space-y-3">
            {previewArticles.map((article, index) => (
              <Reveal key={article.slug} delayMs={index * 100}>
                <ArticleCard article={article} isDark />
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
              <MapPreviewIllustration label={t("nav.mapIllustrationAlt")} />
            </div>
          </Reveal>
          <Reveal className="order-1 lg:order-2">
            <h3 className="text-3xl font-bold leading-tight text-felines-text-primary">
              {t("home.mapHeadline")}
            </h3>
            <ul className="mt-5 space-y-3">
              {mapFeatures.map((feature, i) => (
                <li key={i} className="flex gap-3 text-base text-felines-text-secondary">
                  <span className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-felines-success-light text-felines-success-hover">
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
              {t("home.mapCta")}
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Social proof */}
      <section className="bg-felines-background py-20">
        <Reveal className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <p className="text-2xl font-semibold leading-relaxed text-felines-text-primary sm:text-3xl">
            {t("home.quote")}
          </p>
          <p className="mt-4 text-sm font-medium uppercase tracking-[0.1em] text-felines-text-secondary">
            {t("home.quoteAttrib")}
          </p>
        </Reveal>
      </section>

      <LearnIndex articles={ARTICLES} startDark />

      <footer className="border-t border-felines-border bg-felines-background py-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 text-sm text-felines-text-secondary sm:px-6">
          <p>
            {t("home.footerCredit")}{" "}
            <a
              href="https://luara.work/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-felines-accent-hover"
            >
              Luara Oliveira
            </a>
          </p>
          <div className="flex items-center gap-4">
            <Link href="/glossary" className="font-medium text-felines-accent-hover">
              {t("home.footerGlossary")}
            </Link>
            <Link href="/curso" className="font-medium text-felines-accent-hover">
              {t("home.footerCourse")}
            </Link>
            <a
              href={documentationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-felines-accent-hover"
            >
              {t("home.footerAbout")}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
