-- Auto-suggests an unregistered colony when 3+ sightings cluster within
-- ~200m of each other and no colony already exists nearby. Runs
-- entirely server-side (a trigger on `reports`), not client-side, so it
-- fires consistently no matter which form created the sighting
-- (QuickSightingForm, HelpFlow, SightingReportButton...).

create table if not exists suggested_colonies (
  id uuid primary key default gen_random_uuid(),
  latitude float not null,
  longitude float not null,
  sighting_count int not null default 3,
  created_at timestamptz not null default now()
);

alter table suggested_colonies enable row level security;

-- Public read: this is an inferred approximate area, already derived
-- from sighting pins that are themselves public — showing it doesn't
-- expose anything not already visible on the map.
create policy "suggested_colonies_select_public" on suggested_colonies
  for select using (true);

-- No insert/update/delete policy for any role: rows are only ever
-- written by check_sighting_cluster() below (SECURITY DEFINER, so it
-- bypasses RLS as the function owner regardless of who triggered it).

-- Great-circle distance in meters between two lat/lon points.
create or replace function haversine_meters(lat1 float, lon1 float, lat2 float, lon2 float)
returns float
language sql
immutable
as $$
  select 6371000 * acos(
    least(1.0, greatest(-1.0,
      cos(radians(lat1)) * cos(radians(lat2)) * cos(radians(lon2) - radians(lon1)) +
      sin(radians(lat1)) * sin(radians(lat2))
    ))
  );
$$;

create or replace function check_sighting_cluster()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_nearby_count int;
  v_centroid_lat float;
  v_centroid_lon float;
  v_existing_colony_count int;
  v_existing_suggestion_count int;
  v_nearby_colony record;
begin
  if new.type <> 'sighting' or new.latitude is null or new.longitude is null then
    return new;
  end if;

  -- Other sightings within 200m of this one (not counting itself).
  select count(*), avg(latitude), avg(longitude)
  into v_nearby_count, v_centroid_lat, v_centroid_lon
  from reports
  where type = 'sighting'
    and id <> new.id
    and latitude is not null
    and longitude is not null
    and haversine_meters(latitude, longitude, new.latitude, new.longitude) <= 200;

  -- Need at least 2 others (3 total, including this one) to suggest a colony.
  if v_nearby_count < 2 then
    return new;
  end if;

  -- Use the cluster's centroid (including this sighting) as the
  -- suggestion's location — more representative than any single point.
  v_centroid_lat := (v_centroid_lat * v_nearby_count + new.latitude) / (v_nearby_count + 1);
  v_centroid_lon := (v_centroid_lon * v_nearby_count + new.longitude) / (v_nearby_count + 1);

  -- Skip if a colony already exists within 200m of the cluster.
  select count(*) into v_existing_colony_count
  from colonies
  where latitude is not null
    and haversine_meters(latitude, longitude, v_centroid_lat, v_centroid_lon) <= 200;

  if v_existing_colony_count > 0 then
    return new;
  end if;

  -- Skip if a suggestion already exists near here, instead of stacking
  -- a new one every time another sighting lands in the same cluster.
  select count(*) into v_existing_suggestion_count
  from suggested_colonies
  where haversine_meters(latitude, longitude, v_centroid_lat, v_centroid_lon) <= 200;

  if v_existing_suggestion_count > 0 then
    return new;
  end if;

  insert into suggested_colonies (latitude, longitude, sighting_count)
  values (v_centroid_lat, v_centroid_lon, v_nearby_count + 1);

  -- Notify caretakers of any colony within 500m of the new suggestion —
  -- they're the people best positioned to know if this is really a new
  -- group or an extension of one they already manage.
  for v_nearby_colony in
    select id, name from colonies
    where latitude is not null
      and haversine_meters(latitude, longitude, v_centroid_lat, v_centroid_lon) <= 500
  loop
    insert into notifications (user_id, colony_id, type, message)
    select
      caretakers.user_id,
      v_nearby_colony.id,
      'sighting_cluster',
      'Vários avistamentos perto de ' || v_nearby_colony.name || '. Será que é uma nova colônia se formando?'
    from caretakers
    where caretakers.colony_id = v_nearby_colony.id;
  end loop;

  return new;
end;
$$;

drop trigger if exists check_sighting_cluster_trigger on reports;
create trigger check_sighting_cluster_trigger
  after insert on reports
  for each row
  execute function check_sighting_cluster();
