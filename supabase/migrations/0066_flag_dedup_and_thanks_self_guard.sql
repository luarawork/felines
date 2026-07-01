-- Two independent hardening fixes found during an auth/colony-detail
-- logic audit:
--
-- 1. `flags` had no constraint stopping the same signed-in user from
--    flagging the same target twice — FlagButton's client UI has no
--    duplicate check either, so a user could resubmit the same flag
--    repeatedly (accidentally or to pad a moderation queue). Anonymous
--    flags (created_by is null) are intentionally exempt, same as
--    before, since there's no stable identity to dedupe against for
--    them — this mirrors the story-reaction pattern (0058) of only
--    deduping when a real user id is present.
create unique index if not exists flags_unique_per_user_target
  on flags (target_type, target_id, reason, created_by)
  where created_by is not null;

-- 2. ThankYouButton already blocks a caretaker thanking themselves
--    client-side (`userId === caretakerUserId`), but nothing stopped
--    the same insert via a direct RPC/REST call bypassing the client.
--    Enforce it at the DB level too, consistent with how self-confirm
--    (0038) and self-verify (0054) are both blocked server-side, not
--    just in the UI.
alter table thanks drop constraint if exists thanks_no_self_thank;
alter table thanks add constraint thanks_no_self_thank
  check (sender_user_id <> caretaker_user_id);
