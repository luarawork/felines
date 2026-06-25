-- Widens public report visibility so a caretaker's public profile
-- (/u/:id) can show their report history and confirmations given —
-- type, status, and date only, never the free-text description or
-- photo. Replaces the open-only pin policy with one covering every
-- report, since a profile needs past (resolved) reports too, not just
-- currently-open ones.
drop policy if exists "reports_select_public_open_pins" on reports;

create policy "reports_select_public_pins_and_history" on reports
  for select to anon using (true);

revoke select on reports from anon;
grant select (id, type, colony_id, latitude, longitude, status, created_at, created_by)
  on reports to anon;

-- Confirmations given are public attribution data (who confirmed what),
-- not sensitive — widen from authenticated-only to anyone.
drop policy if exists "report_confirmations_select_authenticated" on report_confirmations;

create policy "report_confirmations_select_public" on report_confirmations
  for select using (true);
