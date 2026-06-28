-- Time-bound help requests a caretaker can post for their colony —
-- visible on the colony page, the map, and /impact. No backend cron in
-- this stack (documented limitation elsewhere in this project), so
-- "auto-expires in 7 days" is enforced by filtering `expires_at > now()`
-- everywhere an active request is queried, rather than a background job
-- that flips status automatically.
create table if not exists help_requests (
  id uuid primary key default gen_random_uuid(),
  colony_id uuid not null references colonies(id) on delete cascade,
  created_by uuid not null references auth.users(id),
  type text not null check (type in (
    'food_supplies', 'foster_home', 'vet_transport',
    'neutering_help', 'backup_caretaker', 'medication', 'other'
  )),
  description text not null check (char_length(description) <= 200),
  urgency text not null default 'normal' check (urgency in ('normal', 'urgent')),
  status text not null default 'open' check (status in ('open', 'resolved')),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '7 days'),
  resolved_at timestamptz
);

alter table help_requests enable row level security;

-- Public read — this is meant to be seen on the map and /impact by
-- anyone, signed in or not.
create policy "help_requests_select_public" on help_requests
  for select using (true);

create policy "help_requests_insert_caretaker" on help_requests
  for insert to authenticated with check (
    auth.uid() = created_by
    and exists (
      select 1 from colonies
      where colonies.id = help_requests.colony_id
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

-- Any caretaker of the colony can update a request (resolve, renew) —
-- not just whoever originally posted it, same as other caretaker-shared
-- actions in this app (editing colony info, managing cats).
create policy "help_requests_update_caretaker" on help_requests
  for update to authenticated using (
    exists (
      select 1 from colonies
      where colonies.id = help_requests.colony_id
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

-- Notifies every caretaker of the colony that someone wants to help.
-- SECURITY DEFINER because that means inserting into notifications rows
-- that don't belong to the caller (see thank_action, migration 0039,
-- for the same reasoning).
create or replace function respond_to_help_request(p_help_request_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_colony_id uuid;
  v_type text;
begin
  select colony_id, type into v_colony_id, v_type
  from help_requests
  where id = p_help_request_id and status = 'open';

  if v_colony_id is null then
    return;
  end if;

  insert into notifications (user_id, colony_id, type, message)
  select
    caretakers.user_id,
    v_colony_id,
    'help_request_response',
    'Alguém respondeu ao seu pedido de ajuda. Confira na página da colônia.'
  from caretakers
  where caretakers.colony_id = v_colony_id
    and caretakers.user_id <> auth.uid();
end;
$$;

revoke execute on function respond_to_help_request(uuid) from public, anon;
grant execute on function respond_to_help_request(uuid) to authenticated;
