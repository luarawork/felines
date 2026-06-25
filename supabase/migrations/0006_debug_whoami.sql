-- Temporary diagnostic function to see which Postgres role and JWT claims
-- the API gateway actually uses for a given request. Safe to drop after
-- debugging (see bottom comment).

create or replace function debug_whoami()
returns table (
  current_role_name text,
  session_user_name text,
  jwt_claims text
)
language sql
security invoker
as $$
  select
    current_user::text,
    session_user::text,
    coalesce(current_setting('request.jwt.claims', true), 'NONE');
$$;

grant execute on function debug_whoami() to public;

-- After debugging, clean up with:
-- drop function if exists debug_whoami();
