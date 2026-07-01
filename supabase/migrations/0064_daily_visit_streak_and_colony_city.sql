-- (1) Streak now advances just by the user visiting the app (logging in).
-- record_daily_visit() works exactly like record_care_streak() but has no
-- colony requirement — it is called from the /profile page on load so that
-- showing up daily is enough to maintain a streak.
create or replace function record_daily_visit()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_current_streak int;
  v_longest_streak int;
  v_last_action_date date;
  v_today date := current_date;
  v_new_streak int;
begin
  select current_streak, longest_streak, last_action_date
  into v_current_streak, v_longest_streak, v_last_action_date
  from profiles
  where id = auth.uid();

  if v_last_action_date = v_today then
    return; -- already counted today, nothing to do
  elsif v_last_action_date = v_today - 1 then
    v_new_streak := coalesce(v_current_streak, 0) + 1;
  else
    v_new_streak := 1; -- gap in days — restart
  end if;

  insert into profiles (id, current_streak, longest_streak, last_action_date)
  values (auth.uid(), v_new_streak, v_new_streak, v_today)
  on conflict (id) do update set
    current_streak = v_new_streak,
    longest_streak = greatest(coalesce(profiles.longest_streak, 0), v_new_streak),
    last_action_date = v_today;
end;
$$;

revoke all on function record_daily_visit() from public;
grant execute on function record_daily_visit() to authenticated;

-- (2) Colony city — filled by reverse-geocoding (Nominatim) when the user
-- places the pin during registration. Used to filter colonies by city on
-- the map without exposing exact coordinates.
alter table colonies add column if not exists city text;
