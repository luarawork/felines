-- Adds notifications to the public /impact activity feed — but only
-- the `type` column ('extreme_weather', 'cat_unseen', 'sighting_cluster',
-- 'action_thanks'), never `message`. The message text often names the
-- specific colony (e.g. "Vários avistamentos perto de Praça X..."),
-- which would leak exactly the kind of identifying detail this feed is
-- built to avoid — anonymization has to happen at the column level, not
-- by trusting the page to strip it back out after the fact.
create or replace function get_recent_platform_activity(p_limit int default 20)
returns table (
  kind text,
  occurred_at timestamptz
)
language sql
security definer
set search_path = public
stable
as $$
  select kind, occurred_at from (
    select event_type as kind, created_at as occurred_at from timeline_events
    union all
    select ('report:' || type) as kind, created_at as occurred_at from reports
    union all
    select 'article_read' as kind, read_at as occurred_at from knowledge_progress
    union all
    select ('notification:' || type) as kind, created_at as occurred_at from notifications
  ) combined
  order by occurred_at desc
  limit p_limit;
$$;

revoke execute on function get_recent_platform_activity(int) from public, anon;
grant execute on function get_recent_platform_activity(int) to anon, authenticated;
