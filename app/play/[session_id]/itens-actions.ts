"use server";

// Barra de itens do jogador: atirar, recarregar, encher cinturão e usar itens.
// Tudo é validado e sorteado aqui; o inventário muda na mesma ação que o evento
// da mesa, então bala gasta nunca volta e bala inexistente nunca é disparada.

import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { itemById } from "@/lib/character-creation/sacramento/catalogo";
import { drawCards } from "@/lib/rulesets/sacramento/generators";
import { calcularAjusteCorpo, fichaMesa, nomeCarta, rolar, type Rolagem } from "@/lib/rulesets/sacramento/mesa";
import { usoDoItem, type Calibre } from "@/lib/rulesets/sacramento/itens-uso";
import {
  NOME_CALIBRE,
  balasDoPorte,
  calibreDoPorte,
  cargaDe,
  gravarTambor,
  lerInventario,
  modulo,
  tamborDe,
  limparVazios,
  nomeDoItem,
  reservaDe,
  retirarBalas,
  usosPorUnidade,
  type ItemInventario,
} from "@/lib/rulesets/sacramento/inventario";
import type { Carta } from "@/lib/rulesets/sacramento/types";
import type { Character } from "@/lib/types";

type R<T = unknown> = ({ ok: true } & T) | { ok: false; error: string };

async function contexto(sessionId: string, characterId: string, indice?: number) {
  const auth = await getProfile();
  if (!auth) return { ok: false as const, error: "Não autenticado" };
  const supabase = await createClient();
  const [{ data: c }, { data: sessao }] = await Promise.all([
    supabase.from("characters").select("*").eq("id", characterId).maybeSingle<Character>(),
    supabase.from("sessions").select("status").eq("id", sessionId).maybeSingle<{ status: string }>(),
  ]);
  if (!c || c.owner_id !== auth.user.id || c.session_id !== sessionId) {
    return { ok: false as const, error: "Personagem não encontrado nesta mesa." };
  }
  if (!sessao || sessao.status === "finished") return { ok: false as const, error: "A campanha está encerrada." };
  // Cópia profunda: as funções de inventário mutam os itens.
  const inv = structuredClone(lerInventario(c.inventory)) as ItemInventario[];
  const item = indice == null ? null : (inv[indice] ?? null);
  if (indice != null && !item) return { ok: false as const, error: "Item não está mais no alforje." };
  return { ok: true as const, auth, supabase, c, inv, item };
}

async function evento(sessionId: string, actorId: string, payload: Record<string, unknown>, isPublic = true) {
  await createAdminClient().from("session_events").insert({
    session_id: sessionId,
    actor_id: actorId,
    type: "player_note",
    is_public: isPublic,
    payload,
  });
}

const defesaValida = (d: number) => Math.max(2, Math.min(9, Math.round(Number(d) || 5)));

/* ── Atirar ── */

type Tambor = { camaras: number[]; posicao: number };

export async function atirar(
  sessionId: string,
  characterId: string,
  indice: number,
  defesa: number,
  /** Revólver: câmara que o jogador deixou no topo ao girar. */
  posicao?: number,
): Promise<R<{ seco: true; carga: number; tambor?: Tambor } | { seco: false; carga: number; rolagem: Rolagem; tambor?: Tambor }>> {
  const ctx = await contexto(sessionId, characterId, indice);
  if (!ctx.ok) return ctx;
  const { c, inv, item } = ctx;
  const u = usoDoItem(item!.id);
  if (u?.tipo !== "arma-fogo") return { ok: false, error: "Isso não atira." };

  let tambor: Tambor | undefined;
  if (u.mecanismo === "tambor") {
    // Dispara a câmara do topo e o tambor avança uma. Vazia ou cápsula: clique em seco.
    tambor = tamborDe(item!, u.carga);
    if (posicao != null) tambor.posicao = modulo(posicao, u.carga);
    const topo = tambor.camaras[tambor.posicao];
    if (topo === 1) tambor.camaras[tambor.posicao] = 2;
    tambor.posicao = modulo(tambor.posicao + 1, u.carga);
    gravarTambor(item!, tambor);
    if (topo !== 1) {
      const { error } = await ctx.supabase.from("characters").update({ inventory: inv }).eq("id", c.id);
      if (error) return { ok: false, error: error.message };
      return { ok: true, seco: true, carga: cargaDe(item!), tambor };
    }
  } else {
    const carga = cargaDe(item!);
    if (carga === 0) return { ok: true, seco: true, carga: 0 };
    item!.carga = carga - 1;
  }

  const nome = nomeDoItem(item!);
  const f = fichaMesa(c);
  const rolagem = rolar({
    tipo: "ataque",
    rotulo: `Tiro · ${nome}`,
    quem: c.name,
    mod: f.antecedentes.violencia ?? 0,
    na: defesaValida(defesa),
  });

  const { error } = await ctx.supabase.from("characters").update({ inventory: inv }).eq("id", c.id);
  if (error) return { ok: false, error: error.message };

  const carga = cargaDe(item!);
  const dano = itemById(item!.id!)?.nota?.split(" · ")[0];
  await evento(sessionId, ctx.auth.user.id, {
    kind: "tiro",
    personagemId: c.id,
    arma: item!.id,
    rolagem,
    texto: `🔫 ${c.name} atirou com ${nome}: ${rolagem.texto}${rolagem.sucesso && dano ? ` · ${dano}` : ""} · ${carga}/${u.carga} na arma`,
  });
  return { ok: true, seco: false, carga, rolagem, tambor };
}

