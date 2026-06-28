-- Automatic 0-100 health score per colony, recalculated by an explicit
-- RPC call after each relevant action (feeding, cat sighting,
-- castration update, report submitted/resolved, caretaker joined/left)
-- — same "call after the action succeeds" pattern as
-- record_care_streak, rather than a trigger on five different tables.
alter table colonies add column if not exists health_score int not null default 50;
alter table colonies add column if not exists health_status text not null default 'stable'
  check (health_status in ('thriving', 'stable', 'needs_attention', 'at_risk'));

-- New columns added via ALTER TABLE aren't included in colonies'
-- existing column-scoped SELECT grant (narrowed since 0017) — needs an
-- explicit grant, same gotcha hit in 0054.
grant select (health_score, health_status) on colonies to anon, authenticated;

create or replace function recalculate_colony_health(p_colony_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_total_cats int;
  v_seen_recently int;
  v_castrated int;
  v_feedings_14d int;
  v_open_sensitive_reports int;
  v_caretaker_count int;
  v_feeding_score numeric;
  v_sighting_score numeric;
  v_castration_score numeric;
  v_reports_score numeric;
  v_caretaker_score numeric;
  v_total_score int;
  v_status text;
begin
  select count(*) into v_total_cats from cats where colony_id = p_colony_id;
  select count(*) into v_seen_recently from cats
    where colony_id = p_colony_id and last_seen >= now() - interval '7 days';
  select count(*) into v_castrated from cats where colony_id = p_colony_id and castrated;
  select count(*) into v_feedings_14d from feedings
    where colony_id = p_colony_id and created_at >= now() - interval '14 days';
  select count(*) into v_open_sensitive_reports from reports
    where colony_id = p_colony_id and status = 'open' and sensitive;
  select count(*) into v_caretaker_count from caretakers where colony_id = p_colony_id;

  -- 30%: feedings in the last 14 days vs. an expected 1/day.
  v_feeding_score := least(v_feedings_14d / 14.0, 1.0) * 30;

  -- 25%: % of named cats seen in the last 7 days. A colony with no
  -- cats registered yet has nothing to fail covering, so it scores
  -- full marks here rather than being penalized for not existing yet.
  v_sighting_score := case when v_total_cats = 0 then 25
    else (v_seen_recently::numeric / v_total_cats) * 25 end;

  -- 20%: % of registered cats marked castrated. Same empty-colony
  -- reasoning as above.
  v_castration_score := case when v_total_cats = 0 then 20
    else (v_castrated::numeric / v_total_cats) * 20 end;

  -- 15%: penalty for unresolved sensitive reports (suspected
  -- poisoning/abuse/disease outbreak) — 5 points off per open one,
  -- floored at 0.
  v_reports_score := greatest(15 - (v_open_sensitive_reports * 5), 0);

  -- 10%: caretaker coverage, capped at 2 caretakers for full marks —
  -- a third caretaker doesn't make a colony meaningfully safer than a
  -- second one does.
  v_caretaker_score := least(v_caretaker_count / 2.0, 1.0) * 10;

  v_total_score := round(
    v_feeding_score + v_sighting_score + v_castration_score + v_reports_score + v_caretaker_score
  );
  v_total_score := greatest(0, least(100, v_total_score));

  v_status := case
    when v_total_score >= 80 then 'thriving'
    when v_total_score >= 60 then 'stable'
    when v_total_score >= 40 then 'needs_attention'
    else 'at_risk'
  end;

  update colonies set health_score = v_total_score, health_status = v_status where id = p_colony_id;
end;
$$;

-- Unlike notify_followers/respond_to_help_request, this one is safe to
-- expose to anon too: it never writes to another user's data, only
-- recomputes this colony's own derived health_score/health_status from
-- already-aggregate queries — so an anonymous report submission (a
-- core, intentional feature of this app) can still keep the score
-- accurate without needing a signed-in caller.
revoke execute on function recalculate_colony_health(uuid) from public;
grant execute on function recalculate_colony_health(uuid) to anon, authenticated;

-- Read-only breakdown of the 5 factors, for the colony stats tab's
-- visual bars — recomputes the same numbers rather than storing them,
-- since they're cheap to derive and storing them would mean keeping
-- two sources of truth in sync.
create or replace function get_colony_health_breakdown(p_colony_id uuid)
returns table (
  feeding_score numeric,
  sighting_score numeric,
  castration_score numeric,
  reports_score numeric,
  caretaker_score numeric
)
language sql
security definer
set search_path = public
stable
as $$
  select
    least((select count(*) from feedings where colony_id = p_colony_id and created_at >= now() - interval '14 days') / 14.0, 1.0) * 30,
    case when (select count(*) from cats where colony_id = p_colony_id) = 0 then 25
      else (select count(*) from cats where colony_id = p_colony_id and last_seen >= now() - interval '7 days')::numeric
        / (select count(*) from cats where colony_id = p_colony_id) * 25 end,
    case when (select count(*) from cats where colony_id = p_colony_id) = 0 then 20
      else (select count(*) from cats where colony_id = p_colony_id and castrated)::numeric
        / (select count(*) from cats where colony_id = p_colony_id) * 20 end,
    greatest(15 - ((select count(*) from reports where colony_id = p_colony_id and status = 'open' and sensitive) * 5), 0),
    least((select count(*) from caretakers where colony_id = p_colony_id) / 2.0, 1.0) * 10;
$$;

revoke execute on function get_colony_health_breakdown(uuid) from public, anon;
grant execute on function get_colony_health_breakdown(uuid) to anon, authenticated;

-- Recreates confirm_report (last touched in 0038/0047) once more, just
-- to add a recalculate_colony_health call on the auto-resolve-at-3
-- path — otherwise a report resolved via the 3-confirmation threshold
-- (as opposed to a caretaker's manual resolve, handled client-side in
-- ReportsList) would leave the colony's health score stale.
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

    if v_colony_id is not null then
      perform recalculate_colony_health(v_colony_id);
    end if;
  end if;
end;
$$;

revoke execute on function confirm_report(uuid) from public;
grant execute on function confirm_report(uuid) to authenticated;
