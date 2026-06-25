-- Colonies seeded by 0003 (before progressive location blur existed)
-- still carry their original small offset (~120-150m) in
-- latitude_blurred/longitude_blurred, instead of the ~500m wide blur
-- level 1 (anonymous) visitors are meant to see. Regenerates the wide
-- blur for every existing colony using the same formula NewColonyForm
-- now uses at registration. Only ever touches the *_blurred columns —
-- never the exact latitude/longitude.
update colonies
set
  latitude_blurred = latitude + (random() - 0.5) * 0.01,
  longitude_blurred = longitude + (random() - 0.5) * 0.01
where latitude is not null;
