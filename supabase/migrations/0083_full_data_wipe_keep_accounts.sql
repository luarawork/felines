-- ONE-TIME CLEANUP, not a normal schema migration — run manually via the
-- Supabase SQL Editor. Wipes every row of data in the app except login
-- accounts themselves (auth.users is never touched, so everyone can
-- still sign in with their existing email/password).
--
-- Unlike 0076 (which kept `profiles` and the seeded community_contacts
-- rows for the hackathon demo), this wipes profiles too — display name,
-- avatar, streaks, ban status, everything. The app recreates a blank
-- profiles row for a user automatically on their next visit
-- (lib/profile.ts), so this is safe; the account just looks brand new
-- again.
--
-- community_contacts is fully cleared here too, INCLUDING the 14 real
-- Natal/RN contacts seeded by 0071_seed_natal_contacts.sql. If you want
-- that curated directory back afterward, re-run 0071's INSERT
-- statements — it's the only table where "zero everything" also means
-- losing curated reference data, not just user activity.
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
  community_contacts,
  feedings,
  flags,
  help_requests,
  knowledge_progress,
  neutering_requests,
  notifications,
  profiles,
  report_confirmations,
  reports,
  resource_post_interests,
  resource_posts,
  story_reactions,
  suggested_colonies,
  thanks,
  timeline_events
cascade;

-- Not handled here, since neither can be done safely from the SQL Editor
-- (same caveat as 0037/0076):
--   1. Storage: colony/cat/avatar photos already uploaded are now
--      orphaned (their rows are gone, but the files remain in the
--      `colony-photos` bucket). Direct `delete from storage.objects` is
--      blocked by Supabase's own protection trigger — clear orphaned
--      files via Dashboard > Storage > colony-photos instead, or leave
--      them (they're unreferenced and invisible to the app either way).
--   2. auth.users: intentionally untouched — every existing account can
--      still log in, they'll just see a completely empty app with no
--      colonies, reports, or profile data until they start again.
