"use client";

import { useState, useTransition } from "react";
import type { Destination, PlayerOption } from "./types";

type Props = {
  players: PlayerOption[];
  defaultType?: Destination["type"];
  onConfirm: (dest: Destination) => Promise<void> | void;
  buttonLabel: React.ReactNode;
  buttonClassName?: string;
  disabled?: boolean;
  title?: string;
};

export function DestinationPicker({
  players,
  defaultType = "all",
  onConfirm,
  buttonLabel,
  buttonClassName,
  disabled,
  title = "Destino da ação",
}: Props) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<Destination["type"]>(defaultType);
  const [specific, setSpecific] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();

  function toggleSpecific(id: string, on: boolean) {
    const next = new Set(specific);
    if (on) next.add(id);
    else next.delete(id);
    setSpecific(next);
  }

  function confirm() {
    let dest: Destination;
    if (type === "gm_only") dest = { type: "gm_only" };
    else if (type === "all") dest = { type: "all" };
    else dest = { type: "specific", playerIds: [...specific] };

    startTransition(async () => {
      await onConfirm(dest);
      setOpen(false);
      setSpecific(new Set());
      setType(defaultType);
    });
  }

  return (
    <>
      <button
        type="button"
        disabled={disabled || pending}
        onClick={() => setOpen(true)}
        className={
          buttonClassName ??
          "rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
        }
      >
        {buttonLabel}
      </button>
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-md border border-zinc-800 bg-zinc-900 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="mb-3 text-sm font-medium text-zinc-100">{title}</h4>
            <div className="flex flex-col gap-2 text-sm text-zinc-200">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="dest"
                  checked={type === "all"}
                  onChange={() => setType("all")}
                  className="accent-emerald-500"
                />
                Todos os jogadores
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="dest"
                  checked={type === "gm_only"}
                  onChange={() => setType("gm_only")}
                  className="accent-emerald-500"
                />
                Apenas eu
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="dest"
                  checked={type === "specific"}
                  onChange={() => setType("specific")}
                  className="accent-emerald-500"
                />
                Específicos
              </label>
              {type === "specific" && (
                <ul className="ml-6 flex flex-col gap-1">
                  {players.length === 0 ? (
                    <li className="text-xs text-zinc-500">
                      Nenhum jogador na sessão.
                    </li>
                  ) : (
                    players.map((p) => (
                      <li key={p.id}>
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={specific.has(p.id)}
                            onChange={(e) => toggleSpecific(p.id, e.target.checked)}
                            className="accent-emerald-500"
                          />
                          {p.name}
                        </label>
                      </li>
                    ))
                  )}
                </ul>
              )}
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-md bg-zinc-800 px-3 py-1.5 text-sm text-zinc-100 hover:bg-zinc-700"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirm}
                disabled={pending}
                className="flex-1 rounded-md bg-emerald-600 px-3 py-1.5 text-sm text-white hover:bg-emerald-500 disabled:opacity-50"
              >
                {pending ? "..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
