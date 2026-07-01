-- Community-curated directory of vet clinics, shelters, NGOs,
-- rescue groups, and other cat-related contacts. Public read;
-- authenticated write; owner delete. No moderation table yet —
-- FlagButton can be extended to cover contacts if abuse becomes
-- an issue.
create table community_contacts (
  id uuid primary key default gen_random_uuid(),
  city text not null check (char_length(city) >= 1 and char_length(city) <= 100),
  name text not null check (char_length(name) >= 1 and char_length(name) <= 150),
  phone text check (char_length(phone) <= 30),
  email text check (char_length(email) <= 200),
  social text check (char_length(social) <= 200),
  category text not null default 'general'
    check (category in ('vet', 'shelter', 'ngo', 'rescue', 'transport', 'legal', 'general')),
  notes text check (char_length(notes) <= 300),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table community_contacts enable row level security;

create policy "community_contacts_select_public" on community_contacts
  for select using (true);

create policy "community_contacts_insert_authenticated" on community_contacts
  for insert to authenticated
  with check (auth.uid() = created_by);

create policy "community_contacts_delete_own" on community_contacts
  for delete to authenticated
  using (auth.uid() = created_by);

grant select on community_contacts to anon, authenticated;
grant insert (city, name, phone, email, social, category, notes, created_by) on community_contacts to authenticated;
grant delete on community_contacts to authenticated;
