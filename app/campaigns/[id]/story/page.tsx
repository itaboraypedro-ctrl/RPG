import { notFound, redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { StoryHub } from "@/components/campaign-story/StoryHub";
import type { CampaignElement, PartyCharacter, PartyMember, Session } from "@/lib/types";

/**
 * Bando = convites por e-mail + jogadores na mesa + personagens vinculados.
 * Jogadores que entraram pelo link antigo (sem convite) também aparecem.
 */
async function loadParty(
  supabase: Awaited<ReturnType<typeof createClient>>,
  sessionId: string,
  gmId: string,
): Promise<{ party: PartyMember[]; invitesReady: boolean }> {
  const admin = createAdminClient();
  const [invitesRes, playersRes, charsRes] = await Promise.all([
    supabase
      .from("campaign_invites")
      .select("id, email, player_id, created_at")
      .eq("session_id", sessionId)
      .order("created_at"),
    // Admin: profiles só são legíveis pelo próprio dono sob RLS.
    admin
      .from("session_players")
      .select("player_id, status, profile:profiles!session_players_player_id_fkey(display_name)")
      .eq("session_id", sessionId)
      .in("status", ["invited", "joined"]),
    supabase
      .from("characters")
      .select("*")
      .eq("session_id", sessionId)
      .neq("owner_id", gmId)
      .order("created_at"),
  ]);

  const invites = (invitesRes.data ?? []) as { id: string; email: string; player_id: string | null }[];
  const players = (playersRes.data ?? []) as unknown as {
    player_id: string;
    status: string;
    profile: { display_name: string } | null;
  }[];
  const chars = (charsRes.data ?? []) as PartyCharacter[];

  const charsOf = (playerId: string | null) =>
    playerId ? chars.filter((c) => c.owner_id === playerId) : [];
  const nameOf = (playerId: string | null) =>
    players.find((p) => p.player_id === playerId)?.profile?.display_name ?? null;
  const statusOf = (playerId: string | null): PartyMember["status"] =>
    !playerId ? "aguardando-conta" : charsOf(playerId).length > 0 ? "pronto" : "criando";

  const party: PartyMember[] = invites.map((inv) => ({
    key: inv.id,
    inviteId: inv.id,
    email: inv.email,
    playerId: inv.player_id,
    displayName: nameOf(inv.player_id),
    status: statusOf(inv.player_id),
    characters: charsOf(inv.player_id),
  }));
  const comConvite = new Set(invites.map((i) => i.player_id).filter(Boolean));
  for (const p of players) {
    if (comConvite.has(p.player_id)) continue;
    party.push({
      key: p.player_id,
      inviteId: null,
      email: null,
      playerId: p.player_id,
      displayName: p.profile?.display_name ?? null,
      status: statusOf(p.player_id),
      characters: charsOf(p.player_id),
    });
  }
  return { party, invitesReady: !invitesRes.error };
}

export const metadata = { title: "Hub de História — ARCANA" };

export default async function CampaignStoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const { id } = await params;
  const { created } = await searchParams;

  const auth = await getProfile();
  if (!auth) redirect(`/login?redirect=/campaigns/${id}/story`);

  const supabase = await createClient();
  const { data: session } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!session) notFound();
  const typed = session as Session;
  if (typed.gm_id !== auth.user.id) redirect("/unauthorized");

  const { data: elements } = await supabase
    .from("campaign_elements")
    .select("*")
    .eq("session_id", id)
    .order("kind")
    .order("position")
    .order("created_at");

  const { party, invitesReady } = await loadParty(supabase, id, auth.user.id);

  return (
    <StoryHub
      session={typed}
      initialElements={(elements ?? []) as CampaignElement[]}
      justCreated={created === "1"}
      party={party}
      invitesReady={invitesReady}
    />
  );
}
