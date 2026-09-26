"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase-server";
import { normalizeEmails } from "@/lib/campaign-invites";
import { SACRAMENTO_META } from "@/lib/rulesets/sacramento/meta";
import type { CampaignConfig, SessionSettings } from "@/lib/types";

export type CreateCampaignPayload = {
  ruleset: "sacramento";
  title: string;
  description: string;
  maxPlayers: number;
  allowNewChars: boolean;
  aiAssistant: boolean;
  tone?: string;
  themes: string[];
  epoch: number;
  sessionZero: {
    lines: string[];
    veils: string[];
    xCard: boolean;
  };
  /** E-mails convidados (campaign_invites, migration 008). */
  inviteEmails?: string[];
};

export async function createCampaign(
  payload: CreateCampaignPayload,
): Promise<{ ok: false; error: string }> {
  const auth = await getProfile();
  if (!auth) return { ok: false, error: "Não autenticado" };
  if (auth.profile.role !== "gm" && auth.profile.role !== "admin") {
    return { ok: false, error: "Apenas o Juiz (conta de mestre) cria campanhas." };
  }

  const title = payload.title.trim();
  if (title.length < 2 || title.length > 200) {
    return { ok: false, error: "Nome da campanha precisa ter entre 2 e 200 caracteres." };
  }
  if (payload.ruleset !== "sacramento") {
    return { ok: false, error: "Modelo de RPG indisponível." };
  }

  const maxPlayers = Math.max(1, Math.min(8, Math.round(payload.maxPlayers)));
  const epoch = Math.round(payload.epoch) || SACRAMENTO_META.defaults.epoca;

  const settings: SessionSettings = {
    max_players: maxPlayers,
    allow_new_chars: payload.allowNewChars,
    xp_enabled: true,
    death_saves: false, // conceito de D&D; Sacramento usa Teste de Morte próprio
    ai_assistant: payload.aiAssistant,
  };

  // Config macro PÚBLICA — legível por jogadores joined. Nunca guardar segredos aqui.
  const campaign: CampaignConfig = {
    premise: payload.description.trim().slice(0, 2000),
    tone: payload.tone,
    themes: payload.themes.slice(0, 12),
    epoch,
    epoch_is_table_version: epoch !== SACRAMENTO_META.defaults.epoca,
    session_zero: {
      lines: payload.sessionZero.lines.slice(0, 30),
      veils: payload.sessionZero.veils.slice(0, 30),
      x_card: payload.sessionZero.xCard,
    },
  };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sessions")
    .insert({
      gm_id: auth.user.id,
      title,
      description: payload.description.trim().slice(0, 2000),
      ruleset: payload.ruleset,
      settings,
      campaign,
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };

  const emails = normalizeEmails(payload.inviteEmails ?? []).filter(
    (e) => e !== auth.user.email?.toLowerCase(),
  );
  if (emails.length > 0) {
    const { error: inviteError } = await supabase
      .from("campaign_invites")
      .insert(emails.map((email) => ({ session_id: data.id, email })));
    if (inviteError) {
      // Campanha criada mesmo assim — o Juiz reconvida pela seção Bando.
      console.error("[createCampaign] convites:", inviteError.message);
    }
  }

  revalidatePath("/hub");
  revalidatePath("/dashboard/sessions");
  redirect(`/campaigns/${data.id}/story?created=1`);
}
