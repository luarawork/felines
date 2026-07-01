-- For serious reports (poisoning, abuse, disease outbreak, threat),
-- all caretakers within a given radius receive an area alert —
-- not just the caretakers of the specific colony being reported.
-- Uses the Haversine formula in pure SQL (no PostGIS required).
-- Reuses notify_caretakers (0059) so deduplication is inherited.
-- Safe for anonymous callers — the message is always a fixed
-- summary, never the reporter's free-text description.
create or replace function notify_nearby_caretakers(
  p_latitude double precision,
  p_longitude double precision,
  p_radius_km double precision,
  p_type text,
  p_message text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_colony record;
begin
  for v_colony in
    select id
    from colonies
    where
      latitude is not null
      and longitude is not null
      -- Haversine formula — distance in km between the report point
      -- and the colony's stored coordinates.
      and (
        2 * 6371 *
        asin(sqrt(
          power(sin(radians((latitude  - p_latitude)  / 2)), 2) +
          cos(radians(p_latitude)) * cos(radians(latitude)) *
          power(sin(radians((longitude - p_longitude) / 2)), 2)
        ))
      ) <= p_radius_km
  loop
    perform notify_caretakers(v_colony.id, p_type, p_message);
  end loop;
end;
$$;

revoke execute on function notify_nearby_caretakers(double precision, double precision, double precision, text, text) from public;
grant execute on function notify_nearby_caretakers(double precision, double precision, double precision, text, text) to anon, authenticated;
