-- Realtime publication
-- SPEC_DATABASE.md §4 + SPEC_SESSION.md §4 (session_players para o lobby)

alter publication supabase_realtime add table sessions;
alter publication supabase_realtime add table session_players;
alter publication supabase_realtime add table characters;
alter publication supabase_realtime add table session_events;
alter publication supabase_realtime add table session_media_state;
alter publication supabase_realtime add table notifications;
