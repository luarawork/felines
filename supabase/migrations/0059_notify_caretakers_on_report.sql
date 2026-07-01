-- When someone reports that a colony needs something (no food/water,
-- injured cat, etc.), the colony's actual caretakers should hear about
-- it directly — not just the people who clicked "follow" on it
-- (notify_followers, 0051), and not only when the reporter happens to
-- be signed in. Mirrors notify_followers' shape, but fans out to the
-- colony's creator + linked caretakers instead, and is safe for
-- anonymous reporters too (same reasoning as recalculate_colony_health
-- in 0057): it never reveals anything beyond a fixed summary string.
create or replace function notify_caretakers(p_colony_id uuid, p_type text, p_message text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- created_by and caretakers can overlap (a creator who also linked
  -- themselves as a caretaker), so this dedupes via UNION rather than
  -- two separate inserts that could double-notify the same person.
  insert into notifications (user_id, colony_id, type, message)
  select recipient_id, p_colony_id, p_type, p_message
  from (
    select created_by as recipient_id from colonies where id = p_colony_id and created_by is not null
    union
    select user_id as recipient_id from caretakers where colony_id = p_colony_id
  ) as recipients;
end;
$$;

revoke execute on function notify_caretakers(uuid, text, text) from public;
grant execute on function notify_caretakers(uuid, text, text) to anon, authenticated;
