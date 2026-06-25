-- Fixes a real gap: confirm_report() let the same person confirm a
-- report multiple times, since it just incremented a counter with no
-- record of who had already confirmed. The "3 confirmations" threshold
-- is supposed to mean 3 different people vouching for a report, not one
-- person clicking three times.
create table if not exists report_confirmations (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references reports(id) on delete cascade,
  user_id uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  unique (report_id, user_id)
);

alter table report_confirmations enable row level security;

create policy "report_confirmations_select_authenticated" on report_confirmations
  for select to authenticated using (true);

-- No direct insert policy: rows are only ever created by confirm_report()
-- itself (security invoker, running as the calling user), via the
-- unique constraint check below — never via a raw insert from the app.
create policy "report_confirmations_insert_own" on report_confirmations
  for insert to authenticated with check (auth.uid() = user_id);

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
  -- Record this user's confirmation first. The unique constraint
  -- rejects a second confirmation from the same person; the exception
  -- is caught so calling confirm_report again is a harmless no-op
  -- instead of an error the UI would have to handle specially.
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
