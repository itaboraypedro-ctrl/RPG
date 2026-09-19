"use server";

import { revalidatePath } from "next/cache";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase-server";
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
