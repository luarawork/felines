-- Users can now dismiss ("mark as read") an individual notification from
-- the /notifications list, which deletes it rather than just flipping
-- `read` — there's no separate read/unread view in this app, so leaving
-- a read row around forever served no purpose. notifications_select_own
-- and notifications_update_own already scope to auth.uid() = user_id;
-- this adds the matching delete policy.
create policy "notifications_delete_own" on notifications
  for delete to authenticated using (auth.uid() = user_id);
