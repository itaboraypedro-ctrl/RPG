import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase-server";
import type {
  Character,
  Notification,
  Session,
  SessionEvent,
  SessionMediaState,
  SessionPlayerStatus,
  StoryTemplate,
} from "@/lib/types";
import { PlayerView } from "@/components/player/PlayerView";

export default async function PlaySessionPage({
  params,
}: {
  params: Promise<{ session_id: string }>;
}) {
  const { session_id: sessionId } = await params;
  const profile = await getProfile();
  if (!profile) redirect(`/login?redirect=/play/${sessionId}`);

  const supabase = await createClient();

  const { data: session } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", sessionId)
    .maybeSingle<Session>();
  if (!session) notFound();

  const { data: membership } = await supabase
    .from("session_players")
    .select("status")
    .eq("session_id", sessionId)
    .eq("player_id", profile.user.id)
    .maybeSingle<{ status: SessionPlayerStatus }>();

  if (
    !membership ||
    (membership.status !== "invited" && membership.status !== "joined")
  ) {
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-[390px] flex-col items-center justify-center gap-4 bg-zinc-950 px-4 text-center text-zinc-100">
        <span className="text-4xl">🚪</span>
        <h1 className="text-lg font-bold">Você não está nesta sessão</h1>
        <p className="text-sm text-zinc-400">
          Use o link de convite do Mestre para entrar.
        </p>
        <Link
          href="/"
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
        >
          Voltar
        </Link>
      </div>
    );
  }

  if (session.status === "finished") {
    redirect(`/play/${sessionId}/summary`);
  }

  const { data: character } = await supabase
    .from("characters")
    .select("*")
    .eq("owner_id", profile.user.id)
    .eq("session_id", sessionId)
    .maybeSingle<Character>();

  if (!character) {
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-[390px] flex-col items-center justify-center gap-4 bg-zinc-950 px-6 text-center text-zinc-100">
        <span className="text-4xl">🧙</span>
        <h1 className="text-lg font-bold">Você ainda não tem personagem</h1>
        <p className="text-sm text-zinc-400">
          Selecione um personagem existente ou crie um novo para entrar em{" "}
          <strong>{session.title}</strong>.
        </p>
        <Link
          href={`/play/characters/select?session=${sessionId}`}
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
        >
          Selecionar personagem
        </Link>
        <Link
          href="/play/characters/new"
          className="text-xs text-emerald-400 hover:text-emerald-300"
        >
          Ou criar um novo personagem
        </Link>
      </div>
    );
  }

  const [
    { data: mediaState },
    { data: notifications },
    { data: sessionPlayersRaw },
    { data: publicEvents },
    template,
  ] = await Promise.all([
    supabase
      .from("session_media_state")
      .select("*")
      .eq("session_id", sessionId)
      .maybeSingle<SessionMediaState>(),
    supabase
      .from("notifications")
      .select("*")
      .eq("session_id", sessionId)
      .or(`target_id.eq.${profile.user.id},target_id.is.null`)
      .order("created_at", { ascending: false })
      .limit(50)
      .returns<Notification[]>(),
    supabase
      .from("session_players")
      .select(
        "player_id, status, profile:profiles!session_players_player_id_fkey(display_name, avatar_url)"
      )
      .eq("session_id", sessionId)
      .in("status", ["invited", "joined"])
      .returns<
        {
          player_id: string;
          status: string;
          profile: { display_name: string; avatar_url: string | null } | null;
        }[]
      >(),
    supabase
      .from("session_events")
      .select("*")
      .eq("session_id", sessionId)
      .eq("is_public", true)
      .order("created_at", { ascending: false })
      .limit(20)
      .returns<SessionEvent[]>(),
    session.template_id
      ? supabase
          .from("story_templates")
          .select("*")
          .eq("id", session.template_id)
          .maybeSingle<StoryTemplate>()
          .then((r) => r.data)
      : Promise.resolve(null),
  ]);

  const players = (sessionPlayersRaw ?? []).map((p) => ({
    player_id: p.player_id,
    status: p.status,
    display_name: p.profile?.display_name ?? "Jogador",
    avatar_url: p.profile?.avatar_url ?? null,
  }));

  const initialMediaState: SessionMediaState = mediaState ?? {
    id: "",
    session_id: sessionId,
    current_audio: null,
    current_image: null,
    ambient_active: false,
    updated_at: new Date().toISOString(),
  };

  return (
    <PlayerView
      userId={profile.user.id}
      initialSession={session}
      initialCharacter={character}
      initialMediaState={initialMediaState}
      initialNotifications={notifications ?? []}
      initialPlayers={players}
      initialPublicEvents={publicEvents ?? []}
      templateContent={template?.content ?? null}
    />
  );
}
