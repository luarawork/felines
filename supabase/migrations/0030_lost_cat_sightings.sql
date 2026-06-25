-- Links a "I saw this cat" sighting report back to the original lost-cat
-- report it responds to, so the owner can see who spotted their cat and
-- where — the closest thing to a notification this app has, surfaced
-- in-app on /reports rather than via email/push (no notification system
-- exists, by design, same as the thank-you feature).
alter table reports add column if not exists related_report_id uuid references reports(id) on delete set null;
