"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { createClient } from "@/lib/supabase-server";
import type {
  Character,
  DeathSaves,
  MediaStateAudio,
  MediaStateImage,
  NotificationType,
  Session,
  SessionEventType,
} from "@/lib/types";
import type { Destination, Enemy, GmAiContext } from "@/components/gm-panel/types";

type ActionResult = { ok?: true; error?: string };

async function fetchSession(supabase: Awaited<ReturnType<typeof createClient>>, id: string) {
  return supabase
    .from("sessions")
    .select("*")
    .eq("id", id)
    .maybeSingle<Session>();
}

async function emitEvent(
  supabase: Awaited<ReturnType<typeof createClient>>,
  sessionId: string,
  actorId: string | null,
  type: SessionEventType,
  payload: Record<string, unknown>,
  isPublic: boolean,
  round: number | null = null
) {
  await supabase.from("session_events").insert({
    session_id: sessionId,
    actor_id: actorId,
    type,
    payload,
    is_public: isPublic,
    round,
  });
}

async function notify(
  supabase: Awaited<ReturnType<typeof createClient>>,
  sessionId: string,
  destination: Destination,
  notif: { type: NotificationType; title: string; message: string; vibrate?: boolean }
) {
  if (destination.type === "gm_only") return;
  if (destination.type === "all") {
    await supabase.from("notifications").insert({
      session_id: sessionId,
      target_id: null,
      type: notif.type,
      title: notif.title,
      message: notif.message,
      vibrate: notif.vibrate ?? false,
    });
    return;
  }
  if (destination.playerIds.length === 0) return;
  await supabase.from("notifications").insert(
    destination.playerIds.map((pid) => ({
      session_id: sessionId,
      target_id: pid,
      type: notif.type,
      title: notif.title,
      message: notif.message,
      vibrate: notif.vibrate ?? false,
    }))
  );
}

