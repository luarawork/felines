-- Security audit finding: thank_action() (0039_action_thanks.sql) never
-- checked whether the caller is the same person who authored the
-- timeline_event being thanked. confirm_report() explicitly blocks
-- self-confirmation (0038_flag_profiles_and_self_confirm.sql) for
-- exactly this reason ("defeats the point of 3 different people
-- vouching"), and the same logic applies here: a user could thank their
-- own action to inflate their own heart count / notification stream,
-- and nothing server-side stopped it — the unique constraint on
-- (timeline_event_id, sender_user_id) only prevents thanking the same
-- action twice, not thanking your own action once.
--
-- Fix: mirror confirm_report's self-action guard — look up the event's
-- author before inserting, and no-op (not error) if it's the caller,
-- same "silent no-op instead of a special error the UI has to handle"
-- pattern already used throughout this file's sibling functions.
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
  select created_by, colony_id into v_author, v_colony_id
  from timeline_events
  where id = p_timeline_event_id;

  if v_author is null or v_author = auth.uid() then
    return;
  end if;

  begin
    insert into action_thanks (timeline_event_id, sender_user_id)
    values (p_timeline_event_id, auth.uid());
  exception when unique_violation then
    return;
  end;

  insert into notifications (user_id, colony_id, type, message)
  values (
    v_author,
    v_colony_id,
    'action_thanks',
    'Alguém agradeceu uma ação que você fez em uma colônia. ❤️'
  );
end;
$$;

revoke all on function thank_action(uuid) from public;
grant execute on function thank_action(uuid) to authenticated;
