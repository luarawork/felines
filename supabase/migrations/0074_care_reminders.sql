-- Recurring care reminders per colony (e.g. "check water every 3 days",
-- "health check every 30 days"). No backend cron in this stack
-- (documented limitation elsewhere in this project — see
-- help_requests' 7-day expiry, also computed client-side rather than
-- flipped by a background job), so "due" status is derived on read
-- from `last_done_at + frequency_days`, not pushed via notification.
--
-- Scoped to caretakers/creator only (select/insert/update/delete) —
-- unlike the colony's public-facing timeline/needs sections, a care
-- schedule is a private planning tool for whoever actually looks after
-- the colony, not something the general public needs to see.
create table if not exists care_reminders (
  id uuid primary key default gen_random_uuid(),
  colony_id uuid not null references colonies(id) on delete cascade,
  created_by uuid not null references auth.users(id),
  type text not null check (type in ('feeding', 'water', 'health_check', 'shelter_check', 'custom')),
  custom_label text check (char_length(custom_label) <= 60),
  frequency_days int not null check (frequency_days > 0 and frequency_days <= 365),
  last_done_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table care_reminders enable row level security;

create policy "care_reminders_select_caretaker" on care_reminders
  for select to authenticated
  using (
    exists (
      select 1 from colonies
      where colonies.id = care_reminders.colony_id
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

create policy "care_reminders_insert_caretaker" on care_reminders
  for insert to authenticated
  with check (
    auth.uid() = created_by
    and exists (
      select 1 from colonies
      where colonies.id = care_reminders.colony_id
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

-- Any caretaker can mark a reminder done or delete it, not just whoever
-- created it — same shared-responsibility model already used for
-- help_requests and colony info edits.
create policy "care_reminders_update_caretaker" on care_reminders
  for update to authenticated
  using (
    exists (
      select 1 from colonies
      where colonies.id = care_reminders.colony_id
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

create policy "care_reminders_delete_caretaker" on care_reminders
  for delete to authenticated
  using (
    exists (
      select 1 from colonies
      where colonies.id = care_reminders.colony_id
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

grant select, insert, update, delete on care_reminders to authenticated;
