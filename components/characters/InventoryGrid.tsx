"use client";

import { useMemo, useState } from "react";
import {
  BAG_SIZE,
  EQUIPMENT_LABELS,
  type EquipmentSlot,
  type InventoryItem,
  maxCarryWeight,
} from "./types";
import { InventorySlot } from "./InventorySlot";

type Props = {
  items: InventoryItem[];
  strength: number;
  editable: boolean;
  onChange: (next: InventoryItem[]) => void;
  onItemClick?: (item: InventoryItem) => void;
};

const LEFT_SLOTS: EquipmentSlot[] = [
  "head",
  "shoulder_left",
  "glove_left",
  "chest",
  "main_hand",
  "boots",
];

const RIGHT_SLOTS: EquipmentSlot[] = [
  "cape",
  "shoulder_right",
  "glove_right",
  "legs",
  "off_hand",
  "ring",
  "amulet",
];

export function InventoryGrid({
  items,
  strength,
  editable,
  onChange,
  onItemClick,
}: Props) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const equipped = useMemo(() => {
    const map = new Map<string, InventoryItem>();
    items.forEach((it) => {
      if (it.equipped_slot) map.set(it.equipped_slot, it);
    });
    return map;
  }, [items]);

  const bagItems = useMemo(() => {
    const arr: (InventoryItem | null)[] = Array(BAG_SIZE).fill(null);
    items.forEach((it) => {
      if (it.equipped_slot) return;
      const pos = it.bag_position ?? -1;
      if (pos >= 0 && pos < BAG_SIZE && !arr[pos]) {
        arr[pos] = it;
      }
    });
    // Items without explicit bag_position (or duplicated) get filled into first empty slots
    items.forEach((it) => {
      if (it.equipped_slot) return;
      if (
        it.bag_position !== undefined &&
        it.bag_position !== null &&
        arr[it.bag_position] === it
      ) {
        return;
      }
      const free = arr.findIndex((s) => s === null);
      if (free >= 0) arr[free] = it;
    });
    return arr;
  }, [items]);

  const totalWeight = items.reduce((sum, it) => sum + (it.weight || 0), 0);
  const maxWeight = maxCarryWeight(strength);
  const overweight = totalWeight > maxWeight;

  function moveTo(target: { kind: "equip"; slot: EquipmentSlot } | { kind: "bag"; pos: number }) {
    if (!draggedId || !editable) return;
    const draggedItem = items.find((i) => i.id === draggedId);
    if (!draggedItem) return;

    if (draggedItem.type === "quest" && target.kind === "bag") {
      // Quest items stay where they are unless landing in bag from elsewhere — fine to allow into bag
      // We only block bag-to-outside (descarte). Bag↔Bag and Bag↔Equip are allowed.
    }

    let next: InventoryItem[];

    if (target.kind === "equip") {
      // Find existing item in target slot
      const existing = items.find((i) => i.equipped_slot === target.slot);
      next = items.map((i) => {
        if (i.id === draggedItem.id) {
          return {
            ...i,
            equipped_slot: target.slot,
            bag_position: null,
          };
        }
        if (existing && i.id === existing.id) {
          // Push existing equipped item to dragged item's previous bag position (or empty bag slot)
          const fallbackPos = draggedItem.bag_position ?? findEmptyBagPos(items, draggedItem.id);
          return {
            ...i,
            equipped_slot: null,
            bag_position: fallbackPos,
          };
        }
        return i;
      });
    } else {
      const occupied = bagItems[target.pos];
      next = items.map((i) => {
        if (i.id === draggedItem.id) {
          return {
            ...i,
            equipped_slot: null,
            bag_position: target.pos,
          };
        }
        if (occupied && i.id === occupied.id) {
          // Swap to dragged's previous spot
          if (draggedItem.equipped_slot) {
            return { ...i, equipped_slot: draggedItem.equipped_slot, bag_position: null };
          }
          const fallback = draggedItem.bag_position ?? findEmptyBagPos(items, draggedItem.id);
          return { ...i, equipped_slot: null, bag_position: fallback };
        }
        return i;
      });
    }

    setError(null);
    onChange(next);
  }

  function findEmptyBagPos(arr: InventoryItem[], excludeId: string): number {
    const used = new Set<number>();
    arr.forEach((it) => {
      if (it.id === excludeId) return;
      if (it.equipped_slot) return;
      if (typeof it.bag_position === "number") used.add(it.bag_position);
    });
    for (let i = 0; i < BAG_SIZE; i++) {
      if (!used.has(i)) return i;
    }
    return 0;
  }

  function discardDragged() {
    if (!draggedId || !editable) return;
    const item = items.find((i) => i.id === draggedId);
    if (!item) return;
    if (item.type === "quest") {
      setError("Itens de quest não podem ser descartados.");
      return;
    }
    if (!confirm(`Descartar ${item.name}?`)) return;
    setError(null);
    onChange(items.filter((i) => i.id !== item.id));
  }

  return (
    <div className="flex flex-col gap-3">
      <header className="flex items-center justify-between text-xs">
        <span className="text-zinc-400">
          Peso:{" "}
          <span className={overweight ? "font-semibold text-red-400" : "text-zinc-200"}>
            {totalWeight}
          </span>{" "}
          / {maxWeight}
        </span>
        {overweight && (
          <span className="rounded bg-red-900/40 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-red-300">
            Sobrecarregado
          </span>
        )}
      </header>

      <div className="grid grid-cols-3 gap-3 rounded-md border border-zinc-800 bg-zinc-900 p-3">
        <div className="flex flex-col gap-1.5">
          {LEFT_SLOTS.map((slot) => (
            <InventorySlot
              key={slot}
              item={equipped.get(slot) ?? null}
              label={EQUIPMENT_LABELS[slot]}
              variant="equipment"
              disabled={!editable}
              onDropItem={() => moveTo({ kind: "equip", slot })}
              onDragStartItem={(it) => setDraggedId(it.id)}
              onDragEndItem={() => setDraggedId(null)}
              onClickItem={onItemClick}
            />
          ))}
        </div>
        <div className="flex items-center justify-center rounded border border-dashed border-zinc-700 bg-zinc-950 p-2 text-center text-[10px] text-zinc-600">
          Personagem
        </div>
        <div className="flex flex-col gap-1.5">
          {RIGHT_SLOTS.map((slot) => (
            <InventorySlot
              key={slot}
              item={equipped.get(slot) ?? null}
              label={EQUIPMENT_LABELS[slot]}
              variant="equipment"
              disabled={!editable}
              onDropItem={() => moveTo({ kind: "equip", slot })}
              onDragStartItem={(it) => setDraggedId(it.id)}
              onDragEndItem={() => setDraggedId(null)}
              onClickItem={onItemClick}
            />
          ))}
          <InventorySlot
            item={equipped.get("belt") ?? null}
            label={EQUIPMENT_LABELS.belt}
            variant="equipment"
            disabled={!editable}
            onDropItem={() => moveTo({ kind: "equip", slot: "belt" })}
            onDragStartItem={(it) => setDraggedId(it.id)}
            onDragEndItem={() => setDraggedId(null)}
            onClickItem={onItemClick}
          />
        </div>
      </div>

      <div>
        <h4 className="mb-2 text-xs uppercase tracking-wide text-zinc-500">
          Mochila
        </h4>
        <div
          className="grid grid-cols-6 gap-1.5 rounded-md border border-zinc-800 bg-zinc-900 p-3"
          onDragOver={(e) => {
            if (editable) e.preventDefault();
          }}
        >
          {bagItems.map((it, idx) => (
            <InventorySlot
              key={idx}
              item={it}
              variant="bag"
              disabled={!editable}
              onDropItem={() => moveTo({ kind: "bag", pos: idx })}
              onDragStartItem={(item) => setDraggedId(item.id)}
              onDragEndItem={() => setDraggedId(null)}
              onClickItem={onItemClick}
            />
          ))}
        </div>
      </div>

      {editable && (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            discardDragged();
          }}
          className="rounded-md border border-dashed border-red-900/50 bg-red-950/10 p-3 text-center text-xs text-red-300"
        >
          Arraste aqui para descartar
        </div>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}

      {items.length === 0 && (
        <p className="text-center text-xs text-zinc-500">
          Inventário vazio. Use o botão &quot;+ Item&quot; para adicionar.
        </p>
      )}
    </div>
  );
}
