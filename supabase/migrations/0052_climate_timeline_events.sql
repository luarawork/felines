-- Lets the weather check (lib/notifications.ts checkExtremeWeatherForCaretaker)
-- insert system-generated timeline events (created_by null) for extreme
-- heat/cold/heavy rain — the existing timeline_events_insert_authenticated
-- policy requires auth.uid() = created_by, which a null author can never
-- satisfy. Scoped tightly: only these 3 event types, only with a null
-- author, so this can't be used to insert an anonymous-looking entry of
-- any other kind.
create policy "timeline_events_insert_weather_system" on timeline_events
  for insert to authenticated with check (
    created_by is null and event_type in ('extreme_heat', 'extreme_cold', 'heavy_rain')
  );

-- Extends the colony stats tab with a weather event count and a
-- by-month breakdown, same shape as get_colony_feeding_weekly/
-- get_colony_reports_monthly (migration 0046). Adding a column to an
-- existing function's OUT/return-table signature isn't something
-- CREATE OR REPLACE can do on its own — Postgres requires the function
-- to be dropped first whenever the row type changes shape.
drop function if exists get_colony_stats(uuid);
create or replace function get_colony_stats(p_colony_id uuid)
returns table (
  total_cats bigint,
  cats_castrated bigint,
  total_feedings bigint,
  total_reports bigint,
  total_reports_resolved bigint,
  total_caretakers bigint,
  total_timeline_events bigint,
  total_weather_events bigint,
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
    (
      select count(*) from timeline_events
      where colony_id = p_colony_id
      and event_type in ('extreme_heat', 'extreme_cold', 'heavy_rain')
    ),
    (select extract(day from now() - created_at)::int from colonies where id = p_colony_id);
$$;

revoke execute on function get_colony_stats(uuid) from public, anon;
grant execute on function get_colony_stats(uuid) to anon, authenticated;

create or replace function get_colony_weather_monthly(p_colony_id uuid)
returns table (month_start date, event_count bigint)
language sql
security definer
set search_path = public
stable
as $$
  select date_trunc('month', month)::date, coalesce(count(timeline_events.id), 0)
  from generate_series(date_trunc('month', now()) - interval '5 months', date_trunc('month', now()), interval '1 month') as month
  left join timeline_events on timeline_events.colony_id = p_colony_id
    and timeline_events.event_type in ('extreme_heat', 'extreme_cold', 'heavy_rain')
    and date_trunc('month', timeline_events.created_at) = month
  group by month
  order by month;
$$;

revoke execute on function get_colony_weather_monthly(uuid) from public, anon;
grant execute on function get_colony_weather_monthly(uuid) to anon, authenticated;
