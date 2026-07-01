-- Security audit finding: several user-supplied text fields have client
-- side length hints (or none at all) but NO database-level CHECK
-- constraint, meaning any direct call to the REST API (using the public
-- anon key embedded in every client bundle — trivially available to
-- anyone) can insert arbitrarily long text, unbounded by whatever the
-- UI enforces. Contrast with colony_stories.title/story_text (0049),
-- help_requests.description (0050), resource_posts.title/description
-- (0056), cat_notes.body (0060), and community_contacts.* (0061), which
-- all already have char_length checks — this migration brings the
-- remaining fields up to the same standard.
--
-- Limits chosen to comfortably fit existing real usage (checked
-- against form maxlength attributes/placeholders in the corresponding
-- components) while still capping worst-case abuse. Using `not valid`
-- is unnecessary here since these are small demo/hackathon-scale
-- tables, but existing rows are still validated against the new check
-- (a violation would mean genuinely abusive pre-existing data, which is
-- useful to surface rather than silently grandfather in).

-- colonies.name / colonies.narrative — never had any length limit.
alter table colonies add constraint colonies_name_length
  check (char_length(name) <= 100);
alter table colonies add constraint colonies_narrative_length
  check (narrative is null or char_length(narrative) <= 2000);

-- cats.name — never had any length limit.
alter table cats add constraint cats_name_length
  check (name is null or char_length(name) <= 60);

-- reports.description — never had any length limit, despite being
-- reachable by fully anonymous inserts (reports_insert_public).
alter table reports add constraint reports_description_length
  check (description is null or char_length(description) <= 1000);

-- caretakers.letter — a caretaker's public "letter to the next
-- caretaker", never had any length limit.
alter table caretakers add constraint caretakers_letter_length
  check (letter is null or char_length(letter) <= 2000);
