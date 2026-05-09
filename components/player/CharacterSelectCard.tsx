"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Character } from "@/lib/types";
import { selectCharacter } from "@/app/play/characters/select/actions";

type Props = {
  character: Character;
  targetSessionId: string | null;
};

export function CharacterSelectCard({ character, targetSessionId }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const inThisSession =
    targetSessionId !== null && character.session_id === targetSessionId;
  const inOtherSession =
    character.session_id !== null && character.session_id !== targetSessionId;

  let statusLabel: string;
  let statusClass: string;
  if (inThisSession) {
    statusLabel = "Já nesta sessão";
    statusClass = "bg-emerald-900/40 text-emerald-300";
  } else if (inOtherSession) {
    statusLabel = "Em outra sessão";
    statusClass = "bg-amber-900/40 text-amber-300";
  } else {
    statusLabel = "Disponível";
    statusClass = "bg-zinc-800 text-zinc-300";
  }

  function onUse() {
    if (!targetSessionId) {
      setError("Sessão não informada.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await selectCharacter(character.id, targetSessionId);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.push(`/play/${targetSessionId}`);
      router.refresh();
    });
  }

  const initial = character.name.charAt(0).toUpperCase();

  return (
    <div className="flex flex-col gap-3 rounded-md border border-zinc-800 bg-zinc-900 p-3">
      <div className="flex items-center gap-3">
        {character.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={character.avatar_url}
            alt={character.name}
            className="h-12 w-12 rounded border border-zinc-700 object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded border border-zinc-700 bg-zinc-800 text-base font-medium text-zinc-200">
            {initial}
          </div>
        )}
        <div className="flex-1">
          <p className="text-sm font-medium text-zinc-100">{character.name}</p>
          <p className="text-xs text-zinc-500">
            {character.race || "—"} · {character.class || "—"} · Nv {character.level}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${statusClass}`}
        >
          {statusLabel}
        </span>
      </div>

      {targetSessionId && !inThisSession && (
        <button
          type="button"
          onClick={onUse}
          disabled={pending || inOtherSession}
          className="rounded-md bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Vinculando..." : "Usar este personagem"}
        </button>
      )}

      {inThisSession && (
        <button
          type="button"
          onClick={() => router.push(`/play/${targetSessionId}`)}
          className="rounded-md bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-100 hover:bg-zinc-700"
        >
          Voltar para a sessão
        </button>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
