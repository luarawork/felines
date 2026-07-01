-- FlagButton (the general colony/report/profile flag flow, reasons:
-- fake_location/harmful_content/spam/other — distinct from the
-- false-pin-specific flow in ReportFalsePinButton, already deduped by
-- 0069's flags_one_false_pin_per_user_per_colony) had no constraint
-- stopping the same signed-in user from submitting the same flag
-- against the same target repeatedly. FlagButton's client UI has no
-- duplicate check either, so a user could resubmit the same flag
-- (accidentally or to pad the moderation queue). Anonymous flags
-- (created_by is null) are intentionally exempt, same as 0069 — no
-- stable identity to dedupe against for them.
--
-- Scoped to exclude the false-pin reasons already covered by 0069's
-- narrower index, so the two constraints don't overlap on the same rows.
create unique index if not exists flags_unique_per_user_target_reason
  on flags (target_type, target_id, reason, created_by)
  where created_by is not null
    and reason not in ('never_seen_cats', 'location_doesnt_exist', 'duplicate_colony', 'suspicious_harmful');
