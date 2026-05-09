"use client";

import { useMemo, useState, useTransition } from "react";
import type { Character, SessionEvent } from "@/lib/types";
import { setActiveCombatant } from "@/app/dashboard/sessions/[id]/play/actions";
import type { Enemy, PlayerOption } from "./types";
import { CharacterDetailModal } from "./CharacterDetailModal";
import { MultiSelectBar } from "./MultiSelectBar";
import { NpcCard } from "./NpcCard";
import { AddNpcForm } from "./AddNpcForm";
import { InitiativeTracker } from "./InitiativeTracker";
import { PlayerSquareBlock } from "./PlayerSquareBlock";
import { MOCK_PLAYERS } from "./mock-players";

type TemplateNpc = { name: string; role: string; motivation: string };

type Props = {
  sessionId: string;
  characters: Character[];
  enemies: Enemy[];
  templateNpcs: TemplateNpc[];
  players: PlayerOption[];
  events: SessionEvent[];
  activeCombatantId?: string;
  disabled: boolean;
};

export function Column1Combat({
  sessionId,
  characters,
  enemies,
  templateNpcs,
  players,
  events,
  activeCombatantId,
  disabled,
}: Props) {
  const [, startTransition] = useTransition();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [openCharId, setOpenCharId] = useState<string | null>(null);

  const openChar = useMemo(
    () =>
      MOCK_PLAYERS.find((c) => c.id === openCharId) ??
      characters.find((c) => c.id === openCharId) ??
      null,
    [characters, openCharId]
  );
  const selectedCharacters = useMemo(
    () => characters.filter((c) => selectedIds.has(c.id)),
    [characters, selectedIds]
  );

  function selectActive(id: string) {
    if (disabled) return;
    startTransition(async () => {
      await setActiveCombatant(sessionId, id);
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <MultiSelectBar
        sessionId={sessionId}
        selectedCharacters={selectedCharacters}
        players={players}
        disabled={disabled}
        onClear={() => setSelectedIds(new Set())}
      />

      <InitiativeTracker
        sessionId={sessionId}
        characters={characters}
        enemies={enemies}
        activeCombatantId={activeCombatantId}
        disabled={disabled}
      />

      <section className="flex flex-col gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Jogadores ({MOCK_PLAYERS.length})
        </h3>
        <div className="grid grid-cols-1 gap-2 @[280px]:grid-cols-2 @[440px]:grid-cols-3">
          {MOCK_PLAYERS.map((c) => (
            <PlayerSquareBlock
              key={c.id}
              character={c}
              active={activeCombatantId === c.id}
              onClick={() => setOpenCharId(c.id)}
            />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          NPCs e Inimigos ({enemies.length})
        </h3>
        {enemies.map((e) => (
          <NpcCard
            key={e.id}
            kind="enemy"
            sessionId={sessionId}
            enemy={e}
            players={players}
            disabled={disabled}
            active={activeCombatantId === e.id}
            onSelect={() => selectActive(e.id)}
          />
        ))}
        <AddNpcForm sessionId={sessionId} disabled={disabled} />
      </section>

      {templateNpcs.length > 0 && (
        <section className="flex flex-col gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            NPCs do template
          </h3>
          {templateNpcs.map((n, i) => (
            <NpcCard
              key={i}
              kind="template"
              name={n.name}
              role={n.role}
              motivation={n.motivation}
            />
          ))}
        </section>
      )}

      {openChar && (
        <CharacterDetailModal
          character={openChar}
          events={events}
          editable={!openChar.id.startsWith("mock-")}
          onClose={() => setOpenCharId(null)}
        />
      )}
    </div>
  );
}

export type { TemplateNpc };
