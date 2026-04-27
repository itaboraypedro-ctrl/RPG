// Tipos das tabelas do GM Controller — espelham SPEC_DATABASE.md §2.

export type Role = "admin" | "gm" | "player";

export type Genre = "fantasy" | "sci-fi" | "horror" | "western" | "modern" | "custom";

export type SessionStatus = "lobby" | "active" | "paused" | "finished";

export type SessionPlayerStatus = "invited" | "joined" | "left" | "kicked";

export type SessionEventType =
  | "combat_damage"
  | "combat_heal"
  | "combat_kill"
  | "condition_added"
  | "condition_removed"
  | "round_start"
  | "round_end"
  | "scene_change"
  | "media_play"
  | "media_stop"
  | "item_given"
  | "item_removed"
  | "xp_gained"
  | "level_up"
  | "player_joined"
  | "player_left"
  | "gm_note"
  | "player_note"
  | "ai_suggestion"
  | "ai_illustration"
  | "session_start"
  | "session_pause"
  | "session_end";

export type MediaType = "audio" | "image" | "video";

export type MediaCategory = "ambient" | "sfx" | "music" | "illustration" | "map" | "misc";

export type AiRequestType =
  | "gm_suggestion"
  | "npc_dialogue"
  | "scene_description"
  | "session_summary"
  | "character_summary"
  | "illustration"
  | "audio_summary";

export type AiRequestStatus = "pending" | "completed" | "failed";

export type NotificationType = "info" | "warning" | "combat" | "item" | "level_up" | "custom";

// JSONB shapes

export type StoryContent = {
  synopsis?: string;
  acts?: Record<string, unknown>[];
  npcs?: Record<string, unknown>[];
  locations?: Record<string, unknown>[];
  items?: Record<string, unknown>[];
  music_cues?: Record<string, unknown>[];
};

export type SessionSettings = {
  max_players?: number;
  allow_new_chars?: boolean;
  xp_enabled?: boolean;
  death_saves?: boolean;
  ai_assistant?: boolean;
};

export type AiContext = {
  story_summary?: string;
  key_events?: Record<string, unknown>[];
  npc_memory?: Record<string, unknown>[];
};

export type CharacterStats = {
  strength?: number;
  dexterity?: number;
  constitution?: number;
  intelligence?: number;
  wisdom?: number;
  charisma?: number;
};

export type DeathSaves = {
  successes: number;
  failures: number;
};

export type MediaStateAudio = {
  media_id: string;
  title: string;
  url: string;
  loop: boolean;
};

export type MediaStateImage = {
  media_id: string;
  url: string;
  caption: string;
};

// 2.1 profiles
export type Profile = {
  id: string;
  display_name: string;
  avatar_url: string | null;
  role: Role;
  created_at: string;
  updated_at: string;
};

// 2.2 story_templates
export type StoryTemplate = {
  id: string;
  gm_id: string;
  title: string;
  description: string;
  genre: Genre;
  cover_image_url: string | null;
  content: StoryContent;
  ai_generated: boolean;
  is_public: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
};

// 2.3 sessions
export type Session = {
  id: string;
  gm_id: string;
  template_id: string | null;
  title: string;
  description: string;
  status: SessionStatus;
  invite_code: string;
  current_round: number;
  current_scene: string;
  settings: SessionSettings;
  ai_context: AiContext;
  created_at: string;
  updated_at: string;
};

// 2.4 session_players
export type SessionPlayer = {
  id: string;
  session_id: string;
  player_id: string;
  status: SessionPlayerStatus;
  joined_at: string | null;
  created_at: string;
};

// 2.5 characters
export type Character = {
  id: string;
  owner_id: string;
  session_id: string | null;
  name: string;
  class: string;
  race: string;
  level: number;
  hp: number;
  max_hp: number;
  temp_hp: number;
  ac: number;
  initiative: number;
  speed: number;
  xp: number;
  xp_next_level: number;
  gold: number;
  conditions: string[];
  death_saves: DeathSaves;
  stats: CharacterStats;
  skills: Record<string, unknown>;
  inventory: Record<string, unknown>[];
  spells: Record<string, unknown>[];
  backstory: string;
  notes: string;
  avatar_url: string | null;
  ai_summary: string;
  created_at: string;
  updated_at: string;
};

// 2.6 session_events
export type SessionEvent = {
  id: string;
  session_id: string;
  actor_id: string | null;
  type: SessionEventType;
  payload: Record<string, unknown>;
  round: number | null;
  is_public: boolean;
  created_at: string;
};

// 2.7 media_library
export type MediaLibraryItem = {
  id: string;
  owner_id: string;
  type: MediaType;
  category: MediaCategory;
  title: string;
  url: string;
  duration_ms: number | null;
  tags: string[];
  ai_generated: boolean;
  is_public: boolean;
  created_at: string;
};

// 2.8 session_media_state
export type SessionMediaState = {
  id: string;
  session_id: string;
  current_audio: MediaStateAudio | null;
  current_image: MediaStateImage | null;
  ambient_active: boolean;
  updated_at: string;
};

// 2.9 ai_requests
export type AiRequest = {
  id: string;
  session_id: string | null;
  requested_by: string | null;
  type: AiRequestType;
  prompt: string;
  response: string | null;
  model: string;
  tokens_used: number | null;
  status: AiRequestStatus;
  created_at: string;
  completed_at: string | null;
};

// 2.10 notifications
export type Notification = {
  id: string;
  session_id: string;
  target_id: string | null;
  type: NotificationType;
  title: string;
  message: string;
  vibrate: boolean;
  read: boolean;
  created_at: string;
};
