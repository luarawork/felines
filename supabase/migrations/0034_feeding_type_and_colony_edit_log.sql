-- Lets a feeding check-in record whether it was food or water, not just
-- "someone fed the colony today" — water matters separately, especially
-- in hot weather, and caretakers want to know which one is missing.
alter table feedings add column if not exists type text not null default 'food'
  check (type in ('food', 'water'));
