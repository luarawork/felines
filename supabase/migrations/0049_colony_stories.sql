-- Community stories wall (/stories): short stories any linked caretaker
-- can share about their own colony, plus an anonymous-friendly heart
-- reaction — same "anyone can react, no account needed" pattern already
-- used for reports/flags.
create table if not exists colony_stories (
  id uuid primary key default gen_random_uuid(),
  colony_id uuid not null references colonies(id) on delete cascade,
  created_by uuid not null references auth.users(id),
  title text not null check (char_length(title) <= 80),
  story_text text not null check (char_length(story_text) <= 500),
  photo_url text,
  -- Display-only: the real author is always recorded in created_by for
  -- accountability/moderation — "anonymous" only controls whether the
  -- public wall shows their name or "Cuidador anônimo".
  anonymous boolean not null default false,
  created_at timestamptz not null default now()
);

alter table colony_stories enable row level security;

create policy "colony_stories_select_public" on colony_stories
  for select using (true);

create policy "colony_stories_insert_caretaker" on colony_stories
  for insert to authenticated with check (
    auth.uid() = created_by
    and exists (
      select 1 from colonies
      where colonies.id = colony_stories.colony_id
      and (
        colonies.created_by = auth.uid()
        or exists (
          select 1 from caretakers
          where caretakers.colony_id = colonies.id
          and caretakers.user_id = auth.uid()
        )
      )
    )
  );

create policy "colony_stories_delete_own" on colony_stories
  for delete to authenticated using (auth.uid() = created_by);

create table if not exists story_reactions (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references colony_stories(id) on delete cascade,
  user_id uuid references auth.users(id),
  created_at timestamptz not null default now()
);

-- Only enforces "one heart per signed-in user per story" — anonymous
-- reactions (user_id null) have no stable identity to deduplicate
-- against server-side; the client guards against obvious repeat clicks
-- via localStorage instead (a UI nicety, not a security boundary).
create unique index if not exists story_reactions_unique_user
  on story_reactions (story_id, user_id)
  where user_id is not null;

alter table story_reactions enable row level security;

create policy "story_reactions_select_public" on story_reactions
  for select using (true);

create policy "story_reactions_insert_public" on story_reactions
  for insert with check (true);