/** Revólver: guarda para onde o jogador girou o tambor. */
export async function girarTambor(sessionId: string, characterId: string, indice: number, posicao: number): Promise<R> {
  const ctx = await contexto(sessionId, characterId, indice);
  if (!ctx.ok) return ctx;
  const u = usoDoItem(ctx.item!.id);
  if (u?.tipo !== "arma-fogo" || u.mecanismo !== "tambor") return { ok: false, error: "Isso não tem tambor." };
  const t = tamborDe(ctx.item!, u.carga);
  t.posicao = modulo(posicao, u.carga);
  gravarTambor(ctx.item!, t);
  const { error } = await ctx.supabase.from("characters").update({ inventory: ctx.inv }).eq("id", ctx.c.id);
  return error ? { ok: false, error: error.message } : { ok: true };
}

/** Revólver: tira uma cápsula disparada da câmara (ela cai no chão). */
export async function tirarCapsula(
  sessionId: string,
  characterId: string,
  indice: number,
  camara: number,
  posicao?: number,
): Promise<R<{ tambor: Tambor }>> {
  const ctx = await contexto(sessionId, characterId, indice);
  if (!ctx.ok) return ctx;
  const u = usoDoItem(ctx.item!.id);
  if (u?.tipo !== "arma-fogo" || u.mecanismo !== "tambor") return { ok: false, error: "Isso não tem tambor." };
  const t = tamborDe(ctx.item!, u.carga);
  if (posicao != null) t.posicao = modulo(posicao, u.carga);
  const k = modulo(camara, u.carga);
  if (t.camaras[k] !== 2) return { ok: false, error: "Não há cápsula nessa câmara." };
  t.camaras[k] = 0;
  gravarTambor(ctx.item!, t);
  const { error } = await ctx.supabase.from("characters").update({ inventory: ctx.inv }).eq("id", ctx.c.id);
  if (error) return { ok: false, error: error.message };
  return { ok: true, tambor: t };
}

/* ── Recarregar ── */

