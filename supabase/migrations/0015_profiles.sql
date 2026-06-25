-- Public-safe user profiles, used to show a caretaker's display name on
-- colony pages and on a public caretaker page, without ever exposing
-- auth.users data (email, etc.) through the API.
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "profiles_select_public" on profiles
  for select using (true);

create policy "profiles_insert_own" on profiles
  for insert to authenticated with check (auth.uid() = id);

create policy "profiles_update_own" on profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
