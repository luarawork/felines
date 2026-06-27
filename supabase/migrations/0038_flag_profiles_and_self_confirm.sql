-- Two independent fixes bundled together since both touch report/flag
-- integrity:
--
-- 1. Lets a caretaker's public profile (/u/:id) be flagged, not just
--    colonies and reports — there was previously no way to report a
--    malicious user account itself.
alter table flags drop constraint if exists flags_target_type_check;
alter table flags add constraint flags_target_type_check
  check (target_type in ('colony', 'report', 'profile'));

-- 2. Server-side enforcement that a report's own creator can't confirm
--    it themselves — confirm_report() previously let anyone authenticated
--    add a confirmation, including the person who filed the report,
--    which defeats the point of "3 different people vouching for this."
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
  v_created_by uuid;
begin
  select status, created_by into v_status, v_created_by from reports where id = p_report_id;
  if v_status is null or v_status = 'resolved' then
    return;
  end if;
  if v_created_by is not null and v_created_by = auth.uid() then
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
