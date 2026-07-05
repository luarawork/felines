-- Final pre-submission security audit finding: profiles.display_name had
-- no database-level length limit — only the frontend enforced maxLength
-- (60, in ProfileContent.tsx). Same class of gap as 0067 (colonies,
-- cats, reports, caretakers): a direct REST call with the public anon
-- key bypasses any client-side maxLength entirely. Matches the
-- frontend's existing 60-character limit exactly.
alter table profiles
  add constraint profiles_display_name_length check (display_name is null or char_length(display_name) <= 60);
