"use client";

import { useState } from "react";
import type { Character } from "@/lib/types";
import {
  addCondition,
  applyHpChange,
  grantXp,
  rollDice,
  setDeathSaves,
} from "@/app/dashboard/sessions/[id]/play/actions";
import { CONDITIONS_5E, type PlayerOption } from "./types";
import { DestinationPicker } from "./DestinationPicker";

type Props = {
  sessionId: string;
  character: Character;
  players: PlayerOption[];
  disabled: boolean;
  onOpenDetails: () => void;
};

type Mode = null | "damage" | "heal" | "condition" | "xp" | "dice";

const DIE_SIDES = [4, 6, 8, 10, 12, 20, 100];

export function CharacterCardQuickActions({
  sessionId,
  character,
  players,
  disabled,
  onOpenDetails,
}: Props) {
  const [mode, setMode] = useState<Mode>(null);
  const [error, setError] = useState<string | null>(null);

  function close() {
    setMode(null);
  }

  async function applyDamage(amount: number, dest: Parameters<typeof applyHpChange>[3]) {
    const r = await applyHpChange(
      sessionId,
      { kind: "character", id: character.id },
      -Math.abs(amount),
      dest
    );
    if (r.error) setError(r.error);
    close();
  }
  async function applyHeal(amount: number, dest: Parameters<typeof applyHpChange>[3]) {
    const r = await applyHpChange(
      sessionId,
      { kind: "character", id: character.id },
      Math.abs(amount),
      dest
    );
    if (r.error) setError(r.error);
    close();
  }

  function deathSaveBump(kind: "successes" | "failures") {
    const next = {
      ...character.death_saves,
      [kind]: Math.min(3, (character.death_saves[kind] ?? 0) + 1),
    };
    setDeathSaves(character.id, next).then((r) => {
      if (r.error) setError(r.error);
    });
  }

  return (
    <>
      <div className="flex items-center gap-1">
        <ActionIcon icon="⚔️" title="Dano" onClick={() => setMode("damage")} disabled={disabled} />
        <ActionIcon icon="💚" title="Curar" onClick={() => setMode("heal")} disabled={disabled} />
        <ActionIcon icon="⚠️" title="Condição" onClick={() => setMode("condition")} disabled={disabled} />
        {character.hp === 0 && (
          <ActionIcon
            icon="💀"
            title="Death save sucesso"
            onClick={() => deathSaveBump("successes")}
            disabled={disabled}
          />
        )}
        <ActionIcon icon="⭐" title="XP" onClick={() => setMode("xp")} disabled={disabled} />
        <ActionIcon icon="🎲" title="Rolar dado" onClick={() => setMode("dice")} disabled={disabled} />
        <ActionIcon icon="➕" title="Mais" onClick={onOpenDetails} disabled={false} />
        <span className="ml-1 hidden gap-0.5 lg:flex">
          <SoonIcon icon="✨" title="Feitiço (em breve)" />
          <SoonIcon icon="📜" title="Texto (em breve)" />
          <SoonIcon icon="🖼️" title="Imagem (em breve)" />
          <SoonIcon icon="🎁" title="Item (em breve)" />
          <SoonIcon icon="📍" title="Mover (em breve)" />
        </span>
      </div>

      {error && <p className="mt-1 text-[10px] text-red-400">{error}</p>}

      {mode === "damage" && (
        <ValuePopover
          title={`Dano em ${character.name}`}
          confirmLabel="Aplicar dano"
          confirmClass="bg-red-700 hover:bg-red-600"
          players={players}
          defaultDest="all"
          onClose={close}
          onConfirm={applyDamage}
        />
      )}
      {mode === "heal" && (
        <ValuePopover
          title={`Curar ${character.name}`}
          confirmLabel="Aplicar cura"
          confirmClass="bg-emerald-600 hover:bg-emerald-500"
          players={players}
          defaultDest="all"
          onClose={close}
          onConfirm={applyHeal}
        />
      )}
      {mode === "condition" && (
        <ConditionPopover
          characterName={character.name}
          players={players}
          onClose={close}
          onConfirm={async (cond, dest) => {
            const r = await addCondition(sessionId, character.id, cond, dest);
            if (r.error) setError(r.error);
            close();
          }}
        />
      )}
      {mode === "xp" && (
        <XpPopover
          characterName={character.name}
          onClose={close}
          onConfirm={async (amount) => {
            const r = await grantXp(sessionId, character.id, amount);
            if (r.error) setError(r.error);
            close();
          }}
        />
      )}
      {mode === "dice" && (
        <DicePopover
          onClose={close}
          onRoll={async (sides) => {
            const r = await rollDice(sessionId, sides, character.id, character.name);
            if (r.error) setError(r.error);
            close();
          }}
        />
      )}
    </>
  );
}

