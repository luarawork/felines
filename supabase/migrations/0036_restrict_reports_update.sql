-- Tightens reports_update_authenticated (0001), which allowed ANY
-- authenticated user to update ANY report row directly
-- (`for update to authenticated using (true)`). The legitimate
-- "confirm a report" path already goes through the confirm_report() RPC
-- (security definer, checks auth.uid() and the 3-confirmation threshold
-- itself), so the table-level policy was never meant to allow arbitrary
-- direct updates — it just never got narrowed after the RPC was added.
-- Left as-is, any logged-in user could call
-- supabase.from("reports").update(...) directly to silently resolve,
-- alter, or hide someone else's report, including sensitive ones
-- (suspected abuse/poisoning).
--
-- Only the report's own creator, or a caretaker/creator of the colony it
-- belongs to (who legitimately resolves reports about their own colony
-- per ReportsList's handleResolve), may now update a report row directly.
drop policy if exists "reports_update_authenticated" on reports;

create policy "reports_update_owner_or_caretaker" on reports
  for update to authenticated using (
    auth.uid() = created_by
    or (
      colony_id is not null
      and exists (
        select 1 from colonies
        where colonies.id = reports.colony_id
        and (
          colonies.created_by = auth.uid()
          or exists (
            select 1 from caretakers
            where caretakers.colony_id = colonies.id
            and caretakers.user_id = auth.uid()
          )
        )
      )
    )
  );
