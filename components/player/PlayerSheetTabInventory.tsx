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
        <Stat label="Itens" value={String(items.length)} />
        <Stat label="Ouro" value={String(character.gold)} accent="gold" />
      </section>

      <InventoryGrid
        items={items}
        strength={stats.strength}
        editable={false}
        onChange={() => {}}
      />

      <p className="text-center text-[10px] text-rpg-text-dim">
        Inventário em modo leitura. Peça ao Mestre para mover itens.
      </p>
    </div>
  );
}

function Stat({
  label,
  value,
  accent = "blue",
}: {
  label: string;
  value: string;
  accent?: "blue" | "gold";
}) {
  return (
    <div className="flex items-center justify-between rounded-md border border-rpg-border bg-rpg-bg px-3 py-2">
      <span
        className="text-[10px] uppercase tracking-[0.2em] text-rpg-text-dim"
        style={{ fontFamily: "var(--font-rpg-hud)" }}
      >
        {label}
      </span>
      <span
        className={`text-base tabular-nums ${
          accent === "gold" ? "text-rpg-gold" : "text-rpg-blue"
        }`}
        style={{ fontFamily: "var(--font-rpg-numbers)" }}
      >
        {value}
      </span>
    </div>
  );
}
