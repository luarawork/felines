// Global navigation bar shown on every page.
// Provides links to the main sections of the app: home, map, help, and
// profile/login. Sticky with a blurred backdrop, per the Felines design
// system. Shows "Entrar" or an avatar dropdown depending on auth state.
"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import { getAvatarUrl } from "@/lib/data/profile";
import { checkExtremeWeatherForCaretaker, checkStaleCatsForCaretaker, getUnreadCount } from "@/lib/data/notifications";
import { useHelpModal } from "@/components/assistant/HelpModalProvider";
import GlobalSearchButton from "@/components/shared/GlobalSearchButton";
import { useLanguage } from "@/lib/i18n";

const NAV_LINK_KEYS = [
  { href: "/", key: "nav.home" },
  { href: "/map", key: "nav.map" },
  { href: "/reports", key: "nav.reports" },
  { href: "/impact", key: "nav.impact" },
] as const;

export default function NavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { openHelpModal } = useHelpModal();
  const { language, setLanguage, t } = useLanguage();
  const [session, setSession] = useState<Session | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Exposes the nav's real rendered height as a CSS variable, since it
  // wraps to 2-3 lines on narrow screens — pages that need to fill
  // "the rest of the viewport" (like /map) can't safely assume a fixed
  // height, but they can read this instead of guessing.
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    function updateHeight() {
      document.documentElement.style.setProperty("--navbar-height", `${header!.offsetHeight}px`);
    }

    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  // Track the auth session so the nav can show the right login/logout state,
  // and stay in sync if the user logs in/out in another tab.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  // Keeps the nav avatar in sync with whatever photo the user has set on
  // /profile, instead of always showing just their initial.
  useEffect(() => {
    if (!session) return;
    getAvatarUrl(session.user.id).then(setAvatarUrl);
  }, [session]);

  // Checks the current weather against the extreme thresholds and
  // whether any cat hasn't been seen in 7+ days, creating notifications
  // for the colonies/cats the user cares for (deduped per day), then
  // refreshes the unread badge. Runs once per session, on whichever
  // page the user happens to load first.
  useEffect(() => {
    if (!session) return;
    Promise.all([
      checkExtremeWeatherForCaretaker(session.user.id, language),
      checkStaleCatsForCaretaker(session.user.id, language),
    ]).finally(() => {
      getUnreadCount(session.user.id).then(setUnreadCount);
    });
  }, [session, language]);

  // Closes the avatar dropdown when clicking outside it or pressing Escape.
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  async function handleLogout() {
    setMenuOpen(false);
    await supabase.auth.signOut();
    router.push("/");
  }

  const initial = session?.user.email?.[0]?.toUpperCase() ?? "?";

  return (
    <header
      ref={headerRef}
      className="felines-safe-top sticky top-0 z-[1500] border-b border-felines-border bg-white/80 backdrop-blur-md"
    >
      <nav
        className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6"
        aria-label={t("nav.navLabel")}
      >
        <Link href="/" className="flex-shrink-0">
          <Image
            src="/images/logo.png"
            alt="Felines logo"
            width={150}
            height={48}
            priority
            className="felines-logo-bounce h-10 w-auto"
          />
        </Link>

        <ul className="hidden items-center gap-6 text-sm font-medium text-felines-text-secondary sm:flex">
          {NAV_LINK_KEYS.map((link) => {
            const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`transition-colors hover:text-felines-accent ${isActive ? "font-semibold text-felines-accent" : ""}`}
                >
                  {t(link.key)}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-3">
          {/* Language switcher — joined PT|EN pill with a sliding active
              background instead of an instant color swap on toggle */}
          <div
            role="group"
            aria-label={t("nav.selectLanguage")}
            className="relative hidden items-center overflow-hidden rounded-full border border-felines-border sm:flex"
          >
            <span
              aria-hidden="true"
              className="absolute inset-y-0 left-0 w-1/2 bg-felines-accent transition-transform duration-200 ease-out"
              style={{ transform: language === "en" ? "translateX(100%)" : "translateX(0%)" }}
            />
            {(["pt", "en"] as const).map((lang, i) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                aria-pressed={language === lang}
                className={`relative z-10 h-8 px-3 text-xs font-semibold transition-colors ${
                  i === 0 ? "" : "border-l border-felines-border"
                } ${
                  language === lang
                    ? "text-white"
                    : "bg-transparent text-felines-text-secondary hover:text-felines-text-primary"
                }`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>

          <GlobalSearchButton />
          <button
            onClick={openHelpModal}
            aria-label={t("nav.getHelp")}
            className="felines-help-pulse flex h-11 w-11 flex-shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-felines-accent text-center text-sm font-semibold text-white transition-colors hover:bg-felines-accent-hover sm:h-auto sm:min-h-[44px] sm:w-auto sm:min-w-[9.5rem] sm:px-4 sm:py-1.5"
          >
            <span aria-hidden="true" className="text-lg sm:hidden">🆘</span>
            <span className="hidden sm:inline">{t("nav.getHelp")}</span>
          </button>

          {session ? (
            <div ref={menuRef} className="relative">
              <button
                onClick={() => setMenuOpen((previous) => !previous)}
                aria-label={unreadCount > 0 ? t("nav.menuLabelUnread").replace("{count}", String(unreadCount)) : t("nav.menuLabel")}
                aria-haspopup="true"
                aria-expanded={menuOpen}
                className="relative flex h-11 w-11 items-center justify-center rounded-full border border-felines-border bg-felines-accent-light text-sm font-semibold text-felines-accent-hover transition-colors hover:bg-felines-accent hover:text-white"
              >
                <span className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full">
                  {avatarUrl ? (
                    <Image src={avatarUrl} alt={t("nav.profileAlt")} fill className="object-cover" />
                  ) : (
                    initial
                  )}
                </span>
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-felines-emergency text-[10px] font-bold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl border border-felines-border bg-white py-1 text-sm shadow-[0_8px_24px_rgba(0,0,0,0.10)]">
                  <Link
                    href="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2 text-felines-text-primary hover:bg-felines-background"
                  >
                    {t("nav.myProfile")}
                  </Link>
                  <Link
                    href="/notifications"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-between px-4 py-2 text-felines-text-primary hover:bg-felines-background"
                  >
                    {t("nav.notifications")}
                    {unreadCount > 0 && (
                      <span className="rounded-full bg-felines-emergency px-1.5 py-0.5 text-xs font-bold text-white">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full px-4 py-2 text-left text-felines-text-primary hover:bg-felines-background"
                  >
                    {t("nav.signOut")}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="text-sm font-medium text-felines-text-secondary transition-colors hover:text-felines-text-primary"
            >
              {t("nav.signIn")}
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
