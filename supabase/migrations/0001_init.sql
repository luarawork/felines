-- Felines initial schema and Row Level Security policies.
-- Run this file in the Supabase SQL Editor (Project > SQL Editor > New query)
-- for project oyncjimmwgyxvkmdqxpv.

create extension if not exists "pgcrypto";

-- =========================================================
-- Tables
-- =========================================================

create table if not exists colonies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  narrative text,
  latitude float,
  longitude float,
  latitude_blurred float,
  longitude_blurred float,
  castration_status text not null default 'none'
    check (castration_status in ('none', 'partial', 'full')),
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);

create table if not exists cats (
  id uuid primary key default gen_random_uuid(),
  colony_id uuid not null references colonies(id) on delete cascade,
  name text,
  photo_url text,
  castrated boolean not null default false,
  last_seen timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists caretakers (
  id uuid primary key default gen_random_uuid(),
  colony_id uuid not null references colonies(id) on delete cascade,
  user_id uuid not null references auth.users(id),
  letter text,
  created_at timestamptz not null default now()
);

create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  colony_id uuid references colonies(id) on delete set null,
  type text not null check (type in (
    'no_food_water', 'injured_sick', 'new_kitten', 'missing_cat',
    'suspected_poisoning', 'suspected_abuse', 'disease_outbreak',
    'threat_to_colony', 'sighting'
  )),
  description text,
  photo_url text,
  latitude float,
  longitude float,
  status text not null default 'open' check (status in ('open', 'resolved')),
  confirmations int not null default 0,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);

create table if not exists timeline_events (
  id uuid primary key default gen_random_uuid(),
  colony_id uuid not null references colonies(id) on delete cascade,
  event_type text not null,
  description text,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);

create table if not exists feedings (
  id uuid primary key default gen_random_uuid(),
  colony_id uuid not null references colonies(id) on delete cascade,
  user_id uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists knowledge_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  article_slug text not null,
  read_at timestamptz not null default now()
);

-- =========================================================
-- Row Level Security
-- =========================================================

alter table colonies enable row level security;
alter table cats enable row level security;
alter table caretakers enable row level security;
alter table reports enable row level security;
alter table timeline_events enable row level security;
alter table feedings enable row level security;
alter table knowledge_progress enable row level security;

-- ---------------------------------------------------------
-- colonies
-- Anyone can read general colony info, but exact lat/long are only
-- meant to be relied on by linked caretakers (enforced at the app layer
-- by selecting latitude_blurred/longitude_blurred for anonymous users).
-- Only authenticated users can create colonies; only the creator or a
-- linked caretaker can update it.
-- ---------------------------------------------------------
create policy "colonies_select_public" on colonies
  for select using (true);

create policy "colonies_insert_authenticated" on colonies
  for insert to authenticated with check (auth.uid() = created_by);

create policy "colonies_update_caretaker" on colonies
  for update to authenticated using (
    auth.uid() = created_by
    or exists (
      select 1 from caretakers
      where caretakers.colony_id = colonies.id
      and caretakers.user_id = auth.uid()
    )
  );

-- RLS is row-level, not column-level, so the public select policy above
-- would expose exact latitude/longitude to anyone via `select *`. To keep
-- exact coordinates restricted to linked caretakers, the app must only
-- request latitude_blurred/longitude_blurred for anonymous map views, and
-- use this function (which checks the caretaker link server-side) to read
-- exact coordinates.
create or replace function get_colony_exact_location(p_colony_id uuid)
returns table (latitude float, longitude float)
language sql
security definer
set search_path = public
as $$
  select c.latitude, c.longitude
  from colonies c
  where c.id = p_colony_id
  and (
    c.created_by = auth.uid()
    or exists (
      select 1 from caretakers
      where caretakers.colony_id = c.id
      and caretakers.user_id = auth.uid()
    )
  );
$$;

revoke all on function get_colony_exact_location(uuid) from public;
grant execute on function get_colony_exact_location(uuid) to authenticated;

-- ---------------------------------------------------------
-- cats
-- Public read (named cats are not sensitive); only linked caretakers
-- or the colony creator can manage them.
-- ---------------------------------------------------------
create policy "cats_select_public" on cats
  for select using (true);

create policy "cats_insert_caretaker" on cats
  for insert to authenticated with check (
    exists (
      select 1 from colonies
      where colonies.id = cats.colony_id
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

create policy "cats_update_caretaker" on cats
  for update to authenticated using (
    exists (
      select 1 from colonies
      where colonies.id = cats.colony_id
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

-- ---------------------------------------------------------
-- caretakers
-- Public read so the UI can show "who cares for this colony";
-- only authenticated users can link themselves as a caretaker.
-- ---------------------------------------------------------
create policy "caretakers_select_public" on caretakers
  for select using (true);

create policy "caretakers_insert_authenticated" on caretakers
  for insert to authenticated with check (auth.uid() = user_id);

-- ---------------------------------------------------------
-- reports
-- Anyone (including anonymous) can submit a report, since emergencies
-- must not require login. Only authenticated users can read full report
-- rows (e.g. status, confirmations); inserts are open to everyone.
-- ---------------------------------------------------------
create policy "reports_insert_public" on reports
  for insert with check (true);

create policy "reports_select_authenticated" on reports
  for select to authenticated using (true);

create policy "reports_update_authenticated" on reports
  for update to authenticated using (true);

-- ---------------------------------------------------------
-- timeline_events
-- Public read so visitors can see a colony's collective history;
-- only authenticated users (caretakers) can add new events.
-- ---------------------------------------------------------
create policy "timeline_events_select_public" on timeline_events
  for select using (true);

create policy "timeline_events_insert_authenticated" on timeline_events
  for insert to authenticated with check (auth.uid() = created_by);

-- ---------------------------------------------------------
-- feedings
-- Only authenticated users can log a feeding, and only their own.
-- ---------------------------------------------------------
create policy "feedings_select_authenticated" on feedings
  for select to authenticated using (true);

create policy "feedings_insert_authenticated" on feedings
  for insert to authenticated with check (auth.uid() = user_id);

-- ---------------------------------------------------------
-- knowledge_progress
-- Private to each user: only the owner can read or write their progress.
-- ---------------------------------------------------------
create policy "knowledge_progress_select_own" on knowledge_progress
  for select to authenticated using (auth.uid() = user_id);

create policy "knowledge_progress_insert_own" on knowledge_progress
  for insert to authenticated with check (auth.uid() = user_id);
