-- Lets a caretaker formally register a neutering need for their
-- colony, making it visible to NGOs/prefectures (and the rest of the
-- community) on the colony page, the map, /impact, and the stats tab.
create table if not exists neutering_requests (
  id uuid primary key default gen_random_uuid(),
  colony_id uuid not null references colonies(id) on delete cascade,
  created_by uuid not null references auth.users(id),
  cats_count int not null check (cats_count > 0),
  urgency text not null check (urgency in ('low', 'medium', 'high')),
  transport_available text not null check (transport_available in ('yes', 'no', 'need_help')),
  best_times text,
  notes text,
  status text not null default 'open' check (status in ('open', 'in_progress', 'completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table neutering_requests enable row level security;

-- Public read — the whole point is visibility for NGOs/prefectures
-- deciding where to act, not just the colony's own caretakers.
create policy "neutering_requests_select_public" on neutering_requests
  for select using (true);

create policy "neutering_requests_insert_caretaker" on neutering_requests
  for insert to authenticated with check (
    auth.uid() = created_by
    and exists (
      select 1 from colonies
      where colonies.id = neutering_requests.colony_id
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

-- Any caretaker of the colony can update status (in_progress/completed),
-- same shared-management pattern as help_requests.
create policy "neutering_requests_update_caretaker" on neutering_requests
  for update to authenticated using (
    exists (
      select 1 from colonies
      where colonies.id = neutering_requests.colony_id
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
