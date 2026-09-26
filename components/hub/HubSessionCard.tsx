import Link from "next/link";
import type { Session, SessionPlayerStatus, SessionStatus } from "@/lib/types";

type GmVariant = {
  variant: "gm";
  session: Session;
  playerCount: number;
  /** Personagens prontos na mesa (história e ficha salvas). */
  readyCount?: number;
  compact?: boolean;
};

type PlayerVariant = {
  variant: "player";
  session: Session;
  gmName: string;
  inviteStatus: SessionPlayerStatus;
  compact?: boolean;
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
  const compact = props.compact ?? false;
  const status = session.status;
  const isActive = status === "active";
  const isFinished = status === "finished";

  // Sacramento: o Juiz cai no Hub de História (bando, dossiês e IA).
  const ctaHref =
    props.variant === "gm"
      ? session.ruleset === "sacramento"
        ? `/campaigns/${session.id}/story`
        : `/dashboard/sessions/${session.id}`
      : `/join/${session.invite_code}`;
  const ctaLabel = props.variant === "gm" ? "Abrir" : "Entrar";

  if (compact) {
    return (
      <Link
        href={ctaHref}
        className={`flex items-center gap-3 border px-3 py-3.5 transition-all hover:border-arcana-gold/40 ${STATUS_BORDER[status]} ${isActive ? "ring-1 ring-emerald-500/20" : ""}`}
        style={{ background: "rgba(15,15,28,0.6)" }}
      >
        <span
          className={`shrink-0 h-1.5 w-1.5 rounded-full ${STATUS_DOT[status]} ${isActive ? "animate-pulse" : ""}`}
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate font-cinzel text-[11px] tracking-[0.12em] text-arcana-text">{session.title}</p>
          <p className="font-crimson text-[10px] text-arcana-text-dim/60">
            {props.variant === "player"
              ? `Mestre: ${props.gmName}`
              : `${props.readyCount ?? 0}/${props.playerCount} pronto${props.playerCount === 1 ? "" : "s"}`}
            {" · "}{formatDate(session.created_at)}
          </p>
        </div>
        <span className={`shrink-0 font-cinzel text-[9px] uppercase tracking-[0.2em] ${isFinished ? "text-arcana-text-dim/50" : "text-arcana-gold"}`}>
          {ctaLabel} →
        </span>
      </Link>
    );
  }

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
