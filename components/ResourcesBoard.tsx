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
import { useLanguage } from "@/lib/i18n";

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

function timeAgo(dateString: string, t: (key: string) => string): string {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days >= 1)
    return (days === 1 ? t("timeAgo.daysAgo") : t("timeAgo.daysAgoPlural")).replace("{count}", String(days));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours >= 1)
    return (hours === 1 ? t("timeAgo.hoursAgo") : t("timeAgo.hoursAgoPlural")).replace("{count}", String(hours));
  return t("timeAgo.justNow");
}

export default function ResourcesBoard() {
  const router = useRouter();
  const { t } = useLanguage();
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
          authorName: (profiles ?? []).find((p) => p.id === row.created_by)?.display_name || t("colony.timeline.authorDefault"),
        }))
      );
    }

    load();
  }, [router, t]);

  async function handleSubmit(formEvent: React.FormEvent) {
    formEvent.preventDefault();
    setError(null);

    if (!postType) {
      setError(t("forms.resource.validationError"));
      return;
    }
    if (!title.trim() || !description.trim()) {
      setError(t("forms.resource.fieldsError"));
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
      setError(t("forms.resource.insertError"));
      return;
    }

    setPosts((previous) => [
      { ...newPost, authorName: t("common.you") },
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
            {t("forms.resource.offering")}
          </button>
          <button
            onClick={() => setActiveTab("requesting")}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium ${
              activeTab === "requesting"
                ? "border-felines-accent text-felines-accent-hover"
                : "border-felines-border text-felines-text-secondary"
            }`}
          >
            {t("forms.resource.requesting")}
          </button>
        </div>
        <button
          onClick={() => setShowForm((previous) => !previous)}
          className="rounded-full bg-felines-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-felines-accent-hover"
        >
          {showForm ? t("forms.resource.cancelNew") : t("forms.resource.new")}
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
              {t("forms.resource.offering_action")}
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
              {t("forms.resource.requesting_action")}
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
            placeholder={t("forms.resource.titlePlaceholder")}
            maxLength={60}
            className="w-full rounded-md border border-felines-border bg-white px-3 py-2 text-sm"
          />

          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder={t("forms.resource.descPlaceholder")}
            maxLength={200}
            rows={3}
            className="w-full rounded-md border border-felines-border bg-white px-3 py-2 text-sm"
          />

          <input
            type="text"
            value={locationHint}
            onChange={(event) => setLocationHint(event.target.value)}
            placeholder={t("forms.resource.locationPlaceholder")}
            maxLength={60}
            className="w-full rounded-md border border-felines-border bg-white px-3 py-2 text-sm"
          />

          {error && <p role="alert" className="text-sm text-felines-emergency">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            aria-busy={submitting}
            className="rounded-full bg-felines-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-felines-accent-hover disabled:opacity-50"
          >
            {submitting ? t("forms.resource.submitting") : t("forms.resource.submit")}
          </button>
        </form>
      )}

      {filteredPosts.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            main={t("forms.resource.noResults")}
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {filteredPosts.map((post) => (
            <div key={post.id} className="rounded-2xl border border-felines-border bg-felines-surface p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-[0.1em] text-felines-accent-hover">
                  {getResourceCategoryIcon(post.category)}{" "}
                  {post.type === "offering" ? t("forms.resource.offering") : t("forms.resource.requesting")}
                </span>
                <span className="text-xs text-felines-text-secondary">{timeAgo(post.created_at, t)}</span>
              </div>
              <p className="mt-2 font-semibold text-felines-text-primary">{post.title}</p>
              <p className="text-xs text-felines-text-secondary">{getResourceCategoryLabel(post.category)}</p>
              <p className="mt-1 text-sm text-felines-text-secondary">{post.description}</p>
              {post.location_hint && (
                <p className="mt-1 text-xs text-felines-text-secondary">📍 {post.location_hint}</p>
              )}
              <p className="mt-2 text-xs text-felines-text-secondary">
                {t("forms.resource.postedBy")}{" "}
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
                    {t("forms.resource.exchanged")}
                  </button>
                ) : (
                  <button
                    onClick={() => handleRespond(post.id)}
                    disabled={respondedIds.has(post.id)}
                    className="rounded-full border border-felines-accent px-3 py-1.5 text-xs font-medium text-felines-accent transition-colors hover:bg-felines-accent hover:text-white disabled:opacity-50"
                  >
                    {respondedIds.has(post.id) ? t("forms.resource.interestSent") : t("forms.resource.interested")}
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
