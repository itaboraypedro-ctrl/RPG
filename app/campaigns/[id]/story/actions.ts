"use server";

import { revalidatePath } from "next/cache";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import type {
  CampaignConfig,
  CampaignElement,
  CampaignElementKind,
  CampaignElementVisibility,
} from "@/lib/types";

type Ok<T = unknown> = ({ ok: true } & T) | { ok: false; error: string };

type GmContext =
  | { ok: false; error: string }
  | { ok: true; supabase: Awaited<ReturnType<typeof createClient>>; userId: string };

async function requireGmOfSession(sessionId: string): Promise<GmContext> {
  const auth = await getProfile();
  if (!auth) return { ok: false, error: "Não autenticado" };
  const supabase = await createClient();
  const { data: session } = await supabase
    .from("sessions")
    .select("id, gm_id")
    .eq("id", sessionId)
    .maybeSingle();
  if (!session || session.gm_id !== auth.user.id) {
    return { ok: false, error: "Apenas o Juiz desta campanha pode editá-la." };
  }
  return { ok: true, supabase, userId: auth.user.id };
}

export async function updateCampaignConfig(
  sessionId: string,
  config: CampaignConfig,
): Promise<Ok> {
  const ctx = await requireGmOfSession(sessionId);
  if (!ctx.ok) return { ok: false, error: ctx.error };

  const { error } = await ctx.supabase
    .from("sessions")
    .update({ campaign: config })
    .eq("id", sessionId);
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/campaigns/${sessionId}/story`);
  return { ok: true };
}

export async function createElement(
  sessionId: string,
  kind: CampaignElementKind,
  visibility: CampaignElementVisibility,
  data: Record<string, unknown>,
): Promise<Ok<{ element: CampaignElement }>> {
  const ctx = await requireGmOfSession(sessionId);
  if (!ctx.ok) return { ok: false, error: ctx.error };

  const { data: element, error } = await ctx.supabase
    .from("campaign_elements")
    .insert({ session_id: sessionId, kind, visibility, data })
    .select("*")
    .single();
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/campaigns/${sessionId}/story`);
  return { ok: true, element: element as CampaignElement };
}

export async function updateElement(
  sessionId: string,
  elementId: string,
  patch: { data?: Record<string, unknown>; visibility?: CampaignElementVisibility },
): Promise<Ok<{ element: CampaignElement }>> {
  const ctx = await requireGmOfSession(sessionId);
  if (!ctx.ok) return { ok: false, error: ctx.error };

  const { data: element, error } = await ctx.supabase
    .from("campaign_elements")
    .update(patch)
    .eq("id", elementId)
    .eq("session_id", sessionId)
    .select("*")
    .single();
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/campaigns/${sessionId}/story`);
  return { ok: true, element: element as CampaignElement };
}

// ─── Imagens de elementos (bucket campaign-images, migration 006) ───
// Upload via service role: a autorização é a checagem de Juiz acima,
// então o bucket não precisa de policies de escrita.

const IMAGE_BUCKET = "campaign-images";
const IMAGE_MAX_BYTES = 5 * 1024 * 1024;
const IMAGE_EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export async function uploadCampaignImage(
  sessionId: string,
  formData: FormData,
): Promise<Ok<{ url: string }>> {
  const ctx = await requireGmOfSession(sessionId);
  if (!ctx.ok) return { ok: false, error: ctx.error };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Nenhuma imagem recebida." };
  }
  const ext = IMAGE_EXT_BY_TYPE[file.type];
  if (!ext) {
    return { ok: false, error: "Formato não suportado — use JPG, PNG, WebP ou GIF." };
  }
  if (file.size > IMAGE_MAX_BYTES) {
    return { ok: false, error: "Imagem acima de 5 MB. Reduza e tente de novo." };
  }

  const admin = createAdminClient();
  const path = `${sessionId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await admin.storage
    .from(IMAGE_BUCKET)
    .upload(path, file, { contentType: file.type });
  if (error) {
    const missing = /bucket/i.test(error.message) && /not.*found/i.test(error.message);
    return {
      ok: false,
      error: missing
        ? "Bucket de imagens não existe — rode a migration 006_campaign_images.sql no SQL Editor."
        : error.message,
    };
  }

  const { data } = admin.storage.from(IMAGE_BUCKET).getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
}

export async function deleteCampaignImage(
  sessionId: string,
  imageUrl: string,
): Promise<Ok> {
  const ctx = await requireGmOfSession(sessionId);
  if (!ctx.ok) return { ok: false, error: ctx.error };

  // Só remove objetos da pasta desta campanha dentro do bucket.
  const marker = `/object/public/${IMAGE_BUCKET}/`;
  const idx = imageUrl.indexOf(marker);
  const path = idx >= 0 ? decodeURIComponent(imageUrl.slice(idx + marker.length)) : null;
  if (!path || !path.startsWith(`${sessionId}/`)) {
    return { ok: false, error: "URL de imagem inválida para esta campanha." };
  }

  const admin = createAdminClient();
  const { error } = await admin.storage.from(IMAGE_BUCKET).remove([path]);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function deleteElement(
  sessionId: string,
  elementId: string,
): Promise<Ok> {
  const ctx = await requireGmOfSession(sessionId);
  if (!ctx.ok) return { ok: false, error: ctx.error };

  const { error } = await ctx.supabase
    .from("campaign_elements")
    .delete()
    .eq("id", elementId)
    .eq("session_id", sessionId);
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/campaigns/${sessionId}/story`);
  return { ok: true };
}
