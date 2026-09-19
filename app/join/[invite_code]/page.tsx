import Link from "next/link";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase-admin";
import { getProfile } from "@/lib/auth";
import type { SessionSettings } from "@/lib/types";

type JoinError = "invalid" | "finished" | "full" | "error";

function ErrorCard({ kind }: { kind: JoinError }) {
  const message =
    kind === "invalid"
      ? "Convite inválido ou expirado."
      : kind === "finished"
        ? "Esta partida já encerrou."
        : kind === "full"
          ? "A mesa está cheia — o limite de jogadores desta campanha foi atingido."
          : "Erro ao entrar na campanha. Tente novamente.";

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[390px] flex-col items-center justify-center gap-4 bg-zinc-950 px-6 text-center text-zinc-100">
      <h1 className="text-xl font-bold">Não foi possível entrar</h1>
      <p className="text-sm text-zinc-400">{message}</p>
      <Link
        href="/hub"
        className="mt-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
      >
        Voltar
      </Link>
    </div>
  );
}

// Usa o admin client: sob RLS, quem ainda não é membro não consegue sequer ler a
// session pelo invite_code (sessions_select_member exige status joined), e o
// upsert antigo em session_players falhava em silêncio. O convite é validado
// aqui no servidor: código válido + partida não encerrada + vaga na mesa.
export default async function JoinPage({
  params,
}: {
  params: Promise<{ invite_code: string }>;
}) {
  const { invite_code } = await params;

  const profileResult = await getProfile();
  if (!profileResult) {
    redirect(`/login?redirect=/join/${invite_code}`);
  }

  const admin = createAdminClient();

  const { data: session } = await admin
    .from("sessions")
    .select("id, status, gm_id, settings")
    .eq("invite_code", invite_code)
    .maybeSingle<{ id: string; status: string; gm_id: string; settings: SessionSettings }>();

  if (!session) return <ErrorCard kind="invalid" />;
  if (session.status === "finished") return <ErrorCard kind="finished" />;

  // O Juiz da campanha não entra como jogador — vai direto para o lobby.
  if (session.gm_id === profileResult.user.id) {
    redirect(`/dashboard/sessions/${session.id}`);
  }

  const { data: existing } = await admin
    .from("session_players")
    .select("status")
    .eq("session_id", session.id)
    .eq("player_id", profileResult.user.id)
    .maybeSingle<{ status: string }>();

  if (existing?.status === "kicked") return <ErrorCard kind="invalid" />;

  if (!existing || existing.status === "left") {
    // Respeita o limite da mesa (invited + joined contam vaga).
    const maxPlayers = session.settings?.max_players;
    if (typeof maxPlayers === "number" && maxPlayers > 0) {
      const { count } = await admin
        .from("session_players")
        .select("id", { count: "exact", head: true })
        .eq("session_id", session.id)
        .in("status", ["invited", "joined"]);
      if ((count ?? 0) >= maxPlayers) return <ErrorCard kind="full" />;
    }

    const { error } = await admin.from("session_players").upsert(
      {
        session_id: session.id,
        player_id: profileResult.user.id,
        status: "joined",
        joined_at: new Date().toISOString(),
      },
      { onConflict: "session_id,player_id" },
    );
    if (error) return <ErrorCard kind="error" />;
  }

  redirect(`/play/${session.id}`);
}
