-- Reuses the existing `flags` table for "Report this pin" (no new
-- table — flags already has the right shape: reason, optional details,
-- optional anonymous created_by). flags.reason has a check constraint
-- (0020) limited to fake_location/harmful_content/spam/other — the 4
-- new false-pin-specific reasons need to be added to it explicitly,
-- confirmed live: inserting one without this first failed with
-- "violates check constraint flags_reason_check".
alter table flags drop constraint if exists flags_reason_check;
alter table flags add constraint flags_reason_check
  check (reason in (
    'fake_location', 'harmful_content', 'spam', 'other',
    'never_seen_cats', 'location_doesnt_exist', 'duplicate_colony', 'suspicious_harmful'
  ));
--
-- Real gap found while building this: flags is currently select-able
-- only by `authenticated` (flags_select_authenticated, 0020). That
-- would make the "3+ false-pin flags" warning badge/banner invisible
-- to anonymous visitors everywhere — and invisible to EVERYONE on the
-- colony page specifically, since it's a server component that always
-- reads as anon (this app's auth lives in browser localStorage, never
-- forwarded to server components). This narrow policy fixes that
-- without widening access to other flag categories (report flags,
-- profile flags, or other colony-flag reasons) which stay
-- authenticated-only as before — permissive policies are OR'd
-- together, so this only adds visibility for this one specific case.
create policy "flags_select_public_false_pin" on flags
  for select using (
    target_type = 'colony'
    and reason in ('never_seen_cats', 'location_doesnt_exist', 'duplicate_colony', 'suspicious_harmful')
  );

grant select on flags to anon;
