// /resources route for Felines.
// Server wrapper — the actual board is a client component since the
// whole page is authenticated-only and needs the live session to gate
// access and to know who's posting/responding.
import type { Metadata } from "next";
import ResourcesBoard from "@/components/ResourcesBoard";

export const metadata: Metadata = {
  title: "Troca de recursos — Felines",
  description: "Quadro onde cuidadores oferecem ou pedem recursos uns aos outros — sem dinheiro envolvido.",
};

export default function ResourcesPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-bold text-felines-text-primary sm:text-3xl">
        Troca de recursos entre cuidadores
      </h1>
      <p className="mt-2 text-base text-felines-text-secondary">
        Ofereça ou peça algo pra outro cuidador. Sem dinheiro envolvido — só comunidade.
      </p>
      <ResourcesBoard />
    </div>
  );
}
