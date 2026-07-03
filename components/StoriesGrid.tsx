// Masonry-style wall of community stories, with a simple sort filter
// and an inline "read more" expand per card. The story list itself is
// fetched once server-side (app/stories/page.tsx) — filtering here is
// just re-sorting the same array client-side, no refetch needed.
"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { StoryWithMeta } from "@/app/stories/page";
import StoryHeartButton from "@/components/StoryHeartButton";
import { useLanguage } from "@/lib/i18n";

type SortMode = "all" | "recent" | "reactions";

function StoryCard({ story }: { story: StoryWithMeta }) {
  const { t, language } = useLanguage();
  const [expanded, setExpanded] = useState(false);
  const photo = story.photoUrl ?? story.colonyCoverPhotoUrl;
  const isLong = story.storyText.length > 180;
  const authorName = story.anonymous
    ? t("common.anonymousCaretaker")
    : story.authorDisplayName || t("colony.timeline.authorDefault");

  return (
    <div className="mb-4 break-inside-avoid rounded-2xl border border-felines-border bg-felines-surface p-4">
      {photo && (
        <div className="relative mb-3 h-40 w-full overflow-hidden rounded-xl">
          <Image src={photo} alt={story.title} fill className="object-cover" />
        </div>
      )}
      <p className="font-bold text-felines-text-primary">{story.title}</p>
      <p className={`mt-1.5 text-sm leading-relaxed text-felines-text-secondary ${expanded ? "" : "line-clamp-3"}`}>
        {story.storyText}
      </p>
      {isLong && (
        <button
          onClick={() => setExpanded((previous) => !previous)}
          className="mt-1 text-xs font-medium text-felines-accent-hover"
        >
          {expanded ? t("stories.showLess") : t("stories.readMore")}
        </button>
      )}
      <Link
        href={`/colony/${story.colonyId}`}
        className="mt-3 block text-sm font-medium text-felines-accent-hover"
      >
        {story.colonyName}
      </Link>
      <div className="mt-2 flex items-center justify-between text-xs text-felines-text-secondary">
        <span>
          {story.anonymous ? (
            authorName
          ) : (
            <Link href={`/u/${story.authorId}`} className="hover:text-felines-accent-hover">
              {authorName}
            </Link>
          )}{" "}
          · {new Date(story.createdAt).toLocaleDateString(language === "pt" ? "pt-BR" : "en-US")}
        </span>
        <StoryHeartButton storyId={story.id} initialCount={story.reactionCount} />
      </div>
    </div>
  );
}

export default function StoriesGrid({ stories }: { stories: StoryWithMeta[] }) {
  const { t } = useLanguage();
  const [sortMode, setSortMode] = useState<SortMode>("all");

  const SORT_OPTIONS: { value: SortMode; label: string }[] = [
    { value: "all", label: t("stories.sortAll") },
    { value: "recent", label: t("stories.sortRecent") },
    { value: "reactions", label: t("stories.sortReactions") },
  ];

  const sortedStories = useMemo(() => {
    if (sortMode === "reactions") {
      return [...stories].sort((a, b) => b.reactionCount - a.reactionCount);
    }
    // "all" and "recent" are both already in created_at-desc order from
    // the server query — no need to re-sort.
    return stories;
  }, [stories, sortMode]);

  return (
    <div>
      <div className="mt-6 flex gap-2">
        {SORT_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => setSortMode(option.value)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              sortMode === option.value
                ? "border-felines-accent text-felines-accent-hover"
                : "border-felines-border text-felines-text-secondary hover:border-felines-accent"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="mt-6 sm:columns-2">
        {sortedStories.map((story) => (
          <StoryCard key={story.id} story={story} />
        ))}
      </div>
    </div>
  );
}
