"use client";

import { useState } from "react";
import type { InventoryItem } from "./types";
import { InventoryItemView } from "./InventoryItem";

type Props = {
  item: InventoryItem | null;
  label?: string;
  variant?: "equipment" | "bag";
  disabled?: boolean;
  onDropItem: () => void;
  onDragStartItem?: (item: InventoryItem) => void;
  onDragEndItem?: () => void;
  onClickItem?: (item: InventoryItem) => void;
};

export function InventorySlot({
  item,
  label,
  variant = "bag",
  disabled,
  onDropItem,
  onDragStartItem,
  onDragEndItem,
  onClickItem,
}: Props) {
  const [hover, setHover] = useState(false);
  const baseClass =
    variant === "equipment"
      ? "h-12 w-12 rounded border bg-zinc-950"
      : "h-12 w-12 rounded border bg-zinc-950";

  return (
    <div
      onDragOver={(e) => {
        if (disabled) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        if (!hover) setHover(true);
      }}
      onDragLeave={() => setHover(false)}
      onDrop={(e) => {
        if (disabled) return;
        e.preventDefault();
        setHover(false);
        onDropItem();
      }}
      className={`relative flex items-center justify-center ${baseClass} ${
        hover ? "border-emerald-500" : "border-zinc-800"
      } ${disabled ? "opacity-50" : ""}`}
    >
      {item ? (
        <InventoryItemView
          item={item}
          draggable={!disabled}
          onDragStart={onDragStartItem}
          onDragEnd={onDragEndItem}
          onClick={onClickItem}
        />
      ) : (
        label && (
          <span className="select-none text-[9px] uppercase tracking-wide text-zinc-600">
            {label}
          </span>
        )
      )}
    </div>
  );
}
