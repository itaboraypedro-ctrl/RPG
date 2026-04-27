export type Player = {
  id: string;
  name: string;
  class: string;
  level: number;
  hp: number;
  max_hp: number;
  ac: number;
  initiative: number;
  notes: string;
  session_id: string;
  created_at: string;
};

export type Session = {
  id: string;
  name: string;
  description: string;
  status: "active" | "paused" | "finished";
  current_round: number;
  created_at: string;
  updated_at: string;
};

export type Item = {
  id: string;
  name: string;
  description: string;
  quantity: number;
  player_id: string;
  session_id: string;
  created_at: string;
};

export type ActionLog = {
  id: string;
  description: string;
  type: "combat" | "scene" | "dice" | "note" | "item";
  player_id: string | null;
  session_id: string;
  metadata: Record<string, unknown>;
  created_at: string;
};
