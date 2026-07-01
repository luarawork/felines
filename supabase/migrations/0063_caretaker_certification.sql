-- "Cuidador Preparado" certification badge.
-- Earned by completing the 5-module mini-course at /curso and
-- passing the final quiz. The client calls earn_caretaker_certification()
-- after confirming the quiz score locally — the function uses ON CONFLICT
-- DO NOTHING so calling it twice is safe. Badge shows on both /profile
-- and /u/:id.
--
-- The table has a unique constraint on user_id so the badge can only
-- be earned once (re-taking the quiz after passing still calls the RPC,
-- which silently no-ops). Direct client INSERT is blocked by the lack
-- of an insert policy — only the RPC can write to this table.
create table caretaker_certifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  earned_at timestamptz not null default now(),
  unique (user_id)
);

alter table caretaker_certifications enable row level security;

create policy "caretaker_certifications_select_public" on caretaker_certifications
  for select using (true);

-- No direct insert policy: all writes go through the RPC below.

create or replace function earn_caretaker_certification()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  insert into caretaker_certifications (user_id)
  values (auth.uid())
  on conflict (user_id) do nothing;
end;
$$;

revoke all on function earn_caretaker_certification() from public;
grant execute on function earn_caretaker_certification() to authenticated;

grant select on caretaker_certifications to anon, authenticated;
