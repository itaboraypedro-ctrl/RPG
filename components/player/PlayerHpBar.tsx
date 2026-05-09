"use client";

import { useState } from "react";

type Kind = "hp" | "effort";

type Props = {
  kind: Kind;
  label: string;
  current: number;
  max: number;
  /** Optional secondary value (used by HP for temp HP display). */
  extra?: number;
  /** Status label (e.g. "Estável", "Crítico") shown below the bar. Optional. */
  status?: { label: string; color: "green" | "amber" | "red" | "zinc" | "gold" };
  /** Extra ring pulse on critical states. */
  pulse?: boolean;
  disabled?: boolean;
  onCommit: (value: number) => void;
};

const FILL_BY_COLOR: Record<NonNullable<Props["status"]>["color"], string> = {
  green: "bg-rpg-green",
  amber: "bg-amber-500",
  red: "bg-rpg-red",
  zinc: "bg-zinc-700",
  gold: "bg-rpg-gold",
};

const TEXT_BY_COLOR: Record<NonNullable<Props["status"]>["color"], string> = {
  green: "text-rpg-green",
  amber: "text-amber-400",
  red: "text-rpg-red",
  zinc: "text-zinc-400",
  gold: "text-rpg-gold",
};

export function PlayerHpBar({
  kind,
  label,
  current,
  max,
  extra,
  status,
  pulse,
  disabled = false,
  onCommit,
}: Props) {
  const [draft, setDraft] = useState(String(current));
  const [lastSeen, setLastSeen] = useState(current);

  // Sync prop -> draft when prop changes (realtime update from GM).
  // This is React 19 idiom: setState during render only when comparing prev value.
  if (current !== lastSeen) {
    setLastSeen(current);
    setDraft(String(current));
  }

  const pct = max > 0 ? Math.max(0, Math.min(100, (current / max) * 100)) : 0;
  const baseFill =
    kind === "effort"
      ? "bg-rpg-gold"
      : status
        ? FILL_BY_COLOR[status.color]
        : "bg-rpg-green";
  const textColor = status ? TEXT_BY_COLOR[status.color] : "text-rpg-text";

  function commit(raw: string | number) {
    if (disabled) return;
    const n =
      typeof raw === "number"
        ? raw
        : Number.parseInt(raw.replace(/[^0-9-]/g, ""), 10);
    const value = Number.isFinite(n) ? n : 0;
    const clamped = Math.max(0, Math.min(max, value));
    setDraft(String(clamped));
    if (clamped !== current) onCommit(clamped);
  }

  function bump(delta: number) {
    if (disabled) return;
    commit(current + delta);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <span
          className="text-[10px] font-semibold uppercase tracking-[0.2em] text-rpg-text-dim"
          style={{ fontFamily: "var(--font-rpg-hud)" }}
        >
          {label}
        </span>
        <span
          className="text-sm tabular-nums text-rpg-text"
          style={{ fontFamily: "var(--font-rpg-numbers)" }}
        >
          {current}
          <span className="text-rpg-text-dim"> / {max}</span>
          {kind === "hp" && extra !== undefined && extra > 0 && (
            <span className="ml-2 rounded bg-rpg-blue/20 px-1.5 py-0.5 text-[10px] text-rpg-blue">
              +{extra} temp
            </span>
          )}
        </span>
      </div>

      <div
        className={`relative h-3 w-full overflow-hidden rounded-full border border-rpg-border bg-rpg-bg ${
          pulse ? "ring-1 ring-rpg-red/60 animate-pulse" : ""
        }`}
      >
        <div
          className={`h-full transition-[width] duration-[400ms] ease-out ${baseFill}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => bump(-1)}
          disabled={disabled || current <= 0}
          className="flex h-7 w-7 items-center justify-center rounded-md border border-rpg-border bg-rpg-bg text-rpg-text transition-colors hover:border-rpg-red/60 hover:text-rpg-red disabled:opacity-40"
          aria-label={`Diminuir ${label}`}
        >
          −
        </button>
        <input
          type="number"
          inputMode="numeric"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => commit(draft)}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.currentTarget as HTMLInputElement).blur();
          }}
          disabled={disabled}
          className="flex-1 rounded-md border border-rpg-border bg-rpg-bg px-2 py-1 text-center text-sm tabular-nums text-rpg-text disabled:opacity-50"
          style={{ fontFamily: "var(--font-rpg-numbers)" }}
        />
        <button
          type="button"
          onClick={() => bump(1)}
          disabled={disabled || current >= max}
          className="flex h-7 w-7 items-center justify-center rounded-md border border-rpg-border bg-rpg-bg text-rpg-text transition-colors hover:border-rpg-green/60 hover:text-rpg-green disabled:opacity-40"
          aria-label={`Aumentar ${label}`}
        >
          +
        </button>
      </div>

      {status && (
        <p
          className={`text-[10px] uppercase tracking-wider ${textColor}`}
          style={{ fontFamily: "var(--font-rpg-hud)" }}
        >
          {status.label}
        </p>
      )}
    </div>
  );
}
