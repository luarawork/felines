-- Closes a real gap in the resource exchange feature: "I'm interested"
-- only ever sent the poster a generic notification with no way to know
-- WHO was interested, and public profiles had no contact method at all
-- — so there was genuinely no safe way for the two sides of an offer
-- to actually reach each other.
--
-- Fix, in two parts:
-- 1. Track each expression of interest in its own table, readable only
--    by the two people involved (the poster and whoever clicked
--    "interested"), so the poster can see who to reach out to and
--    click through to their public profile.
-- 2. Add an optional, user-controlled "public_contact" field to
--    profiles (WhatsApp, email, whatever the user chooses to share),
--    shown on /u/:id only when set — nothing is exposed unless the
--    user explicitly opts in by filling it out.

create table if not exists resource_post_interests (
  id uuid primary key default gen_random_uuid(),
  resource_post_id uuid not null references resource_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (resource_post_id, user_id)
);

alter table resource_post_interests enable row level security;

-- Visible only to the interested user themselves and to the post's
-- author — never a public list, since expressing interest in someone's
-- ration/equipment post isn't information either party necessarily
-- wants broadcast.
create policy "resource_post_interests_select_involved" on resource_post_interests
  for select to authenticated
  using (
    auth.uid() = user_id
    or auth.uid() = (select created_by from resource_posts where resource_posts.id = resource_post_id)
  );

-- No insert/update/delete policy: rows are only ever written by
-- respond_to_resource_post below (SECURITY DEFINER), same pattern as
-- notifications rows written by notify_caretakers/notify_followers.

create or replace function respond_to_resource_post(p_resource_post_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_created_by uuid;
begin
  select created_by into v_created_by from resource_posts where id = p_resource_post_id and status = 'open';

  if v_created_by is null or v_created_by = auth.uid() then
    return;
  end if;

  insert into resource_post_interests (resource_post_id, user_id)
  values (p_resource_post_id, auth.uid())
  on conflict (resource_post_id, user_id) do nothing;

  insert into notifications (user_id, colony_id, type, message)
  values (
    v_created_by,
    null,
    'resource_interest',
    'Alguém demonstrou interesse no seu anúncio de recursos. Veja quem foi na aba de recursos.'
  );
end;
$$;

revoke execute on function respond_to_resource_post(uuid) from public, anon;
grant execute on function respond_to_resource_post(uuid) to authenticated;

-- Optional public contact method, shown on /u/:id only when set.
alter table profiles add column if not exists public_contact text
  check (char_length(public_contact) <= 100);

grant select (id, display_name, avatar_url, created_at, public_contact) on profiles to anon, authenticated;
grant update (public_contact) on profiles to authenticated;
