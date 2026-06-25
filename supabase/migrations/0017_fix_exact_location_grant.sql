-- Fixes 0016: a column-level REVOKE has no effect when the role already
-- holds table-level SELECT, because column privileges in Postgres are
-- purely additive on top of table-level grants — you cannot subtract a
-- column from a table-wide grant with REVOKE SELECT (column). Confirmed
-- via information_schema.column_privileges: anon/authenticated still
-- showed SELECT on latitude/longitude after 0016.
--
-- The correct fix is to revoke table-level SELECT entirely and re-grant
-- it column-by-column, omitting latitude/longitude. Those two columns
-- become readable only through get_colony_exact_location(), a security
-- definer RPC that checks caretaker/creator status server-side.

revoke select on colonies from anon, authenticated;

grant select (
  id,
  name,
  narrative,
  latitude_blurred,
  longitude_blurred,
  latitude_blurred_near,
  longitude_blurred_near,
  castration_status,
  created_at,
  created_by,
  cover_photo_url
) on colonies to anon, authenticated;
