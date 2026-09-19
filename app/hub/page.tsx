import { HubScene } from "@/components/hub/HubScene";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase-server";
import type {
  Character,
  Session,
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
      c.session &&
      (c.session.status === "active" || c.session.status === "paused"),
  );
  const pendingInvitesCount = playerInvites.filter(
    (r) => r.status === "invited",
  ).length;

  return (
    <HubScene
      profile={profile}
      isGm={isGm}
      hasActiveGame={hasActiveGame}
      pendingInvitesCount={pendingInvitesCount}
      characters={characters}
      gmSessions={gmSessions}
      playerInvites={playerInvites}
    />
  );
}