async function getUserId(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

async function patchAiContext(
  supabase: Awaited<ReturnType<typeof createClient>>,
  sessionId: string,
  patch: Partial<GmAiContext>
) {
  const { data: session } = await fetchSession(supabase, sessionId);
  if (!session) return { error: "Sessão não encontrada." };
  const current = (session.ai_context ?? {}) as GmAiContext;
  const next = { ...current, ...patch };
  const { error } = await supabase
    .from("sessions")
    .update({ ai_context: next })
    .eq("id", sessionId);
  return error ? { error: error.message } : { ok: true as const };
}

export async function applyHpChange(
  sessionId: string,
  target: { kind: "character" | "enemy"; id: string },
  delta: number,
  destination: Destination
): Promise<ActionResult> {
  const supabase = await createClient();
  const userId = await getUserId(supabase);
  if (!userId) return { error: "Sessão expirada." };

  const isHeal = delta > 0;
  const eventType: SessionEventType = isHeal ? "combat_heal" : "combat_damage";

  if (target.kind === "character") {
    const { data: char } = await supabase
      .from("characters")
      .select("id, name, hp, max_hp")
      .eq("id", target.id)
      .maybeSingle<{ id: string; name: string; hp: number; max_hp: number }>();
    if (!char) return { error: "Personagem não encontrado." };

    const newHp = Math.max(0, Math.min(char.max_hp, char.hp + delta));
    const { error } = await supabase
      .from("characters")
      .update({ hp: newHp })
      .eq("id", char.id);
    if (error) return { error: error.message };

    await emitEvent(
      supabase,
      sessionId,
      userId,
      eventType,
      { target_id: char.id, target_name: char.name, delta, new_hp: newHp },
      destination.type !== "gm_only"
    );

    if (char.hp > 0 && newHp === 0) {
      await emitEvent(
        supabase,
        sessionId,
        userId,
        "combat_kill",
        { target_id: char.id, target_name: char.name },
        destination.type !== "gm_only"
      );
    }

    await notify(supabase, sessionId, destination, {
      type: "combat",
      title: isHeal ? "Cura aplicada" : "Dano recebido",
      message: `${char.name}: ${isHeal ? "+" : ""}${delta} HP (${newHp}/${char.max_hp})`,
      vibrate: !isHeal,
    });
  } else {
    const { data: session } = await fetchSession(supabase, sessionId);
    if (!session) return { error: "Sessão não encontrada." };
    const ctx = (session.ai_context ?? {}) as GmAiContext;
    const enemies = ctx.enemies ?? [];
    const enemy = enemies.find((e) => e.id === target.id);
    if (!enemy) return { error: "Inimigo não encontrado." };

    const newHp = Math.max(0, Math.min(enemy.max_hp, enemy.hp + delta));
    const updated = enemies.map((e) =>
      e.id === enemy.id ? { ...e, hp: newHp, defeated: newHp === 0 } : e
    );
    const { error } = await supabase
      .from("sessions")
      .update({ ai_context: { ...ctx, enemies: updated } })
      .eq("id", sessionId);
    if (error) return { error: error.message };

    await emitEvent(
      supabase,
      sessionId,
      userId,
      eventType,
      { enemy_id: enemy.id, enemy_name: enemy.name, delta, new_hp: newHp },
      destination.type !== "gm_only"
    );
    if (enemy.hp > 0 && newHp === 0) {
      await emitEvent(
        supabase,
        sessionId,
        userId,
        "combat_kill",
        { enemy_id: enemy.id, enemy_name: enemy.name },
        destination.type !== "gm_only"
      );
    }
    await notify(supabase, sessionId, destination, {
      type: "combat",
      title: isHeal ? "Cura aplicada" : "Dano causado",
      message: `${enemy.name}: ${isHeal ? "+" : ""}${delta} HP`,
    });
  }

  revalidatePath(`/dashboard/sessions/${sessionId}/play`);
  return { ok: true };
}

export async function addCondition(
  sessionId: string,
  charId: string,
  condition: string,
  destination: Destination
): Promise<ActionResult> {
  const supabase = await createClient();
  const userId = await getUserId(supabase);
  if (!userId) return { error: "Sessão expirada." };

  const { data: char } = await supabase
    .from("characters")
    .select("id, name, conditions")
    .eq("id", charId)
    .maybeSingle<Pick<Character, "id" | "name" | "conditions">>();
  if (!char) return { error: "Personagem não encontrado." };
  if (char.conditions.includes(condition)) return { ok: true };

  const next = [...char.conditions, condition];
  const { error } = await supabase
    .from("characters")
    .update({ conditions: next })
    .eq("id", charId);
  if (error) return { error: error.message };

  await emitEvent(
    supabase,
    sessionId,
    userId,
    "condition_added",
    { target_id: charId, target_name: char.name, condition },
    destination.type !== "gm_only"
  );
  await notify(supabase, sessionId, destination, {
    type: "warning",
    title: "Condição aplicada",
    message: `${char.name}: ${condition}`,
  });
  return { ok: true };
}

export async function removeCondition(
  sessionId: string,
  charId: string,
  condition: string
): Promise<ActionResult> {
  const supabase = await createClient();
  const userId = await getUserId(supabase);
  if (!userId) return { error: "Sessão expirada." };

  const { data: char } = await supabase
    .from("characters")
    .select("id, name, conditions")
    .eq("id", charId)
    .maybeSingle<Pick<Character, "id" | "name" | "conditions">>();
  if (!char) return { error: "Personagem não encontrado." };

  const next = char.conditions.filter((c) => c !== condition);
  const { error } = await supabase
    .from("characters")
    .update({ conditions: next })
    .eq("id", charId);
  if (error) return { error: error.message };

  await emitEvent(
    supabase,
    sessionId,
    userId,
    "condition_removed",
    { target_id: charId, target_name: char.name, condition },
    true
  );
  return { ok: true };
}

export async function setDeathSaves(
  charId: string,
  saves: DeathSaves
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("characters")
    .update({ death_saves: saves })
    .eq("id", charId);
  return error ? { error: error.message } : { ok: true };
}

export async function setActiveCombatant(
  sessionId: string,
  combatantId: string | null
): Promise<ActionResult> {
  const supabase = await createClient();
  return patchAiContext(supabase, sessionId, {
    active_combatant_id: combatantId ?? undefined,
  });
}

export async function rollInitiative(sessionId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: chars } = await supabase
    .from("characters")
    .select("id")
    .eq("session_id", sessionId)
    .returns<{ id: string }[]>();

  if (chars) {
    for (const c of chars) {
      const roll = Math.floor(Math.random() * 20) + 1;
      await supabase.from("characters").update({ initiative: roll }).eq("id", c.id);
    }
  }

  const { data: session } = await fetchSession(supabase, sessionId);
  if (session) {
    const ctx = (session.ai_context ?? {}) as GmAiContext;
    const enemies = (ctx.enemies ?? []).map((e) => ({
      ...e,
      initiative: Math.floor(Math.random() * 20) + 1,
    }));
    await supabase
      .from("sessions")
      .update({ ai_context: { ...ctx, enemies } })
      .eq("id", sessionId);
  }

  revalidatePath(`/dashboard/sessions/${sessionId}/play`);
  return { ok: true };
}

