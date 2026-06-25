-- Adds a delete policy for `thanks` (the sender can undo their own
-- thank-you), which was missing — `thanks` previously had no delete
-- policy at all, so even the sender couldn't remove their own row.
create policy "thanks_delete_own" on thanks
  for delete to authenticated using (auth.uid() = sender_user_id);

-- Cleans up test data accumulated during development. Runs as the
-- table owner in the SQL Editor, so it isn't blocked by RLS the way
-- the same deletes would be through the API.
delete from thanks where id = 'b3904219-0f4d-438c-9c3a-a7918e24d9ad';
delete from flags where id = 'e4f0b0fd-6c3b-4db3-bf56-7d626ec9f668';
delete from reports where id in (
  '6f3e5bbf-91af-4935-b66e-8ce5866d89dc',
  '21c7d00d-82f6-496a-b0ba-d1b2bd04b1f6',
  '06e43062-43ad-4b32-9afb-5b52ef51441b',
  '115c1910-87ca-4277-a8b3-dcd2c314cdbc'
);
