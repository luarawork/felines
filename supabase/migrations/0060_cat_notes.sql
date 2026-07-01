-- Community observations for individual cats. Anyone can read them;
-- only authenticated users can add one. There is no update policy —
-- you can add or remove your own notes, but not silently edit them
-- after the fact (same pattern as colony_stories).
create table cat_notes (
  id uuid primary key default gen_random_uuid(),
  cat_id uuid not null references cats(id) on delete cascade,
  created_by uuid references auth.users(id) on delete set null,
  body text not null check (char_length(body) >= 1 and char_length(body) <= 500),
  health_status text check (health_status in ('good', 'concerning', 'serious')),
  created_at timestamptz not null default now()
);

alter table cat_notes enable row level security;

create policy "cat_notes_select_public" on cat_notes
  for select using (true);

create policy "cat_notes_insert_authenticated" on cat_notes
  for insert to authenticated
  with check (auth.uid() = created_by);

create policy "cat_notes_delete_own" on cat_notes
  for delete to authenticated
  using (auth.uid() = created_by);

grant select on cat_notes to anon, authenticated;
grant insert (cat_id, created_by, body, health_status) on cat_notes to authenticated;
grant delete on cat_notes to authenticated;
