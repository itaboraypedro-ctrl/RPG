"use client";

import { useEffect, useRef, useState } from "react";
import type { Character } from "@/lib/types";

type Props = {
  character: Character;
  active?: boolean;
  onClick: () => void;
};

type ActionKind = "damage" | "heal" | "spell" | "effort";
type Toast = { kind: ActionKind; message: string };

const MAX_EFFORT_MOCK = 10;

const CONDITION_COLORS: Record<string, string> = {
  envenenado: "bg-emerald-400",
  atordoado: "bg-yellow-400",
  concentrando: "bg-sky-400",
  amedrontado: "bg-purple-400",
  paralisado: "bg-orange-400",
  enfeitiçado: "bg-pink-400",
};

const SPELLS = [
  "Bola de Fogo",
  "Cura Ferimentos",
  "Mísseis Mágicos",
  "Escudo",
  "Bênção",
  "Restauração Maior",
  "Relâmpago",
  "Sono",
  "Toque Vampírico",
  "Invisibilidade",
];

type Theme = {
  label: string;
  icon: string;
  borderSoft: string;
  text: string;
  accent: string;
  confirm: string;
  iconBtn: string;
  toast: string;
};

const THEMES: Record<ActionKind, Theme> = {
  damage: {
    label: "Dano",
    icon: "⚔",
    borderSoft: "border-red-500/60",
    text: "text-red-400",
    accent: "accent-red-500",
    confirm: "bg-red-600 hover:bg-red-500",
    iconBtn: "bg-red-500/15 hover:bg-red-500/35 text-red-300",
    toast: "bg-red-600",
  },
  heal: {
    label: "Cura",
    icon: "✚",
    borderSoft: "border-emerald-500/60",
    text: "text-emerald-400",
    accent: "accent-emerald-500",
    confirm: "bg-emerald-600 hover:bg-emerald-500",
    iconBtn: "bg-emerald-500/15 hover:bg-emerald-500/35 text-emerald-300",
    toast: "bg-emerald-600",
  },
  spell: {
    label: "Feitiço",
    icon: "✦",
    borderSoft: "border-violet-500/60",
    text: "text-violet-400",
    accent: "accent-violet-500",
    confirm: "bg-violet-600 hover:bg-violet-500",
    iconBtn: "bg-violet-500/15 hover:bg-violet-500/35 text-violet-300",
    toast: "bg-violet-600",
  },
  effort: {
    label: "Esforço",
    icon: "⚡",
    borderSoft: "border-amber-500/60",
    text: "text-amber-400",
    accent: "accent-amber-500",
    confirm: "bg-amber-600 hover:bg-amber-500",
    iconBtn: "bg-amber-500/15 hover:bg-amber-500/35 text-amber-300",
    toast: "bg-amber-600",
  },
};

