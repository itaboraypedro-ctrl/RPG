"use client";

import type { Character, SessionEvent } from "@/lib/types";
import { CharacterSheet } from "@/components/characters/CharacterSheet";

type Props = {
  character: Character;
  events: SessionEvent[];
  onClose: () => void;
};

export function CharacterDetailModal({ character, events, onClose }: Props) {
  return (
    <CharacterSheet
      character={character}
      events={events}
      editable
      onClose={onClose}
    />
  );
}
