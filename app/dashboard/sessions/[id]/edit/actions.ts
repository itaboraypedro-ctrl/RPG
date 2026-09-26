"use server";

import { revalidatePath } from "next/cache";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase-server";
import { limitesDaMesa } from "@/lib/character-creation/sacramento/rules";

/**
 * Salva as regras de criação de personagem da mesa em
 * sessions.settings.regrasCriacao (sanitizadas pelo limitesDaMesa).
 */
export async function salvarRegrasCriacao(
  sessionId: string,
  regrasRaw: unknown,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const auth = await getProfile();
  if (!auth) return { ok: false, error: "Não autenticado" };

  const supabase = await createClient();
  const { data: sessao, error: readError } = await supabase
    .from("sessions")
    .select("id, gm_id, settings")
    .eq("id", sessionId)
    .maybeSingle<{ id: string; gm_id: string; settings: Record<string, unknown> | null }>();
  if (readError || !sessao) return { ok: false, error: "Campanha não encontrada" };
  if (sessao.gm_id !== auth.user.id) return { ok: false, error: "Só o Juiz da mesa altera as regras" };

  const regras = limitesDaMesa(regrasRaw);
  const { error } = await supabase
    .from("sessions")
    .update({ settings: { ...(sessao.settings ?? {}), regrasCriacao: regras } })
    .eq("id", sessionId);
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/dashboard/sessions/${sessionId}/edit`);
  revalidatePath(`/campaigns/${sessionId}/story`);
  revalidatePath("/play/characters/new");
  return { ok: true };
}
