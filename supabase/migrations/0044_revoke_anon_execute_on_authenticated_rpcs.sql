-- Security fix, found while testing 0043: every "authenticated-only" RPC
-- in this project was actually callable by the anon key. `revoke all on
-- function ... from public` (used throughout this codebase) only undoes
-- the implicit PUBLIC grant — Supabase separately grants EXECUTE on new
-- functions directly to `anon` and `authenticated` as a project-level
-- default privilege, which a PUBLIC-only revoke never touches. The
-- subsequent `grant execute ... to authenticated` in each of these
-- migrations was therefore redundant, while the real anon grant was
-- never revoked.
--
-- Verified live with the anon key before this fix: get_colony_exact_location
-- returned 200 (empty result, since auth.uid() is null for anon and
-- never matches), mark_cat_seen_today and record_care_streak both
-- returned 204 (executed). None of these were exploitable for real harm
-- — each function independently checks auth.uid() before doing anything
-- sensitive — but the grant layer should back that up, not rely on every
-- function remembering to self-check forever.
revoke execute on function get_colony_exact_location(uuid) from anon;
revoke execute on function confirm_report(uuid) from anon;
revoke execute on function mark_cat_seen_today(uuid) from anon;
revoke execute on function thank_action(uuid) from anon;
revoke execute on function record_care_streak(uuid) from anon;

-- get_platform_impact_stats() and get_recent_platform_activity() are
-- intentionally public (power the /impact page for anonymous visitors)
-- — explicitly left untouched here.
