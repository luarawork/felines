// The actual /resources board: auth-gated (redirects to /login like
// /reports does), two tabs (Available/Needed), a post form, and
// "I'm interested"/"Exchanged ✓" actions per card.
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import { RESOURCE_CATEGORIES, getResourceCategoryIcon, getResourceCategoryLabel } from "@/lib/resourceTypes";
import EmptyState from "@/components/EmptyState";

type ResourcePost = {
  id: string;
  created_by: string;
  type: "offering" | "requesting";
  category: string;
  title: string;
  description: string;
  location_hint: string | null;
  status: "open" | "resolved";
  created_at: string;
  authorName: string;
};

function timeAgo(dateString: string): string {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days >= 1) return `${days} ${days === 1 ? "dia" : "dias"} atrás`;
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours >= 1) return `${hours} ${hours === 1 ? "hora" : "horas"} atrás`;
  return "agora mesmo";
}

export default function ResourcesBoard() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [posts, setPosts] = useState<ResourcePost[]>([]);
  const [activeTab, setActiveTab] = useState<"offering" | "requesting">("offering");
  const [respondedIds, setRespondedIds] = useState<Set<string>>(new Set());
  const [showForm, setShowForm] = useState(false);

  const [postType, setPostType] = useState<"offering" | "requesting" | null>(null);
  const [category, setCategory] = useState(RESOURCE_CATEGORIES[0].value);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [locationHint, setLocationHint] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: sessionData } = await supabase.auth.getSession();
      setSession(sessionData.session);
      setCheckingSession(false);

      if (!sessionData.session) {
        router.push("/login?returnTo=/resources");
        return;
      }

      const { data: postRows } = await supabase
        .from("resource_posts")
        .select("id, created_by, type, category, title, description, location_hint, status, created_at")
        .eq("status", "open")
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false });

      const authorIds = Array.from(new Set((postRows ?? []).map((row) => row.created_by)));
      const { data: profiles } =
        authorIds.length > 0
          ? await supabase.from("profiles").select("id, display_name").in("id", authorIds)
          : { data: [] };

      setPosts(
        (postRows ?? []).map((row) => ({
          ...row,
          authorName: (profiles ?? []).find((p) => p.id === row.created_by)?.display_name || "Alguém da comunidade",
        }))
      );
    }

    load();
  }, [router]);

  async function handleSubmit(formEvent: React.FormEvent) {
    formEvent.preventDefault();
    setError(null);

    if (!postType) {
      setError("Escolha se você está oferecendo ou procurando algo.");
      return;
    }
    if (!title.trim() || !description.trim()) {
      setError("Preencha o título e a descrição.");
      return;
    }
    if (!session) return;

    setSubmitting(true);
    const { data: newPost, error: insertError } = await supabase
      .from("resource_posts")
      .insert({
        created_by: session.user.id,
        type: postType,
        category,
        title: title.trim(),
        description: description.trim(),
        location_hint: locationHint.trim() || null,
      })
      .select("id, created_by, type, category, title, description, location_hint, status, created_at")
      .single();
    setSubmitting(false);

    if (insertError || !newPost) {
      setError("O anúncio não foi publicado. Tenta de novo?");
      return;
    }

    setPosts((previous) => [
      { ...newPost, authorName: "Você" },
      ...previous,
    ]);
    setTitle("");
    setDescription("");
    setLocationHint("");
    setPostType(null);
    setShowForm(false);
  }

  async function handleRespond(postId: string) {
    await supabase.rpc("respond_to_resource_post", { p_resource_post_id: postId });
    setRespondedIds((previous) => new Set(previous).add(postId));
  }

  async function handleResolve(postId: string) {
    await supabase.from("resource_posts").update({ status: "resolved" }).eq("id", postId);
    setPosts((previous) => previous.filter((post) => post.id !== postId));
  }

  if (checkingSession || !session) return null;

  const filteredPosts = posts.filter((post) => post.type === activeTab);

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("offering")}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium ${
              activeTab === "offering"
                ? "border-felines-accent text-felines-accent-hover"
                : "border-felines-border text-felines-text-secondary"
            }`}
          >
            Disponível
          </button>
          <button
            onClick={() => setActiveTab("requesting")}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium ${
              activeTab === "requesting"
                ? "border-felines-accent text-felines-accent-hover"
                : "border-felines-border text-felines-text-secondary"
            }`}
          >
            Procurado
          </button>
        </div>
        <button
          onClick={() => setShowForm((previous) => !previous)}
          className="rounded-full bg-felines-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-felines-accent-hover"
        >
          {showForm ? "Cancelar" : "+ Publicar anúncio"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-4 space-y-3 rounded-xl border border-felines-border bg-felines-surface p-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPostType("offering")}
              className={`rounded-full border px-3 py-1 text-xs font-medium ${
                postType === "offering"
                  ? "border-felines-accent bg-felines-accent-light text-felines-text-primary"
                  : "border-felines-border text-felines-text-secondary"
              }`}
            >
              Estou oferecendo
            </button>
            <button
              type="button"
              onClick={() => setPostType("requesting")}
              className={`rounded-full border px-3 py-1 text-xs font-medium ${
                postType === "requesting"
                  ? "border-felines-accent bg-felines-accent-light text-felines-text-primary"
                  : "border-felines-border text-felines-text-secondary"
              }`}
            >
              Estou procurando
            </button>
          </div>

          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="w-full rounded-md border border-felines-border bg-white px-3 py-2 text-sm"
          >
            {RESOURCE_CATEGORIES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.icon} {option.label}
              </option>
            ))}
          </select>

          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Título"
            maxLength={60}
            className="w-full rounded-md border border-felines-border bg-white px-3 py-2 text-sm"
          />

          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Descrição"
            maxLength={200}
            rows={3}
            className="w-full rounded-md border border-felines-border bg-white px-3 py-2 text-sm"
          />

          <input
            type="text"
            value={locationHint}
            onChange={(event) => setLocationHint(event.target.value)}
            placeholder="Bairro (nunca endereço exato)"
            maxLength={60}
            className="w-full rounded-md border border-felines-border bg-white px-3 py-2 text-sm"
          />

          {error && <p role="alert" className="text-sm text-felines-emergency">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-felines-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-felines-accent-hover disabled:opacity-50"
          >
            {submitting ? "Publicando..." : "Publicar"}
          </button>
        </form>
      )}

      {filteredPosts.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            main="Nada aqui ainda. Seja a primeira pessoa a oferecer ou procurar algo."
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {filteredPosts.map((post) => (
            <div key={post.id} className="rounded-2xl border border-felines-border bg-felines-surface p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-[0.1em] text-felines-accent-hover">
                  {getResourceCategoryIcon(post.category)}{" "}
                  {post.type === "offering" ? "Oferecendo" : "Procurando"}
                </span>
                <span className="text-xs text-felines-text-secondary">{timeAgo(post.created_at)}</span>
              </div>
              <p className="mt-2 font-semibold text-felines-text-primary">{post.title}</p>
              <p className="text-xs text-felines-text-secondary">{getResourceCategoryLabel(post.category)}</p>
              <p className="mt-1 text-sm text-felines-text-secondary">{post.description}</p>
              {post.location_hint && (
                <p className="mt-1 text-xs text-felines-text-secondary">📍 {post.location_hint}</p>
              )}
              <p className="mt-2 text-xs text-felines-text-secondary">
                Publicado por{" "}
                <Link href={`/u/${post.created_by}`} className="text-felines-accent-hover">
                  {post.authorName}
                </Link>
              </p>
              <div className="mt-3 flex gap-3">
                {post.created_by === session.user.id ? (
                  <button
                    onClick={() => handleResolve(post.id)}
                    className="rounded-full bg-felines-success px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
                  >
                    Trocado ✓
                  </button>
                ) : (
                  <button
                    onClick={() => handleRespond(post.id)}
                    disabled={respondedIds.has(post.id)}
                    className="rounded-full border border-felines-accent px-3 py-1.5 text-xs font-medium text-felines-accent transition-colors hover:bg-felines-accent hover:text-white disabled:opacity-50"
                  >
                    {respondedIds.has(post.id) ? "Interesse enviado ✓" : "Tenho interesse"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
