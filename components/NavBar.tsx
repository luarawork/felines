// Global navigation bar shown on every page.
// Provides links to the main sections of the app: home, map, help, learn,
// and profile/login. Mobile-responsive with a simple horizontal layout
// that wraps on small screens.
"use client";

import Link from "next/link";

// Links shown in the main navigation, in display order.
const NAV_LINKS = [
  { href: "/", label: "Início" },
  { href: "/map", label: "Mapa" },
  { href: "/help", label: "Ajuda" },
  { href: "/learn", label: "Aprender" },
  { href: "/profile", label: "Perfil" },
];

export default function NavBar() {
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
              <Link
                href={link.href}
                className="transition-colors hover:text-felines-accent"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
