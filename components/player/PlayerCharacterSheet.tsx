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

export function PlayerCharacterSheet({ character, publicEvents, editable }: Props) {
  const [tab, setTab] = useState<Tab>("status");
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex h-full flex-col overflow-hidden bg-zinc-950 text-zinc-100">
      {/* Header: compact horizontal */}
      <PlayerSheetHeader character={character} editable={editable} onError={setError} />

      {/* Body: sidebar tabs (desktop) + bottom tabs (mobile) */}
      <div className="flex flex-1 overflow-hidden">

        {/* Desktop sidebar */}
        <nav className="hidden shrink-0 flex-col border-r border-zinc-800 bg-zinc-900 py-2 lg:flex" style={{ width: 56 }}>
          {TABS.map((t) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                title={t.label}
                onClick={() => setTab(t.key)}
                className={`relative flex flex-col items-center gap-1 px-1 py-3 text-center transition-colors ${
                  active
                    ? "text-emerald-400"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 h-8 w-0.5 -translate-y-1/2 rounded-r bg-emerald-400" />
                )}
                <span className="text-base leading-none">{t.icon}</span>
                <span className="text-[7px] uppercase tracking-[0.15em]" style={{ fontFamily: "var(--font-rpg-hud)" }}>
                  {t.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Tab content */}
        <main className="relative flex-1 overflow-y-auto px-4 py-4" style={{ scrollbarWidth: "thin", scrollbarColor: "rgb(63 63 70) transparent" }}>
          {tab === "status" && (
            <PlayerSheetTabStatus character={character} editable={editable} onError={setError} />
          )}
          {tab === "combat" && <PlayerSheetTabCombat character={character} />}
          {tab === "spells" && (
            <PlayerSheetTabSpells character={character} editable={editable} onError={setError} />
          )}
          {tab === "inventory" && <PlayerSheetTabInventory character={character} />}
          {tab === "notes" && (
            <PlayerSheetTabNotes character={character} publicEvents={publicEvents} editable={editable} onError={setError} />
          )}

          {error && (
            <p className="mt-3 rounded border border-red-500/40 bg-red-950/30 px-3 py-2 text-xs text-red-400">
              {error}
            </p>
          )}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="grid shrink-0 grid-cols-5 border-t border-zinc-800 bg-zinc-900 lg:hidden">
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`flex flex-col items-center gap-0.5 py-2.5 transition-colors ${
                active ? "text-emerald-400" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <span className={`text-lg leading-none ${active ? "drop-shadow-[0_0_4px_currentColor]" : ""}`}>
                {t.icon}
              </span>
              <span className="text-[9px] uppercase tracking-[0.2em]" style={{ fontFamily: "var(--font-rpg-hud)" }}>
                {t.label}
              </span>
              {active && (
                <span className="mt-0.5 h-0.5 w-8 rounded-t bg-emerald-400" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
