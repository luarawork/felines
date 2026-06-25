-- Fixes anonymous report submission, which was unexpectedly blocked by RLS.
-- Recreates the insert policy explicitly scoped to anon + authenticated,
-- and makes sure the anon/authenticated roles actually have the INSERT
-- grant on the table (RLS policies only take effect if the underlying
-- SQL privilege already allows the operation).

drop policy if exists "reports_insert_public" on reports;

grant insert on reports to anon, authenticated;

create policy "reports_insert_public" on reports
  for insert to anon, authenticated
  with check (true);
