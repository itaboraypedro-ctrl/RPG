"use client";

import { useState } from "react";
import type { Character, SessionEvent } from "@/lib/types";
import { PlayerSheetHeader } from "./PlayerSheetHeader";
import { PlayerSheetTabStatus } from "./PlayerSheetTabStatus";
import { PlayerSheetTabCombat } from "./PlayerSheetTabCombat";
import { PlayerSheetTabSpells } from "./PlayerSheetTabSpells";
import { PlayerSheetTabInventory } from "./PlayerSheetTabInventory";
import { PlayerSheetTabNotes } from "./PlayerSheetTabNotes";

type Tab = "status" | "combat" | "spells" | "inventory" | "notes";

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: "status", label: "Status", icon: "❤" },
  { key: "combat", label: "Combate", icon: "⚔" },
  { key: "spells", label: "Magias", icon: "✦" },
  { key: "inventory", label: "Mochila", icon: "🎒" },
  { key: "notes", label: "Notas", icon: "📝" },
];

type Props = {
  character: Character;
  publicEvents: SessionEvent[];
  editable: boolean;
};

export function PlayerCharacterSheet({
  character,
  publicEvents,
  editable,
}: Props) {
  const [tab, setTab] = useState<Tab>("status");
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex h-full flex-col bg-rpg-bg text-rpg-text">
      <PlayerSheetHeader
        character={character}
        editable={editable}
        onError={setError}
      />

      <main className="relative flex-1 overflow-y-auto px-4 py-4">
        {tab === "status" && (
          <PlayerSheetTabStatus
            character={character}
            editable={editable}
            onError={setError}
          />
        )}
        {tab === "combat" && <PlayerSheetTabCombat character={character} />}
        {tab === "spells" && (
          <PlayerSheetTabSpells
            character={character}
            editable={editable}
            onError={setError}
          />
        )}
        {tab === "inventory" && (
          <PlayerSheetTabInventory character={character} />
        )}
        {tab === "notes" && (
          <PlayerSheetTabNotes
            character={character}
            publicEvents={publicEvents}
            editable={editable}
            onError={setError}
          />
        )}

        {error && (
          <p className="mt-3 rounded-md border border-rpg-red/50 bg-rpg-red/10 px-3 py-2 text-xs text-rpg-red">
            {error}
          </p>
        )}
      </main>

      <nav className="grid shrink-0 grid-cols-5 border-t border-rpg-border bg-rpg-surface">
        {TABS.map((t) => {
          const isActive = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`flex flex-col items-center gap-0.5 py-2.5 transition-colors ${
                isActive
                  ? "text-rpg-blue"
                  : "text-rpg-text-dim hover:text-rpg-text"
              }`}
            >
              <span
                className={`text-lg leading-none ${
                  isActive ? "drop-shadow-[0_0_4px_currentColor]" : ""
                }`}
              >
                {t.icon}
              </span>
              <span
                className="text-[9px] uppercase tracking-[0.2em]"
                style={{ fontFamily: "var(--font-rpg-hud)" }}
              >
                {t.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 mt-0.5 h-0.5 w-8 rounded-t bg-rpg-blue" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
