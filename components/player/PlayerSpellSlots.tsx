"use client";

import type { SpellSlotsState } from "@/components/characters/types";

type Props = {
  slots: SpellSlotsState;
  disabled?: boolean;
  onToggle: (level: number, nextUsed: number) => void;
};

const ORDINAL = ["1º", "2º", "3º", "4º", "5º", "6º", "7º", "8º", "9º"];

export function PlayerSpellSlots({ slots, disabled = false, onToggle }: Props) {
  const visible = ORDINAL.map((label, i) => ({
    level: i + 1,
    label,
    total: slots.total[i] ?? 0,
    used: Math.min(slots.used[i] ?? 0, slots.total[i] ?? 0),
  })).filter((s) => s.total > 0);

  if (visible.length === 0) {
    return (
      <p className="text-center text-xs text-rpg-text-dim">
        Sem spell slots disponíveis.
      </p>
    );
  }

  function handleDotClick(level: number, idx: number, currentUsed: number) {
    if (disabled) return;
    // Dots à esquerda (idx < total - used) = disponíveis
    // Dots à direita = usados
    // Idx 0..total-1: clique no primeiro disponível -> incrementa used
    //                 clique no primeiro usado -> decrementa used
    const total = slots.total[level - 1] ?? 0;
    const availableCount = total - currentUsed;
    if (idx < availableCount) {
      onToggle(level, currentUsed + 1);
    } else {
      onToggle(level, Math.max(0, currentUsed - 1));
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      {visible.map((s) => {
        const available = s.total - s.used;
        return (
          <div
            key={s.level}
            className="flex items-center gap-2 rounded-md border border-rpg-border bg-rpg-bg px-2 py-1.5"
          >
            <span
              className="w-8 shrink-0 text-[11px] uppercase tracking-wider text-rpg-text-dim"
              style={{ fontFamily: "var(--font-rpg-hud)" }}
            >
              Nível {s.level}
            </span>
            <div className="flex flex-1 flex-wrap gap-1">
              {Array.from({ length: s.total }).map((_, idx) => {
                const isAvailable = idx < available;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleDotClick(s.level, idx, s.used)}
                    disabled={disabled}
                    aria-label={
                      isAvailable
                        ? `Slot ${s.level} disponível — gastar`
                        : `Slot ${s.level} usado — recuperar`
                    }
                    className={`h-4 w-4 rounded-full border transition-colors ${
                      isAvailable
                        ? "border-rpg-purple bg-rpg-purple shadow-[0_0_4px_rgba(155,127,232,0.6)]"
                        : "border-rpg-border bg-rpg-surface"
                    } disabled:cursor-not-allowed disabled:opacity-50`}
                  />
                );
              })}
            </div>
            <span
              className="shrink-0 text-[11px] tabular-nums text-rpg-text-dim"
              style={{ fontFamily: "var(--font-rpg-numbers)" }}
            >
              {available}/{s.total}
            </span>
          </div>
        );
      })}
    </div>
  );
}
