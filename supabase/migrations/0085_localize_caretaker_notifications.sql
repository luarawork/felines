-- Bug reported live: notifications always read in Portuguese
-- regardless of the site's language toggle. notify_caretakers() and
-- notify_nearby_caretakers() build their message from a fixed
-- server-side template (hardened against free-text injection in
-- 0065/0078) that was Portuguese-only — there was no way for the
-- caller to ask for an English version. app/api/reports/route.ts now
-- passes the submitting visitor's current site language; this adds the
-- parameter and the English template alongside the existing Portuguese
-- one. Only appending a new trailing parameter with a default, so
-- `create or replace` can update the function in place without a
-- `drop function` first (unlike 0065, which renamed an existing
-- parameter and needed one).
create or replace function notify_caretakers(
  p_colony_id uuid,
  p_type text,
  p_report_type text default null,
  p_language text default 'pt'
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_message text;
  v_recent_count int;
  v_is_en boolean := p_language = 'en';
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
      case when v_is_en
        then 'Someone reported that a colony you care for needs attention.'
        else 'Alguém relatou que uma colônia que você cuida precisa de atenção.'
      end
    when 'area_alert' then
      case when v_is_en
        then '⚠️ Area alert: a report of "' || (
          case p_report_type
            when 'suspected_poisoning' then 'suspected poisoning'
            when 'suspected_abuse' then 'abuse'
            when 'disease_outbreak' then 'a disease outbreak'
            when 'threat_to_colony' then 'a threat to the colony'
            else null
          end
        ) || '" was recorded near a colony you care for.'
        else '⚠️ Alerta de área: foi registrado um relato de "' || (
          case p_report_type
            when 'suspected_poisoning' then 'suspeita de envenenamento'
            when 'suspected_abuse' then 'maus-tratos'
            when 'disease_outbreak' then 'surto de doença'
            when 'threat_to_colony' then 'ameaça a colônia'
            else null
          end
        ) || '" perto de uma colônia que você cuida.'
      end
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

create or replace function notify_nearby_caretakers(
  p_latitude double precision,
  p_longitude double precision,
  p_radius_km double precision,
  p_report_type text,
  p_language text default 'pt'
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
    perform notify_caretakers(v_colony.id, 'area_alert', p_report_type, p_language);
  end loop;
end;
$$;

revoke execute on function notify_caretakers(uuid, text, text, text) from public;
grant execute on function notify_caretakers(uuid, text, text, text) to anon, authenticated;

revoke execute on function notify_nearby_caretakers(double precision, double precision, double precision, text, text) from public;
grant execute on function notify_nearby_caretakers(double precision, double precision, double precision, text, text) to anon, authenticated;
