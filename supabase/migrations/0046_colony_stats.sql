-- Powers the colony page's new "Relatórios" tab. feedings has no anon
-- SELECT policy at all (by design — who fed what is personal), so a
-- public per-colony stats view can't just select from it directly;
-- these SECURITY DEFINER functions return only aggregates scoped to one
-- colony, never raw feeding/report rows.

create or replace function get_colony_stats(p_colony_id uuid)
returns table (
  total_cats bigint,
  cats_castrated bigint,
  total_feedings bigint,
  total_reports bigint,
  total_reports_resolved bigint,
  total_caretakers bigint,
  total_timeline_events bigint,
  days_since_registered int
)
language sql
security definer
set search_path = public
stable
as $$
  select
    (select count(*) from cats where colony_id = p_colony_id),
    (select count(*) from cats where colony_id = p_colony_id and castrated),
    (select count(*) from feedings where colony_id = p_colony_id),
    (select count(*) from reports where colony_id = p_colony_id),
    (select count(*) from reports where colony_id = p_colony_id and status = 'resolved'),
    (select count(*) from caretakers where colony_id = p_colony_id),
    (select count(*) from timeline_events where colony_id = p_colony_id),
    (select extract(day from now() - created_at)::int from colonies where id = p_colony_id);
$$;

revoke execute on function get_colony_stats(uuid) from public, anon;
grant execute on function get_colony_stats(uuid) to anon, authenticated;

-- Feeding check-ins per week for the last 8 weeks (food + water combined).
create or replace function get_colony_feeding_weekly(p_colony_id uuid)
returns table (week_start date, check_in_count bigint)
language sql
security definer
set search_path = public
stable
as $$
  select date_trunc('week', week)::date, coalesce(count(feedings.id), 0)
  from generate_series(date_trunc('week', now()) - interval '7 weeks', date_trunc('week', now()), interval '1 week') as week
  left join feedings on feedings.colony_id = p_colony_id
    and date_trunc('week', feedings.created_at) = week
  group by week
  order by week;
$$;

revoke execute on function get_colony_feeding_weekly(uuid) from public, anon;
grant execute on function get_colony_feeding_weekly(uuid) to anon, authenticated;

-- Reports submitted per month for the last 6 months.
create or replace function get_colony_reports_monthly(p_colony_id uuid)
returns table (month_start date, report_count bigint)
language sql
security definer
set search_path = public
stable
as $$
  select date_trunc('month', month)::date, coalesce(count(reports.id), 0)
  from generate_series(date_trunc('month', now()) - interval '5 months', date_trunc('month', now()), interval '1 month') as month
  left join reports on reports.colony_id = p_colony_id
    and date_trunc('month', reports.created_at) = month
  group by month
  order by month;
$$;

revoke execute on function get_colony_reports_monthly(uuid) from public, anon;
grant execute on function get_colony_reports_monthly(uuid) to anon, authenticated;

-- Count of reports by type, for this colony only.
create or replace function get_colony_report_breakdown(p_colony_id uuid)
returns table (report_type text, report_count bigint)
language sql
security definer
set search_path = public
stable
as $$
  select type, count(*) from reports
  where colony_id = p_colony_id
  group by type
  order by count(*) desc;
$$;

revoke execute on function get_colony_report_breakdown(uuid) from public, anon;
grant execute on function get_colony_report_breakdown(uuid) to anon, authenticated;
