-- Fixes a gap 0044 missed: confirm_report's original migrations
-- (0011/0019/0023/0027) granted EXECUTE to `authenticated` but never
-- revoked it from `PUBLIC` — unlike get_colony_exact_location,
-- mark_cat_seen_today, and thank_action, which all did `revoke all on
-- function ... from public` before granting to authenticated. Since
-- every role implicitly has whatever PUBLIC has, anon kept executing
-- confirm_report via that PUBLIC grant even after 0044 revoked the
-- (nonexistent) direct anon grant.
--
-- Confirmed via information_schema.routine_privileges: PUBLIC still had
-- EXECUTE, anon had no row at all (because it never needed one — PUBLIC
-- covered it).
revoke execute on function confirm_report(uuid) from public;
grant execute on function confirm_report(uuid) to authenticated;
