"use client";

import { useEffect, useRef, useState } from "react";
import type { Character } from "@/lib/types";
import { InventoryGrid } from "./InventoryGrid";
import { type InventoryItem, inventoryOf, statsOf, type ItemRarity, type ItemType } from "./types";

type Props = {
  character: Character;
  editable: boolean;
};

const ITEM_TYPES: ItemType[] = ["weapon", "armor", "potion", "scroll", "misc", "quest"];
const RARITIES: ItemRarity[] = ["common", "uncommon", "rare", "epic", "legendary"];

export function CharacterSheetTab2({ character, editable }: Props) {
  const initial = inventoryOf(character);
  const [items, setItems] = useState<InventoryItem[]>(initial);
  const [editing, setEditing] = useState<InventoryItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const lastSavedRef = useRef<string>(JSON.stringify(initial));
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function persist(next: InventoryItem[]) {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      const payload = JSON.stringify(next);
      if (payload === lastSavedRef.current) return;
      try {
        const res = await fetch(`/api/characters/${character.id}/inventory`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ inventory: next }),
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as { error?: string };
          setError(data.error ?? "Falha ao salvar inventário");
          return;
        }
        lastSavedRef.current = payload;
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro");
      }
    }, 300);
  }

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  function handleChange(next: InventoryItem[]) {
    setItems(next);
    persist(next);
  }

  function addItem() {
    const newItem: InventoryItem = {
      id: crypto.randomUUID(),
      name: "Item novo",
      type: "misc",
      rarity: "common",
      icon: "📦",
      description: "",
      weight: 0,
      value: 0,
      bag_position: findFirstFreeBag(items),
    };
    const next = [...items, newItem];
    handleChange(next);
    setEditing(newItem);
  }

  return (
    <div className="flex flex-col gap-4">
      {editable && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-zinc-400">
            Arraste itens para equipar, mover ou descartar.
          </p>
          <button
            type="button"
            onClick={addItem}
            className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-500"
          >
            + Item
          </button>
        </div>
      )}

      <InventoryGrid
        items={items}
        strength={statsOf(character).strength}
        editable={editable}
        onChange={handleChange}
        onItemClick={(it) => editable && setEditing(it)}
      />

      {error && <p className="text-xs text-red-400">{error}</p>}

      {editing && editable && (
        <ItemEditor
          item={editing}
          onClose={() => setEditing(null)}
          onSave={(patched) => {
            const next = items.map((i) => (i.id === patched.id ? patched : i));
            handleChange(next);
            setEditing(null);
          }}
          onDelete={() => {
            if (editing.type === "quest") {
              setError("Itens de quest não podem ser removidos.");
              return;
            }
            const next = items.filter((i) => i.id !== editing.id);
            handleChange(next);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function findFirstFreeBag(items: InventoryItem[]): number {
  const used = new Set<number>();
  items.forEach((i) => {
    if (!i.equipped_slot && typeof i.bag_position === "number") {
      used.add(i.bag_position);
    }
  });
  for (let i = 0; i < 30; i++) {
    if (!used.has(i)) return i;
  }
  return 0;
}

function ItemEditor({
  item,
  onClose,
  onSave,
  onDelete,
}: {
  item: InventoryItem;
  onClose: () => void;
  onSave: (next: InventoryItem) => void;
  onDelete: () => void;
}) {
  const [draft, setDraft] = useState(item);

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-md border border-zinc-800 bg-zinc-900 p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-3 text-sm font-medium text-zinc-100">Editar item</h3>
        <div className="flex flex-col gap-2">
          <label className="text-xs text-zinc-400">
            Nome
            <input
              type="text"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              className="mt-1 w-full rounded border border-zinc-800 bg-zinc-950 px-2 py-1 text-sm"
            />
          </label>
          <div className="flex gap-2">
            <label className="flex-1 text-xs text-zinc-400">
              Ícone (emoji)
              <input
                type="text"
                value={draft.icon}
                onChange={(e) => setDraft({ ...draft, icon: e.target.value })}
                maxLength={4}
                className="mt-1 w-full rounded border border-zinc-800 bg-zinc-950 px-2 py-1 text-sm"
              />
            </label>
            <label className="flex-1 text-xs text-zinc-400">
              Tipo
              <select
                value={draft.type}
                onChange={(e) =>
                  setDraft({ ...draft, type: e.target.value as ItemType })
                }
                className="mt-1 w-full rounded border border-zinc-800 bg-zinc-950 px-2 py-1 text-sm"
              >
                {ITEM_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex-1 text-xs text-zinc-400">
              Raridade
              <select
                value={draft.rarity}
                onChange={(e) =>
                  setDraft({ ...draft, rarity: e.target.value as ItemRarity })
                }
                className="mt-1 w-full rounded border border-zinc-800 bg-zinc-950 px-2 py-1 text-sm"
              >
                {RARITIES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="text-xs text-zinc-400">
            Descrição
            <textarea
              rows={2}
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              className="mt-1 w-full rounded border border-zinc-800 bg-zinc-950 px-2 py-1 text-sm"
            />
          </label>
          <div className="flex gap-2">
            <label className="flex-1 text-xs text-zinc-400">
              Peso
              <input
                type="number"
                min={0}
                value={draft.weight}
                onChange={(e) => setDraft({ ...draft, weight: Number(e.target.value) || 0 })}
                className="mt-1 w-full rounded border border-zinc-800 bg-zinc-950 px-2 py-1 text-sm"
              />
            </label>
            <label className="flex-1 text-xs text-zinc-400">
              Valor (ouro)
              <input
                type="number"
                min={0}
                value={draft.value}
                onChange={(e) => setDraft({ ...draft, value: Number(e.target.value) || 0 })}
                className="mt-1 w-full rounded border border-zinc-800 bg-zinc-950 px-2 py-1 text-sm"
              />
            </label>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onDelete}
            className="rounded-md border border-red-900/50 bg-red-950/30 px-3 py-1.5 text-xs text-red-300 hover:bg-red-950/50"
          >
            Remover
          </button>
          <button
            type="button"
            onClick={onClose}
            className="ml-auto rounded-md bg-zinc-800 px-3 py-1.5 text-xs text-zinc-100 hover:bg-zinc-700"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onSave(draft)}
            className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs text-white hover:bg-emerald-500"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
