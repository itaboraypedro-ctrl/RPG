// Inventário em jogo (characters.inventory, jsonb): leitura e contas puras,
// usadas pelo servidor (que grava) e pela barra de itens (que só mostra).
// Munição é contada bala a bala em três camadas: arma → cinturão/bandoleira → caixa.

import { itemById } from "@/lib/character-creation/sacramento/catalogo";
import { usoDoItem, type Calibre, type UsoItem } from "./itens-uso";

export type ItemInventario = {
  id?: string;
  nome?: string;
  categoria?: string;
  quantidade?: number;
  precoPago?: number;
  espaco?: number | null;
  daMesa?: boolean;
  /** Arma de fogo: balas prontas para disparar. Ausente = carregada (armas antigas). */
  carga?: number;
  /** Revólver: cápsulas disparadas que ficam no tambor até a recarga. */
  vazias?: number;
  /** Caixa de munição: balas restantes na pilha. Cinturão/bandoleira: balas nas alças. */
  balas?: number;
  /** Bandoleira: calibre das balas nas alças (definido ao encher). */
  calibre?: Calibre;
  /** Fósforos (10): palitos restantes na caixa aberta. */
  usos?: number;
  /** Lanterna acesa. */
  acesa?: boolean;
};

export function lerInventario(raw: unknown): ItemInventario[] {
  return Array.isArray(raw) ? (raw as ItemInventario[]) : [];
}

/** Carga atual de uma arma de fogo (0 se não for arma). */
export function cargaDe(item: ItemInventario): number {
  const u = usoDoItem(item.id);
  if (u?.tipo !== "arma-fogo") return 0;
  return Math.max(0, Math.min(u.carga, item.carga ?? u.carga));
}

/** Balas numa caixa de munição (pilha inteira). */
export function balasDaCaixa(item: ItemInventario): number {
  const u = usoDoItem(item.id);
  if (u?.tipo !== "municao") return 0;
  return Math.max(0, item.balas ?? (item.quantidade ?? 1) * u.balasPorCaixa);
}

/** Calibre guardado num cinturão/bandoleira. O coldre só leva bala de revólver (p. 53). */
export function calibreDoPorte(item: ItemInventario): Calibre | null {
  if (item.id === "coldre") return "revolver";
  if (item.id === "bandoleira") return item.calibre ?? null;
  return null;
}

export function balasDoPorte(item: ItemInventario): number {
  const u = usoDoItem(item.id);
  return u?.tipo === "porte" && u.balas ? Math.max(0, Math.min(u.balas.max, item.balas ?? 0)) : 0;
}

export type Reserva = { porte: number; caixa: number };

/** Balas de um calibre fora da arma: nas alças e nas caixas. */
export function reservaDe(inv: ItemInventario[], calibre: Calibre): Reserva {
  let porte = 0;
  let caixa = 0;
  for (const it of inv) {
    if (calibreDoPorte(it) === calibre) porte += balasDoPorte(it);
    const u = usoDoItem(it.id);
    if (u?.tipo === "municao" && u.calibre === calibre) caixa += balasDaCaixa(it);
  }
  return { porte, caixa };
}

/** Tira `n` balas do inventário (alças primeiro, depois caixas). Muta `inv`. */
export function retirarBalas(
  inv: ItemInventario[],
  calibre: Calibre,
  n: number,
  soCaixa = false,
): { porte: number; caixa: number } {
  let falta = n;
  const tirado = { porte: 0, caixa: 0 };
  for (const it of inv) {
    if (falta <= 0 || soCaixa) break;
    if (calibreDoPorte(it) !== calibre) continue;
    const t = Math.min(falta, balasDoPorte(it));
    it.balas = balasDoPorte(it) - t;
    tirado.porte += t;
    falta -= t;
  }
  for (const it of inv) {
    if (falta <= 0) break;
    const u = usoDoItem(it.id);
    if (u?.tipo !== "municao" || u.calibre !== calibre) continue;
    const tem = balasDaCaixa(it);
    const t = Math.min(falta, tem);
    ajustarCaixa(it, tem - t, u.balasPorCaixa);
    tirado.caixa += t;
    falta -= t;
  }
  return tirado;
}

/** Atualiza balas e quantidade de caixas (uma caixa por 12/6 balas, arredondado pra cima). */
export function ajustarCaixa(it: ItemInventario, balas: number, porCaixa: number) {
  it.balas = balas;
  it.quantidade = Math.ceil(balas / porCaixa);
}

/** Remove entradas zeradas (caixa vazia, comida acabada). Armas e portes nunca somem. */
export function limparVazios(inv: ItemInventario[]): ItemInventario[] {
  return inv.filter((it) => {
    const u = usoDoItem(it.id);
    if (u?.tipo === "arma-fogo" || u?.tipo === "porte") return true;
    return (it.quantidade ?? 1) > 0;
  });
}

/* ── Barra de itens: ordem e selo ── */

const ORDEM: Record<UsoItem["tipo"] | "passivo", number> = {
  "arma-fogo": 0,
  arremesso: 1,
  porte: 2,
  municao: 3,
  remedio: 4,
  fogo: 5,
  luz: 6,
  consumivel: 7,
  gadget: 8,
  contador: 9,
  recipiente: 10,
  passivo: 11,
};

export type SlotBarra = { indice: number; item: ItemInventario; uso: UsoItem | null; selo: string | null };

export function slotsDaBarra(inv: ItemInventario[]): SlotBarra[] {
  return inv
    .map((item, indice) => {
      const uso = usoDoItem(item.id);
      let selo: string | null = null;
      if (uso?.tipo === "arma-fogo") selo = `${cargaDe(item)}/${uso.carga}`;
      else if (uso?.tipo === "municao") selo = String(balasDaCaixa(item));
      else if (uso?.tipo === "porte" && uso.balas) selo = String(balasDoPorte(item));
      else if ((uso?.tipo === "fogo" || uso?.tipo === "contador") && uso.usos) selo = String(usosRestantes(item));
      else if ((item.quantidade ?? 1) > 1) selo = `×${item.quantidade}`;
      return { indice, item, uso, selo };
    })
    .sort((a, b) => {
      const d = ORDEM[a.uso?.tipo ?? "passivo"] - ORDEM[b.uso?.tipo ?? "passivo"];
      return d !== 0 ? d : a.indice - b.indice;
    });
}

/** Fósforos (10), gazuas (20): usos da unidade aberta + unidades fechadas. */
export function usosPorUnidade(it: ItemInventario): number | null {
  const u = usoDoItem(it.id);
  return (u?.tipo === "fogo" || u?.tipo === "contador") && u.usos ? u.usos : null;
}

export function usosRestantes(it: ItemInventario): number {
  const porUnidade = usosPorUnidade(it);
  if (!porUnidade) return 0;
  const qtd = it.quantidade ?? 1;
  return qtd <= 0 ? 0 : (it.usos ?? porUnidade) + (qtd - 1) * porUnidade;
}

export function nomeDoItem(it: ItemInventario): string {
  return it.nome ?? (it.id ? itemById(it.id)?.nome : undefined) ?? "Item";
}

export const NOME_CALIBRE: Record<Calibre, string> = {
  revolver: "balas de revólver",
  espingarda: "cartuchos de espingarda",
  fuzil: "balas de fuzil",
};