function ActionIcon({
  icon,
  title,
  onClick,
  disabled,
}: {
  icon: string;
  title: string;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      disabled={disabled}
      title={title}
      className="flex h-7 w-7 items-center justify-center rounded border border-zinc-800 bg-zinc-900 text-sm hover:border-zinc-600 hover:bg-zinc-800 disabled:opacity-40"
    >
      {icon}
    </button>
  );
}

function SoonIcon({ icon, title }: { icon: string; title: string }) {
  return (
    <span
      title={title}
      className="flex h-7 w-7 cursor-not-allowed items-center justify-center rounded border border-zinc-800 bg-zinc-900 text-sm opacity-30"
    >
      {icon}
    </span>
  );
}

function PopoverShell({
  children,
  title,
  onClose,
}: {
  children: React.ReactNode;
  title: string;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-md border border-zinc-800 bg-zinc-900 p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h4 className="mb-3 text-sm font-medium text-zinc-100">{title}</h4>
        {children}
      </div>
    </div>
  );
}

function ValuePopover({
  title,
  confirmLabel,
  confirmClass,
  players,
  defaultDest,
  onClose,
  onConfirm,
}: {
  title: string;
  confirmLabel: string;
  confirmClass: string;
  players: PlayerOption[];
  defaultDest: "all" | "gm_only";
  onClose: () => void;
  onConfirm: (value: number, dest: import("./types").Destination) => Promise<void>;
}) {
  const [value, setValue] = useState(10);

  return (
    <PopoverShell title={title} onClose={onClose}>
      <div className="flex flex-col gap-3">
        <input
          type="number"
          min={0}
          max={500}
          value={value}
          onChange={(e) => setValue(Math.max(0, Number(e.target.value) || 0))}
          autoFocus
          className="rounded border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-md bg-zinc-800 px-3 py-2 text-sm text-zinc-100 hover:bg-zinc-700"
          >
            Cancelar
          </button>
          <DestinationPicker
            players={players}
            defaultType={defaultDest}
            onConfirm={(dest) => onConfirm(value, dest)}
            buttonLabel={confirmLabel}
            buttonClassName={`flex-1 rounded-md ${confirmClass} px-3 py-2 text-sm font-medium text-white disabled:opacity-50`}
          />
        </div>
      </div>
    </PopoverShell>
  );
}

function ConditionPopover({
  characterName,
  players,
  onClose,
  onConfirm,
}: {
  characterName: string;
  players: PlayerOption[];
  onClose: () => void;
  onConfirm: (cond: string, dest: import("./types").Destination) => Promise<void>;
}) {
  const [cond, setCond] = useState<string>(CONDITIONS_5E[0]);

  return (
    <PopoverShell title={`Condição em ${characterName}`} onClose={onClose}>
      <div className="flex flex-col gap-3">
        <select
          value={cond}
          onChange={(e) => setCond(e.target.value)}
          className="rounded border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
        >
          {CONDITIONS_5E.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-md bg-zinc-800 px-3 py-2 text-sm text-zinc-100 hover:bg-zinc-700"
          >
            Cancelar
          </button>
          <DestinationPicker
            players={players}
            defaultType="all"
            onConfirm={(dest) => onConfirm(cond, dest)}
            buttonLabel="Aplicar"
            buttonClassName="flex-1 rounded-md bg-amber-700 px-3 py-2 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-50"
          />
        </div>
      </div>
    </PopoverShell>
  );
}

function XpPopover({
  characterName,
  onClose,
  onConfirm,
}: {
  characterName: string;
  onClose: () => void;
  onConfirm: (amount: number) => Promise<void>;
}) {
  const [amount, setAmount] = useState(100);

  return (
    <PopoverShell title={`XP para ${characterName}`} onClose={onClose}>
      <div className="flex flex-col gap-3">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value) || 0)}
          autoFocus
          className="rounded border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-md bg-zinc-800 px-3 py-2 text-sm text-zinc-100 hover:bg-zinc-700"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onConfirm(amount)}
            className="flex-1 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500"
          >
            Conceder
          </button>
        </div>
      </div>
    </PopoverShell>
  );
}

function DicePopover({
  onClose,
  onRoll,
}: {
  onClose: () => void;
  onRoll: (sides: number) => Promise<void>;
}) {
  return (
    <PopoverShell title="Rolar dado" onClose={onClose}>
      <div className="grid grid-cols-4 gap-2">
        {DIE_SIDES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onRoll(s)}
            className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm text-zinc-100 hover:border-emerald-500 hover:bg-zinc-900"
          >
            d{s}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={onClose}
        className="mt-3 w-full rounded-md bg-zinc-800 px-3 py-2 text-sm text-zinc-100 hover:bg-zinc-700"
      >
        Cancelar
      </button>
    </PopoverShell>
  );
}
