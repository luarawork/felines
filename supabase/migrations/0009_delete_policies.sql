-- Adds DELETE policies that were missing from the initial schema.
-- Without these, no row could ever be removed via the API, even by its
-- own owner. Scope is intentionally narrow: people can only remove things
-- that are theirs.

-- A colony can be deleted by its creator or any linked caretaker.
create policy "colonies_delete_caretaker" on colonies
  for delete to authenticated using (
    auth.uid() = created_by
    or exists (
      select 1 from caretakers
      where caretakers.colony_id = colonies.id
      and caretakers.user_id = auth.uid()
    )
  );

-- Cats can be removed by whoever can manage the parent colony.
create policy "cats_delete_caretaker" on cats
  for delete to authenticated using (
    exists (
      select 1 from colonies
      where colonies.id = cats.colony_id
      and (
        colonies.created_by = auth.uid()
        or exists (
          select 1 from caretakers
          where caretakers.colony_id = colonies.id
          and caretakers.user_id = auth.uid()
        )
      )
    )
  );

-- A caretaker link can only be removed by the caretaker themselves
-- (stepping down), not by other caretakers.
create policy "caretakers_delete_own" on caretakers
  for delete to authenticated using (auth.uid() = user_id);

-- Reports can be removed by whoever created them. Anonymous reports
-- (created_by is null) can't be deleted via the API, only resolved/updated.
create policy "reports_delete_own" on reports
  for delete to authenticated using (auth.uid() = created_by);

-- Timeline events can only be removed by whoever created them.
create policy "timeline_events_delete_own" on timeline_events
  for delete to authenticated using (auth.uid() = created_by);

-- Feedings and knowledge progress are always personal, so owners can
-- remove their own rows (e.g. to correct a mistaken log).
create policy "feedings_delete_own" on feedings
  for delete to authenticated using (auth.uid() = user_id);

create policy "knowledge_progress_delete_own" on knowledge_progress
  for delete to authenticated using (auth.uid() = user_id);
