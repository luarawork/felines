// Root layout for the Felines app.
// Sets up the global font (Inter), page metadata, and wraps every page
// with the shared NavBar so navigation is consistent across the site.
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";
import FirstVisitBanner from "@/components/FirstVisitBanner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Felines - Mapa de Colônias Felinas em Natal",
  description:
    "Plataforma comunitária para mapear colônias de gatos de rua em Natal, RN, e ajudar vizinhos a entenderem e cuidarem dos gatos da sua região.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-felines-background text-felines-text-primary">
        <FirstVisitBanner />
        <NavBar />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
