-- Final pre-submission security audit finding: no coordinate column in
-- colonies or reports had a database-level range check. lib/validateCoordinates.ts
-- guards every *external* API call (geocoding, weather), but a direct
-- insert/update against these two tables — via the public reports_insert_public
-- policy, or any future write path — was never bounded at the one place
-- that actually enforces it for every caller, API route or not.
-- Out-of-range values here aren't an SSRF/injection risk (nothing takes
-- these values into an external request), but they can break the map's
-- Leaflet rendering and any distance/radius math (e.g.
-- notify_nearby_caretakers). Standard geographic bounds: latitude
-- -90..90, longitude -180..180.
alter table colonies
  add constraint colonies_latitude_range check (latitude is null or (latitude >= -90 and latitude <= 90)),
  add constraint colonies_longitude_range check (longitude is null or (longitude >= -180 and longitude <= 180)),
  add constraint colonies_latitude_blurred_range check (latitude_blurred is null or (latitude_blurred >= -90 and latitude_blurred <= 90)),
  add constraint colonies_longitude_blurred_range check (longitude_blurred is null or (longitude_blurred >= -180 and longitude_blurred <= 180)),
  add constraint colonies_latitude_blurred_near_range check (latitude_blurred_near is null or (latitude_blurred_near >= -90 and latitude_blurred_near <= 90)),
  add constraint colonies_longitude_blurred_near_range check (longitude_blurred_near is null or (longitude_blurred_near >= -180 and longitude_blurred_near <= 180));

alter table reports
  add constraint reports_latitude_range check (latitude is null or (latitude >= -90 and latitude <= 90)),
  add constraint reports_longitude_range check (longitude is null or (longitude >= -180 and longitude <= 180));
