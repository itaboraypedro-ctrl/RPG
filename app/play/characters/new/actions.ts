"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase-server";
import type {
  BaseVisual,
  ElementosHistoria,
  HistoriaEstruturada,
  RostoEscolha,
} from "@/lib/character-creation/sacramento/types";
import { baseId } from "@/lib/character-creation/sacramento/bases";

export type CreateSacramentoPayload = {
  name: string;
  base: BaseVisual;
  customizacoes: string[];
  avatarUrl: string | null;
  avatarHistory: string[];
  rosto: RostoEscolha | null;
  elementos: ElementosHistoria;
  historia: HistoriaEstruturada;
  historiaModo: "manual" | "ia";
};

/** Compila a história estruturada num texto corrido para a coluna backstory. */
function renderBackstory(h: HistoriaEstruturada): string {
  const partes = [
    h.resumo,
    ...h.capitulos.map((c) => `## ${c.titulo}\n${c.texto}`),
    h.familia ? `## Família\n${h.familia}` : null,
    h.vinculos.length > 0
      ? `## Vínculos\n${h.vinculos
          .map((v) => `- ${v.nome} (${v.relacao})${v.detalhe ? `: ${v.detalhe}` : ""}`)
          .join("\n")}`
      : null,
    `## Trilha de Redenção — ${h.redencao.trilhaNome}\n${h.redencao.premissa}\n${h.redencao.passos
      .map((p, i) => `${i + 1}. ${p}${i === 5 ? " (encerramento)" : ""}`)
      .join("\n")}`,
    h.ganchos.length > 0 ? `## Pontas soltas\n${h.ganchos.map((g) => `- ${g}`).join("\n")}` : null,
  ];
  return partes.filter(Boolean).join("\n\n");
}

export async function createSacramentoCharacter(
  payload: CreateSacramentoPayload,
): Promise<{ ok: false; error: string }> {
  const auth = await getProfile();
  if (!auth) {
    return { ok: false, error: "Não autenticado" };
  }

  const name = payload.name?.trim();
  if (!name || name.length < 2) {
    return { ok: false, error: "Nome do personagem é obrigatório" };
  }
  if (!payload.historia || payload.historia.redencao?.passos?.length !== 6) {
    return { ok: false, error: "História incompleta — a trilha de redenção precisa de 6 passos" };
  }

  const supabase = await createClient();

  // Valores iniciais do livro antes dos atributos (docs/01 §3):
  // Vida 6, Dor 6, Defesa 5, 1 movimento, 1 ação de combate, $200 para compras.
  // A distribuição de atributos/antecedentes acontece na área de regras, não aqui.
  const insertRow: Record<string, unknown> = {
    owner_id: auth.user.id,
    name,
    class: "",
    race: "",
    level: 1,
    hp: 6,
    max_hp: 6,
    temp_hp: 0,
    ac: 5,
    initiative: 0,
    speed: 1,
    xp: 0,
    xp_next_level: 10,
    gold: 200,
    conditions: [],
    death_saves: { successes: 0, failures: 0 },
    stats: {},
    skills: {},
    inventory: [],
    spells: [],
    backstory: renderBackstory(payload.historia),
    notes: "",
    avatar_url: payload.avatarUrl,
    ai_summary: "",
    sex: payload.base.apresentacao === "feminino" ? "female" : "male",
    age_category: payload.base.faixaEtaria,
    appearance_description: payload.customizacoes.join("; ") || null,
    avatar_history: payload.avatarHistory,
    visual: {
      base: { ...payload.base, baseId: baseId(payload.base) },
      customizacoes: payload.customizacoes,
      rosto: payload.rosto
        ? { modo: payload.rosto.modo, descricao: payload.rosto.descricao ?? null }
        : null,
    },
    story: {
      elementos: payload.elementos,
      historia: payload.historia,
      origem: payload.historiaModo,
      aprovadaEm: new Date().toISOString(),
    },
  };

  const { error } = await supabase.from("characters").insert(insertRow);
  if (error) {
    // PostgREST: "Could not find the 'story' column of 'characters' in the schema cache"
    const colunaFaltando =
      /column/i.test(error.message) &&
      /(visual|story|age_category|avatar_history)/i.test(error.message);
    return {
      ok: false,
      error: colunaFaltando
        ? "Banco desatualizado — rode a migration 007_sacramento_character_wizard.sql no SQL Editor."
        : error.message,
    };
  }

  revalidatePath("/hub");
  redirect("/hub");
}
