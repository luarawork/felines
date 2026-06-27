-- Lets any signed-in user say "thanks" (a heart) on a specific timeline
-- event — a finer-grained version of the existing caretaker-level
-- `thanks` table, scoped to one concrete action (a feeding, a new cat,
-- a castration round...) instead of "thanks for caretaking in general".
-- Notifies the action's author, the way checkExtremeWeatherForCaretaker
-- already notifies caretakers about weather.
create table if not exists action_thanks (
  id uuid primary key default gen_random_uuid(),
  timeline_event_id uuid not null references timeline_events(id) on delete cascade,
  sender_user_id uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  unique (timeline_event_id, sender_user_id)
);

alter table action_thanks enable row level security;

-- Public read so the heart count is visible to anyone, same as
-- report_confirmations_select_public.
create policy "action_thanks_select_public" on action_thanks
  for select using (true);

-- No direct insert policy: rows are only ever created through
-- thank_action() below, since adding a heart also needs to notify the
-- action's author — a privileged write (to another user's
-- notifications row) that a plain RLS insert policy can't express.

-- security definer because notifying the action's author means
-- inserting a row into `notifications` for a user_id other than the
-- caller, which notifications_insert_own (auth.uid() = user_id) would
-- otherwise block — the function validates everything itself instead
-- of relying on the caller's own RLS grants.
create or replace function thank_action(p_timeline_event_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_author uuid;
  v_colony_id uuid;
begin
  begin
    insert into action_thanks (timeline_event_id, sender_user_id)
    values (p_timeline_event_id, auth.uid());
  exception when unique_violation then
    return;
  end;

  select created_by, colony_id into v_author, v_colony_id
  from timeline_events
  where id = p_timeline_event_id;

  if v_author is not null and v_author <> auth.uid() then
    insert into notifications (user_id, colony_id, type, message)
    values (
      v_author,
      v_colony_id,
      'action_thanks',
      'Alguém agradeceu uma ação que você fez em uma colônia. ❤️'
    );
  end if;
end;
$$;

revoke all on function thank_action(uuid) from public;
grant execute on function thank_action(uuid) to authenticated;
