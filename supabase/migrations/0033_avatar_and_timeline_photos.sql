-- Profile photos: a public-safe avatar_url, same privacy model as
-- display_name (no email or other private data attached to it).
alter table profiles add column if not exists avatar_url text;

-- Lets a timeline entry carry a photo — used both for standalone
-- "here's an update" photos and to preserve the colony's previous
-- cover photo in the timeline when it gets replaced, so that history
-- isn't silently lost.
alter table timeline_events add column if not exists photo_url text;
