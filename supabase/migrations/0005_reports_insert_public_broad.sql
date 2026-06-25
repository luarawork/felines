-- Widens the reports insert policy to PUBLIC (no role restriction), to
-- match the pattern already working for colonies_select_public and
-- cats_select_public. Also grants insert to PUBLIC at the table level,
-- in case the API gateway runs requests under a role that isn't
-- exactly 'anon' or 'authenticated'.

drop policy if exists "reports_insert_public" on reports;

grant insert on reports to public;

create policy "reports_insert_public" on reports
  for insert
  with check (true);
