"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { ContactRow } from "@/app/contacts/page";

const CATEGORY_OPTIONS = [
  { value: "vet", label: "🏥 Clínica veterinária" },
  { value: "shelter", label: "🏠 Abrigo" },
  { value: "ngo", label: "🤝 ONG" },
  { value: "rescue", label: "🚨 Grupo de resgate" },
  { value: "transport", label: "🚗 Transporte de animais" },
  { value: "legal", label: "⚖️ Apoio jurídico" },
  { value: "general", label: "📋 Contato geral" },
];

export default function ContactsBoard({
  initialByCity,
  categoryLabels,
}: {
  initialByCity: Record<string, ContactRow[]>;
  categoryLabels: Record<string, { label: string; emoji: string }>;
}) {
  const [byCity, setByCity] = useState(initialByCity);
  const [formOpen, setFormOpen] = useState(false);
  const [city, setCity] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [social, setSocial] = useState("");
  const [category, setCategory] = useState("general");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterCity, setFilterCity] = useState<string>("");

  const cities = Object.keys(byCity).sort();

  const filteredCities = filterCity
    ? cities.filter((c) => c.toLowerCase().includes(filterCity.toLowerCase()))
    : cities;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!city.trim() || !name.trim()) {
      setError("Cidade e nome são obrigatórios.");
      return;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      setError("Você precisa estar logado para cadastrar um contato.");
      return;
    }

    setSubmitting(true);
    const { data: newRow, error: insertError } = await supabase
      .from("community_contacts")
      .insert({
        city: city.trim(),
        name: name.trim(),
        phone: phone.trim() || null,
        email: email.trim() || null,
        social: social.trim() || null,
        category,
        notes: notes.trim() || null,
        created_by: sessionData.session.user.id,
      })
      .select("id, city, name, phone, email, social, category, notes, created_at")
      .single();

    setSubmitting(false);

    if (insertError || !newRow) {
      setError("Não foi possível cadastrar o contato. Tenta de novo?");
      return;
    }

    const contact = newRow as ContactRow;
    setByCity((prev) => {
      const next = { ...prev };
      if (!next[contact.city]) next[contact.city] = [];
      next[contact.city] = [contact, ...next[contact.city]];
      return next;
    });

    setCity("");
    setName("");
    setPhone("");
    setEmail("");
    setSocial("");
    setCategory("general");
    setNotes("");
    setFormOpen(false);
  }

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Filtrar por cidade…"
          value={filterCity}
          onChange={(e) => setFilterCity(e.target.value)}
          className="w-full max-w-xs rounded-full border border-felines-border bg-white px-4 py-2 text-sm"
        />
        <button
          onClick={() => setFormOpen((prev) => !prev)}
          className="rounded-full bg-felines-accent px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-felines-accent-hover"
        >
          {formOpen ? "Cancelar" : "+ Cadastrar contato"}
        </button>
      </div>

      {formOpen && (
        <form
          onSubmit={handleSubmit}
          className="mt-5 space-y-3 rounded-xl border border-felines-border bg-felines-surface p-6"
        >
          <h3 className="font-semibold text-felines-text-primary">Novo contato</h3>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-felines-text-secondary">
                Cidade <span className="text-felines-emergency">*</span>
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                maxLength={100}
                className="mt-1 w-full rounded-lg border border-felines-border bg-white px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-felines-text-secondary">
                Nome / Organização <span className="text-felines-emergency">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={150}
                className="mt-1 w-full rounded-lg border border-felines-border bg-white px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-felines-text-secondary">
                Telefone / WhatsApp
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={30}
                className="mt-1 w-full rounded-lg border border-felines-border bg-white px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-felines-text-secondary">
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={200}
                className="mt-1 w-full rounded-lg border border-felines-border bg-white px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-felines-text-secondary">
                Rede social (Instagram, Facebook…)
              </label>
              <input
                type="text"
                value={social}
                onChange={(e) => setSocial(e.target.value)}
                maxLength={200}
                className="mt-1 w-full rounded-lg border border-felines-border bg-white px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-felines-text-secondary">
                Categoria
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 w-full rounded-lg border border-felines-border bg-white px-3 py-2 text-sm"
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-felines-text-secondary">
              Observações (horários, especialidade, etc.)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              maxLength={300}
              className="mt-1 w-full rounded-lg border border-felines-border bg-white px-3 py-2 text-sm"
            />
          </div>

          {error && <p className="text-sm text-felines-emergency">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-felines-accent px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {submitting ? "Salvando…" : "Cadastrar"}
          </button>
        </form>
      )}

      {filteredCities.length === 0 ? (
        <p className="mt-8 text-center text-sm text-felines-text-secondary">
          Nenhum contato cadastrado ainda. Seja o primeiro a adicionar um.
        </p>
      ) : (
        <div className="mt-8 space-y-10">
          {filteredCities.map((cityName) => (
            <section key={cityName}>
              <h2 className="text-lg font-bold text-felines-text-primary">{cityName}</h2>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                {byCity[cityName].map((contact) => {
                  const cat = categoryLabels[contact.category] ?? {
                    label: contact.category,
                    emoji: "📋",
                  };
                  return (
                    <div
                      key={contact.id}
                      className="rounded-xl border border-felines-border bg-felines-surface p-4 text-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-felines-text-primary">{contact.name}</p>
                        <span className="flex-shrink-0 rounded-full border border-felines-border px-2 py-0.5 text-xs text-felines-text-secondary">
                          {cat.emoji} {cat.label}
                        </span>
                      </div>
                      <div className="mt-2 space-y-0.5 text-felines-text-secondary">
                        {contact.phone && (
                          <p>📞 {contact.phone}</p>
                        )}
                        {contact.email && (
                          <p>✉️ {contact.email}</p>
                        )}
                        {contact.social && (
                          <p>🌐 {contact.social}</p>
                        )}
                        {contact.notes && (
                          <p className="mt-1 text-xs">{contact.notes}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
