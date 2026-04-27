"use client";

import type { SpellSlotsState } from "./types";

type Props = {
  slots: SpellSlotsState;
  editable: boolean;
  onChange: (next: SpellSlotsState) => void;
};

export function SpellSlots({ slots, editable, onChange }: Props) {
  function setTotal(level: number, value: number) {
    const total = slots.total.map((t, i) => (i === level ? Math.max(0, value) : t));
    const used = slots.used.map((u, i) =>
      i === level ? Math.min(u, total[level]) : u
    );
    onChange({ total, used });
  }

  function toggleUsed(level: number, idx: number) {
    if (!editable) return;
    const currentUsed = slots.used[level] ?? 0;
    const total = slots.total[level] ?? 0;
    if (idx < currentUsed) {
      // mark as available
      const used = slots.used.map((u, i) => (i === level ? Math.max(0, u - 1) : u));
      onChange({ ...slots, used });
    } else {
      // mark as used
      if (currentUsed >= total) return;
      const used = slots.used.map((u, i) => (i === level ? u + 1 : u));
      onChange({ ...slots, used });
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-9 gap-1">
        {slots.total.map((total, level) => {
          const used = slots.used[level] ?? 0;
          return (
            <div
              key={level}
              className="flex flex-col items-center gap-1 rounded border border-zinc-800 bg-zinc-950 p-1.5"
            >
              <span className="text-[9px] uppercase tracking-wide text-zinc-500">
                Nv {level + 1}
              </span>
              {editable && (
                <input
                  type="number"
                  min={0}
                  max={9}
                  value={total}
                  onChange={(e) => setTotal(level, Number(e.target.value) || 0)}
                  className="w-9 rounded border border-zinc-800 bg-zinc-900 text-center text-xs"
                />
              )}
              <div className="flex flex-col gap-0.5">
                {Array.from({ length: total }, (_, i) => i).map((i) => {
                  const isUsed = i < used;
                  return (
                    <button
                      key={i}
                      type="button"
                      disabled={!editable}
                      onClick={() => toggleUsed(level, i)}
                      className={`h-2.5 w-2.5 rounded-full border ${
                        isUsed
                          ? "border-zinc-700 bg-zinc-800"
                          : "border-emerald-600 bg-emerald-500"
                      } ${editable ? "cursor-pointer" : "cursor-default"}`}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
