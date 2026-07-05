-- Final pre-submission security audit finding: notify_caretakers() is
-- granted to anon (intentionally — anonymous report submission needs to
-- trigger it), but the app's only rate limiting (lib/rateLimit.ts,
-- 10/hour anon) lives in app/api/reports/route.ts, not in the database.
-- A caller hitting the public Supabase REST endpoint directly
-- (POST /rest/v1/rpc/notify_caretakers) with a valid, enumerable
-- colony_id bypasses that limiter entirely — confirmed live during this
-- audit (curl with the anon key returned 204, no rate limit applied).
-- Since the function no longer accepts free text (hardened in 0065),
-- this can't inject arbitrary content, but it could still be used to
-- spam a specific colony's caretakers with real notification rows,
-- unrate-limited.
--
-- Fix: a lightweight circuit breaker using data already being written —
-- no new table needed. If an identical (colony_id, type) notification
-- was already created for this colony in the last 5 minutes, skip
-- inserting another. This caps the worst case at one notification batch
-- per colony per 5 minutes regardless of how many times the RPC is
-- called directly, while never affecting genuine, spaced-out usage.
create or replace function notify_caretakers(
  p_colony_id uuid,
  p_type text,
  p_report_type text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_message text;
  v_recent_count int;
begin
  select count(*) into v_recent_count
  from notifications
  where colony_id = p_colony_id
    and type = p_type
    and created_at > now() - interval '5 minutes';

  if v_recent_count > 0 then
    return;
  end if;

  v_message := case p_type
    when 'report_submitted' then
      'Alguém relatou que uma colônia que você cuida precisa de atenção.'
    when 'area_alert' then
      '⚠️ Alerta de área: foi registrado um relato de "' || (
        case p_report_type
          when 'suspected_poisoning' then 'suspeita de envenenamento'
          when 'suspected_abuse' then 'maus-tratos'
          when 'disease_outbreak' then 'surto de doença'
          when 'threat_to_colony' then 'ameaça a colônia'
          else null
        end
      ) || '" perto de uma colônia que você cuida.'
    else null
  end;

  if v_message is null then
    return;
  end if;

  insert into notifications (user_id, colony_id, type, message)
  select recipient_id, p_colony_id, p_type, v_message
  from (
    select created_by as recipient_id from colonies where id = p_colony_id and created_by is not null
    union
    select user_id as recipient_id from caretakers where colony_id = p_colony_id
  ) as recipients;
end;
$$;

revoke execute on function notify_caretakers(uuid, text, text) from public;
grant execute on function notify_caretakers(uuid, text, text) to anon, authenticated;
