// /reports route for Felines.
// Four tabs: community reports, resource exchange, community stories, and contacts.
// Stories and contacts are fetched here server-side so they render in the tab
// without a second full-page route.
import { createClient } from "@supabase/supabase-js";
import ReportsList from "@/components/ReportsList";
import ResourcesBoard from "@/components/ResourcesBoard";
import StoriesGrid from "@/components/StoriesGrid";
import ContactsBoard from "@/components/ContactsBoard";
import ReportsStoriesEmpty from "@/components/ReportsStoriesEmpty";
import ColonyTabs from "@/components/ColonyTabs";
import ReportsPageHeader from "@/components/ReportsPageHeader";
import type { StoryWithMeta } from "@/app/stories/page";
import { CATEGORY_LABELS } from "@/app/contacts/page";
import type { ContactRow } from "@/app/contacts/page";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const dynamic = "force-dynamic";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const defaultTabId =
    tab === "resources"
      ? "resources"
      : tab === "stories"
        ? "stories"
        : tab === "contacts"
          ? "contacts"
          : "reports";

  // Fetch stories and contacts in parallel
  const [{ data: storyRows }, { data: contactRows }] = await Promise.all([
    supabase
      .from("colony_stories")
      .select("id, colony_id, created_by, title, story_text, photo_url, anonymous, created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("community_contacts")
      .select("id, city, name, phone, email, social, category, notes, created_at")
      .order("city")
      .order("created_at", { ascending: false }),
  ]);

  let stories: StoryWithMeta[] = [];
  if (storyRows && storyRows.length > 0) {
    const colonyIds = Array.from(new Set(storyRows.map((row) => row.colony_id)));
    const authorIds = Array.from(new Set(storyRows.map((row) => row.created_by)));
    const storyIds = storyRows.map((row) => row.id);

    const [{ data: colonyRows }, { data: profileRows }, { data: reactionRows }] =
      await Promise.all([
        supabase.from("colonies").select("id, name, cover_photo_url").in("id", colonyIds),
        supabase.from("profiles").select("id, display_name").in("id", authorIds),
        supabase.from("story_reactions").select("story_id").in("story_id", storyIds),
      ]);

    const reactionCounts = new Map<string, number>();
    (reactionRows ?? []).forEach((row) => {
      reactionCounts.set(row.story_id, (reactionCounts.get(row.story_id) ?? 0) + 1);
    });

    stories = storyRows.map((row) => {
      const colony = (colonyRows ?? []).find((c) => c.id === row.colony_id);
      const profile = (profileRows ?? []).find((p) => p.id === row.created_by);
      return {
        id: row.id,
        colonyId: row.colony_id,
        colonyName: colony?.name ?? "Colônia",
        colonyCoverPhotoUrl: colony?.cover_photo_url ?? null,
        title: row.title,
        storyText: row.story_text,
        photoUrl: row.photo_url,
        anonymous: row.anonymous,
        authorId: row.created_by,
        authorDisplayName: row.anonymous ? null : profile?.display_name || null,
        createdAt: row.created_at,
        reactionCount: reactionCounts.get(row.id) ?? 0,
      };
    });
  }

  const contacts = (contactRows ?? []) as ContactRow[];
  const byCity = contacts.reduce<Record<string, ContactRow[]>>((acc, c) => {
    if (!acc[c.city]) acc[c.city] = [];
    acc[c.city].push(c);
    return acc;
  }, {});

  const storiesContent =
    stories.length === 0 ? <ReportsStoriesEmpty /> : <StoriesGrid stories={stories} />;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <ReportsPageHeader />
      <ColonyTabs
        defaultTabId={defaultTabId}
        tabs={[
          { id: "reports", label: "Relatos", labelKey: "reports.tabs.reports", content: <ReportsList /> },
          { id: "resources", label: "Troca de recursos", labelKey: "reports.tabs.resources", content: <ResourcesBoard /> },
          {
            id: "contacts",
            label: "Contatos",
            labelKey: "reports.tabs.contacts",
            content: <ContactsBoard initialByCity={byCity} categoryLabels={CATEGORY_LABELS} />,
          },
          { id: "stories", label: "Histórias", labelKey: "reports.tabs.stories", content: storiesContent },
        ]}
      />
    </div>
  );
}
