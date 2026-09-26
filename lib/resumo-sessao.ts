import type { SupabaseClient } from "@supabase/supabase-js";
import { fichaMesa } from "@/lib/rulesets/sacramento/mesa";
import { sessoesDaMesa } from "@/lib/sessoes-de-jogo";
import type { Character, Session, SessionEvent } from "@/lib/types";

export type ResumoPersonagem = {
  character: Character;
  saldo: number;
  saldoDelta: number;
  xpDelta: number;
  danoV: number;
  curaV: number;
  dor: number;
  itens: { nome: string; quantidade: number }[];
  testes: { sucesso: number; falha: number };
  tiros: { disparos: number; acertos: number };
  sina: { ganhas: number; usadas: number };
  feitos: string[];
};

export type ResumoSessao = {
  /** null = resumo da campanha inteira. */
  numero: number | null;
  sessoesJogadas: number;
  duracaoMs: number;
  cenas: string[];
  combates: number;
  personagens: ResumoPersonagem[];
};

/** Valor em reais escrito em pt-BR ("1.234,50") → número. */
function reais(s: string): number {
  return Number(s.replace(/\./g, "").replace(",", "."));
}

const n = (re: RegExp, t: string) => {
  const m = t.match(re);
  return m ? Number(m[1]) : 0;
};

/**
 * Resumo de uma sessão de jogo (ou da campanha, com `numero` null) a partir
 * dos eventos da mesa. Usa o cliente admin: compras são eventos privados.
 */
export async function montarResumo(
  admin: SupabaseClient,
  session: Session,
  numero: number | null,
): Promise<ResumoSessao | null> {
  const sessoes = sessoesDaMesa(session.settings);
  const alvo = numero == null ? null : sessoes.find((s) => s.numero === numero);
  if (numero != null && !alvo) return null;

  let q = admin.from("session_events").select("*").eq("session_id", session.id).order("created_at");
  if (alvo) {
    q = q.gte("created_at", alvo.inicio);
    if (alvo.fim) q = q.lte("created_at", new Date(new Date(alvo.fim).getTime() + 1000).toISOString());
  }
  const [{ data: eventos }, { data: personagens }] = await Promise.all([
    q.returns<SessionEvent[]>(),
    admin.from("characters").select("*").eq("session_id", session.id).neq("owner_id", session.gm_id).order("created_at").returns<Character[]>(),
  ]);
  const evs = eventos ?? [];

  const duracaoMs = alvo
    ? alvo.fim
      ? new Date(alvo.fim).getTime() - new Date(alvo.inicio).getTime()
      : 0
    : sessoes.reduce((t, s) => t + (s.fim ? new Date(s.fim).getTime() - new Date(s.inicio).getTime() : 0), 0);

  const cenas: string[] = [];
  let combates = 0;
  for (const e of evs) {
    const texto = typeof e.payload?.texto === "string" ? (e.payload.texto as string) : "";
    if (e.type === "scene_change") cenas.push(texto.replace(/^Nova cena:\s*/, ""));
    if (e.type === "round_start" && texto.startsWith("Combate!")) combates++;
  }

  const resumoDe = (c: Character): ResumoPersonagem => {
    const r: ResumoPersonagem = {
      character: c,
      saldo: fichaMesa(c).saldo,
      saldoDelta: 0,
      xpDelta: 0,
      danoV: 0,
      curaV: 0,
      dor: 0,
      itens: [],
      testes: { sucesso: 0, falha: 0 },
      tiros: { disparos: 0, acertos: 0 },
      sina: { ganhas: 0, usadas: 0 },
      feitos: [],
    };
    for (const e of evs) {
      const p = (e.payload ?? {}) as Record<string, unknown>;
      const texto = typeof p.texto === "string" ? p.texto : "";
      const rolagem = p.rolagem as { quem?: string } | undefined;
      const meu = p.personagemId === c.id || rolagem?.quem === c.name;
      if (!meu) continue;

      if (p.tipo === "compra") {
        r.saldoDelta -= Number(p.total ?? 0);
        const nome = texto.match(/× (.+) por /)?.[1] ?? "Item";
        r.itens.push({ nome, quantidade: Number(p.quantidade ?? 1) });
        r.feitos.push(texto);
      } else if (e.type === "item_given") {
        const m = texto.match(/(recebeu|pagou) \$([\d.,]+)/);
        if (m) r.saldoDelta += (m[1] === "recebeu" ? 1 : -1) * reais(m[2]);
        r.feitos.push(texto.replace(/ — saldo .*$/, ""));
      } else if (e.type === "xp_gained") {
        const m = texto.match(/(ganhou|perdeu) (\d+) XP/);
        if (m) r.xpDelta += (m[1] === "ganhou" ? 1 : -1) * Number(m[2]);
        r.feitos.push(texto.replace(/ \(total \d+\)$/, ""));
      } else if (e.type === "level_up" || e.type === "combat_kill") {
        r.feitos.push(texto);
      } else if (e.type === "combat_damage") {
        r.danoV += n(/perdeu (\d+) V/, texto) + (/−1 V/.test(texto) ? 1 : 0);
        r.dor += n(/sofreu (\d+) de Dor/, texto) + (/Dor \d\/6/.test(texto) && !/sofreu|perdeu/.test(texto) ? 1 : 0);
      } else if (e.type === "combat_heal") {
        r.curaV += n(/recuperou (\d+) V/, texto);
      } else if (e.type === "condition_added" && /Morto|Inconsciente|À beira/.test(texto)) {
        r.feitos.push(texto);
      } else if (p.kind === "tiro") {
        r.tiros.disparos++;
        if ((p.rolagem as { sucesso?: boolean } | undefined)?.sucesso) r.tiros.acertos++;
      } else if (p.kind === "uso" && texto) {
        r.feitos.push(texto);
      } else if (p.kind === "rolagem") {
        if (/SUCESSO/.test(texto)) r.testes.sucesso++;
        else if (/FALHA/.test(texto)) r.testes.falha++;
      } else if (/ganhou uma Carta de Sina/.test(texto)) {
        r.sina.ganhas++;
        r.feitos.push(texto);
      } else if (/(usou|gastou) a Sina/.test(texto)) {
        r.sina.usadas++;
        r.feitos.push(texto);
      }
    }
    r.saldoDelta = Math.round(r.saldoDelta * 100) / 100;
    return r;
  };

  return {
    numero: alvo?.numero ?? null,
    sessoesJogadas: sessoes.filter((s) => s.fim).length,
    duracaoMs,
    cenas,
    combates,
    personagens: (personagens ?? []).map(resumoDe),
  };
}
