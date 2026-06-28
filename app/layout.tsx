// Root layout for the Felines app.
// Sets up the global font (Inter), page metadata, and wraps every page
// with the shared NavBar so navigation is consistent across the site.
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";
import HelpModalProvider from "@/components/HelpModalProvider";
import { SITE_URL } from "@/lib/siteUrl";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const SITE_TITLE = "Felines - Mapa de Colônias Felinas em Natal";
const SITE_DESCRIPTION =
  "Plataforma comunitária para mapear colônias de gatos de rua em Natal, RN, e ajudar vizinhos a entenderem e cuidarem dos gatos da sua região.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  // Per-page generateMetadata calls (article/colony/impact pages)
  // override title/description/openGraph.url, but inherit this default
  // image and site name unless they set their own.
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    siteName: "Felines",
    images: ["/images/hero-cat.png"],
    locale: "pt_BR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-felines-background text-felines-text-primary">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[2500] focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-felines-text-primary focus:shadow-lg"
        >
          Pular para o conteúdo
        </a>
        <HelpModalProvider>
          <NavBar />
          <main id="main-content" className="flex-1">
            {children}
          </main>
        </HelpModalProvider>
      </body>
    </html>
  );
}
