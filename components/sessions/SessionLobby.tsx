"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import type {
  Session,
  SessionPlayer,
  SessionPlayerStatus,
  SessionSettings,
  SessionStatus,
} from "@/lib/types";
import { kickPlayer, updateStatus } from "@/app/dashboard/sessions/[id]/actions";
import { InviteLink } from "./InviteLink";
import { StatusBadge } from "./SessionCard";

export type LobbyPlayer = SessionPlayer & {
  profile: { display_name: string; avatar_url: string | null } | null;
};

const PLAYER_STATUS_LABEL: Record<SessionPlayerStatus, string> = {
  invited: "Convidado",
  joined: "No lobby",
  left: "Saiu",
  kicked: "Removido",
};

type Props = {
  session: Session;
  initialPlayers: LobbyPlayer[];
  template: { id: string; title: string } | null;
};

export function SessionLobby({ session, initialPlayers, template }: Props) {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [players, setPlayers] = useState<LobbyPlayer[]>(initialPlayers);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const refetchPlayers = useCallback(async () => {
    const { data } = await supabase
      .from("session_players")
      .select("*, profile:profiles!session_players_player_id_fkey(display_name, avatar_url)")
      .eq("session_id", session.id)
      .returns<LobbyPlayer[]>();
    if (data) setPlayers(data);
  }, [supabase, session.id]);

  useEffect(() => {
    const channel = supabase
      .channel(`session-lobby-${session.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "session_players",
          filter: `session_id=eq.${session.id}`,
        },
        () => {
          refetchPlayers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, session.id, refetchPlayers]);

  const visiblePlayers = players.filter(
    (p) => p.status === "joined" || p.status === "invited"
  );

  function changeStatus(next: SessionStatus, options?: { confirm?: string; navigateToPlay?: boolean }) {
    if (options?.confirm && !confirm(options.confirm)) return;
    setError(null);
    startTransition(async () => {
      const result = await updateStatus(session.id, next);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (options?.navigateToPlay) {
        router.push(`/dashboard/sessions/${session.id}/play`);
      }
      router.refresh();
    });
  }

  function onStart() {
    if (visiblePlayers.length === 0) {
      if (!confirm("Sem jogadores no lobby. Iniciar mesmo assim?")) return;
    }
    changeStatus("active", { navigateToPlay: true });
  }

  function onKick(playerId: string) {
    if (!confirm("Remover este jogador da sessão?")) return;
    setError(null);
    startTransition(async () => {
      const result = await kickPlayer(session.id, playerId);
      if (result.error) {
        setError(result.error);
        return;
      }
      await refetchPlayers();
      router.refresh();
    });
  }

  const settings = (session.settings ?? {}) as SessionSettings;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <Link
          href="/dashboard/sessions"
          className="text-xs text-zinc-500 hover:text-zinc-300"
        >
          ← Voltar
        </Link>
        <div className="flex items-start justify-between gap-2">
          <h1 className="text-xl font-bold tracking-tight">{session.title}</h1>
          <StatusBadge status={session.status} />
        </div>
        {session.description && (
          <p className="text-sm text-zinc-400">{session.description}</p>
        )}
      </header>

      <StatusControls
        status={session.status}
        pending={pending}
        onStart={onStart}
        onPause={() => changeStatus("paused")}
        onResume={() => changeStatus("active", { navigateToPlay: true })}
        onFinish={() =>
          changeStatus("finished", {
            confirm: "Encerrar a sessão? Esta ação não pode ser desfeita.",
          })
        }
        onCancel={() =>
          changeStatus("finished", {
            confirm: "Cancelar a sessão? Esta ação não pode ser desfeita.",
          })
        }
      />

      {error && <p className="text-sm text-red-400">{error}</p>}

      <InviteLink inviteCode={session.invite_code} />

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
          Jogadores ({visiblePlayers.length})
        </h2>
        {visiblePlayers.length === 0 ? (
          <p className="rounded-md border border-zinc-800 bg-zinc-900 p-3 text-sm text-zinc-500">
            Nenhum jogador no lobby ainda. Compartilhe o link de convite acima.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {visiblePlayers.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between gap-2 rounded-md border border-zinc-800 bg-zinc-900 p-3"
              >
                <div className="flex flex-col">
                  <span className="text-sm text-zinc-100">
                    {p.profile?.display_name ?? "Jogador"}
                  </span>
                  <span className="text-xs text-zinc-500">
                    {PLAYER_STATUS_LABEL[p.status]}
                  </span>
                </div>
                {session.status === "lobby" && (
                  <button
                    type="button"
                    onClick={() => onKick(p.player_id)}
                    disabled={pending}
                    className="rounded-md border border-red-900/50 bg-red-950/30 px-3 py-1 text-xs font-medium text-red-300 hover:bg-red-950/50 disabled:opacity-50"
                  >
                    Remover
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-2">
        <header className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
            Configurações
          </h2>
          {session.status === "lobby" && (
            <Link
              href={`/dashboard/sessions/${session.id}/edit`}
              className="text-xs text-emerald-400 hover:text-emerald-300"
            >
              Editar
            </Link>
          )}
        </header>
        <dl className="flex flex-col gap-1 rounded-md border border-zinc-800 bg-zinc-900 p-3 text-sm">
          {template && (
            <Row label="Template" value={template.title} />
          )}
          <Row label="Máximo de jogadores" value={String(settings.max_players ?? 6)} />
          <Row
            label="Criar personagem na hora"
            value={settings.allow_new_chars ? "Sim" : "Não"}
          />
          <Row label="Sistema de XP" value={settings.xp_enabled ? "Sim" : "Não"} />
          <Row label="Death saves" value={settings.death_saves ? "Sim" : "Não"} />
          <Row label="Assistente de IA" value={settings.ai_assistant ? "Sim" : "Não"} />
        </dl>
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2 text-zinc-300">
      <dt className="text-zinc-500">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

type ControlsProps = {
  status: SessionStatus;
  pending: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onFinish: () => void;
  onCancel: () => void;
};

function StatusControls({
  status,
  pending,
  onStart,
  onPause,
  onResume,
  onFinish,
  onCancel,
}: ControlsProps) {
  if (status === "finished") return null;

  return (
    <div className="flex flex-col gap-2">
      {status === "lobby" && (
        <>
          <button
            type="button"
            onClick={onStart}
            disabled={pending}
            className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            {pending ? "Iniciando..." : "Iniciar partida"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="rounded-md border border-red-900/50 bg-red-950/30 px-3 py-2 text-sm font-medium text-red-300 hover:bg-red-950/50 disabled:opacity-50"
          >
            Cancelar sessão
          </button>
        </>
      )}
      {status === "active" && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onPause}
            disabled={pending}
            className="flex-1 rounded-md bg-amber-600 px-3 py-2 text-sm font-medium text-white hover:bg-amber-500 disabled:opacity-50"
          >
            Pausar
          </button>
          <button
            type="button"
            onClick={onFinish}
            disabled={pending}
            className="flex-1 rounded-md border border-red-900/50 bg-red-950/30 px-3 py-2 text-sm font-medium text-red-300 hover:bg-red-950/50 disabled:opacity-50"
          >
            Encerrar
          </button>
        </div>
      )}
      {status === "paused" && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onResume}
            disabled={pending}
            className="flex-1 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            Retomar
          </button>
          <button
            type="button"
            onClick={onFinish}
            disabled={pending}
            className="flex-1 rounded-md border border-red-900/50 bg-red-950/30 px-3 py-2 text-sm font-medium text-red-300 hover:bg-red-950/50 disabled:opacity-50"
          >
            Encerrar
          </button>
        </div>
      )}
    </div>
  );
}
