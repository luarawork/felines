"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import type { ContactRow } from "@/app/contacts/page";
import { useLanguage } from "@/lib/i18n";

const CATEGORY_VALUES = ["vet", "shelter", "ngo", "rescue", "transport", "legal", "general"] as const;

type ContactFormValues = {
  city: string;
  name: string;
  phone: string;
  email: string;
  social: string;
  category: string;
  notes: string;
};

const EMPTY_FORM: ContactFormValues = {
  city: "",
  name: "",
  phone: "",
  email: "",
  social: "",
  category: "general",
  notes: "",
};

export default function ContactsBoard({
  initialByCity,
  categoryLabels,
}: {
  initialByCity: Record<string, ContactRow[]>;
  categoryLabels: Record<string, { label: string; emoji: string }>;
}) {
  const { t } = useLanguage();
  const [session, setSession] = useState<Session | null>(null);
  const [byCity, setByCity] = useState(initialByCity);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<ContactFormValues>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterCity, setFilterCity] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ContactFormValues>(EMPTY_FORM);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
  }, []);

  function categoryFor(category: string) {
    const catMeta = categoryLabels[category] ?? { label: category, emoji: "📋" };
    const translatedLabel = t(`contacts.categories.${category}`);
    return {
      ...catMeta,
      label: translatedLabel.startsWith("contacts.categories.") ? catMeta.label : translatedLabel,
    };
  }

  const cities = Object.keys(byCity).sort();
  const filteredCities = filterCity
    ? cities.filter((c) => c.toLowerCase().includes(filterCity.toLowerCase()))
    : cities;

  function contactsForCity(cityName: string) {
    const contacts = byCity[cityName] ?? [];
    return filterCategory ? contacts.filter((c) => c.category === filterCategory) : contacts;
  }

  const hasAnyVisibleContact = filteredCities.some((cityName) => contactsForCity(cityName).length > 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.city.trim() || !form.name.trim()) {
      setError(t("contacts.validationError"));
      return;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      setError(t("contacts.loginRequired"));
      return;
    }

    setSubmitting(true);
    const { data: newRow, error: insertError } = await supabase
      .from("community_contacts")
      .insert({
        city: form.city.trim(),
        name: form.name.trim(),
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        social: form.social.trim() || null,
        category: form.category,
        notes: form.notes.trim() || null,
        created_by: sessionData.session.user.id,
      })
      .select("id, city, name, phone, email, social, category, notes, created_at, created_by")
      .single();

    setSubmitting(false);

    if (insertError || !newRow) {
      setError(t("contacts.insertError"));
      return;
    }

    const contact = newRow as ContactRow;
    setByCity((prev) => {
      const next = { ...prev };
      if (!next[contact.city]) next[contact.city] = [];
      next[contact.city] = [contact, ...next[contact.city]];
      return next;
    });

    setForm(EMPTY_FORM);
    setFormOpen(false);
  }

  function startEdit(contact: ContactRow) {
    setEditingId(contact.id);
    setEditError(null);
    setEditForm({
      city: contact.city,
      name: contact.name,
      phone: contact.phone ?? "",
      email: contact.email ?? "",
      social: contact.social ?? "",
      category: contact.category,
      notes: contact.notes ?? "",
    });
  }

  async function handleSaveEdit(originalCity: string, contactId: string) {
    if (!editForm.city.trim() || !editForm.name.trim()) {
      setEditError(t("contacts.validationError"));
      return;
    }

    setEditSubmitting(true);
    const { data: updatedRow, error: updateError } = await supabase
      .from("community_contacts")
      .update({
        city: editForm.city.trim(),
        name: editForm.name.trim(),
        phone: editForm.phone.trim() || null,
        email: editForm.email.trim() || null,
        social: editForm.social.trim() || null,
        category: editForm.category,
        notes: editForm.notes.trim() || null,
      })
      .eq("id", contactId)
      .select("id, city, name, phone, email, social, category, notes, created_at, created_by")
      .single();
    setEditSubmitting(false);

    if (updateError || !updatedRow) {
      setEditError(t("contacts.updateError"));
      return;
    }

    const updated = updatedRow as ContactRow;
    setByCity((prev) => {
      const next = { ...prev };
      // The city may have changed — remove from the old group first.
      next[originalCity] = (next[originalCity] ?? []).filter((c) => c.id !== contactId);
      if (!next[updated.city]) next[updated.city] = [];
      next[updated.city] = [updated, ...next[updated.city].filter((c) => c.id !== contactId)];
      return next;
    });
    setEditingId(null);
  }

  async function handleDelete(cityName: string, contactId: string) {
    if (!confirm(t("contacts.deleteConfirm"))) return;

    const { error: deleteError } = await supabase.from("community_contacts").delete().eq("id", contactId);
    if (deleteError) {
      setError(t("contacts.deleteError"));
      return;
    }

    setByCity((prev) => {
      const next = { ...prev };
      next[cityName] = (next[cityName] ?? []).filter((c) => c.id !== contactId);
      return next;
    });
  }

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          aria-label={t("contacts.filterCityAriaLabel")}
          placeholder={t("contacts.filterPlaceholder")}
          value={filterCity}
          onChange={(e) => setFilterCity(e.target.value)}
          className="w-full max-w-xs rounded-full border border-felines-border bg-white px-4 py-2 text-sm"
        />
        <select
          aria-label={t("contacts.categoryFilterAriaLabel")}
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="rounded-full border border-felines-border bg-white px-4 py-2 text-sm"
        >
          <option value="">{t("contacts.categoryFilterAll")}</option>
          {CATEGORY_VALUES.map((value) => {
            const cat = categoryFor(value);
            return (
              <option key={value} value={value}>
                {cat.emoji} {cat.label}
              </option>
            );
          })}
        </select>
        <button
          onClick={() => setFormOpen((prev) => !prev)}
          className="rounded-full bg-felines-accent px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-felines-accent-hover"
        >
          {formOpen ? t("contacts.cancelBtn") : t("contacts.newContactBtn")}
        </button>
      </div>

      {formOpen && (
        <form
          onSubmit={handleSubmit}
          className="mt-5 space-y-3 rounded-xl border border-felines-border bg-felines-surface p-6"
        >
          <h3 className="font-semibold text-felines-text-primary">{t("contacts.formTitle")}</h3>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-felines-text-secondary">
                {t("contacts.cityLabel")} <span className="text-felines-emergency">*</span>
              </label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
                maxLength={100}
                className="mt-1 w-full rounded-lg border border-felines-border bg-white px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-felines-text-secondary">
                {t("contacts.nameLabel")} <span className="text-felines-emergency">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                maxLength={150}
                className="mt-1 w-full rounded-lg border border-felines-border bg-white px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-felines-text-secondary">
                {t("contacts.phoneLabel")}
              </label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                maxLength={30}
                className="mt-1 w-full rounded-lg border border-felines-border bg-white px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-felines-text-secondary">
                {t("contacts.emailLabel")}
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                maxLength={200}
                className="mt-1 w-full rounded-lg border border-felines-border bg-white px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-felines-text-secondary">
                {t("contacts.socialLabel")}
              </label>
              <input
                type="text"
                value={form.social}
                onChange={(e) => setForm((prev) => ({ ...prev, social: e.target.value }))}
                maxLength={200}
                className="mt-1 w-full rounded-lg border border-felines-border bg-white px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-felines-text-secondary">
                {t("contacts.categoryLabel")}
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-felines-border bg-white px-3 py-2 text-sm"
              >
                {CATEGORY_VALUES.map((value) => {
                  const cat = categoryFor(value);
                  return (
                    <option key={value} value={value}>
                      {cat.emoji} {cat.label}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-felines-text-secondary">
              {t("contacts.notesLabel")}
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
              rows={2}
              maxLength={300}
              className="mt-1 w-full rounded-lg border border-felines-border bg-white px-3 py-2 text-sm"
            />
          </div>

          {error && <p role="alert" className="text-sm text-felines-emergency">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            aria-busy={submitting}
            className="rounded-full bg-felines-accent px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {submitting ? t("contacts.submitting") : t("contacts.submitBtn")}
          </button>
        </form>
      )}

      {filteredCities.length === 0 ? (
        <p className="mt-8 text-center text-sm text-felines-text-secondary">
          {t("contacts.empty")}
        </p>
      ) : !hasAnyVisibleContact ? (
        <p className="mt-8 text-center text-sm text-felines-text-secondary">
          {t("contacts.noResultsForFilter")}
        </p>
      ) : (
        <div className="mt-8 space-y-10">
          {filteredCities.map((cityName) => {
            const contacts = contactsForCity(cityName);
            if (contacts.length === 0) return null;

            return (
              <section key={cityName}>
                <h2 className="text-lg font-bold text-felines-text-primary">{cityName}</h2>
                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                  {contacts.map((contact) => {
                    const cat = categoryFor(contact.category);
                    const isOwn = session?.user.id === contact.created_by;
                    const isEditing = editingId === contact.id;

                    if (isEditing) {
                      return (
                        <div
                          key={contact.id}
                          className="space-y-2 rounded-xl border border-felines-accent bg-felines-surface p-4 text-sm sm:col-span-2"
                        >
                          <p className="font-semibold text-felines-text-primary">{t("contacts.editFormTitle")}</p>
                          <div className="grid gap-2 sm:grid-cols-2">
                            <input
                              type="text"
                              aria-label={t("contacts.cityLabel")}
                              value={editForm.city}
                              onChange={(e) => setEditForm((prev) => ({ ...prev, city: e.target.value }))}
                              placeholder={t("contacts.cityLabel")}
                              maxLength={100}
                              className="rounded-lg border border-felines-border bg-white px-3 py-2 text-sm"
                            />
                            <input
                              type="text"
                              aria-label={t("contacts.nameLabel")}
                              value={editForm.name}
                              onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                              placeholder={t("contacts.nameLabel")}
                              maxLength={150}
                              className="rounded-lg border border-felines-border bg-white px-3 py-2 text-sm"
                            />
                            <input
                              type="text"
                              aria-label={t("contacts.phoneLabel")}
                              value={editForm.phone}
                              onChange={(e) => setEditForm((prev) => ({ ...prev, phone: e.target.value }))}
                              placeholder={t("contacts.phoneLabel")}
                              maxLength={30}
                              className="rounded-lg border border-felines-border bg-white px-3 py-2 text-sm"
                            />
                            <input
                              type="email"
                              aria-label={t("contacts.emailLabel")}
                              value={editForm.email}
                              onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
                              placeholder={t("contacts.emailLabel")}
                              maxLength={200}
                              className="rounded-lg border border-felines-border bg-white px-3 py-2 text-sm"
                            />
                            <input
                              type="text"
                              aria-label={t("contacts.socialLabel")}
                              value={editForm.social}
                              onChange={(e) => setEditForm((prev) => ({ ...prev, social: e.target.value }))}
                              placeholder={t("contacts.socialLabel")}
                              maxLength={200}
                              className="rounded-lg border border-felines-border bg-white px-3 py-2 text-sm"
                            />
                            <select
                              aria-label={t("contacts.categoryLabel")}
                              value={editForm.category}
                              onChange={(e) => setEditForm((prev) => ({ ...prev, category: e.target.value }))}
                              className="rounded-lg border border-felines-border bg-white px-3 py-2 text-sm"
                            >
                              {CATEGORY_VALUES.map((value) => {
                                const c = categoryFor(value);
                                return (
                                  <option key={value} value={value}>
                                    {c.emoji} {c.label}
                                  </option>
                                );
                              })}
                            </select>
                          </div>
                          <textarea
                            aria-label={t("contacts.notesLabel")}
                            value={editForm.notes}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, notes: e.target.value }))}
                            placeholder={t("contacts.notesLabel")}
                            rows={2}
                            maxLength={300}
                            className="w-full rounded-lg border border-felines-border bg-white px-3 py-2 text-sm"
                          />
                          {editError && <p role="alert" className="text-sm text-felines-emergency">{editError}</p>}
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSaveEdit(cityName, contact.id)}
                              disabled={editSubmitting}
                              aria-busy={editSubmitting}
                              className="rounded-full bg-felines-accent px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                            >
                              {editSubmitting ? t("contacts.saving") : t("contacts.saveBtn")}
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="rounded-full border border-felines-border px-4 py-1.5 text-xs font-medium text-felines-text-secondary"
                            >
                              {t("contacts.cancelBtn")}
                            </button>
                          </div>
                        </div>
                      );
                    }

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
                          {contact.phone && <p>📞 {contact.phone}</p>}
                          {contact.email && <p>✉️ {contact.email}</p>}
                          {contact.social && <p>🌐 {contact.social}</p>}
                          {contact.notes && <p className="mt-1 text-xs">{contact.notes}</p>}
                        </div>
                        {isOwn && (
                          <div className="mt-3 flex gap-3">
                            <button
                              onClick={() => startEdit(contact)}
                              className="text-xs font-medium text-felines-accent hover:text-felines-accent-hover"
                            >
                              {t("contacts.edit")}
                            </button>
                            <button
                              onClick={() => handleDelete(cityName, contact.id)}
                              className="text-xs font-medium text-felines-emergency hover:opacity-80"
                            >
                              {t("contacts.delete")}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
