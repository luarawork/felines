// Small pill badge showing an article's depth level (1-5), color-coded
// so a reader can tell at a glance how introductory or advanced a piece
// of content is before clicking into it.
import type { ArticleLevel } from "@/lib/articles";

const LEVEL_STYLES: Record<ArticleLevel, { background: string; color: string }> = {
  1: { background: "#F9F6F2", color: "#6B6B6B" },
  2: { background: "#F9F6F2", color: "#6B6B6B" },
  3: { background: "#FEF0EB", color: "#C4704F" },
  4: { background: "#F0F7F0", color: "#6B8F6A" },
  5: { background: "#F0F7F0", color: "#6B8F6A" },
};

export default function ArticleLevelBadge({ level }: { level: ArticleLevel }) {
  const style = LEVEL_STYLES[level];
  return (
    <span
      className="inline-block rounded-full px-2 py-1 text-xs font-medium"
      style={{ background: style.background, color: style.color }}
    >
      Nível {level}
    </span>
  );
}
