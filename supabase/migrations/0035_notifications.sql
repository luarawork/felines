-- Notifications for caretakers — currently used for extreme weather
-- alerts (below 10°C or above 32°C) on colonies they care for. Rows are
-- created client-side (no scheduled job in this stack), so the insert
-- policy just enforces that a user can only create notifications for
-- themselves; de-duplication per day happens in application code.
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  colony_id uuid references colonies(id) on delete cascade,
  type text not null,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table notifications enable row level security;

create policy "notifications_select_own" on notifications
  for select to authenticated using (auth.uid() = user_id);

create policy "notifications_insert_own" on notifications
  for insert to authenticated with check (auth.uid() = user_id);

create policy "notifications_update_own" on notifications
  for update to authenticated using (auth.uid() = user_id);
