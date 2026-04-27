"use client";

import { useMemo } from "react";
import type { Character, SessionEvent } from "@/lib/types";
import { EventLog } from "@/components/gm-panel/EventLog";

type Props = {
  character: Character;
  events: SessionEvent[];
};

export function CharacterSheetTab4({ character, events }: Props) {
  const filtered = useMemo(() => {
    return events.filter((e) => {
      if (e.actor_id === character.id) return true;
      const p = e.payload as Record<string, unknown>;
      return p.target_id === character.id || p.target_name === character.name;
    });
  }, [events, character.id, character.name]);

  if (filtered.length === 0) {
    return (
      <p className="rounded-md border border-zinc-800 bg-zinc-900 p-4 text-center text-xs text-zinc-500">
        Nenhum evento relacionado a este personagem.
      </p>
    );
  }

  return <EventLog events={filtered} />;
}
