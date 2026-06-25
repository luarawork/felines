-- Lets any authenticated user confirm a cat sighting ("I saw [name]
-- today") without granting full UPDATE access to the cats table —
-- that stays restricted to the colony's creator/caretakers. This RPC
-- only ever touches last_seen.
create or replace function mark_cat_seen_today(p_cat_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update cats set last_seen = now() where id = p_cat_id;
$$;

revoke all on function mark_cat_seen_today(uuid) from public;
grant execute on function mark_cat_seen_today(uuid) to authenticated;
