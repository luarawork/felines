-- Security Advisor flagged notify_caretakers/notify_nearby_caretakers as
-- executable directly by anon via /rest/v1/rpc. That grant is required
-- (anonymous reporters need to trigger caretaker notifications), but the
-- functions previously accepted a completely free-text p_message from
-- the caller and inserted it verbatim into `notifications` — meaning
-- anyone hitting the RPC directly (bypassing the app, using the public
-- anon key that's embedded in every client bundle) could spam/phish any
-- colony's caretaker(s) with arbitrary message text, since colony_id
-- values are already enumerable from the public map.
--
-- Fix: stop trusting caller-supplied message text. Both functions now
-- take only a validated `p_type` (and, for the area-alert case, the
-- underlying report type — itself constrained to the same small enum
-- reports.type already uses) and build the notification message from a
-- fixed internal template. An unrecognized p_type is a silent no-op
-- rather than an error, so a malformed/unexpected call just does nothing
-- instead of leaking which values are valid via error messages.

-- Postgres won't let CREATE OR REPLACE rename a parameter on an
-- existing signature (p_message -> p_report_type here), so the old
-- versions must be dropped explicitly before recreating them.
drop function if exists notify_caretakers(uuid, text, text);
drop function if exists notify_nearby_caretakers(double precision, double precision, double precision, text, text);

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
begin
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

create or replace function notify_nearby_caretakers(
  p_latitude double precision,
  p_longitude double precision,
  p_radius_km double precision,
  p_report_type text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_colony record;
begin
  if p_report_type not in ('suspected_poisoning', 'suspected_abuse', 'disease_outbreak', 'threat_to_colony') then
    return;
  end if;

  for v_colony in
    select id
    from colonies
    where
      latitude is not null
      and longitude is not null
      and (
        2 * 6371 *
        asin(sqrt(
          power(sin(radians((latitude  - p_latitude)  / 2)), 2) +
          cos(radians(p_latitude)) * cos(radians(latitude)) *
          power(sin(radians((longitude - p_longitude) / 2)), 2)
        ))
      ) <= p_radius_km
  loop
    perform notify_caretakers(v_colony.id, 'area_alert', p_report_type);
  end loop;
end;
$$;

revoke execute on function notify_nearby_caretakers(double precision, double precision, double precision, text) from public;
grant execute on function notify_nearby_caretakers(double precision, double precision, double precision, text) to anon, authenticated;

-- check_colony_verification is a trigger function, never meant to be
-- called directly via RPC (same class of finding as check_sighting_cluster
-- in 0047) — trigger firing doesn't require the firing role to hold
-- EXECUTE, so revoking from everyone is safe and just silences the
-- Security Advisor's "anon/authenticated can execute" warnings for it.
revoke execute on function check_colony_verification() from public, anon, authenticated;
