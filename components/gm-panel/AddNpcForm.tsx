"use client";

import { useState, useTransition } from "react";
import { addEnemy } from "@/app/dashboard/sessions/[id]/play/actions";

export function AddNpcForm({
  sessionId,
  disabled,
}: {
  sessionId: string;
  disabled: boolean;
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [hp, setHp] = useState(20);
  const [ac, setAc] = useState(12);
  const [initiative, setInitiative] = useState(10);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim().length === 0) {
      setError("Nome obrigatório.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const r = await addEnemy(sessionId, {
        name: name.trim(),
        type: type.trim() || undefined,
        hp,
        max_hp: hp,
        ac,
        initiative,
      });
      if (r.error) {
        setError(r.error);
        return;
      }
      setName("");
      setType("");
      setHp(20);
      setAc(12);
      setInitiative(10);
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-2 rounded-md border border-zinc-800 bg-zinc-900 p-3"
    >
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={disabled}
          required
          className="flex-1 rounded border border-zinc-800 bg-zinc-950 px-2 py-1 text-xs"
        />
        <input
          type="text"
          placeholder="Tipo"
          value={type}
          onChange={(e) => setType(e.target.value)}
          disabled={disabled}
          className="w-24 rounded border border-zinc-800 bg-zinc-950 px-2 py-1 text-xs"
        />
      </div>
      <div className="flex gap-2">
        <label className="flex flex-1 items-center gap-1 text-xs text-zinc-400">
          HP
          <input
            type="number"
            min={1}
            value={hp}
            onChange={(e) => setHp(Math.max(1, Number(e.target.value) || 1))}
            disabled={disabled}
            className="w-full rounded border border-zinc-800 bg-zinc-950 px-2 py-1 text-xs text-zinc-100"
          />
        </label>
        <label className="flex flex-1 items-center gap-1 text-xs text-zinc-400">
          CA
          <input
            type="number"
            min={1}
            value={ac}
            onChange={(e) => setAc(Math.max(1, Number(e.target.value) || 1))}
            disabled={disabled}
            className="w-full rounded border border-zinc-800 bg-zinc-950 px-2 py-1 text-xs text-zinc-100"
          />
        </label>
        <label className="flex flex-1 items-center gap-1 text-xs text-zinc-400">
          Init
          <input
            type="number"
            value={initiative}
            onChange={(e) => setInitiative(Number(e.target.value) || 0)}
            disabled={disabled}
            className="w-full rounded border border-zinc-800 bg-zinc-950 px-2 py-1 text-xs text-zinc-100"
          />
        </label>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={disabled || pending}
        className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
      >
        + Adicionar à batalha
      </button>
    </form>
  );
}
