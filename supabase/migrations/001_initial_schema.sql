-- GM Controller — Initial schema
-- Materializes SPEC_DATABASE.md §2 (10 tables, constraints, indexes).
-- RLS policies live in ../rls.sql; triggers in ../triggers.sql.

-- 2.1 profiles
create table profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  display_name  text not null,
  avatar_url    text,
  role          text not null default 'player' check (role in ('admin', 'gm', 'player')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- 2.2 story_templates
create table story_templates (
  id              uuid primary key default gen_random_uuid(),
  gm_id           uuid not null references profiles(id) on delete cascade,
  title           text not null,
  description     text not null default '',
  genre           text not null default 'fantasy' check (genre in ('fantasy', 'sci-fi', 'horror', 'western', 'modern', 'custom')),
  cover_image_url text,
  content         jsonb not null default '{}',
  ai_generated    boolean not null default false,
  is_public       boolean not null default false,
  tags            text[] not null default '{}',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- 2.3 sessions
create table sessions (
  id            uuid primary key default gen_random_uuid(),
  gm_id         uuid not null references profiles(id) on delete cascade,
  template_id   uuid references story_templates(id) on delete set null,
  title         text not null,
  description   text not null default '',
  status        text not null default 'lobby' check (status in ('lobby', 'active', 'paused', 'finished')),
  invite_code   text not null unique default substr(md5(random()::text), 1, 8),
  current_round integer not null default 0,
  current_scene text not null default '',
  settings      jsonb not null default '{}',
  ai_context    jsonb not null default '{}',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- 2.4 session_players
create table session_players (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references sessions(id) on delete cascade,
  player_id   uuid not null references profiles(id) on delete cascade,
  status      text not null default 'invited' check (status in ('invited', 'joined', 'left', 'kicked')),
  joined_at   timestamptz,
  created_at  timestamptz not null default now(),
  unique (session_id, player_id)
);

-- 2.5 characters
create table characters (
  id             uuid primary key default gen_random_uuid(),
  owner_id       uuid not null references profiles(id) on delete cascade,
  session_id     uuid references sessions(id) on delete set null,
  name           text not null,
  class          text not null default '',
  race           text not null default '',
  level          integer not null default 1,
  hp             integer not null default 10,
  max_hp         integer not null default 10,
  temp_hp        integer not null default 0,
  ac             integer not null default 10,
  initiative     integer not null default 0,
  speed          integer not null default 30,
  xp             integer not null default 0,
  xp_next_level  integer not null default 300,
  gold           integer not null default 0,
  conditions     text[] not null default '{}',
  death_saves    jsonb not null default '{"successes": 0, "failures": 0}',
  stats          jsonb not null default '{}',
  skills         jsonb not null default '{}',
  inventory      jsonb not null default '[]',
  spells         jsonb not null default '[]',
  backstory      text not null default '',
  notes          text not null default '',
  avatar_url     text,
  ai_summary     text not null default '',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- 2.6 session_events
create table session_events (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references sessions(id) on delete cascade,
  actor_id    uuid references profiles(id) on delete set null,
  type        text not null check (type in (
    'combat_damage', 'combat_heal', 'combat_kill',
    'condition_added', 'condition_removed',
    'round_start', 'round_end',
    'scene_change', 'media_play', 'media_stop',
    'item_given', 'item_removed',
    'xp_gained', 'level_up',
    'player_joined', 'player_left',
    'gm_note', 'player_note',
    'ai_suggestion', 'ai_illustration',
    'session_start', 'session_pause', 'session_end'
  )),
  payload     jsonb not null default '{}',
  round       integer,
  is_public   boolean not null default false,
  created_at  timestamptz not null default now()
);

create index on session_events (session_id, created_at desc);
create index on session_events (session_id, type);

-- 2.7 media_library
create table media_library (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null references profiles(id) on delete cascade,
  type          text not null check (type in ('audio', 'image', 'video')),
  category      text not null default 'misc' check (category in ('ambient', 'sfx', 'music', 'illustration', 'map', 'misc')),
  title         text not null,
  url           text not null,
  duration_ms   integer,
  tags          text[] not null default '{}',
  ai_generated  boolean not null default false,
  is_public     boolean not null default false,
  created_at    timestamptz not null default now()
);

-- 2.8 session_media_state
create table session_media_state (
  id              uuid primary key default gen_random_uuid(),
  session_id      uuid not null unique references sessions(id) on delete cascade,
  current_audio   jsonb default null,
  current_image   jsonb default null,
  ambient_active  boolean not null default false,
  updated_at      timestamptz not null default now()
);

-- 2.9 ai_requests
create table ai_requests (
  id            uuid primary key default gen_random_uuid(),
  session_id    uuid references sessions(id) on delete set null,
  requested_by  uuid references profiles(id) on delete set null,
  type          text not null check (type in (
    'gm_suggestion',
    'npc_dialogue',
    'scene_description',
    'session_summary',
    'character_summary',
    'illustration',
    'audio_summary'
  )),
  prompt        text not null,
  response      text,
  model         text not null default 'claude-sonnet-4-20250514',
  tokens_used   integer,
  status        text not null default 'pending' check (status in ('pending', 'completed', 'failed')),
  created_at    timestamptz not null default now(),
  completed_at  timestamptz
);

-- 2.10 notifications
create table notifications (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references sessions(id) on delete cascade,
  target_id   uuid references profiles(id) on delete cascade,
  type        text not null check (type in ('info', 'warning', 'combat', 'item', 'level_up', 'custom')),
  title       text not null,
  message     text not null default '',
  vibrate     boolean not null default false,
  read        boolean not null default false,
  created_at  timestamptz not null default now()
);
