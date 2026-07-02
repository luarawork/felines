// Lets a colony's creator or a linked caretaker manage its named cats:
// add a new cat (with optional photo), edit a cat's name/photo, toggle
// castration status, and remove a cat. Hidden entirely for visitors who
// aren't authorized to manage the colony — RLS would block the
// mutation anyway, but checking here avoids showing controls that would
// just fail.
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { buildSafeStoragePath, validatePhotoFile } from "@/lib/storage";
import { useColonyAccessContext } from "@/components/ColonyAccessProvider";
import PhotoUploadButton from "@/components/PhotoUploadButton";
import { useLanguage } from "@/lib/i18n";

type ManagedCat = {
  id: string;
  name: string | null;
  photo_url: string | null;
  castrated: boolean;
  last_seen: string | null;
};

// Uploads a cat photo and returns its public URL, or null if the file
// fails validation (wrong type, too large) or the upload itself fails.
async function uploadCatPhoto(colonyId: string, photoFile: File): Promise<string | null> {
  if (validatePhotoFile(photoFile)) return null;

  const filePath = buildSafeStoragePath(`cats/${colonyId}`, photoFile);
  const { error: uploadError } = await supabase.storage
    .from("colony-photos")
    .upload(filePath, photoFile);

  if (uploadError) return null;
  return supabase.storage.from("colony-photos").getPublicUrl(filePath).data.publicUrl;
}

