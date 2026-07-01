// Trigger + modal for a linked caretaker to share a short story about
// their colony on the public /stories wall. Gated by canManage, same
// pattern as EditColonyButton — only visible to whoever actually
// caretakes this colony.
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useColonyAccessContext } from "@/components/ColonyAccessProvider";
import { useEscapeToClose } from "@/lib/useEscapeToClose";
import { buildSafeStoragePath, validatePhotoFile } from "@/lib/storage";
import PhotoUploadButton from "@/components/PhotoUploadButton";

export default function ShareStoryButton({ colonyId }: { colonyId: string }) {
  const router = useRouter();
  const { session, canManage, checkingAccess } = useColonyAccessContext();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [storyText, setStoryText] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEscapeToClose(open, () => setOpen(false));

  async function handleSubmit(formEvent: React.FormEvent) {
    formEvent.preventDefault();
    setError(null);

    if (!title.trim() || !storyText.trim()) {
      setError("Preencha o título e a história antes de enviar.");
      return;
    }
    if (!session) return;

    setSubmitting(true);

    let photoUrl: string | null = null;
    if (photoFile) {
      const photoError = validatePhotoFile(photoFile);
      if (photoError) {
        setSubmitting(false);
        setError(photoError);
        return;
      }
      const filePath = buildSafeStoragePath(`stories/${colonyId}`, photoFile);
      const { error: uploadError } = await supabase.storage.from("colony-photos").upload(filePath, photoFile);
      if (uploadError) {
        setSubmitting(false);
        setError("A foto não subiu. Tenta de novo?");
        return;
      }
      photoUrl = supabase.storage.from("colony-photos").getPublicUrl(filePath).data.publicUrl;
    }

    const { error: insertError } = await supabase.from("colony_stories").insert({
      colony_id: colonyId,
      created_by: session.user.id,
      title: title.trim(),
      story_text: storyText.trim(),
      photo_url: photoUrl,
      anonymous: false,
    });

    setSubmitting(false);

    if (insertError) {
      setError("A história não foi enviada. Tenta de novo?");
      return;
    }

    setSubmitted(true);
    router.refresh();
  }

  if (checkingAccess || !canManage) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-full border border-felines-border px-4 py-2 text-sm font-medium text-felines-text-secondary transition-colors hover:border-felines-accent hover:text-felines-accent-hover"
      >
        Compartilhar uma história sobre essa colônia
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-story-title"
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-felines-background p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <h2 id="share-story-title" className="text-lg font-bold text-felines-text-primary">
                Compartilhar uma história
              </h2>
              <button
                onClick={() => setOpen(false)}
                aria-label="Fechar"
                className="flex h-11 w-11 flex-shrink-0 items-center justify-center text-xl leading-none text-felines-text-secondary hover:text-felines-text-primary"
              >
                ×
              </button>
            </div>

            {submitted ? (
              <div className="mt-4">
                <p className="rounded-lg border border-felines-success bg-felines-success/10 px-4 py-3 text-sm text-felines-success">
                  História publicada no mural! Valeu por compartilhar.
                </p>
                <button
                  onClick={() => setOpen(false)}
                  className="mt-3 text-sm font-medium text-felines-text-secondary hover:text-felines-text-primary"
                >
                  Fechar
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-4 space-y-3">
                <div>
                  <label htmlFor="story-title" className="block text-xs font-medium text-felines-text-secondary">
                    Título
                  </label>
                  <input
                    id="story-title"
                    type="text"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    maxLength={80}
                    className="mt-1 w-full rounded-md border border-felines-border bg-white px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="story-text" className="block text-xs font-medium text-felines-text-secondary">
                    A história
                  </label>
                  <textarea
                    id="story-text"
                    value={storyText}
                    onChange={(event) => setStoryText(event.target.value)}
                    maxLength={500}
                    rows={5}
                    placeholder="Um momento especial, uma transformação, um gato que foi adotado..."
                    className="mt-1 w-full rounded-md border border-felines-border bg-white px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-felines-text-secondary">
                    Foto (opcional)
                  </label>
                  <div className="mt-1">
                    <PhotoUploadButton label="Escolher foto" file={photoFile} onChange={setPhotoFile} />
                  </div>
                </div>

                {error && <p role="alert" className="text-sm text-felines-emergency">{error}</p>}

                <button
                  type="submit"
                  disabled={submitting}
                  aria-busy={submitting}
                  className="rounded-full bg-felines-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-felines-accent-hover disabled:opacity-50"
                >
                  {submitting ? "Enviando..." : "Publicar história"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
