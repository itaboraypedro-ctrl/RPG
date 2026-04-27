"use client";

import { type InventoryItem as InventoryItemT, RARITY_BORDER, RARITY_TEXT } from "./types";

type Props = {
  item: InventoryItemT;
  draggable?: boolean;
  onDragStart?: (item: InventoryItemT) => void;
  onDragEnd?: () => void;
  onClick?: (item: InventoryItemT) => void;
  small?: boolean;
};

export function InventoryItemView({
  item,
  draggable = true,
  onDragStart,
  onDragEnd,
  onClick,
  small,
}: Props) {
  const size = small ? "h-10 w-10" : "h-11 w-11";
  return (
    <button
      type="button"
      draggable={draggable}
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", item.id);
        onDragStart?.(item);
      }}
      onDragEnd={() => onDragEnd?.()}
      onClick={() => onClick?.(item)}
      title={`${item.name}\n${item.description ?? ""}\nPeso: ${item.weight} · Valor: ${item.value}`}
      className={`flex ${size} items-center justify-center rounded border-2 bg-zinc-900 transition-colors hover:bg-zinc-800 ${RARITY_BORDER[item.rarity]}`}
    >
      <span className={`text-xl ${RARITY_TEXT[item.rarity]}`}>{item.icon || "•"}</span>
    </button>
  );
}