export async function recarregar(
  sessionId: string,
  characterId: string,
  indice: number,
  posicao?: number,
): Promise<R<{ texto: string; carga: number; tambor?: Tambor }>> {
  const ctx = await contexto(sessionId, characterId, indice);
  if (!ctx.ok) return ctx;
  const { c, item } = ctx;
  let inv = ctx.inv;
  const u = usoDoItem(item!.id);
  if (u?.tipo !== "arma-fogo") return { ok: false, error: "Isso não recarrega." };

  const carga = cargaDe(item!);
  const falta = u.carga - carga;
  const t = u.mecanismo === "tambor" ? tamborDe(item!, u.carga) : null;
  if (t && posicao != null) t.posicao = modulo(posicao, u.carga);
  if (falta <= 0 && !(t ? t.camaras.includes(2) : item!.vazias)) return { ok: false, error: "Já está carregada." };

  const tirado = retirarBalas(inv, u.calibre, falta);
  const total = tirado.porte + tirado.caixa;
  if (total === 0 && falta > 0) return { ok: false, error: `Sem ${NOME_CALIBRE[u.calibre]}.` };

  if (t) {
    // Cápsulas saem; as balas entram a partir do topo, na ordem em que vão disparar.
    t.camaras = t.camaras.map((c) => (c === 2 ? 0 : c));
    let resta = total;
    for (let i = 0; i < u.carga && resta > 0; i++) {
      const k = modulo(t.posicao + i, u.carga);
      if (t.camaras[k] === 0) {
        t.camaras[k] = 1;
        resta--;
      }
    }
    gravarTambor(item!, t);
  } else {
    item!.carga = carga + total;
    item!.vazias = 0;
  }
  inv = limparVazios(inv);
  // Custo da arma é o mesmo para 1 bala ou a carga toda (p. 82); da mochila, +2 AC (p. 53).
  const custo = u.recargaAC + (tirado.caixa > 0 ? 2 : 0);
  const origem = [tirado.porte && `${tirado.porte} do porte`, tirado.caixa && `${tirado.caixa} da caixa`].filter(Boolean).join(" + ");
  const texto = `${c.name} recarregou ${nomeDoItem(item!)} (+${total}${origem ? `: ${origem}` : ""}) — ${custo} AC`;

  const { error } = await ctx.supabase.from("characters").update({ inventory: inv }).eq("id", c.id);
  if (error) return { ok: false, error: error.message };
  await evento(sessionId, ctx.auth.user.id, { kind: "recarga", personagemId: c.id, arma: item!.id, balas: total, texto });
  return { ok: true, texto, carga: cargaDe(item!), tambor: t ?? undefined };
}

/* ── Encher cinturão / bandoleira a partir das caixas ── */

export async function encherPorte(
  sessionId: string,
  characterId: string,
  indice: number,
): Promise<R<{ texto: string }>> {
  const ctx = await contexto(sessionId, characterId, indice);
  if (!ctx.ok) return ctx;
  const { c, item } = ctx;
  let inv = ctx.inv;
  const u = usoDoItem(item!.id);
  if (u?.tipo !== "porte" || !u.balas) return { ok: false, error: "Isso não guarda balas." };

  let calibre: Calibre | null = calibreDoPorte(item!);
  if (!calibre || balasDoPorte(item!) === 0) {
    // Bandoleira vazia: leva o calibre que tiver mais caixa (espingarda ou fuzil).
    if (item!.id === "bandoleira") {
      const esp = reservaDe(inv, "espingarda").caixa;
      const fuz = reservaDe(inv, "fuzil").caixa;
      calibre = esp === 0 && fuz === 0 ? null : esp >= fuz ? "espingarda" : "fuzil";
    }
  }
  if (!calibre) return { ok: false, error: "Nenhuma caixa de munição que caiba aqui." };

  const tem = balasDoPorte(item!);
  const espaco = u.balas.max - tem;
  if (espaco <= 0) return { ok: false, error: "Já está cheio." };
  const tirado = retirarBalas(inv, calibre, espaco, true);
  if (tirado.caixa === 0) return { ok: false, error: `Sem caixa de ${NOME_CALIBRE[calibre]}.` };

  item!.balas = tem + tirado.caixa;
  if (item!.id === "bandoleira") item!.calibre = calibre;
  inv = limparVazios(inv);
  const texto = `${c.name} encheu ${nomeDoItem(item!).toLowerCase()} com ${tirado.caixa} ${NOME_CALIBRE[calibre]} (${item!.balas}/${u.balas.max})`;

  const { error } = await ctx.supabase.from("characters").update({ inventory: inv }).eq("id", c.id);
  if (error) return { ok: false, error: error.message };
  await evento(sessionId, ctx.auth.user.id, { kind: "municao", personagemId: c.id, texto }, false);
  return { ok: true, texto };
}

/* ── Usar item (comer, beber, remédio, fósforo, lanterna, dinamite, dados…) ── */

const PASSADO: Record<string, string> = { comer: "comeu", beber: "bebeu", fumar: "fumou" };

