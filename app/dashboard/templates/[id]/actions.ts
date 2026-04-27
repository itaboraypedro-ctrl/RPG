"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase-server";
import type { StoryTemplate } from "@/lib/types";

export async function duplicateTemplate(
  id: string
): Promise<{ id?: string; error?: string }> {
  const supabase = await createClient();

  const { data: original } = await supabase
    .from("story_templates")
    .select("*")
    .eq("id", id)
    .maybeSingle<StoryTemplate>();

  if (!original) return { error: "Template não encontrado." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada." };

  const { data, error } = await supabase
    .from("story_templates")
    .insert({
      gm_id: user.id,
      title: `Cópia de ${original.title}`,
      description: original.description,
      genre: original.genre,
      cover_image_url: original.cover_image_url,
      content: original.content,
      tags: original.tags,
      ai_generated: original.ai_generated,
      is_public: false,
    })
    .select("id")
    .single<{ id: string }>();

  if (error || !data) return { error: error?.message ?? "Falha ao duplicar." };

  revalidatePath("/dashboard/templates");
  return { id: data.id };
}

export async function deleteTemplate(
  id: string
): Promise<{ ok?: true; error?: string }> {
  const supabase = await createClient();

  const { count } = await supabase
    .from("sessions")
    .select("id", { count: "exact", head: true })
    .eq("template_id", id)
    .neq("status", "finished");

  if ((count ?? 0) > 0) {
    return {
      error:
        "Este template está em uso por sessões ativas. Encerre ou remova as sessões antes de excluir.",
    };
  }

  const { error } = await supabase.from("story_templates").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/dashboard/templates");
  return { ok: true };
}
