"use client";

import { useState, useTransition } from "react";
import type { Character } from "@/lib/types";
import {
  removeCondition,
  setDeathSaves,
} from "@/app/dashboard/sessions/[id]/play/actions";
import type { PlayerOption } from "./types";
import { CharacterCardQuickActions } from "./CharacterCardQuickActions";

type Props = {
  sessionId: string;
  character: Character;
  players: PlayerOption[];
  disabled: boolean;
  active: boolean;
  selected: boolean;
  onSelect: () => void;
  onToggleSelect: () => void;
  onOpenDetails: () => void;
};

export function CharacterCard({
  sessionId,
  character,
  players,
  disabled,
  active,
  selected,
  onSelect,
  onToggleSelect,
  onOpenDetails,
}: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const hpPercent = character.max_hp > 0 ? (character.hp / character.max_hp) * 100 : 0;
  const critical = hpPercent < 25 && character.hp > 0;
  const dead = character.hp === 0;
  const initial = character.name.charAt(0).toUpperCase();

  function onRemoveCondition(condition: string) {
    startTransition(async () => {
      const r = await removeCondition(sessionId, character.id, condition);
      if (r.error) setError(r.error);
    });
  }

  function deathSaveBump(kind: "successes" | "failures") {
    startTransition(async () => {
      const next = {
        ...character.death_saves,
        [kind]: Math.min(3, (character.death_saves[kind] ?? 0) + 1),
      };
      const r = await setDeathSaves(character.id, next);
      if (r.error) setError(r.error);
    });
  }

  function resetDeathSaves() {
    startTransition(async () => {
      const r = await setDeathSaves(character.id, { successes: 0, failures: 0 });
      if (r.error) setError(r.error);
    });
  }

  return (
    <div
      onClick={onSelect}
      className={`relative flex flex-col gap-2 rounded-md border bg-zinc-900 p-3 transition-colors ${
        active ? "border-emerald-500" : selected ? "border-emerald-700" : "border-zinc-800"
      } ${dead ? "opacity-70 grayscale" : ""}`}
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetails();
          }}
          className="shrink-0"
          title="Abrir ficha"
        >
          {character.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={character.avatar_url}
              alt={character.name}
              className="h-10 w-10 rounded border border-zinc-700 object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded border border-zinc-700 bg-zinc-800 text-sm font-medium text-zinc-200">
              {initial}
            </div>
          )}
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetails();
          }}
          className="flex-1 text-left"
        >
          <p className="text-sm font-medium text-zinc-100 hover:text-emerald-300">
            {character.name}
          </p>
          <p className="text-xs text-zinc-500">
            {character.class || "—"} · Nv {character.level} · CA {character.ac}
          </p>
        </button>
        <label
          className="shrink-0 cursor-pointer"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            checked={selected}
            onChange={onToggleSelect}
            className="h-4 w-4 accent-emerald-500"
          />
        </label>
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-400">HP</span>
          <span className={dead ? "text-red-400" : "text-zinc-200"}>
            {character.hp}/{character.max_hp}
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
          <div
            className={`h-full transition-all ${
              dead
                ? "bg-zinc-700"
                : critical
                  ? "animate-pulse bg-red-500"
                  : "bg-emerald-500"
            }`}
            style={{ width: `${hpPercent}%` }}
          />
        </div>
      </div>

      <div onClick={(e) => e.stopPropagation()}>
        <CharacterCardQuickActions
          sessionId={sessionId}
          character={character}
          players={players}
          disabled={disabled}
          onOpenDetails={onOpenDetails}
        />
      </div>

      {character.conditions.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {character.conditions.map((c) => (
            <button
              key={c}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemoveCondition(c);
              }}
              disabled={disabled || pending}
              className="flex items-center gap-1 rounded-full bg-amber-900/40 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-300 hover:bg-amber-900/60 disabled:opacity-50"
            >
              {c} <span className="text-amber-500">×</span>
            </button>
          ))}
        </div>
      )}

      {dead && (
        <div className="rounded-md border border-red-900/50 bg-red-950/30 p-2 text-xs">
          <p className="mb-1 text-red-300">Inconsciente — Death saves</p>
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                deathSaveBump("successes");
              }}
              disabled={disabled || pending}
              className="flex-1 rounded bg-emerald-900/40 px-2 py-1 text-emerald-300 hover:bg-emerald-900/60 disabled:opacity-50"
            >
              ✓ {character.death_saves.successes ?? 0}/3
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                deathSaveBump("failures");
              }}
              disabled={disabled || pending}
              className="flex-1 rounded bg-red-900/40 px-2 py-1 text-red-300 hover:bg-red-900/60 disabled:opacity-50"
            >
              ✗ {character.death_saves.failures ?? 0}/3
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                resetDeathSaves();
              }}
              disabled={disabled || pending}
              className="rounded bg-zinc-800 px-2 py-1 text-zinc-300 hover:bg-zinc-700 disabled:opacity-50"
            >
              Resetar
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
