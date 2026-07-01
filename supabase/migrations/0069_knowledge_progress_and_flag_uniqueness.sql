-- (1) Fixes a real bug: components/ArticleProgressTracker.tsx upserts into
-- knowledge_progress with `onConflict: "user_id,article_slug"`, but no
-- unique constraint on that pair has ever existed on this table (see
-- 0001_init.sql) — the client-side dedup in ProfileContent.tsx (reading
-- into a Set) was masking that every "read" actually inserted a brand
-- new row instead of being a true no-op. Postgres requires a matching
-- unique/exclusion constraint for ON CONFLICT to target; without one the
-- upsert either errors or (depending on driver behavior) silently
-- duplicates rows, undermining anything that counts distinct articles
-- read (the profile's reading progress, the 3-articles quiz gate).
--
-- Existing duplicate rows are collapsed first (keeping the earliest
-- read_at per user/article) so the unique index can be created cleanly.
delete from knowledge_progress a
using knowledge_progress b
where a.user_id = b.user_id
  and a.article_slug = b.article_slug
  and a.read_at > b.read_at;

-- Tie-break: if two rows for the same user/article somehow share the
-- exact same read_at, keep the lowest id so the delete above is
-- deterministic even in that edge case.
delete from knowledge_progress a
using knowledge_progress b
where a.user_id = b.user_id
  and a.article_slug = b.article_slug
  and a.read_at = b.read_at
  and a.id > b.id;

alter table knowledge_progress
  add constraint knowledge_progress_user_article_unique unique (user_id, article_slug);

-- (2) Fixes a real gap: flags has no constraint stopping the same user
-- from submitting multiple false-pin flags against the same colony
-- (spec: one flag per user per colony). Scoped narrowly to the
-- false-pin reasons introduced in 0055 so existing report/other-colony
-- flag flows (which allow re-flagging, e.g. after new evidence) are
-- unaffected.
create unique index if not exists flags_one_false_pin_per_user_per_colony
  on flags (target_type, target_id, created_by)
  where target_type = 'colony'
    and reason in ('never_seen_cats', 'location_doesnt_exist', 'duplicate_colony', 'suspicious_harmful')
    and created_by is not null;
