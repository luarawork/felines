-- Thank-you system: an authenticated user can thank a specific
-- caretaker of a colony once. Recorded both as its own row (to enforce
-- "once per caretaker per colony") and as a timeline_events entry (so
-- it shows up in the colony's history like any other contribution).
create table if not exists thanks (
  id uuid primary key default gen_random_uuid(),
  colony_id uuid not null references colonies(id) on delete cascade,
  caretaker_user_id uuid not null references auth.users(id),
  sender_user_id uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  unique (colony_id, caretaker_user_id, sender_user_id)
);

alter table thanks enable row level security;

create policy "thanks_select_public" on thanks
  for select using (true);

create policy "thanks_insert_own" on thanks
  for insert to authenticated with check (auth.uid() = sender_user_id);

-- Flagging suspicious content: anyone (including anonymous) can flag a
-- colony or a report, same as reporting itself requires no account.
-- Flags are visible only to authenticated users for now — there's no
-- moderation UI yet, this just records them for later review.
create table if not exists flags (
  id uuid primary key default gen_random_uuid(),
  target_type text not null check (target_type in ('colony', 'report')),
  target_id uuid not null,
  reason text not null check (reason in ('fake_location', 'harmful_content', 'spam', 'other')),
  details text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

alter table flags enable row level security;

create policy "flags_insert_public" on flags
  for insert with check (true);

create policy "flags_select_authenticated" on flags
  for select to authenticated using (true);
