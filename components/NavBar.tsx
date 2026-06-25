// Global navigation bar shown on every page.
// Provides links to the main sections of the app: home, map, help, learn,
// and profile/login. Shows "Entrar" or "Sair" depending on auth state.
// Mobile-responsive with a simple horizontal layout that wraps on small screens.
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import { getOpenReportsForMyColonies } from "@/lib/myColonyReports";
import { useHelpModal } from "@/components/HelpModalProvider";

// Links shown in the main navigation, in display order. "Aprender" was
// dropped since that content now lives on the home page itself. The
// help action is a standalone highlighted button, not a plain link —
// see below.
const NAV_LINKS = [
  { href: "/", label: "Início" },
  { href: "/map", label: "Mapa" },
];

export default function NavBar() {
  const router = useRouter();
  const { openHelpModal } = useHelpModal();
  const [session, setSession] = useState<Session | null>(null);
  const [myColonyReportCount, setMyColonyReportCount] = useState(0);

  // Track the auth session so the nav can show the right login/logout state,
  // and stay in sync if the user logs in/out in another tab.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  // Loads how many open reports exist for colonies this user created or
  // caretakes, shown as a small badge next to "Relatos" so caretakers
  // notice new reports without having to check every colony manually.
  useEffect(() => {
    async function loadReportCount() {
      if (!session) {
        setMyColonyReportCount(0);
        return;
      }

      const reports = await getOpenReportsForMyColonies(session.user.id);
      setMyColonyReportCount(reports.length);
    }

    loadReportCount();
  }, [session]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <header className="border-b border-felines-border bg-felines-surface">
      <nav
        className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6"
        aria-label="Navegação principal"
      >
        <Link href="/" className="text-lg font-bold text-felines-accent">
          Felines
        </Link>
        <ul className="flex flex-wrap items-center gap-4 text-sm font-medium text-felines-text-secondary">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="transition-colors hover:text-felines-accent">
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <button
              onClick={openHelpModal}
              className="rounded-full bg-felines-emergency px-4 py-1.5 font-medium text-white transition-colors hover:bg-felines-emergency/90"
            >
              Preciso de ajuda
            </button>
          </li>
          {session ? (
            <>
              <li>
                <Link
                  href="/reports"
                  className="flex items-center gap-1 transition-colors hover:text-felines-accent"
                >
                  Relatos
                  {myColonyReportCount > 0 && (
                    <span className="rounded-full bg-felines-emergency px-1.5 py-0.5 text-xs font-bold text-white">
                      {myColonyReportCount}
                    </span>
                  )}
                </Link>
              </li>
              <li>
                <Link href="/profile" className="transition-colors hover:text-felines-accent">
                  Perfil
                </Link>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="transition-colors hover:text-felines-accent"
                >
                  Sair
                </button>
              </li>
            </>
          ) : (
            <li>
              <Link href="/login" className="transition-colors hover:text-felines-accent">
                Entrar
              </Link>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
}
