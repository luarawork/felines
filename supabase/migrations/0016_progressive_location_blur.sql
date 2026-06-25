-- Progressive location blur by access level.
-- Location blur protects cats from malicious users who could use exact
-- coordinates to find and harm animals. Anonymous visitors get a wide
-- blur (~500m), signed-in non-caretakers get a closer blur (~100m), and
-- only linked caretakers/the creator can read the exact location — and
-- only through the get_colony_exact_location() RPC below, never a raw
-- column select.

-- Closer blur shown to authenticated users who are not (yet) a caretaker.
alter table colonies add column if not exists latitude_blurred_near float;
alter table colonies add column if not exists longitude_blurred_near float;

-- Backfill the closer blur for colonies created before this column
-- existed, using a tighter random offset than the existing wide blur.
update colonies
set
  latitude_blurred_near = latitude + (random() - 0.5) * 0.002,
  longitude_blurred_near = longitude + (random() - 0.5) * 0.002
where latitude_blurred_near is null and latitude is not null;

-- RLS is row-level, not column-level: the colonies_select_public policy
-- (select using (true)) lets anyone read a colony row, which would still
-- include the exact latitude/longitude columns if selected directly.
-- Revoking column-level SELECT on those two columns closes that gap for
-- anon and authenticated alike — exact coordinates become readable only
-- through get_colony_exact_location(), a security definer function that
-- validates caretaker/creator status server-side before returning them.
revoke select (latitude, longitude) on colonies from anon, authenticated;
