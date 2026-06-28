-- Personal care streak: consecutive days a caretaker performs a caring
-- action (feeding/water check-in, "I saw this cat today", or a timeline
-- event) on a colony they actually caretake. Deliberately personal —
-- never exposed on a public profile or any leaderboard, just a private
-- motivation signal shown to the user themselves on /profile.
alter table profiles add column if not exists current_streak int not null default 0;
alter table profiles add column if not exists longest_streak int not null default 0;
alter table profiles add column if not exists last_action_date date;

-- Call this after any caring action. It's a no-op (no error, no change)
-- if the caller isn't actually a caretaker/creator of p_colony_id —
-- streaks only count actions on colonies someone actively cares for,
-- not just any authenticated action anywhere.
create or replace function record_care_streak(p_colony_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_is_caretaker boolean;
  v_current_streak int;
  v_longest_streak int;
  v_last_action_date date;
  v_today date := current_date;
  v_new_streak int;
begin
  select
    exists (select 1 from colonies where id = p_colony_id and created_by = auth.uid())
    or exists (select 1 from caretakers where colony_id = p_colony_id and user_id = auth.uid())
  into v_is_caretaker;

  if not v_is_caretaker then
    return;
  end if;

  select current_streak, longest_streak, last_action_date
  into v_current_streak, v_longest_streak, v_last_action_date
  from profiles
  where id = auth.uid();

  if v_last_action_date = v_today then
    -- Already counted an action today — same day, no change (per spec).
    return;
  elsif v_last_action_date = v_today - 1 then
    v_new_streak := coalesce(v_current_streak, 0) + 1;
  else
    v_new_streak := 1;
  end if;

  insert into profiles (id, current_streak, longest_streak, last_action_date)
  values (auth.uid(), v_new_streak, v_new_streak, v_today)
  on conflict (id) do update set
    current_streak = v_new_streak,
    longest_streak = greatest(coalesce(profiles.longest_streak, 0), v_new_streak),
    last_action_date = v_today;
end;
$$;

revoke all on function record_care_streak(uuid) from public;
grant execute on function record_care_streak(uuid) to authenticated;
