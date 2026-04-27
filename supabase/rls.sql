-- GM Controller — Row Level Security
-- Materializes SPEC_DATABASE.md §3.

-- Helper: avoids recursive RLS when policies on profiles need to check role.
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (select 1 from profiles where id = uid and role = 'admin');
$$;

-- Helper: is the user a joined player in the given session?
create or replace function public.is_session_member(sid uuid, uid uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from session_players
    where session_id = sid and player_id = uid and status = 'joined'
  );
$$;

-- Helper: is the user the GM of the given session?
create or replace function public.is_session_gm(sid uuid, uid uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (select 1 from sessions where id = sid and gm_id = uid);
$$;

-- Enable RLS on every table
alter table profiles            enable row level security;
alter table story_templates     enable row level security;
alter table sessions            enable row level security;
alter table session_players     enable row level security;
alter table characters          enable row level security;
alter table session_events      enable row level security;
alter table media_library       enable row level security;
alter table session_media_state enable row level security;
alter table ai_requests         enable row level security;
alter table notifications       enable row level security;

-- ─── profiles ────────────────────────────────────────────────────────────────
create policy profiles_select_self_or_admin on profiles
  for select using (id = auth.uid() or public.is_admin(auth.uid()));

create policy profiles_update_self on profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- ─── story_templates ─────────────────────────────────────────────────────────
create policy story_templates_owner_all on story_templates
  for all using (gm_id = auth.uid()) with check (gm_id = auth.uid());

create policy story_templates_select_public on story_templates
  for select using (is_public = true);

-- ─── sessions ────────────────────────────────────────────────────────────────
create policy sessions_gm_all on sessions
  for all using (gm_id = auth.uid()) with check (gm_id = auth.uid());

create policy sessions_select_member on sessions
  for select using (public.is_session_member(id, auth.uid()));

-- ─── session_players ─────────────────────────────────────────────────────────
create policy session_players_gm_all on session_players
  for all
  using (public.is_session_gm(session_id, auth.uid()))
  with check (public.is_session_gm(session_id, auth.uid()));

create policy session_players_select_self on session_players
  for select using (player_id = auth.uid());

create policy session_players_update_self on session_players
  for update using (player_id = auth.uid()) with check (player_id = auth.uid());

-- ─── characters ──────────────────────────────────────────────────────────────
create policy characters_owner_all on characters
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy characters_select_gm on characters
  for select using (
    session_id is not null and public.is_session_gm(session_id, auth.uid())
  );

-- ─── session_events ──────────────────────────────────────────────────────────
create policy session_events_gm_all on session_events
  for all
  using (public.is_session_gm(session_id, auth.uid()))
  with check (public.is_session_gm(session_id, auth.uid()));

create policy session_events_select_player_public on session_events
  for select using (
    is_public = true and public.is_session_member(session_id, auth.uid())
  );

-- ─── media_library ───────────────────────────────────────────────────────────
create policy media_library_owner_all on media_library
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy media_library_select_public on media_library
  for select using (is_public = true);

-- ─── session_media_state ─────────────────────────────────────────────────────
create policy session_media_state_select_member on session_media_state
  for select using (
    public.is_session_gm(session_id, auth.uid())
    or public.is_session_member(session_id, auth.uid())
  );

create policy session_media_state_gm_insert on session_media_state
  for insert with check (public.is_session_gm(session_id, auth.uid()));

create policy session_media_state_gm_update on session_media_state
  for update
  using (public.is_session_gm(session_id, auth.uid()))
  with check (public.is_session_gm(session_id, auth.uid()));

-- ─── notifications ───────────────────────────────────────────────────────────
create policy notifications_gm_insert on notifications
  for insert with check (public.is_session_gm(session_id, auth.uid()));

create policy notifications_select_target on notifications
  for select using (
    (target_id = auth.uid())
    or (
      target_id is null
      and (
        public.is_session_gm(session_id, auth.uid())
        or public.is_session_member(session_id, auth.uid())
      )
    )
  );

create policy notifications_update_target on notifications
  for update using (target_id = auth.uid()) with check (target_id = auth.uid());

-- ─── ai_requests ─────────────────────────────────────────────────────────────
-- Service role bypasses RLS, so no insert/update/delete policy is defined here.
create policy ai_requests_select_gm on ai_requests
  for select using (
    session_id is not null and public.is_session_gm(session_id, auth.uid())
  );
