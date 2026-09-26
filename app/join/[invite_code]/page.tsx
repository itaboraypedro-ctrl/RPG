import Link from "next/link";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase-admin";
import { getProfile } from "@/lib/auth";
import { claimEmailInvites } from "@/lib/campaign-invites";

type JoinError = "invalid" | "finished" | "not-invited" | "error";

function ErrorCard({ kind }: { kind: JoinError }) {
  const message =
    kind === "invalid"
      ? "Convite inválido ou expirado."
      : kind === "finished"
        ? "Esta partida já encerrou."
        : kind === "not-invited"
          ? "Seu e-mail não está na lista de convidados desta campanha. Peça ao Juiz para convidar o e-mail desta conta."
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
// session pelo invite_code. A entrada é só por convite: o e-mail da conta precisa
// estar na lista do Juiz (campaign_invites → session_players 'invited', migration
// 008) ou o jogador já precisa estar na mesa. O link sozinho não abre a porta.
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
  const userId = profileResult.user.id;

  const admin = createAdminClient();

  const { data: session } = await admin
    .from("sessions")
    .select("id, status, gm_id, ruleset")
    .eq("invite_code", invite_code)
    .maybeSingle<{ id: string; status: string; gm_id: string; ruleset: string }>();

  if (!session) return <ErrorCard kind="invalid" />;
  if (session.status === "finished") return <ErrorCard kind="finished" />;

  // O Juiz da campanha não entra como jogador — vai direto para o hub da história.
  if (session.gm_id === userId) {
    redirect(`/campaigns/${session.id}/story`);
  }

  await claimEmailInvites(userId, profileResult.user.email);

  const { data: existing } = await admin
    .from("session_players")
    .select("status")
    .eq("session_id", session.id)
    .eq("player_id", userId)
    .maybeSingle<{ status: string }>();

  if (existing?.status === "kicked") return <ErrorCard kind="invalid" />;
  if (!existing || existing.status === "left") return <ErrorCard kind="not-invited" />;

  if (existing.status === "invited") {
    const { error } = await admin
      .from("session_players")
      .update({ status: "joined", joined_at: new Date().toISOString() })
      .eq("session_id", session.id)
      .eq("player_id", userId);
    if (error) return <ErrorCard kind="error" />;
  }

  // Sem personagem nesta campanha → criador do modelo dela (hoje, Sacramento).
  const { data: personagem } = await admin
    .from("characters")
    .select("id")
    .eq("owner_id", userId)
    .eq("session_id", session.id)
    .limit(1);
  if ((!personagem || personagem.length === 0) && session.ruleset === "sacramento") {
    redirect(`/play/characters/new?mesa=${session.id}`);
  }

  redirect(`/play/${session.id}`);
}
