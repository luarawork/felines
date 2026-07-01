// /contacts — Community-curated list of important contacts related
// to cat care: vets, shelters, NGOs, rescue groups, etc. Public
// read; any authenticated user can add a new entry.
// Server component renders the list; client component handles the form.
import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import ContactsBoard from "@/components/ContactsBoard";

export const metadata: Metadata = {
  title: "Contatos úteis — Felines",
  description:
    "Clínicas veterinárias, ONGs, abrigos e grupos de resgate cadastrados pela comunidade Felines.",
};

export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type ContactRow = {
  id: string;
  city: string;
  name: string;
  phone: string | null;
  email: string | null;
  social: string | null;
  category: string;
  notes: string | null;
  created_at: string;
};

const CATEGORY_LABELS: Record<string, { label: string; emoji: string }> = {
  vet: { label: "Clínica veterinária", emoji: "🏥" },
  shelter: { label: "Abrigo", emoji: "🏠" },
  ngo: { label: "ONG", emoji: "🤝" },
  rescue: { label: "Grupo de resgate", emoji: "🚨" },
  transport: { label: "Transporte de animais", emoji: "🚗" },
  legal: { label: "Apoio jurídico", emoji: "⚖️" },
  general: { label: "Contato geral", emoji: "📋" },
};

export { CATEGORY_LABELS };

export default async function ContactsPage() {
  const { data: rows } = await supabase
    .from("community_contacts")
    .select("id, city, name, phone, email, social, category, notes, created_at")
    .order("city")
    .order("created_at", { ascending: false });

  const contacts = (rows ?? []) as ContactRow[];

  // Group by city
  const byCity = contacts.reduce<Record<string, ContactRow[]>>((acc, c) => {
    const key = c.city;
    if (!acc[key]) acc[key] = [];
    acc[key].push(c);
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <Link href="/" className="text-sm text-felines-text-secondary hover:text-felines-accent">
        ← Início
      </Link>

      <h1 className="mt-4 text-3xl font-bold text-felines-text-primary">
        Contatos úteis
      </h1>
      <p className="mt-2 max-w-xl text-base text-felines-text-secondary">
        Clínicas, ONGs, abrigos e grupos de resgate cadastrados pela comunidade. Se você conhece
        um contato que ainda não está aqui, adicione.
      </p>

      <ContactsBoard initialByCity={byCity} categoryLabels={CATEGORY_LABELS} />
    </div>
  );
}
