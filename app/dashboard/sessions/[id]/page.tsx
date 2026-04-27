import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import type { Session } from "@/lib/types";
import {
  SessionLobby,
  type LobbyPlayer,
} from "@/components/sessions/SessionLobby";

type SessionWithTemplate = Session & {
  template: { id: string; title: string } | null;
};

export default async function SessionLobbyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: session } = await supabase
    .from("sessions")
    .select("*, template:story_templates(id, title)")
    .eq("id", id)
    .maybeSingle<SessionWithTemplate>();

  if (!session) notFound();

  const { data: players } = await supabase
    .from("session_players")
    .select(
      "*, profile:profiles!session_players_player_id_fkey(display_name, avatar_url)"
    )
    .eq("session_id", id)
    .returns<LobbyPlayer[]>();

  const { template, ...sessionWithoutTemplate } = session;

  return (
    <div className="flex flex-1 flex-col px-4 py-6">
      <SessionLobby
        session={sessionWithoutTemplate}
        initialPlayers={players ?? []}
        template={template}
      />
    </div>
  );
}
