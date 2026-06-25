-- Lets anonymous visitors see report pins (sightings, emergencies) on
-- the public map, matching the original spec ("anyone can see sighting
-- and emergency pins"). Previously reports_select_authenticated was the
-- only select policy, so anon got zero rows for reports — the map's
-- sighting/emergency pins were invisible to anyone without an account.
--
-- Anon only gets the columns needed to draw a pin (type, coordinates,
-- which colony it's tied to) and only for open reports — never the free
-- text description, photo, confirmation count, or who created it.
-- Authenticated users keep full row + column access via the existing
-- reports_select_authenticated policy (RLS permissive policies are
-- OR'd together, so this is additive, not a narrowing).

create policy "reports_select_public_open_pins" on reports
  for select to anon using (status = 'open');

revoke select on reports from anon;
grant select (id, type, colony_id, latitude, longitude, status) on reports to anon;
