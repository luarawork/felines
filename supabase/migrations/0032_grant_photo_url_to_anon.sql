-- A lost-cat report only works as a "have you seen this cat" poster if
-- the photo is visible to anyone, logged in or not — that's the whole
-- point of maximizing reach for a missing pet. Description stays
-- authenticated-only as before; only photo_url is widened here.
grant select (photo_url) on reports to anon;
