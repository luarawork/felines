-- Hearting a story currently inserts into story_reactions directly
-- (story_reactions_insert_public, with check (true)) but never notifies
-- the story's author — there was no path to do that, since notifying
-- someone else means writing to their notifications row, which
-- notifications_insert_own (auth.uid() = user_id) blocks for a plain
-- client-side insert. Same fix as thank_action() in 0039: move the
-- insert behind a security definer function that does both writes.
drop policy if exists "story_reactions_insert_public" on story_reactions;

create or replace function react_to_story(p_story_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_author uuid;
  v_colony_id uuid;
begin
  begin
    insert into story_reactions (story_id, user_id) values (p_story_id, auth.uid());
  exception when unique_violation then
    return;
  end;

  select created_by, colony_id into v_author, v_colony_id
  from colony_stories
  where id = p_story_id;

  -- auth.uid() is null for anonymous reactions (allowed, same as
  -- before) — only skip notifying when the reactor is the author
  -- themselves, not when they're anonymous.
  if v_author is not null and (auth.uid() is null or v_author <> auth.uid()) then
    insert into notifications (user_id, colony_id, type, message)
    values (
      v_author,
      v_colony_id,
      'story_reaction',
      'Alguém reagiu com ❤️ a uma história que você compartilhou.'
    );
  end if;
end;
$$;

revoke all on function react_to_story(uuid) from public;
grant execute on function react_to_story(uuid) to anon, authenticated;
