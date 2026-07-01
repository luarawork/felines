-- Security gap found during audit: 0043_care_streak.sql's own comment
-- says streaks are "Deliberately personal — never exposed on a public
-- profile or any leaderboard, just a private motivation signal shown
-- to the user themselves on /profile" — but no column-level grant was
-- ever added to actually enforce that. profiles_select_public
-- (`for select using (true)`, from 0015_profiles.sql) is a row policy,
-- not a column policy, so it happily returns current_streak,
-- longest_streak, and last_action_date to anyone, including anon,
-- for every user_id. Confirmed live: an anonymous curl request against
-- /rest/v1/profiles?select=id,current_streak,longest_streak,last_action_date
-- returns another user's real streak data with no auth at all.
--
-- Fix: same pattern already used for colonies' exact lat/lng (0016) and
-- colony_followers' user_id (0051) — revoke table-wide SELECT and grant
-- back an explicit column list per role. `id` and `display_name` (and
-- avatar_url, added in 0033) stay public since those are the intended
-- public-profile fields; the three streak columns become
-- authenticated-and-self only, enforced via a security-definer RPC
-- rather than a row policy (row policies can't express "only this row's
-- streak columns, but other columns of the same row stay public" —
-- that's exactly the column vs. row distinction the comment in 0016
-- already documents).

revoke select on profiles from anon, authenticated;

-- Public-safe columns: anyone can still see a caretaker's display name
-- and avatar on colony pages / public profile pages, same as before.
grant select (id, display_name, avatar_url, created_at) on profiles to anon, authenticated;

-- Streak columns: readable only by the profile's own owner, via RPC
-- rather than a raw column grant (a column grant has no way to also
-- require auth.uid() = id — it either allows the column for the whole
-- role or it doesn't).
create or replace function get_own_streak()
returns table (current_streak int, longest_streak int, last_action_date date)
language sql
security definer
set search_path = public
stable
as $$
  select p.current_streak, p.longest_streak, p.last_action_date
  from profiles p
  where p.id = auth.uid();
$$;

revoke all on function get_own_streak() from public;
grant execute on function get_own_streak() to authenticated;
