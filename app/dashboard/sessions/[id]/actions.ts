"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase-server";
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
    .select("status")
    .eq("id", sessionId)
    .single<{ status: SessionStatus }>();

  if (fetchError || !current) return { error: "Sessão não encontrada." };

  if (current.status === "finished") {
    return { error: "Sessão já encerrada." };
  }

  const { error: updateError } = await supabase
    .from("sessions")
    .update({ status: next })
    .eq("id", sessionId);

  if (updateError) return { error: updateError.message };

  const eventType = STATUS_TO_EVENT[next];
  if (eventType) {
    await supabase.from("session_events").insert({
      session_id: sessionId,
      actor_id: user.id,
      type: eventType,
      is_public: true,
      payload: { from: current.status, to: next },
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
