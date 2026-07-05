-- Requested moderation escalation: once a colony pin collects 3
-- false-pin flags (the same 4 reasons already checked client-side in
-- ColonyMap.tsx to render the "flagged" chip — never_seen_cats,
-- location_doesnt_exist, duplicate_colony, suspicious_harmful), the pin
-- itself is removed from the map, and whoever created it is barred from
-- posting new colonies/reports for 1 month. If the same account hits
-- this 3 times (ban_count reaches 3), the ban becomes permanent.
--
-- This used to only be a client-side count (ColonyMap.tsx) driving a
-- cosmetic "flagged" badge — nothing actually removed the pin or
-- touched the creator's account. This migration moves the threshold
-- check into the database (a trigger, so it fires no matter which
-- client submitted the 3rd flag) and adds real enforcement.

alter table profiles
  add column if not exists banned_until timestamptz,
  add column if not exists ban_count int not null default 0,
  add column if not exists banned boolean not null default false;

alter table colonies
  add column if not exists removed_at timestamptz;

-- Security definer so RLS insert policies (below) can check ban status
-- without needing a public grant on profiles.banned/banned_until/ban_count
-- — those columns should stay as invisible to other users as
-- current_streak/longest_streak already are (0066).
create or replace function is_user_banned(p_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    (select banned or (banned_until is not null and banned_until > now())
     from profiles where id = p_user_id),
    false
  );
$$;

revoke execute on function is_user_banned(uuid) from public;
grant execute on function is_user_banned(uuid) to anon, authenticated;

create or replace function handle_false_pin_threshold()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_flag_count int;
  v_creator_id uuid;
  v_new_ban_count int;
begin
  if new.target_type <> 'colony' then
    return new;
  end if;
  if new.reason not in ('never_seen_cats', 'location_doesnt_exist', 'duplicate_colony', 'suspicious_harmful') then
    return new;
  end if;

  select count(*) into v_flag_count
  from flags
  where target_type = 'colony'
    and target_id = new.target_id
    and reason in ('never_seen_cats', 'location_doesnt_exist', 'duplicate_colony', 'suspicious_harmful');

  if v_flag_count < 3 then
    return new;
  end if;

  select created_by into v_creator_id from colonies where id = new.target_id and removed_at is null;
  if v_creator_id is null then
    -- Either already removed (a later flag crossing the same threshold
    -- again) or has no creator on record — nothing further to do.
    return new;
  end if;

  update colonies set removed_at = now() where id = new.target_id;

  update profiles
  set ban_count = ban_count + 1,
      banned = (ban_count + 1) >= 3,
      banned_until = case when (ban_count + 1) >= 3 then null else now() + interval '1 month' end
  where id = v_creator_id
  returning ban_count into v_new_ban_count;

  insert into notifications (user_id, colony_id, type, message)
  values (
    v_creator_id,
    new.target_id,
    'colony_removed_ban',
    case
      when v_new_ban_count >= 3 then
        'Uma colônia que você cadastrou foi removida após 3 denúncias da comunidade. Como isso já aconteceu 3 vezes com sua conta, ela foi banida permanentemente.'
      else
        'Uma colônia que você cadastrou foi removida após 3 denúncias da comunidade. Sua conta ficará impedida de cadastrar colônias ou relatos no mapa por 1 mês.'
    end
  );

  return new;
end;
$$;

drop trigger if exists trg_false_pin_threshold on flags;
create trigger trg_false_pin_threshold
  after insert on flags
  for each row
  execute function handle_false_pin_threshold();

-- Enforce the ban at the one place every write path (app UI, direct
-- REST call) actually goes through: the insert policies themselves.
-- Anonymous callers (auth.uid() is null) are unaffected — only an
-- identified, banned account is blocked.
drop policy if exists "colonies_insert_authenticated" on colonies;
create policy "colonies_insert_authenticated" on colonies
  for insert to authenticated with check (auth.uid() = created_by and not is_user_banned(auth.uid()));

drop policy if exists "reports_insert_public" on reports;
create policy "reports_insert_public" on reports
  for insert with check (auth.uid() is null or not is_user_banned(auth.uid()));