export async function updateRound(
  sessionId: string,
  delta: number
): Promise<ActionResult> {
  const supabase = await createClient();
  const userId = await getUserId(supabase);
  if (!userId) return { error: "Sessão expirada." };

  const { data: session } = await fetchSession(supabase, sessionId);
  if (!session) return { error: "Sessão não encontrada." };
  const next = Math.max(0, session.current_round + delta);
  const { error } = await supabase
    .from("sessions")
    .update({ current_round: next })
    .eq("id", sessionId);
  if (error) return { error: error.message };

  await emitEvent(
    supabase,
    sessionId,
    userId,
    delta > 0 ? "round_start" : "round_end",
    { round: next },
    true,
    next
  );
  return { ok: true };
}

export async function addEnemy(
  sessionId: string,
  enemy: Omit<Enemy, "id">
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: session } = await fetchSession(supabase, sessionId);
  if (!session) return { error: "Sessão não encontrada." };

  const ctx = (session.ai_context ?? {}) as GmAiContext;
  const enemies = ctx.enemies ?? [];
  const next: Enemy[] = [...enemies, { ...enemy, id: randomUUID() }];
  const { error } = await supabase
    .from("sessions")
    .update({ ai_context: { ...ctx, enemies: next } })
    .eq("id", sessionId);
  return error ? { error: error.message } : { ok: true };
}

export async function updateEnemy(
  sessionId: string,
  enemyId: string,
  patch: Partial<Enemy>
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: session } = await fetchSession(supabase, sessionId);
  if (!session) return { error: "Sessão não encontrada." };
  const ctx = (session.ai_context ?? {}) as GmAiContext;
  const enemies = (ctx.enemies ?? []).map((e) =>
    e.id === enemyId ? { ...e, ...patch } : e
  );
  const { error } = await supabase
    .from("sessions")
    .update({ ai_context: { ...ctx, enemies } })
    .eq("id", sessionId);
  return error ? { error: error.message } : { ok: true };
}

export async function removeEnemy(
  sessionId: string,
  enemyId: string
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: session } = await fetchSession(supabase, sessionId);
  if (!session) return { error: "Sessão não encontrada." };
  const ctx = (session.ai_context ?? {}) as GmAiContext;
  const enemies = (ctx.enemies ?? []).filter((e) => e.id !== enemyId);
  const { error } = await supabase
    .from("sessions")
    .update({ ai_context: { ...ctx, enemies } })
    .eq("id", sessionId);
  return error ? { error: error.message } : { ok: true };
}

export async function setCurrentImage(
  sessionId: string,
  image: MediaStateImage | null,
  destination: Destination
): Promise<ActionResult> {
  const supabase = await createClient();
  const userId = await getUserId(supabase);
  if (!userId) return { error: "Sessão expirada." };

  const { error } = await supabase
    .from("session_media_state")
    .update({ current_image: image, updated_at: new Date().toISOString() })
    .eq("session_id", sessionId);
  if (error) return { error: error.message };

  await emitEvent(
    supabase,
    sessionId,
    userId,
    image ? "media_play" : "media_stop",
    { kind: "image", media_id: image?.media_id ?? null, url: image?.url ?? null },
    destination.type !== "gm_only"
  );
  if (image) {
    await notify(supabase, sessionId, destination, {
      type: "info",
      title: "Cena atualizada",
      message: image.caption || "Nova imagem ativa.",
    });
  }
  return { ok: true };
}

