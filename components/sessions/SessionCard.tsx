import Link from "next/link";
import type { Session, SessionPlayerStatus, SessionStatus } from "@/lib/types";

export type SessionWithMeta = Session & {
  template: { title: string } | null;
  session_players: { player_id: string; status: SessionPlayerStatus }[];
};

const STATUS_LABEL: Record<SessionStatus, string> = {
  lobby: "Lobby",
  active: "Ativa",
  paused: "Pausada",
  finished: "Encerrada",
};

const STATUS_CLASS: Record<SessionStatus, string> = {
  lobby: "bg-zinc-800 text-zinc-300",
  active: "bg-emerald-900/50 text-emerald-400",
  paused: "bg-amber-900/50 text-amber-400",
  finished: "bg-zinc-800 text-zinc-500",
};

export function StatusBadge({ status }: { status: SessionStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${STATUS_CLASS[status]}`}
    >
      {status === "active" && (
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
      )}
      {STATUS_LABEL[status]}
    </span>
  );
}

export function SessionCard({ session }: { session: SessionWithMeta }) {
  const date = new Date(session.created_at).toLocaleDateString("pt-BR");
  const playerCount = session.session_players.filter(
    (p) => p.status === "joined" || p.status === "invited"
  ).length;

  return (
    <Link
      href={`/dashboard/sessions/${session.id}`}
      className="flex flex-col gap-2 rounded-md border border-zinc-800 bg-zinc-900 p-4 transition-colors hover:border-zinc-700"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium leading-tight text-zinc-100">{session.title}</h3>
        <StatusBadge status={session.status} />
      </div>
      <div className="flex items-center gap-2 text-xs text-zinc-500">
        <span>{date}</span>
        <span>·</span>
        <span>
          {playerCount} {playerCount === 1 ? "jogador" : "jogadores"}
        </span>
        {session.template && (
          <>
            <span>·</span>
            <span className="truncate">{session.template.title}</span>
          </>
        )}
      </div>
      {session.description && (
        <p className="line-clamp-2 text-sm text-zinc-400">{session.description}</p>
      )}
    </Link>
  );
}
