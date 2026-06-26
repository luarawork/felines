-- ONE-TIME RESET, not a normal schema migration — do not run this in a
-- production environment with real data. Wipes every row from every
-- application table (colonies, reports, profiles, etc.), leaving the
-- schema/RLS/RPCs intact but the database completely empty.
--
-- This file only handles table rows. Storage objects and auth users
-- must be cleared separately, since neither can be done safely from
-- the SQL Editor:
--   1. Storage: direct `delete from storage.objects` is blocked by
--      Supabase (storage.protect_delete() trigger) — use the Storage
--      API instead. Easiest path: Dashboard > Storage > colony-photos
--      > select all > delete (the UI calls the Storage API for you),
--      or delete the bucket entirely and recreate it per 0002/0026.
--   2. Auth: Dashboard > Authentication > Users > select all > Delete
--      (deleting auth.users directly via SQL skips cleanup of
--      sessions/identities/refresh_tokens that the Dashboard handles).

-- Order doesn't matter: cascade handles dependent rows in tables not
-- listed explicitly (e.g. report_confirmations references reports).
truncate table
  notifications,
  report_confirmations,
  flags,
  thanks,
  feedings,
  knowledge_progress,
  timeline_events,
  reports,
  cats,
  caretakers,
  colonies,
  profiles
cascade;
