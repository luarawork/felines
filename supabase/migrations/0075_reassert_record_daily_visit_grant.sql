-- Final security review found record_daily_visit() callable by the
-- anon role in the live database, even though 0064's migration file
-- reads `revoke all on function record_daily_visit() from public;`
-- followed by `grant execute ... to authenticated` only (anon
-- excluded). A live anon-key RPC call reached real execution — it
-- only failed because of the profiles table's NOT NULL constraint on
-- id (auth.uid() resolves to null for anon), not because of a
-- permission check. That's an accidental side-effect protecting this,
-- not an actual grant boundary — the four other RPCs audited alongside
-- it (get_colony_exact_location, confirm_report, mark_cat_seen_today,
-- thank_action) all correctly returned "permission denied" instead.
--
-- Re-asserting the revoke defensively; this is idempotent and safe to
-- run regardless of why the live grant drifted from the migration file.
revoke all on function record_daily_visit() from public, anon;
grant execute on function record_daily_visit() to authenticated;
