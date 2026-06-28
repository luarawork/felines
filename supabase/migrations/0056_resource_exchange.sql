-- Simple offer/request board for caretakers — no payment, just
-- community exchange. Whole page is authenticated-only (per spec), so
-- unlike reports/flags this never needs an anonymous path.
create table if not exists resource_posts (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references auth.users(id),
  type text not null check (type in ('offering', 'requesting')),
  category text not null check (category in (
    'food_supplies', 'equipment', 'transport', 'medication', 'volunteer_time', 'other'
  )),
  title text not null check (char_length(title) <= 60),
  description text not null check (char_length(description) <= 200),
  -- Neighborhood only, never an exact address — this is free text the
  -- poster writes themselves, so there's no server-side way to enforce
  -- "not an exact address"; that's a UI/copy instruction to the poster.
  location_hint text,
  status text not null default 'open' check (status in ('open', 'resolved')),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '30 days')
);

alter table resource_posts enable row level security;

create policy "resource_posts_select_authenticated" on resource_posts
  for select to authenticated using (true);

create policy "resource_posts_insert_own" on resource_posts
  for insert to authenticated with check (auth.uid() = created_by);

create policy "resource_posts_update_own" on resource_posts
  for update to authenticated using (auth.uid() = created_by);

-- "I'm interested" — notifies the poster. SECURITY DEFINER since it
-- writes to someone else's notifications row, same reasoning as
-- thank_action/respond_to_help_request.
create or replace function respond_to_resource_post(p_resource_post_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_created_by uuid;
begin
  select created_by into v_created_by from resource_posts where id = p_resource_post_id and status = 'open';

  if v_created_by is null or v_created_by = auth.uid() then
    return;
  end if;

  insert into notifications (user_id, colony_id, type, message)
  values (
    v_created_by,
    null,
    'resource_interest',
    'Alguém demonstrou interesse no seu anúncio de recursos. Confira seu perfil público pra essa pessoa entrar em contato.'
  );
end;
$$;

revoke execute on function respond_to_resource_post(uuid) from public, anon;
grant execute on function respond_to_resource_post(uuid) to authenticated;
