-- Powers the public /impact page with live, aggregate-only platform
-- statistics. Several of the source tables (feedings, knowledge_progress)
-- have no anon SELECT policy at all — by design, those rows are personal
-- (who fed what, who read what). Rather than widening row-level access
-- just so a public stats page can compute a count, these two
-- SECURITY DEFINER functions return only aggregates/anonymized labels,
-- never raw rows, no matter who calls them.

-- One row of platform-wide totals. No per-user or per-colony detail is
-- exposed — every field here is a count or an average.
create or replace function get_platform_impact_stats()
returns table (
  total_colonies bigint,
  total_cats bigint,
  total_cats_castrated bigint,
  total_reports bigint,
  total_reports_resolved bigint,
  total_feedings bigint,
  total_caretakers bigint,
  total_articles_read bigint,
  most_read_article_slug text
)
language sql
security definer
set search_path = public
stable
as $$
  select
    (select count(*) from colonies),
    (select count(*) from cats),
    (select count(*) from cats where castrated),
    (select count(*) from reports),
    (select count(*) from reports where status = 'resolved'),
    (select count(*) from feedings),
    (select count(distinct user_id) from caretakers),
    (select count(*) from knowledge_progress),
    (
      select article_slug from knowledge_progress
      group by article_slug
      order by count(*) desc
      limit 1
    );
$$;

revoke all on function get_platform_impact_stats() from public;
grant execute on function get_platform_impact_stats() to anon, authenticated;

-- The last N platform-wide actions, fully anonymized: no user id, no
-- colony id/name, no coordinates — just what kind of thing happened and
-- when. "kind" is a short machine label the page maps to a human
-- sentence (e.g. "colony_created" -> "A colony was registered").
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
  ) combined
  order by occurred_at desc
  limit p_limit;
$$;

revoke all on function get_recent_platform_activity(int) from public;
grant execute on function get_recent_platform_activity(int) to anon, authenticated;
