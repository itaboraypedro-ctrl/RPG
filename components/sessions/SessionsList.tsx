"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { SessionStatus } from "@/lib/types";
import { SessionCard, type SessionWithMeta } from "./SessionCard";

const STATUSES: { value: SessionStatus | "all"; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "lobby", label: "Lobby" },
  { value: "active", label: "Ativa" },
  { value: "paused", label: "Pausada" },
  { value: "finished", label: "Encerrada" },
];

export function SessionsList({ sessions }: { sessions: SessionWithMeta[] }) {
  const [filter, setFilter] = useState<SessionStatus | "all">("all");

  const filtered = useMemo(
    () => (filter === "all" ? sessions : sessions.filter((s) => s.status === filter)),
    [sessions, filter]
  );

  if (sessions.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
        <span className="text-4xl">🎲</span>
        <p className="text-zinc-400">
          Nenhuma sessão ainda. Crie sua primeira partida.
        </p>
        <Link
          href="/dashboard/sessions/new"
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
        >
          Nova sessão
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <select
        value={filter}
        onChange={(e) => setFilter(e.target.value as SessionStatus | "all")}
        className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
      >
        {STATUSES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-zinc-500">
          Nenhuma sessão com este status.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((s) => (
            <SessionCard key={s.id} session={s} />
          ))}
        </div>
      )}
    </div>
  );
}
