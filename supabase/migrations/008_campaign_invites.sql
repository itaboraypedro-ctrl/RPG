-- =============================================================
-- 008 — Convites de campanha por e-mail
-- RODAR MANUALMENTE NO SUPABASE SQL EDITOR (mesmo procedimento da 005/007)
-- =============================================================
--
-- O Juiz lista os e-mails do bando. Quem cria conta (ou entra) com um desses
-- e-mails é "reivindicado" pelo servidor: vira session_players 'invited' e só
-- então pode abrir o criador de personagem daquela campanha.
-- A reivindicação roda com service role (lib/campaign-invites.ts), então os
-- jogadores não precisam de policy de escrita aqui.

create table if not exists campaign_invites (
  id         uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id) on delete cascade,
  email      text not null check (email = lower(email) and position('@' in email) > 1),
  player_id  uuid references profiles(id) on delete set null,
  claimed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (session_id, email)
);

create index if not exists campaign_invites_email_idx on campaign_invites (email);

alter table campaign_invites enable row level security;

drop policy if exists campaign_invites_gm_all on campaign_invites;
create policy campaign_invites_gm_all on campaign_invites
  for all
  using (public.is_session_gm(session_id, auth.uid()))
  with check (public.is_session_gm(session_id, auth.uid()));

drop policy if exists campaign_invites_select_self on campaign_invites;
create policy campaign_invites_select_self on campaign_invites
  for select
  using (email = lower(coalesce(auth.jwt() ->> 'email', '')));
