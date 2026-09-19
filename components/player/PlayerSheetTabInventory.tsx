"use client";

import type { Character } from "@/lib/types";
import { InventoryGrid } from "@/components/characters/InventoryGrid";
import { inventoryOf, statsOf } from "@/components/characters/types";

type Props = {
  character: Character;
};

export function PlayerSheetTabInventory({ character }: Props) {
  const items = inventoryOf(character);
  const stats = statsOf(character);

  return (
    <div className="flex flex-col gap-3">
      <section className="grid grid-cols-2 gap-2">
        <InvStat label="Itens" value={String(items.length)} />
        <InvStat label="Ouro" value={String(character.gold)} accent="gold" />
      </section>

      <InventoryGrid
        items={items}
        strength={stats.strength}
        editable={false}
        onChange={() => {}}
      />

      <p className="text-center text-[10px] text-zinc-600">
        Inventário em modo leitura. Peça ao Mestre para mover itens.
      </p>
    </div>
  );
}

function InvStat({
  label,
  value,
  accent = "blue",
}: {
  label: string;
  value: string;
  accent?: "blue" | "gold";
}) {
  return (
    <div className="relative overflow-hidden flex items-center justify-between rounded border border-zinc-800 bg-zinc-900 px-3 py-2.5">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />
      <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500" style={{ fontFamily: "var(--font-rpg-hud)" }}>
        {label}
      </span>
      <span
        className={`text-base tabular-nums ${accent === "gold" ? "text-amber-400" : "text-blue-400"}`}
        style={{ fontFamily: "var(--font-rpg-numbers)" }}
      >
        {value}
      </span>
    </div>
  );
}
