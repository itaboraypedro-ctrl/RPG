"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase-server";
import type {
  BaseVisual,
  ElementosHistoria,
  FichaMecanica,
  HistoriaEstruturada,
} from "@/lib/character-creation/sacramento/types";
import { baseId } from "@/lib/character-creation/sacramento/bases";
import { characterImagePath } from "@/lib/character-creation/sacramento/kits";
import { calcularDerivados, validarFicha, XP_POR_NIVEL } from "@/lib/character-creation/sacramento/rules";
import { contarParrudeza } from "@/lib/character-creation/sacramento/habilidades";

export type CreateSacramentoPayload = {
  name: string;
  base: BaseVisual;
  kitId: string;
  elementos: ElementosHistoria;
  historia: HistoriaEstruturada;
  historiaModo: "manual" | "ia";
  ficha: FichaMecanica;
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

  const ficha = payload.ficha;
  const validacao = validarFicha(ficha);
  if (validacao.erros.length > 0) {
    return { ok: false, error: validacao.erros[0] };
  }

  const derivados = calcularDerivados(ficha, contarParrudeza(ficha.habilidades));
  const proximoNivel = Math.min(6, ficha.nivel + 1) as keyof typeof XP_POR_NIVEL;

  const supabase = await createClient();

  const insertRow: Record<string, unknown> = {
    owner_id: auth.user.id,
    name,
    class: "",
    race: "",
    level: ficha.nivel,
    hp: derivados.vidaMaxima,
    max_hp: derivados.vidaMaxima,
    temp_hp: 0,
    ac: derivados.defesa,
    initiative: 0, // iniciativa em Sacramento usa cartas, não um número (pp. 26, 78)
    speed: derivados.movimentos,
    xp: derivados.xp,
    xp_next_level: XP_POR_NIVEL[proximoNivel],
    gold: 200, // orçamento inicial do livro (p. 52); compras acontecem na mesa
    conditions: [],
    death_saves: { successes: 0, failures: 0 },
    stats: {
      sistema: "sacramento",
      atributos: ficha.atributos,
      derivados: {
        vidaMaxima: derivados.vidaMaxima,
        capacidadeDor: derivados.capacidadeDor,
        defesa: derivados.defesa,
        movimentos: derivados.movimentos,
        acoesCombate: derivados.acoesCombate,
        cartasIniciativa: derivados.cartasIniciativa,
      },
      montaria: ficha.montaria,
    },
    skills: { antecedentes: ficha.antecedentes, habilidades: ficha.habilidades },
    inventory: [],
    spells: [],
    backstory: renderBackstory(payload.historia),
    notes: "",
    avatar_url: characterImagePath(payload.base, payload.kitId),
    ai_summary: "",
    // Apresentação/idade ficam em visual (as colunas da migration 004 não existem no banco).
    visual: {
      base: { ...payload.base, baseId: baseId(payload.base) },
      kitId: payload.kitId,
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
      /column/i.test(error.message) && /(visual|story)/i.test(error.message);
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
