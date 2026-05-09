import { notFound, redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase-server";
import type { Character, Session, SessionEvent } from "@/lib/types";
import { PlayerSummary } from "@/components/player/PlayerSummary";

export default async function SummaryPage({
  params,
}: {
  params: Promise<{ session_id: string }>;
}) {
  const { session_id: sessionId } = await params;
  const profile = await getProfile();
  if (!profile) redirect(`/login?redirect=/play/${sessionId}/summary`);

  const supabase = await createClient();

  const { data: session } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", sessionId)
    .maybeSingle<Session>();
  if (!session) notFound();

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
