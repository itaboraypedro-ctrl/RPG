import { notFound, redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase-server";
import type { Character, Session, SessionEvent } from "@/lib/types";
import { PlayerSummary } from "@/components/player/PlayerSummary";
import { ResumoDaSessao } from "@/components/mesa/ResumoDaSessao";
import { montarResumo } from "@/lib/resumo-sessao";
import { sessoesDaMesa } from "@/lib/sessoes-de-jogo";
import { createAdminClient } from "@/lib/supabase-admin";

export default async function SummaryPage({
  params,
  searchParams,
}: {
  params: Promise<{ session_id: string }>;
  searchParams: Promise<{ sessao?: string }>;
}) {
  const { session_id: sessionId } = await params;
  const { sessao } = await searchParams;
  const profile = await getProfile();
  if (!profile) redirect(`/login?redirect=/play/${sessionId}/summary`);

  const supabase = await createClient();

  const { data: session } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", sessionId)
    .maybeSingle<Session>();
  if (!session) notFound();

  // Sacramento: resumo de fim de sessão (campanha segue) ou de campanha.
  if (session.ruleset === "sacramento") {
    const { data: membro } = await supabase
      .from("session_players")
      .select("status")
      .eq("session_id", sessionId)
      .eq("player_id", profile.user.id)
      .maybeSingle<{ status: string }>();
    if (!membro && session.gm_id !== profile.user.id) redirect(`/play/${sessionId}`);

    const encerradas = sessoesDaMesa(session.settings).filter((s) => s.fim);
    const pedido = sessao ? Number(sessao) : null;
    const numero =
      session.status === "finished" && pedido == null
        ? null
        : (pedido ?? encerradas[encerradas.length - 1]?.numero);
    if (numero === undefined || (numero != null && !encerradas.some((s) => s.numero === numero))) {
      redirect(`/play/${sessionId}`);
    }

    const resumo = await montarResumo(createAdminClient(), session, numero);
    if (!resumo) redirect(`/play/${sessionId}`);
    const meu = resumo.personagens.find((r) => r.character.owner_id === profile.user.id);
    const emAndamento = session.status === "active" || session.status === "paused";
    return (
      <ResumoDaSessao
        sessionId={sessionId}
        titulo={session.title}
        resumo={resumo}
        destaqueId={meu?.character.id}
        voltar={
          session.status === "finished"
            ? { href: "/hub", rotulo: "Voltar ao Hub" }
            : { href: `/play/${sessionId}`, rotulo: emAndamento ? "Voltar à mesa" : "Ver minha ficha" }
        }
        aguardarProxima={session.status === "lobby"}
      />
    );
  }

  if (session.status !== "finished") {
    redirect(`/play/${sessionId}`);
  }

  const { data: character } = await supabase
    .from("characters")
    .select("*")
    .eq("owner_id", profile.user.id)
    .eq("session_id", sessionId)
    .maybeSingle<Character>();

  const { data: events } = await supabase
    .from("session_events")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true })
    .returns<SessionEvent[]>();

  const evList = events ?? [];

  const startEvent = evList.find((e) => e.type === "session_start");
  const endEvent = [...evList].reverse().find((e) => e.type === "session_end");
  const durationMs =
    startEvent && endEvent
      ? new Date(endEvent.created_at).getTime() -
        new Date(startEvent.created_at).getTime()
      : 0;

  let damageTaken = 0;
  let xpGained = 0;
  let itemsReceived = 0;

  if (character) {
    for (const e of evList) {
      const p = e.payload as Record<string, unknown>;
      if (e.type === "combat_damage" && p.target_id === character.id) {
        const delta = Number(p.delta ?? 0);
        damageTaken += Math.abs(delta);
      }
      if (e.type === "xp_gained" && p.target_id === character.id) {
        xpGained += Number(p.amount ?? 0);
      }
      if (e.type === "item_given" && p.target_id === character.id) {
        itemsReceived += 1;
      }
    }
  }

  return (
    <PlayerSummary
      sessionTitle={session.title}
      characterName={character?.name ?? null}
      durationMs={durationMs}
      damageTaken={damageTaken}
      xpGained={xpGained}
      itemsReceived={itemsReceived}
    />
  );
}