export default function CatManager({ colonyId }: { colonyId: string }) {
  const router = useRouter();
  const { session, canManage, checkingAccess } = useColonyAccessContext();
  const { t } = useLanguage();

  const [cats, setCats] = useState<ManagedCat[]>([]);

  const [name, setName] = useState("");
  const [castrated, setCastrated] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhotoFile, setEditPhotoFile] = useState<File | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  // Loads the current cat list for management. Independent of the
  // access check above — the list itself is public-readable, only the
  // mutation controls are gated.
  useEffect(() => {
    async function loadCats() {
      const { data: catRows } = await supabase
        .from("cats")
        .select("id, name, photo_url, castrated, last_seen")
        .eq("colony_id", colonyId)
        .order("created_at", { ascending: false });

      if (catRows) setCats(catRows as ManagedCat[]);
    }

    loadCats();
  }, [colonyId]);

  // Adds a new cat to the colony, uploading the photo first if provided.
  async function handleAddCat(formEvent: React.FormEvent) {
    formEvent.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError(t("colony.catManager.nameRequired"));
      return;
    }
    if (!session) return;

    setSubmitting(true);

    let photoUrl: string | null = null;
    if (photoFile) {
      photoUrl = await uploadCatPhoto(colonyId, photoFile);
      if (!photoUrl) {
        setSubmitting(false);
        setError(t("colony.catManager.photoUploadError"));
        return;
      }
    }

    const { data: newCat, error: insertError } = await supabase
      .from("cats")
      .insert({
        colony_id: colonyId,
        name: name.trim(),
        castrated,
        photo_url: photoUrl,
        last_seen: new Date().toISOString(),
      })
      .select("id, name, photo_url, castrated, last_seen")
      .single();

    setSubmitting(false);

    if (insertError || !newCat) {
      setError(t("colony.catManager.addError"));
      return;
    }

    await supabase.from("timeline_events").insert({
      colony_id: colonyId,
      event_type: "new_cat",
      description: `${name.trim()} foi adicionado à colônia.`,
      created_by: session.user.id,
    });

    await supabase.rpc("notify_followers", {
      p_colony_id: colonyId,
      p_type: "new_cat",
      p_message: `${name.trim()} foi adicionado a uma colônia que você segue.`,
    });

    await supabase.rpc("recalculate_colony_health", { p_colony_id: colonyId });

    setCats((previous) => [newCat as ManagedCat, ...previous]);
    setName("");
    setCastrated(false);
    setPhotoFile(null);
    router.refresh();
  }

  // Toggles a cat's castration status.
  async function handleToggleCastrated(cat: ManagedCat) {
    const { error: updateError } = await supabase
      .from("cats")
      .update({ castrated: !cat.castrated })
      .eq("id", cat.id);

    if (updateError) {
      setError(t("colony.catManager.toggleError"));
      return;
    }

    // Only logged when turning castration ON, not off — this is what
    // powers the "Primeira castração" milestone card (ColonyMilestones),
    // which needs a real timestamp the cats table itself never tracked.
    if (!cat.castrated && session) {
      await supabase.from("timeline_events").insert({
        colony_id: colonyId,
        event_type: "cat_castrated",
        description: `${cat.name ?? "Um gato"} foi castrado.`,
        created_by: session.user.id,
      });
      await supabase.rpc("record_care_streak", { p_colony_id: colonyId });

      // Castration milestone: this toggle is the one that brings every
      // registered cat to castrated=true.
      const allNowCastrated = cats.every((item) => item.id === cat.id || item.castrated);
      if (allNowCastrated && cats.length > 0) {
        await supabase.rpc("notify_followers", {
          p_colony_id: colonyId,
          p_type: "castration_milestone",
          p_message: "Uma colônia que você segue agora está totalmente castrada!",
        });
      }
    }

    await supabase.rpc("recalculate_colony_health", { p_colony_id: colonyId });

    setCats((previous) =>
      previous.map((item) => (item.id === cat.id ? { ...item, castrated: !item.castrated } : item))
    );
    router.refresh();
  }

  // Marks a cat as seen right now, for quick day-to-day check-ins without
  // opening a full edit form.
  async function handleMarkSeenToday(catId: string) {
    const now = new Date().toISOString();
    const { error: updateError } = await supabase
      .from("cats")
      .update({ last_seen: now })
      .eq("id", catId);

    if (updateError) {
      setError(t("colony.catManager.seenError"));
      return;
    }

    await supabase.rpc("record_care_streak", { p_colony_id: colonyId });
    await supabase.rpc("recalculate_colony_health", { p_colony_id: colonyId });

    setCats((previous) =>
      previous.map((item) => (item.id === catId ? { ...item, last_seen: now } : item))
    );
    router.refresh();
  }

  // Removes a cat from the colony.
  async function handleRemoveCat(catId: string) {
    const catName = cats.find((c) => c.id === catId)?.name ?? t("colony.catManager.noName");
    if (!window.confirm(t("colony.catManager.removeConfirm").replace("{name}", catName))) return;
    const { error: deleteError } = await supabase.from("cats").delete().eq("id", catId);

    if (deleteError) {
      setError(t("colony.catManager.removeError"));
      return;
    }

    await supabase.rpc("recalculate_colony_health", { p_colony_id: colonyId });
    setCats((previous) => previous.filter((item) => item.id !== catId));
    router.refresh();
  }

  function startEditing(cat: ManagedCat) {
    setEditingCatId(cat.id);
    setEditName(cat.name ?? "");
    setEditPhotoFile(null);
    setError(null);
  }

  // Saves the name (always) and photo (only if a new one was chosen)
  // for the cat currently being edited.
  async function handleSaveEdit(catId: string) {
    if (!editName.trim()) {
      setError(t("colony.catManager.nameRequired"));
      return;
    }

    setSavingEdit(true);

    let photoUrl: string | undefined;
    if (editPhotoFile) {
      const uploadedUrl = await uploadCatPhoto(colonyId, editPhotoFile);
      if (!uploadedUrl) {
        setSavingEdit(false);
        setError(t("colony.catManager.editPhotoError"));
        return;
      }
      photoUrl = uploadedUrl;
    }

    const { error: updateError } = await supabase
      .from("cats")
      .update({ name: editName.trim(), ...(photoUrl ? { photo_url: photoUrl } : {}) })
      .eq("id", catId);

    setSavingEdit(false);

    if (updateError) {
      setError(t("colony.catManager.saveEditError"));
      return;
    }

    setCats((previous) =>
      previous.map((item) =>
        item.id === catId
          ? { ...item, name: editName.trim(), photo_url: photoUrl ?? item.photo_url }
          : item
      )
    );
    setEditingCatId(null);
    router.refresh();
  }

  if (checkingAccess || !canManage) return null;

  return (
    <section className="mt-10 rounded-xl border border-felines-border bg-felines-surface p-5">
      <h2 className="text-lg font-bold text-felines-text-primary">{t("colony.catManager.sectionTitle")}</h2>

      <form onSubmit={handleAddCat} className="mt-4 space-y-3">
        <div>
          <label htmlFor="new-cat-name" className="block text-xs font-medium text-felines-text-secondary">
            {t("colony.catManager.nameLabel")}
          </label>
          <input
            id="new-cat-name"
            type="text"
            value={name}
            onChange={(formEvent) => setName(formEvent.target.value)}
            maxLength={100}
            className="mt-1 w-full max-w-xs rounded-md border border-felines-border bg-white px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-felines-text-secondary">
            {t("colony.catManager.photoLabel")}
          </label>
          <div className="mt-1">
            <PhotoUploadButton label="Escolher foto" file={photoFile} onChange={setPhotoFile} />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-felines-text-secondary">
          <input
            type="checkbox"
            checked={castrated}
            onChange={(formEvent) => setCastrated(formEvent.target.checked)}
          />
          {t("colony.catManager.castrated")}
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-felines-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-felines-accent-hover disabled:opacity-50"
        >
          {submitting ? t("colony.catManager.addSubmitting") : t("colony.catManager.addSubmit")}
        </button>
      </form>

      {error && <p role="alert" className="mt-2 text-sm text-felines-emergency">{error}</p>}

      {cats.length > 0 && (
        <ul className="mt-5 space-y-2">
          {cats.map((cat) =>
            editingCatId === cat.id ? (
              <li
                key={cat.id}
                className="space-y-2 rounded-md border border-felines-accent px-3 py-3 text-sm"
              >
                <div>
                  <label
                    htmlFor={`edit-cat-name-${cat.id}`}
                    className="block text-xs font-medium text-felines-text-secondary"
                  >
                    {t("colony.catManager.editNameLabel")}
                  </label>
                  <input
                    id={`edit-cat-name-${cat.id}`}
                    type="text"
                    value={editName}
                    onChange={(formEvent) => setEditName(formEvent.target.value)}
                    maxLength={100}
                    className="mt-1 w-full max-w-xs rounded-md border border-felines-border bg-white px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-felines-text-secondary">
                    {t("colony.catManager.editPhotoLabel")}
                  </label>
                  <div className="mt-1">
                    <PhotoUploadButton
                      label="Escolher foto"
                      file={editPhotoFile}
                      onChange={setEditPhotoFile}
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleSaveEdit(cat.id)}
                    disabled={savingEdit}
                    className="rounded-full bg-felines-accent px-3 py-1 text-xs font-medium text-white disabled:opacity-50"
                  >
                    {savingEdit ? t("colony.catManager.savingEdit") : t("colony.catManager.saveEdit")}
                  </button>
                  <button
                    onClick={() => setEditingCatId(null)}
                    className="text-xs text-felines-text-secondary"
                  >
                    {t("common.cancel")}
                  </button>
                </div>
              </li>
            ) : (
              <li
                key={cat.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-felines-border px-3 py-2 text-sm"
              >
                <span className="font-medium text-felines-text-primary">
                  <Link
                    href={`/cat/${cat.id}`}
                    className="hover:text-felines-accent hover:underline"
                  >
                    {cat.name ?? t("colony.catManager.noName")}
                  </Link>
                  {cat.last_seen && (
                    <span className="ml-2 text-xs font-normal text-felines-text-secondary">
                      {t("colony.catManager.lastSeen")} {new Date(cat.last_seen).toLocaleDateString("pt-BR")}
                    </span>
                  )}
                </span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => startEditing(cat)}
                    className="text-felines-text-secondary hover:text-felines-accent"
                  >
                    {t("colony.catManager.edit")}
                  </button>
                  <button
                    onClick={() => handleMarkSeenToday(cat.id)}
                    className="text-felines-success hover:underline"
                  >
                    {t("colony.catManager.seenToday")}
                  </button>
                  <button
                    onClick={() => handleToggleCastrated(cat)}
                    className="text-felines-accent transition-colors hover:text-felines-accent-hover"
                  >
                    {cat.castrated ? t("colony.catManager.markNotCastrated") : t("colony.catManager.markCastrated")}
                  </button>
                  <button
                    onClick={() => handleRemoveCat(cat.id)}
                    className="text-felines-emergency hover:underline"
                  >
                    {t("colony.catManager.remove")}
                  </button>
                </div>
              </li>
            )
          )}
        </ul>
      )}
    </section>
  );
}
