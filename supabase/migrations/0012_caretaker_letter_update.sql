-- Lets a caretaker edit their own letter for the next caretaker.
-- The caretakers table previously had no UPDATE policy at all, so this
-- field could be set on insert but never edited afterwards.
create policy "caretakers_update_own" on caretakers
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
