-- The community stories wall (/stories, and the "Histórias" tab on
-- /reports) is now login-required to view, per product decision — the
-- original 0049 policy allowed anyone to read colony_stories, matching
-- the "public wall" framing at the time. Restricting SELECT to
-- authenticated only; insert/delete policies are untouched, since only
-- linked caretakers could post or remove a story anyway.
drop policy if exists "colony_stories_select_public" on colony_stories;

create policy "colony_stories_select_authenticated" on colony_stories
  for select to authenticated using (true);
