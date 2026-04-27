import type {
  Character,
  MediaLibraryItem,
  Session,
  SessionEvent,
  SessionMediaState,
  StoryContent,
  StoryTemplate,
} from "@/lib/types";

export type Enemy = {
  id: string;
  name: string;
  type?: string;
  hp: number;
  max_hp: number;
  ac: number;
  initiative: number;
  defeated?: boolean;
};

export type GmAiContext = {
  story_summary?: string;
  enemies?: Enemy[];
  active_combatant_id?: string;
  key_events?: unknown[];
  npc_memory?: unknown[];
};

export type Destination =
  | { type: "gm_only" }
  | { type: "all" }
  | { type: "specific"; playerIds: string[] };

export type CombatantRef =
  | { kind: "character"; id: string }
  | { kind: "enemy"; id: string };

export type PlayerOption = {
  id: string;
  name: string;
};

export type GmPanelData = {
  session: Session;
  characters: Character[];
  players: PlayerOption[];
  events: SessionEvent[];
  mediaState: SessionMediaState;
  mediaLibrary: MediaLibraryItem[];
  template: { title: string; content: StoryContent } | null;
  templateRow: StoryTemplate | null;
};

export const CONDITIONS_5E = [
  "Cego",
  "Caído",
  "Enfeitiçado",
  "Envenenado",
  "Paralisado",
  "Petrificado",
  "Atordoado",
  "Inconsciente",
  "Invisível",
  "Surdo",
  "Amedrontado",
  "Agarrado",
  "Restrito",
  "Incapacitado",
] as const;

export function aiContextOf(session: Session): GmAiContext {
  return (session.ai_context ?? {}) as GmAiContext;
}
