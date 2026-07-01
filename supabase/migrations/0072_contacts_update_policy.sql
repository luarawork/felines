-- community_contacts (0061) had insert-own and delete-own policies but
-- no update policy, so the app had no way to let a contact's author
-- edit it after posting (only delete-and-recreate). Adds an
-- update-own policy, matching the existing insert/delete pattern.
create policy "community_contacts_update_own" on community_contacts
  for update to authenticated
  using (auth.uid() = created_by)
  with check (auth.uid() = created_by);

grant update (city, name, phone, email, social, category, notes) on community_contacts to authenticated;