export function PlayerSquareBlock({ character, active = false, onClick }: Props) {
  const [hovered, setHovered] = useState(false);
  const [actionOpen, setActionOpen] = useState<ActionKind | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const toastTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    };
  }, []);

  function showToast(t: Toast) {
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    setToast(t);
    toastTimer.current = window.setTimeout(() => setToast(null), 1500);
  }

  const hpPercent =
    character.max_hp > 0 ? (character.hp / character.max_hp) * 100 : 0;
  const dead = character.hp === 0;
  const critical = !dead && hpPercent < 25;
  const wounded = !dead && !critical && hpPercent < 60;
  const initial = character.name.charAt(0).toUpperCase();

  const hpBarColor = dead
    ? "bg-zinc-700"
    : critical
      ? "bg-red-500"
      : wounded
        ? "bg-amber-500"
        : "bg-emerald-500";

  const visibleConditions = character.conditions.slice(0, 3);
  const extraConditions = character.conditions.length - visibleConditions.length;

  function handleCardClick() {
    if (actionOpen) return;
    onClick();
  }

  function handleActionConfirm(kind: ActionKind, value: number, spell?: string) {
    setActionOpen(null);
    if (kind === "damage") showToast({ kind, message: `−${value} dano` });
    else if (kind === "heal") showToast({ kind, message: `+${value} cura` });
    else if (kind === "spell")
      showToast({ kind, message: `${spell ?? "Feitiço"} nv.${value}` });
    else if (kind === "effort")
      showToast({ kind, message: `−${value} esforço` });
  }

  const overlayMaxH =
    actionOpen === "spell"
      ? "max-h-[80px]"
      : actionOpen
        ? "max-h-[64px]"
        : hovered
          ? "max-h-[32px]"
          : "max-h-0";

  const spacerH =
    actionOpen === "spell"
      ? "h-[80px]"
      : actionOpen
        ? "h-[64px]"
        : hovered
          ? "h-[32px]"
          : "h-0";

  const avatarSize =
    actionOpen === "spell"
      ? "h-7 w-7 text-xs"
      : actionOpen
        ? "h-9 w-9 text-sm"
        : "h-12 w-12 text-lg";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && !actionOpen) {
          e.preventDefault();
          onClick();
        }
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`group relative flex aspect-square cursor-pointer flex-col items-center gap-1 overflow-hidden rounded-md border bg-zinc-900 p-2 text-left transition-colors hover:border-emerald-500 focus:border-emerald-500 focus:outline-none ${
        active
          ? "border-emerald-500 shadow-[0_0_0_1px_rgb(16_185_129)]"
          : "border-zinc-800"
      } ${dead ? "opacity-70 grayscale" : ""}`}
      title={character.name}
    >
      {character.conditions.length > 0 && (
        <div className="absolute right-1 top-1 z-[1] flex items-center gap-0.5">
          {visibleConditions.map((c) => (
            <span
              key={c}
              title={c}
              className={`h-2 w-2 rounded-full ${
                CONDITION_COLORS[c.toLowerCase()] ?? "bg-amber-400"
              }`}
            />
          ))}
          {extraConditions > 0 && (
            <span className="text-[9px] font-semibold text-amber-300">
              +{extraConditions}
            </span>
          )}
        </div>
      )}

      <div className="flex min-h-0 flex-1 items-center justify-center pt-1">
        {character.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={character.avatar_url}
            alt={character.name}
            className={`shrink-0 rounded-full border border-zinc-700 object-cover transition-[width,height] duration-200 ease-out ${avatarSize}`}
          />
        ) : (
          <div
            className={`flex shrink-0 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 font-semibold text-zinc-200 transition-[width,height,font-size] duration-200 ease-out ${avatarSize}`}
          >
            {initial}
          </div>
        )}
      </div>

      <div className="flex w-full flex-col gap-0.5">
        <p className="truncate text-center text-xs font-semibold text-zinc-100">
          {character.name}
        </p>
        <p className="truncate text-center text-[10px] text-zinc-400">
          {character.class} {character.race} · Nv.{character.level}
        </p>
        <div className="relative h-3 w-full overflow-hidden rounded-sm bg-zinc-800">
          <div
            className={`h-full transition-all ${hpBarColor}`}
            style={{ width: `${hpPercent}%` }}
          />
          <span className="absolute inset-0 flex items-center justify-center text-[9px] font-semibold text-white drop-shadow">
            {character.hp}/{character.max_hp}
          </span>
        </div>
      </div>

      <div
        className={`shrink-0 transition-[height] duration-200 ease-out ${spacerH}`}
        aria-hidden
      />

      <div
        className="absolute inset-x-0 bottom-0 z-10 overflow-hidden rounded-b-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`overflow-hidden transition-[max-height] duration-200 ease-out ${overlayMaxH}`}
        >
          {!actionOpen ? (
            <ActionsBar onPick={(kind) => setActionOpen(kind)} />
          ) : (
            <ActionPanel
              kind={actionOpen}
              character={character}
              onClose={() => setActionOpen(null)}
              onConfirm={handleActionConfirm}
            />
          )}
        </div>
      </div>

      {toast && (
        <div className="pointer-events-none absolute inset-x-0 top-2 z-30 flex justify-center">
          <div
            className={`animate-[fadeOut_1.5s_ease-out] rounded-md px-2.5 py-1 text-xs font-semibold text-white shadow-lg ${THEMES[toast.kind].toast}`}
          >
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
}

function ActionsBar({ onPick }: { onPick: (kind: ActionKind) => void }) {
  return (
    <div className="flex h-8 items-center justify-around border-t border-zinc-800 bg-zinc-950/90 px-1 backdrop-blur-sm">
      {(Object.keys(THEMES) as ActionKind[]).map((kind) => (
        <button
          key={kind}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPick(kind);
          }}
          title={THEMES[kind].label}
          className={`flex h-6 w-7 items-center justify-center rounded text-sm transition-colors duration-150 ${THEMES[kind].iconBtn}`}
        >
          {THEMES[kind].icon}
        </button>
      ))}
    </div>
  );
}

