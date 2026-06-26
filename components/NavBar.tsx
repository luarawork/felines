// Global navigation bar shown on every page.
// Provides links to the main sections of the app: home, map, help, and
// profile/login. Sticky with a blurred backdrop, per the Felines design
// system. Shows "Entrar" or an avatar dropdown depending on auth state.
"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import { useHelpModal } from "@/components/HelpModalProvider";

// Links shown in the main navigation, in display order. "Aprender" was
// dropped since that content now lives on the home page itself.
const NAV_LINKS = [
  { href: "/", label: "Início" },
  { href: "/map", label: "Mapa" },
];

export default function NavBar() {
  const router = useRouter();
  const { openHelpModal } = useHelpModal();
  const [session, setSession] = useState<Session | null>(null);
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

  // Closes the avatar dropdown when clicking outside it.
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
      className="sticky top-0 z-[1500] border-b border-felines-border bg-white/80 backdrop-blur-md"
    >
      <nav
        className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6"
        aria-label="Navegação principal"
      >
        <Link href="/" className="flex-shrink-0">
          <Image
            src="/logo.png"
            alt="Felines"
            width={150}
            height={66}
            priority
            className="h-10 w-auto"
          />
        </Link>

        <ul className="hidden items-center gap-6 text-sm font-medium text-felines-text-secondary sm:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="transition-colors hover:text-felines-accent">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <button
            onClick={openHelpModal}
            className="felines-help-pulse rounded-full bg-felines-accent px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-felines-accent-hover"
          >
            Preciso de ajuda 🐾
          </button>

          {session ? (
            <div ref={menuRef} className="relative">
              <button
                onClick={() => setMenuOpen((previous) => !previous)}
                aria-label="Menu da conta"
                aria-haspopup="true"
                aria-expanded={menuOpen}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-felines-accent-light text-sm font-semibold text-felines-accent-hover transition-colors hover:bg-felines-accent hover:text-white"
              >
                {initial}
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-44 rounded-xl border border-felines-border bg-white py-1 text-sm shadow-[0_8px_24px_rgba(0,0,0,0.10)]">
                  <Link
                    href="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2 text-felines-text-primary hover:bg-felines-background"
                  >
                    Meu perfil
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full px-4 py-2 text-left text-felines-text-primary hover:bg-felines-background"
                  >
                    Sair
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="text-sm font-medium text-felines-text-secondary transition-colors hover:text-felines-text-primary"
            >
              Entrar
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
