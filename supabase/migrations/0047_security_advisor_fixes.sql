-- Addresses warnings from Supabase's Security Advisor.

-- 1. function_search_path_mutable: 4 functions never set search_path,
--    so a session-level search_path change could redirect an unqualified
--    table/function reference inside them to a different schema. Same
--    bodies as before, just adding `set search_path = public` (the
--    pattern every other function in this project already follows).
create or replace function set_report_sensitivity()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.sensitive := new.type in ('suspected_poisoning', 'suspected_abuse', 'disease_outbreak');
  return new;
end;
$$;

create or replace function set_report_location_blur()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.latitude is not null and new.longitude is not null then
    new.latitude_blurred := new.latitude + (random() - 0.5) * 0.01;
    new.longitude_blurred := new.longitude + (random() - 0.5) * 0.01;
  end if;
  return new;
end;
$$;

create or replace function haversine_meters(lat1 float, lon1 float, lat2 float, lon2 float)
returns float
language sql
immutable
set search_path = public
as $$
  select 6371000 * acos(
    least(1.0, greatest(-1.0,
      cos(radians(lat1)) * cos(radians(lat2)) * cos(radians(lon2) - radians(lon1)) +
      sin(radians(lat1)) * sin(radians(lat2))
    ))
  );
$$;

create or replace function confirm_report(p_report_id uuid)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_confirmations int;
  v_sensitive boolean;
  v_colony_id uuid;
  v_type text;
  v_status text;
  v_created_by uuid;
begin
  select status, created_by into v_status, v_created_by from reports where id = p_report_id;
  if v_status is null or v_status = 'resolved' then
    return;
  end if;
  if v_created_by is not null and v_created_by = auth.uid() then
    return;
  end if;

  begin
    insert into report_confirmations (report_id, user_id) values (p_report_id, auth.uid());
  exception when unique_violation then
    return;
  end;

  update reports
  set confirmations = confirmations + 1
  where id = p_report_id
  returning confirmations, sensitive, colony_id, type
  into v_confirmations, v_sensitive, v_colony_id, v_type;

  if v_confirmations >= 3 then
    update reports set status = 'resolved' where id = p_report_id;

    if v_sensitive and v_colony_id is not null then
      insert into timeline_events (colony_id, event_type, description, created_by)
      values (
        v_colony_id,
        'report_resolved',
        'Relato sensível (' || v_type || ') resolvido após 3 confirmações.',
        auth.uid()
      );
    end if;
  end if;
end;
$$;

revoke execute on function confirm_report(uuid) from public;
grant execute on function confirm_report(uuid) to authenticated;

-- 2. anon/authenticated_security_definer_function_executable:
--    check_sighting_cluster() is a trigger function, never meant to be
--    called directly via /rest/v1/rpc — it picked up the same
--    default-privilege EXECUTE grant every new function gets (see
--    0044/0045's notes on this Supabase behavior). Trigger firing
--    doesn't require the firing role to hold EXECUTE on the trigger
--    function, so revoking from everyone doesn't break the trigger
--    itself (confirmed: it's how Postgres trigger invocation works).
revoke execute on function check_sighting_cluster() from public, anon, authenticated;

-- The get_colony_*/get_platform_* and mark_cat_seen_today/
-- record_care_streak/thank_action/get_colony_exact_location warnings
-- are expected — those are deliberately public (read-only aggregates)
-- or authenticated-only by design, already verified live in prior
-- migrations. No change needed for those.

-- 3. public_bucket_allows_listing: colony-photos is a public bucket, so
--    direct object reads (the only thing this app does — getPublicUrl()
--    constructs a URL, it doesn't query storage.objects) work via the
--    bucket's public flag regardless of RLS. This SELECT policy only
--    additionally allowed listing/enumerating every file in the bucket
--    through the Storage API — not needed for how the app actually uses
--    public photos, so removing it doesn't break any upload/display flow.
drop policy if exists "colony_photos_read_public" on storage.objects;
