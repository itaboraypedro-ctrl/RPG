-- Allow the GM of a session to UPDATE characters in that session.
-- Without this, server actions in the GM panel (HP, conditions, inventory, etc.)
-- silently fail under RLS when the GM is not also the character owner.

create policy characters_update_gm on characters
  for update
  using (
    session_id is not null and public.is_session_gm(session_id, auth.uid())
  )
  with check (
    session_id is not null and public.is_session_gm(session_id, auth.uid())
  );
