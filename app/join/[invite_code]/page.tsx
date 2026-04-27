import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { getProfile } from "@/lib/auth";

type JoinError = "invalid" | "finished";

function ErrorCard({ kind }: { kind: JoinError }) {
  const message =
    kind === "invalid"
      ? "Convite inválido ou expirado."
      : "Esta partida já encerrou.";

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[390px] flex-col items-center justify-center gap-4 bg-zinc-950 px-6 text-center text-zinc-100">
      <h1 className="text-xl font-bold">Não foi possível entrar</h1>
      <p className="text-sm text-zinc-400">{message}</p>
      <Link
        href="/play"
        className="mt-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
      >
        Voltar
      </Link>
    </div>
  );
}

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

  const supabase = await createClient();

  const { data: session } = await supabase
    .from("sessions")
    .select("id, status")
    .eq("invite_code", invite_code)
    .maybeSingle<{ id: string; status: string }>();

  if (!session) return <ErrorCard kind="invalid" />;
  if (session.status === "finished") return <ErrorCard kind="finished" />;

  const { data: existing } = await supabase
    .from("session_players")
    .select("status")
    .eq("session_id", session.id)
    .eq("player_id", profileResult.user.id)
    .maybeSingle<{ status: string }>();

  if (!existing || existing.status === "left" || existing.status === "kicked") {
    await supabase.from("session_players").upsert(
      {
        session_id: session.id,
        player_id: profileResult.user.id,
        status: "invited",
      },
      { onConflict: "session_id,player_id" }
    );
  }

  redirect(`/play/${session.id}`);
}
