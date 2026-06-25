-- Removes the temporary debug_whoami() function created in 0006 for
-- diagnosing an RLS investigation. No longer needed.
drop function if exists debug_whoami();
