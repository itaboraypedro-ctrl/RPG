import Link from "next/link";
import { CharacterCarousel } from "@/components/hub/CharacterCarousel";
import { HubGreeting } from "@/components/hub/HubGreeting";
import { HubNav } from "@/components/hub/HubNav";
import { HubSessionCard } from "@/components/hub/HubSessionCard";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase-server";
import type {
  Character,
  Session,
  SessionPlayer,
  SessionPlayerStatus,
  SessionStatus,
} from "@/lib/types";

type CharacterWithSession = Character & {
  session?: { id: string; status: SessionStatus; title: string } | null;
};

type GmSessionRow = Session & {
  session_players?: { player_id: string; status: SessionPlayerStatus }[];
};

type PlayerInviteRow = {
  status: SessionPlayerStatus;
  session: (Session & {
    gm: { display_name: string } | null;
  }) | null;
};

const ACTIVE_PLAYER_STATUSES: SessionPlayerStatus[] = ["invited", "joined"];

export default async function HubPage() {
  const { user, profile } = await requireRole(["player", "gm", "admin"]);
  const supabase = await createClient();
  const isGm = profile.role === "gm" || profile.role === "admin";

  const [charactersRes, gmSessionsRes, playerInvitesRes] = await Promise.all([
    supabase
      .from("characters")
      .select("*, session:sessions(id, status, title)")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false }),
    isGm
      ? supabase
          .from("sessions")
          .select("*, session_players(player_id, status)")
          .eq("gm_id", user.id)
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [] as GmSessionRow[], error: null }),
    supabase
      .from("session_players")
      .select(
        "status, session:sessions(*, gm:profiles!sessions_gm_id_fkey(display_name))",
      )
      .eq("player_id", user.id)
      .in("status", ACTIVE_PLAYER_STATUSES),
  ]);

  const characters = (charactersRes.data ?? []) as CharacterWithSession[];
  const gmSessions = (gmSessionsRes.data ?? []) as GmSessionRow[];
  const playerInvites = (
    (playerInvitesRes.data ?? []) as unknown as PlayerInviteRow[]
  )
    .filter(
      (row): row is PlayerInviteRow & {
        session: NonNullable<PlayerInviteRow["session"]>;
      } => Boolean(row.session),
    )
    .filter((row) => row.session.gm_id !== user.id);

  const hasActiveGame = characters.some(
    (c) =>
      c.session && (c.session.status === "active" || c.session.status === "paused"),
  );
  const pendingInvitesCount = playerInvites.filter(
    (r) => r.status === "invited",
  ).length;

  return (
    <div className="flex min-h-dvh flex-col bg-arcana-bg text-arcana-text">
      <HubNav profile={profile} />

      <HubGreeting
        profile={profile}
        hasActiveGame={hasActiveGame}
        pendingInvitesCount={pendingInvitesCount}
      />

      <main className="flex flex-1 flex-col gap-12 pb-20 sm:gap-16">
        {/* Personagens */}
        <section>
          <header className="mb-5 flex items-center justify-between px-4 sm:px-8">
            <h2 className="font-cinzel text-sm uppercase tracking-[0.4em] text-arcana-gold">
              Seus personagens
            </h2>
          </header>
          <div className="mx-auto max-w-6xl">
            <CharacterCarousel characters={characters} />
          </div>
        </section>

        {/* GM: Suas Campanhas */}
        {isGm && (
          <section className="mx-auto w-full max-w-6xl px-4 sm:px-8">
            <header className="mb-5 flex items-center justify-between">
              <h2 className="font-cinzel text-sm uppercase tracking-[0.4em] text-arcana-gold">
                Suas Campanhas
              </h2>
              <Link
                href="/dashboard/sessions/new"
                className="border border-arcana-gold/50 px-4 py-2 font-cinzel text-[10px] uppercase tracking-[0.3em] text-arcana-gold transition-all hover:border-arcana-gold hover:bg-arcana-gold hover:text-arcana-bg"
              >
                + Nova campanha
              </Link>
            </header>
            {gmSessions.length === 0 ? (
              <EmptyState
                title="Nenhuma campanha criada ainda."
                cta={
                  <Link
                    href="/dashboard/sessions/new"
                    className="border border-arcana-gold px-6 py-2.5 font-cinzel text-[10px] uppercase tracking-[0.3em] text-arcana-gold transition-all hover:bg-arcana-gold hover:text-arcana-bg"
                  >
                    + Criar campanha
                  </Link>
                }
              />
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
                {gmSessions.map((session) => (
                  <HubSessionCard
                    key={session.id}
                    variant="gm"
                    session={session}
                    playerCount={
                      session.session_players?.filter(
                        (p) => p.status === "joined",
                      ).length ?? 0
                    }
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Jogador: Convites e Partidas */}
        <section className="mx-auto w-full max-w-6xl px-4 sm:px-8">
          <header className="mb-5">
            <h2 className="font-cinzel text-sm uppercase tracking-[0.4em] text-arcana-gold">
              Convites e Partidas
            </h2>
          </header>
          {playerInvites.length === 0 ? (
            <EmptyState
              title="Nenhum convite pendente."
              description={
                isGm
                  ? "Quando outros mestres te convidarem para jogar, os convites aparecem aqui."
                  : "Peça um link de convite ao seu Mestre."
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
              {playerInvites.map((row) => (
                <HubSessionCard
                  key={row.session.id}
                  variant="player"
                  session={row.session}
                  gmName={row.session.gm?.display_name ?? "Desconhecido"}
                  inviteStatus={row.status}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function EmptyState({
  title,
  description,
  cta,
}: {
  title: string;
  description?: string;
  cta?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-4 border border-dashed border-arcana-border bg-arcana-surface/40 px-6 py-12 text-center">
      <p className="font-cinzel text-sm uppercase tracking-[0.25em] text-arcana-text-dim">
        {title}
      </p>
      {description && (
        <p className="max-w-sm font-crimson text-sm text-arcana-text-dim">
          {description}
        </p>
      )}
      {cta}
    </div>
  );
}
