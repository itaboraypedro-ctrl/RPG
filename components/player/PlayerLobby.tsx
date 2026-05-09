"use client";

import Link from "next/link";
import type { Session } from "@/lib/types";

type LobbyPlayer = {
  player_id: string;
  display_name: string;
  avatar_url: string | null;
  status: string;
};

type Props = {
  session: Session;
  players: LobbyPlayer[];
  hasCharacter: boolean;
  characterName?: string;
};

export function PlayerLobby({ session, players, hasCharacter, characterName }: Props) {
  return (
    <div className="flex flex-1 flex-col gap-6 px-4 py-6">
      <header className="flex flex-col items-center gap-3 text-center">
        <span className="text-4xl">⏳</span>
        <h1 className="text-lg font-semibold text-zinc-100">{session.title}</h1>
        <p className="text-sm text-zinc-400">
          Aguardando o Mestre iniciar a partida...
        </p>
      </header>

      {hasCharacter && characterName && (
        <p className="rounded-md border border-emerald-900/40 bg-emerald-950/20 p-2 text-center text-xs text-emerald-300">
          Você está jogando como <strong>{characterName}</strong>
        </p>
      )}

      <Link
        href={`/play/characters/select?session=${session.id}`}
        className="rounded-md bg-zinc-800 px-3 py-2 text-center text-sm font-medium text-zinc-100 hover:bg-zinc-700"
      >
        {hasCharacter ? "Trocar personagem" : "Selecionar personagem"}
      </Link>

      <section className="flex flex-col gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          No lobby ({players.length})
        </h2>
        {players.length === 0 ? (
          <p className="rounded-md border border-zinc-800 bg-zinc-900 p-3 text-xs text-zinc-500">
            Você é o primeiro a chegar.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {players.map((p) => {
              const initial = p.display_name.charAt(0).toUpperCase();
              return (
                <li
                  key={p.player_id}
                  className="flex items-center gap-3 rounded-md border border-zinc-800 bg-zinc-900 p-2"
                >
                  {p.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.avatar_url}
                      alt={p.display_name}
                      className="h-8 w-8 rounded-full border border-zinc-700 object-cover"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 text-xs font-medium text-zinc-200">
                      {initial}
                    </div>
                  )}
                  <span className="flex-1 text-sm text-zinc-200">{p.display_name}</span>
                  <span className="text-[10px] uppercase tracking-wide text-zinc-500">
                    {p.status === "joined" ? "Pronto" : "Convidado"}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
