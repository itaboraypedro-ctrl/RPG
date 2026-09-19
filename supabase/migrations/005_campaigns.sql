-- Migration 005 — Campanhas com preset de ruleset (Sacramento) + hub de história
-- RODAR MANUALMENTE NO SUPABASE SQL EDITOR (mesmo procedimento da 004).
--
-- 1. sessions ganha `ruleset` (preset de RPG) e `campaign` (config macro pública
--    da campanha: premissa, época, temas, tom, sessão zero — legível por jogadores
--    joined via RLS existente, portanto NUNCA guardar segredos do Juiz aqui).
-- 2. campaign_elements guarda o conteúdo do hub de história (lugares, facções,
--    NPCs, cenas, missões, eventos de calendário, notas secretas), 1 linha por
--    elemento, com visibilidade por linha (RLS é por linha, não por coluna).
-- 3. Fix do fluxo de convite: player pode se inserir como 'joined' em
--    session_players (antes não havia policy de INSERT self e o /join falhava).

-- ─── 1. sessions ─────────────────────────────────────────────────────────────
alter table sessions
  add column if not exists ruleset text not null default 'custom';

alter table sessions
  add column if not exists campaign jsonb not null default '{}';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'sessions_ruleset_check'
  ) then
    alter table sessions
      add constraint sessions_ruleset_check check (ruleset in ('custom', 'sacramento'));
  end if;
end $$;

-- ─── 2. campaign_elements ────────────────────────────────────────────────────
create table if not exists campaign_elements (
  id         uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id) on delete cascade,
  kind       text not null check (kind in
    ('place', 'faction', 'npc', 'scene', 'mission', 'calendar_event', 'secret_note')),
  visibility text not null default 'gm_only' check (visibility in ('gm_only', 'public')),
  position   integer not null default 0,
  data       jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists campaign_elements_session_kind_idx
  on campaign_elements (session_id, kind, position);

alter table campaign_elements enable row level security;

drop policy if exists campaign_elements_gm_all on campaign_elements;
create policy campaign_elements_gm_all on campaign_elements
  for all
  using (public.is_session_gm(session_id, auth.uid()))
  with check (public.is_session_gm(session_id, auth.uid()));

drop policy if exists campaign_elements_select_member_public on campaign_elements;
create policy campaign_elements_select_member_public on campaign_elements
  for select
  using (visibility = 'public' and public.is_session_member(session_id, auth.uid()));

drop trigger if exists campaign_elements_set_updated_at on campaign_elements;
create trigger campaign_elements_set_updated_at
before update on campaign_elements
for each row execute function public.update_updated_at();

-- ─── 3. Fix convite: player entra sozinho pelo link ──────────────────────────
drop policy if exists session_players_insert_self on session_players;
create policy session_players_insert_self on session_players
  for insert
  with check (player_id = auth.uid() and status = 'joined');
