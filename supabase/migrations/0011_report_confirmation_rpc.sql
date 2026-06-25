-- Atomically increments a report's confirmation count. Using an RPC
-- instead of a client-side read-then-write avoids lost updates when two
-- people confirm the same report at nearly the same time.
create or replace function confirm_report(p_report_id uuid)
returns void
language sql
security invoker
as $$
  update reports
  set confirmations = confirmations + 1
  where id = p_report_id;
$$;

grant execute on function confirm_report(uuid) to authenticated;