export async function setCurrentAudio(
  sessionId: string,
  audio: MediaStateAudio | null,
  destination: Destination
): Promise<ActionResult> {
  const supabase = await createClient();
  const userId = await getUserId(supabase);
  if (!userId) return { error: "Sessão expirada." };

  const { error } = await supabase
    .from("session_media_state")
    .update({ current_audio: audio, updated_at: new Date().toISOString() })
    .eq("session_id", sessionId);
  if (error) return { error: error.message };

  await emitEvent(
    supabase,
    sessionId,
    userId,
    audio ? "media_play" : "media_stop",
    { kind: "audio", media_id: audio?.media_id ?? null, title: audio?.title ?? null },
    destination.type !== "gm_only"
  );
  if (audio) {
    await notify(supabase, sessionId, destination, {
      type: "info",
      title: "Trilha sonora",
      message: audio.title,
    });
  }
  return { ok: true };
}

export async function playSound(
  sessionId: string,
  mediaId: string,
  title: string,
  destination: Destination
): Promise<ActionResult> {
  const supabase = await createClient();
  const userId = await getUserId(supabase);
  if (!userId) return { error: "Sessão expirada." };

  await emitEvent(
    supabase,
    sessionId,
    userId,
    "media_play",
    { kind: "sfx", media_id: mediaId, title },
    destination.type !== "gm_only"
  );
  await notify(supabase, sessionId, destination, {
    type: "info",
    title: "Efeito sonoro",
    message: title,
  });
  return { ok: true };
}

export async function saveStoryAnnotation(
  sessionId: string,
  text: string
): Promise<ActionResult> {
  const supabase = await createClient();
  return patchAiContext(supabase, sessionId, { story_summary: text });
}

export async function rollDice(
  sessionId: string,
  sides: number,
  charId: string | null,
  charName: string | null
): Promise<{ ok?: true; error?: string; result?: number }> {
  const supabase = await createClient();
  const userId = await getUserId(supabase);
  if (!userId) return { error: "Sessão expirada." };

  const result = Math.floor(Math.random() * sides) + 1;
  await emitEvent(
    supabase,
    sessionId,
    userId,
    "gm_note",
    {
      kind: "dice_roll",
      sides,
      result,
      char_id: charId,
      char_name: charName,
    },
    true
  );
  return { ok: true, result };
}

export async function grantXp(
  sessionId: string,
  charId: string,
  amount: number
): Promise<ActionResult> {
  const supabase = await createClient();
  const userId = await getUserId(supabase);
  if (!userId) return { error: "Sessão expirada." };

  const { data: char } = await supabase
    .from("characters")
    .select("id, name, xp")
    .eq("id", charId)
    .maybeSingle<{ id: string; name: string; xp: number }>();
  if (!char) return { error: "Personagem não encontrado." };

  const next = Math.max(0, char.xp + amount);
  const { error } = await supabase
    .from("characters")
    .update({ xp: next })
    .eq("id", charId);
  if (error) return { error: error.message };

  await emitEvent(
    supabase,
    sessionId,
    userId,
    "xp_gained",
    { target_id: charId, target_name: char.name, amount, total: next },
    true
  );
  return { ok: true };
}

export async function advanceAct(
  sessionId: string,
  sceneTitle: string
): Promise<ActionResult> {
  const supabase = await createClient();
  const userId = await getUserId(supabase);
  if (!userId) return { error: "Sessão expirada." };

  const { error } = await supabase
    .from("sessions")
    .update({ current_scene: sceneTitle })
    .eq("id", sessionId);
  if (error) return { error: error.message };

  await emitEvent(
    supabase,
    sessionId,
    userId,
    "scene_change",
    { scene: sceneTitle },
    true
  );
  return { ok: true };
}
