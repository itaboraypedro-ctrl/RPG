import Link from "next/link";
import type { Session, SessionPlayerStatus, SessionStatus } from "@/lib/types";

type GmVariant = {
  variant: "gm";
  session: Session;
  playerCount: number;
};

type PlayerVariant = {
  variant: "player";
  session: Session;
  gmName: string;
  inviteStatus: SessionPlayerStatus;
};

type Props = GmVariant | PlayerVariant;

const STATUS_LABEL: Record<SessionStatus, string> = {
  lobby: "Aguardando",
  active: "Ao vivo agora",
  paused: "Pausada",
  finished: "Encerrada",
};

const STATUS_DOT: Record<SessionStatus, string> = {
  lobby: "bg-amber-400",
  active: "bg-emerald-400",
  paused: "bg-zinc-400",
  finished: "bg-zinc-600",
};

const STATUS_BORDER: Record<SessionStatus, string> = {
  lobby: "border-amber-500/30",
  active: "border-emerald-500/40",
  paused: "border-arcana-border",
  finished: "border-arcana-border opacity-70",
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
    });
  } catch {
    return "";
  }
}

export function HubSessionCard(props: Props) {
  const { session } = props;
  const status = session.status;
  const isActive = status === "active";
  const isFinished = status === "finished";

  const ctaHref =
    props.variant === "gm"
      ? `/dashboard/sessions/${session.id}`
      : `/play/${session.id}`;
  const ctaLabel = props.variant === "gm" ? "Abrir" : "Entrar";

  return (
    <article
      className={`flex flex-col gap-4 border bg-arcana-surface p-5 transition-colors hover:border-arcana-gold/40 sm:p-6 ${STATUS_BORDER[status]} ${isActive ? "ring-1 ring-emerald-500/30" : ""}`}
    >
      <div className="flex items-center gap-2 font-cinzel text-[10px] uppercase tracking-[0.3em] text-arcana-text-dim">
        <span
          className={`inline-block h-2 w-2 rounded-full ${STATUS_DOT[status]} ${isActive ? "animate-pulse" : ""}`}
          aria-hidden="true"
        />
        {STATUS_LABEL[status]}
      </div>

      <div>
        <h3 className="font-cinzel text-lg tracking-[0.15em] text-arcana-text">
          {session.title}
        </h3>
        {session.description && (
          <p className="mt-2 line-clamp-2 font-crimson text-sm text-arcana-text-dim">
            {session.description}
          </p>
        )}
      </div>

      <dl className="flex flex-wrap gap-x-4 gap-y-1 font-crimson text-sm text-arcana-text-dim">
        {props.variant === "player" && (
          <div>
            <dt className="sr-only">Mestre</dt>
            <dd>
              <span className="text-arcana-text-dim">Mestre: </span>
              <span className="text-arcana-text">{props.gmName}</span>
            </dd>
          </div>
        )}
        {props.variant === "gm" && (
          <div>
            <dt className="sr-only">Jogadores</dt>
            <dd>
              {props.playerCount} jogador{props.playerCount === 1 ? "" : "es"}
            </dd>
          </div>
        )}
        <div>
          <dt className="sr-only">Data</dt>
          <dd>{formatDate(session.created_at)}</dd>
        </div>
      </dl>

      <Link
        href={ctaHref}
        className={`mt-2 self-start border px-6 py-2 font-cinzel text-[10px] uppercase tracking-[0.3em] transition-all ${
          isFinished
            ? "border-arcana-border text-arcana-text-dim hover:border-arcana-text-dim hover:text-arcana-text"
            : "border-arcana-gold text-arcana-gold hover:bg-arcana-gold hover:text-arcana-bg"
        }`}
      >
        {ctaLabel}
      </Link>
    </article>
  );
}
