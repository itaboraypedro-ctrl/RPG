"use client";

import type { Character, SessionEvent } from "@/lib/types";
import { CharacterSheet } from "@/components/characters/CharacterSheet";

type Props = {
  character: Character;
  events: SessionEvent[];
  editable?: boolean;
  onClose: () => void;
};

export function CharacterDetailModal({
  character,
  events,
  editable = true,
  onClose,
}: Props) {
  return (
    <CharacterSheet
      character={character}
      events={events}
      editable={editable}
      onClose={onClose}
    />
  );
}