export async function usarItem(
  sessionId: string,
  characterId: string,
  indice: number,
  opcoes: { defesa?: number } = {},
): Promise<R<{ texto: string; rolagem?: Rolagem; carta?: Carta; dados?: number[] }>> {
  const ctx = await contexto(sessionId, characterId, indice);
  if (!ctx.ok) return ctx;
  const { c, item } = ctx;
  let inv = ctx.inv;
  const u = usoDoItem(item!.id);
  if (!u) return { ok: false, error: "Este item não tem uso na mesa." };
  const nome = nomeDoItem(item!);
  const gastar = () => {
    item!.quantidade = (item!.quantidade ?? 1) - 1;
  };
  const patch: Record<string, unknown> = {};
  let texto = "";
  let publico = true;
  let rolagem: Rolagem | undefined;
  let carta: Carta | undefined;
  let dados: number[] | undefined;

  switch (u.tipo) {
    case "consumivel":
      gastar();
      texto = `${c.name} ${PASSADO[u.verbo]} ${nome.toLowerCase()}`;
      break;

    case "remedio": {
      gastar();
      let cura = u.curaV ?? 0;
      let efeito = u.efeito;
      if (u.carta) {
        [carta] = drawCards(1);
        const preta = carta.naipe === "paus" || carta.naipe === "espadas";
        cura = preta ? 3 : 0;
        efeito = preta ? `${nomeCarta(carta)} — carta preta, cura 3V` : `${nomeCarta(carta)} — carta vermelha, ENVENENADO`;
        if (!preta) patch.conditions = [...new Set([...(c.conditions ?? []), "Envenenado"])];
      }
      if (cura > 0 && !u.soDescanso) {
        const stats = { ...((c.stats ?? {}) as Record<string, unknown>) };
        const r = calcularAjusteCorpo(
          { nome: c.name, hp: c.hp, maxHp: c.max_hp, dor: typeof stats.dor === "number" ? (stats.dor as number) : 0, condicoes: c.conditions ?? [] },
          { canal: "vida", delta: cura },
        );
        stats.dor = r.dor;
        patch.hp = r.hp;
        patch.stats = stats;
        patch.conditions = (patch.conditions as string[] | undefined) ?? r.condicoes;
      }
      texto = `${c.name} usou ${nome}: ${efeito}${u.custoAC ? ` (${u.custoAC} AC)` : ""}${u.soDescanso ? " — o Juiz aplica no descanso" : ""}`;
      break;
    }

    case "fogo":
    case "contador": {
      const porUnidade = usosPorUnidade(item!);
      if (porUnidade) {
        const resto = (item!.usos ?? porUnidade) - 1;
        if (resto <= 0) {
          gastar();
          item!.usos = undefined;
        } else item!.usos = resto;
      }
      texto = `${c.name}: ${u.verbo.toLowerCase()} — ${nome.toLowerCase()}`;
      publico = u.tipo === "contador";
      break;
    }

    case "luz": {
      if (!item!.acesa) {
        const oleo = inv.find((i) => i.id === u.combustivel && (i.quantidade ?? 1) > 0);
        if (!oleo) return { ok: false, error: "Sem óleo de lanterna." };
        oleo.quantidade = (oleo.quantidade ?? 1) - 1;
        item!.acesa = true;
        texto = `${c.name} acendeu a lanterna (gastou 1 óleo)`;
      } else {
        item!.acesa = false;
        texto = `${c.name} apagou a lanterna`;
      }
      break;
    }

    case "arremesso": {
      gastar();
      rolagem = rolar({
        tipo: "ataque",
        rotulo: `Arremesso · ${nome}`,
        quem: c.name,
        mod: fichaMesa(c).antecedentes.violencia ?? 0,
        na: defesaValida(opcoes.defesa ?? 5),
      });
      texto = `🧨 ${c.name} arremessou ${nome.toLowerCase()} (${u.custo}): ${rolagem.texto}`;
      break;
    }

    case "gadget": {
      if (u.gadget === "dados") {
        dados = [0, 0, 0].map(() => 1 + Math.floor(Math.random() * 6));
        texto = `🎲 ${c.name} jogou os dados: ${dados.join(" · ")}`;
      } else if (u.gadget === "baralho") {
        [carta] = drawCards(1);
        texto = `🃏 ${c.name} puxou do baralho: ${nomeCarta(carta)}`;
      } else return { ok: false, error: "Este item funciona só na sua tela." };
      break;
    }

    default:
      return { ok: false, error: "Use este item pelo painel próprio." };
  }

  if ((item!.quantidade ?? 1) < 0) return { ok: false, error: `Acabou: ${nome}.` };
  inv = limparVazios(inv);
  const { error } = await ctx.supabase.from("characters").update({ ...patch, inventory: inv }).eq("id", c.id);
  if (error) return { ok: false, error: error.message };
  await evento(sessionId, ctx.auth.user.id, { kind: "uso", personagemId: c.id, itemId: item!.id, rolagem, texto }, publico);
  return { ok: true, texto, rolagem, carta, dados };
}
