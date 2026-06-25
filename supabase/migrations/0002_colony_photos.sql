-- Adds cover photo support for colonies, required by the /colony/new form.
-- Run this in the Supabase SQL Editor after 0001_init.sql.

alter table colonies add column if not exists cover_photo_url text;

-- Storage bucket for colony cover photos. Public read (photos are not
-- sensitive), authenticated-only upload.
insert into storage.buckets (id, name, public)
values ('colony-photos', 'colony-photos', true)
on conflict (id) do nothing;

create policy "colony_photos_read_public" on storage.objects
  for select using (bucket_id = 'colony-photos');

create policy "colony_photos_insert_authenticated" on storage.objects
  for insert to authenticated with check (bucket_id = 'colony-photos');
