-- New colonies start "unverified" and become "community_verified" once
-- 3 different non-caretaker, non-creator users confirm they've seen
-- cats at that location — a lightweight trust signal distinct from
-- caretaking itself.
alter table colonies add column if not exists verified_status text not null default 'unverified'
  check (verified_status in ('unverified', 'community_verified'));
alter table colonies add column if not exists verified_at timestamptz;

-- colonies' SELECT grant was already narrowed to an explicit column
-- list back in 0017 (to keep exact lat/lng out of it) — a column added
-- afterward via ALTER TABLE isn't automatically included in that
-- existing grant, so it needs its own explicit grant here.
grant select (verified_status, verified_at) on colonies to anon, authenticated;

create table if not exists colony_verifications (
  id uuid primary key default gen_random_uuid(),
  colony_id uuid not null references colonies(id) on delete cascade,
  user_id uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  unique (colony_id, user_id)
);

alter table colony_verifications enable row level security;

create policy "colony_verifications_select_public" on colony_verifications
  for select using (true);

-- Caretakers are assumed to have already seen the cats, and the
-- creator obviously has too — neither counts toward "community"
-- verification. Enforced here, not just hidden in the UI, since a
-- caretaker could otherwise call this directly.
create policy "colony_verifications_insert_non_caretaker" on colony_verifications
  for insert to authenticated with check (
    auth.uid() = user_id
    and not exists (
      select 1 from colonies
      where colonies.id = colony_verifications.colony_id
      and colonies.created_by = auth.uid()
    )
    and not exists (
      select 1 from caretakers
      where caretakers.colony_id = colony_verifications.colony_id
      and caretakers.user_id = auth.uid()
    )
  );

-- Flips a colony to community_verified the moment it reaches 3
-- confirmations — permanent once reached, per spec ("verification is
-- permanent once reached"), so this never runs in reverse even if
-- rows were somehow removed later (there's no delete policy on
-- colony_verifications at all, so that's not a real path today anyway).
create or replace function check_colony_verification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
begin
  select count(*) into v_count from colony_verifications where colony_id = new.colony_id;

  if v_count >= 3 then
    update colonies
    set verified_status = 'community_verified', verified_at = coalesce(verified_at, now())
    where id = new.colony_id and verified_status <> 'community_verified';
  end if;

  return new;
end;
$$;

drop trigger if exists check_colony_verification_trigger on colony_verifications;
create trigger check_colony_verification_trigger
  after insert on colony_verifications
  for each row
  execute function check_colony_verification();