type PanelProps = {
  kind: ActionKind;
  character: Character;
  onClose: () => void;
  onConfirm: (kind: ActionKind, value: number, spell?: string) => void;
};

function ActionPanel({ kind, character, onClose, onConfirm }: PanelProps) {
  const isSpell = kind === "spell";
  const min = isSpell ? 1 : 0;
  const max = isSpell ? 9 : 100;
  const initial = isSpell ? 1 : 10;
  const [value, setValue] = useState(initial);
  const [spell, setSpell] = useState(SPELLS[0]);
  const theme = THEMES[kind];

  let preview: { from: number; to: number; suffix: string } | null = null;
  if (kind === "damage") {
    preview = {
      from: character.hp,
      to: Math.max(0, character.hp - value),
      suffix: "HP",
    };
  } else if (kind === "heal") {
    preview = {
      from: character.hp,
      to: Math.min(character.max_hp, character.hp + value),
      suffix: "HP",
    };
  } else if (kind === "effort") {
    preview = {
      from: MAX_EFFORT_MOCK,
      to: Math.max(0, MAX_EFFORT_MOCK - value),
      suffix: "⚡",
    };
  }

  const applyLabel = preview
    ? `${preview.from} → ${preview.to} ${preview.suffix}`
    : `Aplicar ${spell}`;

  return (
    <div
      className={`flex flex-col gap-0.5 border-t bg-zinc-950 px-2 py-1 ${theme.borderSoft}`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between gap-1 text-[10px] font-bold uppercase tracking-wide leading-none">
        <span className={theme.text}>
          {theme.icon} {theme.label}
        </span>
        <span className="flex-1 truncate text-center text-zinc-500 normal-case">
          {character.name}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="flex h-4 w-4 items-center justify-center rounded text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
          aria-label="Fechar"
          title="Fechar"
        >
          ×
        </button>
      </div>

      {isSpell && (
        <select
          value={spell}
          onChange={(e) => setSpell(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          className="h-5 rounded border border-zinc-800 bg-zinc-900 px-1 text-[10px] text-zinc-100 focus:border-violet-500 focus:outline-none"
        >
          {SPELLS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      )}

      <div className="flex items-center gap-1.5">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          onClick={(e) => e.stopPropagation()}
          className={`h-3 flex-1 ${theme.accent}`}
        />
        <span
          className={`min-w-[32px] text-right text-sm font-bold leading-none tabular-nums ${theme.text}`}
        >
          {isSpell ? `nv.${value}` : kind === "heal" ? `+${value}` : `−${value}`}
        </span>
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onConfirm(kind, value, isSpell ? spell : undefined);
        }}
        className={`h-5 w-full truncate rounded text-[11px] font-semibold leading-none text-white ${theme.confirm}`}
      >
        {applyLabel}
      </button>
    </div>
  );
}
