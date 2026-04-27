"use client";

import { useState } from "react";
import type { Character } from "@/lib/types";
import {
  addCondition,
  applyHpChange,
} from "@/app/dashboard/sessions/[id]/play/actions";
import { CONDITIONS_5E, type PlayerOption } from "./types";
import { DestinationPicker } from "./DestinationPicker";

type Props = {
  sessionId: string;
  selectedCharacters: Character[];
  players: PlayerOption[];
  disabled: boolean;
  onClear: () => void;
};

type Mode = null | "damage" | "heal" | "condition";

export function MultiSelectBar({
  sessionId,
  selectedCharacters,
  players,
  disabled,
  onClear,
}: Props) {
  const [mode, setMode] = useState<Mode>(null);
  const [value, setValue] = useState(10);
  const [condition, setCondition] = useState<string>(CONDITIONS_5E[0]);
  const [error, setError] = useState<string | null>(null);

  if (selectedCharacters.length < 2) return null;

  async function applyToAll(
    fn: (charId: string, dest: Parameters<typeof applyHpChange>[3]) => Promise<{ ok?: true; error?: string }>,
    dest: Parameters<typeof applyHpChange>[3]
  ) {
    setError(null);
    for (const c of selectedCharacters) {
      const r = await fn(c.id, dest);
      if (r.error) {
        setError(r.error);
        return;
      }
    }
    setMode(null);
    onClear();
  }

  return (
    <div className="sticky top-0 z-30 flex flex-col gap-2 rounded-md border border-emerald-700 bg-emerald-950/50 p-2 backdrop-blur-sm">
      <header className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-emerald-200">
          {selectedCharacters.length} selecionados
        </span>
        <button
          type="button"
          onClick={onClear}
          className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] uppercase text-zinc-300 hover:bg-zinc-700"
        >
          Limpar
        </button>
      </header>

      {mode === null && (
        <div className="flex flex-wrap gap-1">
          <button
            type="button"
            onClick={() => setMode("damage")}
            disabled={disabled}
            className="rounded bg-red-700 px-2 py-1 text-xs text-white hover:bg-red-600 disabled:opacity-50"
          >
            ⚔️ Dano em área
          </button>
          <button
            type="button"
            onClick={() => setMode("heal")}
            disabled={disabled}
            className="rounded bg-emerald-700 px-2 py-1 text-xs text-white hover:bg-emerald-600 disabled:opacity-50"
          >
            💚 Curar todos
          </button>
          <button
            type="button"
            onClick={() => setMode("condition")}
            disabled={disabled}
            className="rounded bg-amber-700 px-2 py-1 text-xs text-white hover:bg-amber-600 disabled:opacity-50"
          >
            ⚠️ Aplicar condição
          </button>
        </div>
      )}

      {(mode === "damage" || mode === "heal") && (
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            value={value}
            onChange={(e) => setValue(Math.max(0, Number(e.target.value) || 0))}
            autoFocus
            className="w-20 rounded border border-zinc-800 bg-zinc-950 px-2 py-1 text-sm"
          />
          <DestinationPicker
            players={players}
            defaultType="all"
            onConfirm={(dest) =>
              applyToAll(
                (charId) =>
                  applyHpChange(
                    sessionId,
                    { kind: "character", id: charId },
                    mode === "damage" ? -Math.abs(value) : Math.abs(value),
                    dest
                  ),
                dest
              )
            }
            buttonLabel={mode === "damage" ? "Aplicar dano" : "Curar"}
            buttonClassName={`rounded px-2 py-1 text-xs font-medium text-white ${
              mode === "damage"
                ? "bg-red-700 hover:bg-red-600"
                : "bg-emerald-600 hover:bg-emerald-500"
            }`}
          />
          <button
            type="button"
            onClick={() => setMode(null)}
            className="rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-200 hover:bg-zinc-700"
          >
            Cancelar
          </button>
        </div>
      )}

      {mode === "condition" && (
        <div className="flex items-center gap-2">
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="flex-1 rounded border border-zinc-800 bg-zinc-950 px-2 py-1 text-sm"
          >
            {CONDITIONS_5E.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <DestinationPicker
            players={players}
            defaultType="all"
            onConfirm={(dest) =>
              applyToAll(
                (charId) => addCondition(sessionId, charId, condition, dest),
                dest
              )
            }
            buttonLabel="Aplicar"
            buttonClassName="rounded bg-amber-700 px-2 py-1 text-xs font-medium text-white hover:bg-amber-600"
          />
          <button
            type="button"
            onClick={() => setMode(null)}
            className="rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-200 hover:bg-zinc-700"
          >
            Cancelar
          </button>
        </div>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
