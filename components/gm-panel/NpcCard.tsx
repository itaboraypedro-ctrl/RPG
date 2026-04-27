"use client";

import { useState, useTransition } from "react";
import {
  applyHpChange,
  removeEnemy,
  updateEnemy,
} from "@/app/dashboard/sessions/[id]/play/actions";
import type { Enemy, PlayerOption } from "./types";
import { DestinationPicker } from "./DestinationPicker";

type NpcTemplateProps = {
  kind: "template";
  name: string;
  role: string;
  motivation: string;
};

type EnemyProps = {
  kind: "enemy";
  sessionId: string;
  enemy: Enemy;
  players: PlayerOption[];
  disabled: boolean;
  active: boolean;
  onSelect: () => void;
};

type Props = NpcTemplateProps | EnemyProps;

export function NpcCard(props: Props) {
  if (props.kind === "template") {
    return (
      <div className="flex flex-col gap-1 rounded-md border border-zinc-800 bg-zinc-900 p-3">
        <p className="text-sm font-medium text-zinc-100">{props.name}</p>
        <p className="text-xs italic text-zinc-500">{props.role}</p>
        {props.motivation && (
          <p className="text-xs text-zinc-300">{props.motivation}</p>
        )}
      </div>
    );
  }
  return <EnemyCard {...props} />;
}

function EnemyCard({ sessionId, enemy, players, disabled, active, onSelect }: EnemyProps) {
  const [amount, setAmount] = useState(10);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const hpPercent = enemy.max_hp > 0 ? (enemy.hp / enemy.max_hp) * 100 : 0;
  const dead = enemy.hp === 0 || enemy.defeated;

  function onRemove() {
    if (!confirm(`Remover ${enemy.name} da batalha?`)) return;
    startTransition(async () => {
      const r = await removeEnemy(sessionId, enemy.id);
      if (r.error) setError(r.error);
    });
  }

  function onMarkDefeated() {
    startTransition(async () => {
      const r = await updateEnemy(sessionId, enemy.id, { defeated: true, hp: 0 });
      if (r.error) setError(r.error);
    });
  }

  async function applyDelta(delta: number, dest: Parameters<typeof applyHpChange>[3]) {
    setError(null);
    const r = await applyHpChange(sessionId, { kind: "enemy", id: enemy.id }, delta, dest);
    if (r.error) setError(r.error);
  }

  return (
    <div
      onClick={onSelect}
      className={`relative flex flex-col gap-2 rounded-md border bg-zinc-900 p-3 transition-colors ${
        active ? "border-emerald-500" : "border-zinc-800"
      } ${dead ? "opacity-60 grayscale" : ""}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-zinc-100">{enemy.name}</p>
          <p className="text-xs text-zinc-500">
            {enemy.type ? `${enemy.type} · ` : ""}CA {enemy.ac} · Init {enemy.initiative}
          </p>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          disabled={disabled || pending}
          className="rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400 hover:bg-zinc-700 disabled:opacity-50"
        >
          Remover
        </button>
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-400">HP</span>
          <span className={dead ? "text-red-400" : "text-zinc-200"}>
            {enemy.hp}/{enemy.max_hp}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
          <div
            className={`h-full transition-all ${
              dead ? "bg-zinc-700" : "bg-red-500"
            }`}
            style={{ width: `${hpPercent}%` }}
          />
        </div>
      </div>

      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
        <input
          type="range"
          min={0}
          max={200}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="flex-1 accent-red-500"
          disabled={disabled}
        />
        <input
          type="number"
          min={0}
          max={200}
          value={amount}
          onChange={(e) =>
            setAmount(Math.max(0, Math.min(200, Number(e.target.value) || 0)))
          }
          className="w-14 rounded border border-zinc-800 bg-zinc-950 px-1.5 py-0.5 text-xs"
          disabled={disabled}
        />
      </div>

      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
        <DestinationPicker
          players={players}
          defaultType="all"
          onConfirm={(dest) => applyDelta(-amount, dest)}
          buttonLabel={`Dano ${amount}`}
          buttonClassName="flex-1 rounded-md bg-red-700 px-2 py-1 text-xs font-medium text-white hover:bg-red-600 disabled:opacity-50"
          disabled={disabled}
        />
        <DestinationPicker
          players={players}
          defaultType="gm_only"
          onConfirm={(dest) => applyDelta(amount, dest)}
          buttonLabel={`Curar ${amount}`}
          buttonClassName="flex-1 rounded-md bg-emerald-700 px-2 py-1 text-xs font-medium text-white hover:bg-emerald-600 disabled:opacity-50"
          disabled={disabled}
        />
        {!dead && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMarkDefeated();
            }}
            disabled={disabled || pending}
            className="rounded-md border border-red-900/50 bg-red-950/30 px-2 py-1 text-xs text-red-300 hover:bg-red-950/50 disabled:opacity-50"
          >
            Derrotado
          </button>
        )}
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
