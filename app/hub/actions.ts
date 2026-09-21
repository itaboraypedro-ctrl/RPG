"use server";

import { revalidatePath } from "next/cache";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";

/**
 * Apaga um personagem do dono logado (RLS characters_owner_all garante o
 * escopo) e limpa os retratos gerados na forja do bucket character-images.
 */
export async function deleteCharacter(
  characterId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const auth = await getProfile();
  if (!auth) return { ok: false, error: "Não autenticado" };

  const supabase = await createClient();
  const { data: row, error: readError } = await supabase
    .from("characters")
    .select("id, owner_id, visual")
    .eq("id", characterId)
    .single<{ id: string; owner_id: string; visual: { imagens?: Record<string, string> } | null }>();
  if (readError || !row) return { ok: false, error: "Personagem não encontrado" };
  if (row.owner_id !== auth.user.id) return { ok: false, error: "Esse personagem não é seu" };

  const { error: deleteError } = await supabase.from("characters").delete().eq("id", row.id);
  if (deleteError) return { ok: false, error: deleteError.message };

  // Retratos da forja: remove só arquivos da pasta do próprio dono.
  const urls = Object.values(row.visual?.imagens ?? {});
  const prefixo = "/character-images/";
  const paths = urls
    .filter((u): u is string => typeof u === "string" && u.includes(prefixo))
    .map((u) => decodeURIComponent(u.slice(u.indexOf(prefixo) + prefixo.length)))
    .filter((p) => p.startsWith(`${auth.user.id}/`));
  if (paths.length > 0) {
    // Falha aqui não desfaz a deleção — órfão no storage é tolerável.
    await createAdminClient().storage.from("character-images").remove(paths);
  }

  revalidatePath("/hub");
  return { ok: true };
}
