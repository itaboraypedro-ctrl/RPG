"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase-server";
import { numeroSessao, sessaoAberta, sessoesDaMesa } from "@/lib/sessoes-de-jogo";
import type { SessionEventType, SessionStatus } from "@/lib/types";

const STATUS_TO_EVENT: Record<SessionStatus, SessionEventType | null> = {
  lobby: null,
  active: "session_start",
  paused: "session_pause",
  finished: "session_end",
};

export async function updateStatus(
  sessionId: string,
  next: SessionStatus
): Promise<{ ok?: true; error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada." };

  const { data: current, error: fetchError } = await supabase
    .from("sessions")
    .select("status, settings")
    .eq("id", sessionId)
    .single<{ status: SessionStatus; settings: Record<string, unknown> | null }>();

  if (fetchError || !current) return { error: "Sessão não encontrada." };

  // Campanha encerrada só volta para o lobby (reabrir).
  if (current.status === "finished" && next !== "lobby") {
    return { error: "Campanha encerrada — reabra antes de jogar." };
  }
  if (current.status === next) return { ok: true };

  // Numeração das sessões de jogo (settings.sessoes).
  const agora = new Date().toISOString();
  const sessoes = sessoesDaMesa(current.settings).map((s) => ({ ...s }));
  const aberta = sessaoAberta(sessoes);
  let texto: string | undefined;

  if (next === "active" && !aberta) {
    const numero = sessoes.length + 1;
    sessoes.push({ numero, inicio: agora });
    texto = `Sessão ${numeroSessao(numero)} começou`;
  } else if (next === "lobby" && current.status === "finished") {
    texto = "Campanha reaberta";
  } else if (next === "lobby" && aberta) {
    aberta.fim = agora;
    texto = `Sessão ${numeroSessao(aberta.numero)} encerrada`;
  } else if (aberta && (next === "active" || next === "paused")) {
    texto = `Sessão ${numeroSessao(aberta.numero)} ${next === "active" ? "retomada" : "pausada"}`;
  } else if (next === "finished") {
    if (aberta) aberta.fim = agora;
    texto = "Campanha encerrada";
  }

  const { error: updateError } = await supabase
    .from("sessions")
    .update({ status: next, settings: { ...(current.settings ?? {}), sessoes } })
    .eq("id", sessionId);

  if (updateError) return { error: updateError.message };

  const eventType =
    next === "lobby" ? (current.status === "finished" ? "session_start" : "session_end") : STATUS_TO_EVENT[next];
  if (eventType) {
    await supabase.from("session_events").insert({
      session_id: sessionId,
      actor_id: user.id,
      type: eventType,
      is_public: true,
      payload: { from: current.status, to: next, ...(texto ? { texto } : {}) },
    });
  }

  revalidatePath(`/dashboard/sessions/${sessionId}`);
  revalidatePath("/dashboard/sessions");
  return { ok: true };
}

export async function kickPlayer(
  sessionId: string,
  playerId: string
): Promise<{ ok?: true; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("session_players")
    .update({ status: "kicked" })
    .eq("session_id", sessionId)
    .eq("player_id", playerId);

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/sessions/${sessionId}`);
  return { ok: true };
}
