"use client";

import { useEffect, useState } from "react";
import type { Character, SessionEvent } from "@/lib/types";
import { CharacterSheetTab1 } from "./CharacterSheetTab1";
import { CharacterSheetTab2 } from "./CharacterSheetTab2";
import { CharacterSheetTab3 } from "./CharacterSheetTab3";
import { CharacterSheetTab4 } from "./CharacterSheetTab4";
import { CharacterSheetTab5 } from "./CharacterSheetTab5";

type Tab = 1 | 2 | 3 | 4 | 5;

type Props = {
  character: Character;
  events: SessionEvent[];
  editable: boolean;
  onClose: () => void;
};

const TABS: { id: Tab; label: string }[] = [
  { id: 1, label: "Ficha" },
  { id: 2, label: "Inventário" },
  { id: 3, label: "Poderes" },
  { id: 4, label: "Log" },
  { id: 5, label: "Notas" },
];

export function CharacterSheet({ character, events, editable, onClose }: Props) {
  const [tab, setTab] = useState<Tab>(1);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex h-full max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-zinc-800 px-4 py-2">
          <div className="flex items-center gap-3">
            <h2 className="font-semibold text-zinc-100">{character.name}</h2>
            <span className="text-xs text-zinc-500">
              {character.race} · {character.class} · Nv {character.level}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
            aria-label="Fechar"
          >
            ✕
          </button>
        </header>

        <nav className="flex shrink-0 border-b border-zinc-800 bg-zinc-900">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex-1 px-3 py-2 text-xs uppercase tracking-wide transition-colors ${
                tab === t.id
                  ? "border-b-2 border-emerald-500 text-emerald-300"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <div className="flex-1 overflow-y-auto p-4">
          {tab === 1 && <CharacterSheetTab1 character={character} />}
          {tab === 2 && <CharacterSheetTab2 character={character} editable={editable} />}
          {tab === 3 && <CharacterSheetTab3 character={character} editable={editable} />}
          {tab === 4 && <CharacterSheetTab4 character={character} events={events} />}
          {tab === 5 && <CharacterSheetTab5 character={character} editable={editable} />}
        </div>
      </div>
    </div>
  );
}
