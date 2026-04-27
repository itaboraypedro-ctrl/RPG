"use client";

import { useMemo, useState, useTransition } from "react";
import type { Character } from "@/lib/types";
import {
  rollInitiative,
  setActiveCombatant,
  updateEnemy,
} from "@/app/dashboard/sessions/[id]/play/actions";
import { createClient } from "@/lib/supabase";
import type { Enemy } from "./types";

type Props = {
  sessionId: string;
  characters: Character[];
  enemies: Enemy[];
  activeCombatantId?: string;
  disabled: boolean;
};

type Row =
  | { kind: "char"; id: string; name: string; initiative: number }
  | { kind: "enemy"; id: string; name: string; initiative: number };

export function InitiativeTracker({
  sessionId,
  characters,
  enemies,
  activeCombatantId,
  disabled,
}: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const rows: Row[] = useMemo(() => {
    const charRows: Row[] = characters.map((c) => ({
      kind: "char",
      id: c.id,
      name: c.name,
      initiative: c.initiative,
    }));
    const enemyRows: Row[] = enemies.map((e) => ({
      kind: "enemy",
      id: e.id,
      name: e.name,
      initiative: e.initiative,
    }));
    return [...charRows, ...enemyRows].sort((a, b) => b.initiative - a.initiative);
  }, [characters, enemies]);

  const activeIdx = rows.findIndex((r) => r.id === activeCombatantId);

  function nextTurn() {
    if (rows.length === 0) return;
    const nextIdx = activeIdx < 0 ? 0 : (activeIdx + 1) % rows.length;
    startTransition(async () => {
      const r = await setActiveCombatant(sessionId, rows[nextIdx].id);
      if (r.error) setError(r.error);
    });
  }

  function onRoll() {
    if (!confirm("Rolar iniciativa para todos?")) return;
    startTransition(async () => {
      const r = await rollInitiative(sessionId);
      if (r.error) setError(r.error);
    });
  }

  async function updateInitInline(row: Row, value: number) {
    if (row.kind === "char") {
      const supabase = createClient();
      await supabase
        .from("characters")
        .update({ initiative: value })
        .eq("id", row.id);
    } else {
      await updateEnemy(sessionId, row.id, { initiative: value });
    }
  }

  return (
    <div className="flex flex-col gap-2 rounded-md border border-zinc-800 bg-zinc-900 p-3">
      <header className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Iniciativa
        </h3>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={onRoll}
            disabled={disabled || pending}
            className="rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-200 hover:bg-zinc-700 disabled:opacity-50"
          >
            Rolar
          </button>
          <button
            type="button"
            onClick={nextTurn}
            disabled={disabled || pending || rows.length === 0}
            className="rounded bg-emerald-600 px-2 py-1 text-xs text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            Próximo turno
          </button>
        </div>
      </header>

      {rows.length === 0 ? (
        <p className="text-xs text-zinc-500">Nenhum combatente.</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {rows.map((r, idx) => (
            <li
              key={`${r.kind}-${r.id}`}
              className={`flex items-center gap-2 rounded px-2 py-1 text-xs ${
                idx === activeIdx
                  ? "border border-emerald-500 bg-emerald-900/20 text-emerald-200"
                  : "border border-transparent text-zinc-300"
              }`}
            >
              <span className="w-5 text-right text-zinc-500">{idx + 1}.</span>
              <input
                type="number"
                value={r.initiative}
                onChange={(e) => updateInitInline(r, Number(e.target.value) || 0)}
                disabled={disabled}
                className="w-12 rounded border border-zinc-800 bg-zinc-950 px-1 py-0.5 text-center text-xs"
              />
              <span className="flex-1 truncate">{r.name}</span>
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                  r.kind === "char"
                    ? "bg-emerald-900/40 text-emerald-300"
                    : "bg-red-900/40 text-red-300"
                }`}
              >
                {r.kind === "char" ? "PC" : "NPC"}
              </span>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
