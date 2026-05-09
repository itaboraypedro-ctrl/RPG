"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase-server";

type Result = { ok?: true; error?: string };

export async function selectCharacter(
  charId: string,
  sessionId: string
): Promise<Result> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada." };

  const { data: char } = await supabase
    .from("characters")
    .select("id, owner_id")
    .eq("id", charId)
    .maybeSingle<{ id: string; owner_id: string }>();
  if (!char) return { error: "Personagem não encontrado." };
  if (char.owner_id !== user.id) {
    return { error: "Permissão negada." };
  }

  const { error } = await supabase
    .from("characters")
    .update({ session_id: sessionId })
    .eq("id", charId);
  if (error) return { error: error.message };

  revalidatePath(`/play/${sessionId}`);
  revalidatePath("/play/characters/select");
  return { ok: true };
}
