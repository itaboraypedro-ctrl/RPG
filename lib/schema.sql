-- GM Controller — Supabase schema
-- Execute this in the Supabase SQL Editor

create table sessions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  status text not null default 'active' check (status in ('active', 'paused', 'finished')),
  current_round integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table players (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  class text not null default '',
  level integer not null default 1,
  hp integer not null default 10,
  max_hp integer not null default 10,
  ac integer not null default 10,
  initiative integer not null default 0,
  notes text not null default '',
  session_id uuid not null references sessions(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  quantity integer not null default 1,
  player_id uuid not null references players(id) on delete cascade,
  session_id uuid not null references sessions(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table action_logs (
  id uuid primary key default gen_random_uuid(),
  description text not null,
  type text not null check (type in ('combat', 'scene', 'dice', 'note', 'item')),
  player_id uuid references players(id) on delete set null,
  session_id uuid not null references sessions(id) on delete cascade,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- Indexes
create index players_session_id_idx on players(session_id);
create index items_player_id_idx on items(player_id);
create index items_session_id_idx on items(session_id);
create index action_logs_session_id_idx on action_logs(session_id);
create index action_logs_type_idx on action_logs(type);
