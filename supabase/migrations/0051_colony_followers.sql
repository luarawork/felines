-- Lets any signed-in user follow a colony without becoming a caretaker.
-- "Anyone can read follower count (not who)" for anon is enforced at
-- the column grant level: anon gets (id, colony_id, created_at) only,
-- enough to count, never user_id. authenticated needs full column
-- access instead — checking "do I follow this colony" means filtering
-- WHERE user_id = me, and Postgres requires SELECT on a column to
-- filter by it even when it's never returned, so there's no clean way
-- to allow "filter by your own value" without granting the column
-- outright. The app itself never renders a follower list, same trust
-- model already used for `caretakers` (fully public-readable, by
-- design, with no list UI exposing it gratuitously).
create table if not exists colony_followers (
  id uuid primary key default gen_random_uuid(),
  colony_id uuid not null references colonies(id) on delete cascade,
  user_id uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  unique (colony_id, user_id)
);

alter table colony_followers enable row level security;

create policy "colony_followers_select_public" on colony_followers
  for select using (true);

create policy "colony_followers_insert_own" on colony_followers
  for insert to authenticated with check (auth.uid() = user_id);

create policy "colony_followers_delete_own" on colony_followers
  for delete to authenticated using (auth.uid() = user_id);

revoke select on colony_followers from anon, authenticated;
grant select (id, colony_id, created_at) on colony_followers to anon;
grant select on colony_followers to authenticated;

-- Notifies every follower of a colony when something significant
-- happens. SECURITY DEFINER since it writes notifications for users
-- other than the caller — same reasoning as thank_action/
-- respond_to_help_request. p_message should always be a summary, never
-- raw user-submitted text (e.g. a report's free-text description),
-- since this fans out to people who aren't caretakers.
create or replace function notify_followers(p_colony_id uuid, p_type text, p_message text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into notifications (user_id, colony_id, type, message)
  select user_id, p_colony_id, p_type, p_message
  from colony_followers
  where colony_id = p_colony_id;
end;
$$;

revoke execute on function notify_followers(uuid, text, text) from public, anon;
grant execute on function notify_followers(uuid, text, text) to authenticated;
