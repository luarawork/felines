-- Security fix: anon's column grant on `reports` (0024/0025/0031/0032)
-- included raw `latitude`/`longitude` — exact coordinates, readable by
-- anyone with no account, for every report type including sensitive
-- ones (suspected_poisoning, suspected_abuse, disease_outbreak). Since
-- reports are filed at/near the real colony location, this let anyone
-- recover a colony's near-exact position by reading its open reports,
-- completely bypassing the colonies table's own blur system.
--
-- Mirrors the approach already used for colonies: a blurred column pair
-- is what anon actually reads; exact latitude/longitude stays readable
-- only by authenticated users (gated by reports_select_authenticated).

alter table reports add column if not exists latitude_blurred float;
alter table reports add column if not exists longitude_blurred float;

-- Backfill: same ~500m-radius wide-blur formula used for colonies
-- (0018_regenerate_wide_blur.sql).
update reports
set
  latitude_blurred = latitude + (random() - 0.5) * 0.01,
  longitude_blurred = longitude + (random() - 0.5) * 0.01
where latitude is not null and latitude_blurred is null;

-- Computes the blurred pair automatically on every insert/update of the
-- exact coordinates, so no client code path (ReportButton, HelpFlow,
-- QuickSightingForm, LostCatForm, SightingReportButton...) has to
-- remember to compute it — a forgotten call site was exactly how the
-- original colonies blur very nearly worked, so this is enforced once,
-- centrally, in the database instead.
create or replace function set_report_location_blur()
returns trigger
language plpgsql
as $$
begin
  if new.latitude is not null and new.longitude is not null then
    new.latitude_blurred := new.latitude + (random() - 0.5) * 0.01;
    new.longitude_blurred := new.longitude + (random() - 0.5) * 0.01;
  end if;
  return new;
end;
$$;

drop trigger if exists set_report_location_blur_trigger on reports;
create trigger set_report_location_blur_trigger
  before insert or update of latitude, longitude on reports
  for each row
  execute function set_report_location_blur();

-- The actual fix: anon's column grant no longer includes raw
-- latitude/longitude, only the blurred pair. authenticated keeps full
-- column access (unaffected — no grant was ever revoked from it),
-- gated by the existing reports_select_authenticated row policy.
revoke select on reports from anon;
grant select (
  id,
  type,
  colony_id,
  latitude_blurred,
  longitude_blurred,
  status,
  created_at,
  created_by,
  related_report_id,
  photo_url
) on reports to anon;
