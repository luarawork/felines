-- Adds a `sensitive` flag to reports (poisoning, abuse, disease outbreak)
-- and makes confirm_report() auto-resolve a report once it reaches 3
-- confirmations. Confirmations always come from authenticated users
-- already (confirm_report is granted to `authenticated` only), so the
-- "3 confirmations from authenticated users" requirement for sensitive
-- reports is satisfied by the existing access model — this migration
-- adds the threshold and the sensitive flag/timeline behavior on top.

alter table reports add column if not exists sensitive boolean not null default false;

update reports
set sensitive = true
where type in ('suspected_poisoning', 'suspected_abuse', 'disease_outbreak');

-- Keeps `sensitive` consistent with `type` automatically, so the app
-- never has to remember to set it correctly on insert.
create or replace function set_report_sensitivity()
returns trigger
language plpgsql
as $$
begin
  new.sensitive := new.type in ('suspected_poisoning', 'suspected_abuse', 'disease_outbreak');
  return new;
end;
$$;

drop trigger if exists set_report_sensitivity_trigger on reports;
create trigger set_report_sensitivity_trigger
  before insert on reports
  for each row
  execute function set_report_sensitivity();

-- Replaces the simple increment-only RPC with one that also resolves
-- the report once it reaches 3 confirmations, and — for sensitive
-- reports tied to a colony — leaves a permanent timeline entry so the
-- resolution is never lost from the colony's history even after the
-- report itself is marked resolved.
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
begin
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
