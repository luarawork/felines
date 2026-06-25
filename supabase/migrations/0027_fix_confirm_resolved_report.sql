-- Fixes a real bug: confirm_report() never checked whether the report
-- was already resolved before incrementing. Nothing stopped someone
-- from calling it again after resolution — the confirmation count would
-- keep climbing past 3, and for sensitive reports, a duplicate
-- "resolved after 3 confirmations" timeline entry would be inserted
-- every time, since the >= 3 branch re-ran on every call.
create or replace function confirm_report(p_report_id uuid)
returns void
language plpgsql
security invoker
as $$
declare
  v_confirmations int;
  v_sensitive boolean;
  v_colony_id uuid;
  v_type text;
  v_status text;
begin
  select status into v_status from reports where id = p_report_id;
  if v_status is null or v_status = 'resolved' then
    return;
  end if;

  begin
    insert into report_confirmations (report_id, user_id) values (p_report_id, auth.uid());
  exception when unique_violation then
    return;
  end;

  update reports
  set confirmations = confirmations + 1
  where id = p_report_id
  returning confirmations, sensitive, colony_id, type
  into v_confirmations, v_sensitive, v_colony_id, v_type;

  if v_confirmations >= 3 then
    update reports set status = 'resolved' where id = p_report_id;

    if v_sensitive and v_colony_id is not null then
      insert into timeline_events (colony_id, event_type, description, created_by)
      values (
        v_colony_id,
        'report_resolved',
        'Relato sensível (' || v_type || ') resolvido após 3 confirmações.',
        auth.uid()
      );
    end if;
  end if;
end;
$$;

grant execute on function confirm_report(uuid) to authenticated;
