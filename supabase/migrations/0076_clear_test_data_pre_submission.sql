-- ONE-TIME CLEANUP, not a normal schema migration — run manually via the
-- Supabase SQL Editor before hackathon submission/demo. Wipes every row of
-- user-generated content (test colonies, cats, sightings, reports, stories,
-- resource posts, etc.) while leaving three things untouched:
--   1. auth.users / profiles — the judges' account and the shared test
--      account both stay exactly as they are; this script never touches
--      either table.
--   2. community_contacts seeded rows — the 14 real Natal/RN contacts from
--      0071_seed_natal_contacts.sql all have created_by = null (curated
--      seed data, not tied to a user). Any contact added through the app
--      while testing has a real created_by, so it's the only thing removed
--      from that table.
--   3. Schema, RLS policies, and RPCs — untouched, exactly like 0037's
--      full reset.
--
-- Order doesn't matter within this list — TRUNCATE handles every FK
-- dependency between the listed tables regardless of order; CASCADE is
-- just a safety net for anything referencing one of these tables that
-- isn't itself in the list.
truncate table
  action_thanks,
  care_reminders,
  caretaker_certifications,
  caretakers,
  cat_notes,
  cats,
  colonies,
  colony_followers,
  colony_stories,
  colony_verifications,
  feedings,
  flags,
  help_requests,
  knowledge_progress,
  neutering_requests,
  notifications,
  report_confirmations,
  reports,
  resource_post_interests,
  resource_posts,
  story_reactions,
  suggested_colonies,
  thanks,
  timeline_events
cascade;

-- community_contacts: remove only contacts added by a real user while
-- testing. The seeded rows (created_by is null) are left in place.
delete from community_contacts where created_by is not null;

-- Not handled here, since neither can be done safely from the SQL Editor
-- (same caveat as 0037):
--   1. Storage: colony/cat/avatar photos uploaded during testing are now
--      orphaned (their rows are gone, but the files remain in the
--      `colony-photos` bucket). Direct `delete from storage.objects` is
--      blocked by Supabase's own protection trigger — clear orphaned
--      files via Dashboard > Storage > colony-photos instead, or leave
--      them (they're unreferenced and invisible to the app either way).
--   2. auth.users: intentionally untouched by this script — see the
--      header above. If a specific test *account* (not its content)
--      ever needs deleting too, that's a Dashboard > Authentication >
--      Users action, done by hand, one account at a time.
