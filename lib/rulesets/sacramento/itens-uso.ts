// Como cada item do catálogo se comporta na barra de itens da ficha.
// Fonte das regras: docs/01 §9 (LIVRO pp. 52–65) e docs/02 (combate, p. 81–82).
// Item fora deste mapa é passivo: aparece na barra, abre detalhe, sem "usar".
// `decisao` marca o que o livro não fecha — o Juiz confirma antes de automatizar.

/** Calibres que o livro vende (p. 56): só três caixas existem. */
export type Calibre = "revolver" | "espingarda" | "fuzil";

/** Como a carga aparece na tela e como se recarrega. */
export type Mecanismo =
  | "tambor" // câmaras em círculo que giram a cada tiro
  | "pente" // fila vertical de balas que sobe
  | "canos" // 1–2 canos lado a lado, abre e troca cartucho
  | "tubo"; // fila horizontal sob o cano (fuzil/carabina)

export type UsoItem =
  | {
      tipo: "arma-fogo";
      calibre: Calibre;
      carga: number;
      /** Custo de recarga em AC — igual para 1 bala ou carga inteira (p. 82). */
      recargaAC: number;
      mecanismo: Mecanismo;
      /** Regra de cadência extra, texto curto. */
      cadencia?: string;
      decisao?: string;
    }
  | { tipo: "municao"; calibre: Calibre; balasPorCaixa: number }
  | { tipo: "porte"; suporte: "coldre" | "bandoleira" | "bainha"; balas?: { max: number }; decisao?: string }
  | { tipo: "arremesso"; custo: string; decisao?: string }
  | { tipo: "remedio"; efeito: string; custoAC?: number; curaV?: number; carta?: boolean; soDescanso?: boolean }
  | { tipo: "fogo"; usos: number | null; verbo: string }
  | { tipo: "luz"; combustivel: string }
  | { tipo: "consumivel"; verbo: "comer" | "beber" | "fumar" }
  | { tipo: "recipiente"; espacos: number; decisao?: string }
  | { tipo: "gadget"; gadget: "bussola" | "relogio" | "binoculo" | "dados" | "baralho" | "cantil" }
  | { tipo: "contador"; verbo: string; usos: number };

const CALIBRE_PENDENTE = "O livro não diz o calibre — confirmar com o Juiz.";

export const USO_ITENS: Record<string, UsoItem> = {
  /* ── Armas de fogo (p. 56 e 58) ── */
  revolver: { tipo: "arma-fogo", calibre: "revolver", carga: 6, recargaAC: 2, mecanismo: "tambor" },
  magnum: { tipo: "arma-fogo", calibre: "revolver", carga: 6, recargaAC: 2, mecanismo: "tambor", decisao: CALIBRE_PENDENTE },
  "pistola-automatica": {
    tipo: "arma-fogo", calibre: "revolver", carga: 11, recargaAC: 2, mecanismo: "pente",
    cadencia: "Um tiro adicional por AC", decisao: CALIBRE_PENDENTE,
  },
  "mauser-c69": { tipo: "arma-fogo", calibre: "revolver", carga: 15, recargaAC: 1, mecanismo: "pente", decisao: CALIBRE_PENDENTE },
  derringer: {
    tipo: "arma-fogo", calibre: "revolver", carga: 2, recargaAC: 1, mecanismo: "canos",
    decisao: "Carga 2 na tabela e 1 na descrição (C08). " + CALIBRE_PENDENTE,
  },
  garrucha: { tipo: "arma-fogo", calibre: "espingarda", carga: 1, recargaAC: 2, mecanismo: "canos", decisao: CALIBRE_PENDENTE },
  espingarda: { tipo: "arma-fogo", calibre: "espingarda", carga: 2, recargaAC: 1, mecanismo: "canos" },
  "cano-serrado": { tipo: "arma-fogo", calibre: "espingarda", carga: 2, recargaAC: 2, mecanismo: "canos" },
  fuzil: { tipo: "arma-fogo", calibre: "fuzil", carga: 5, recargaAC: 2, mecanismo: "tubo" },
  carabina: {
    tipo: "arma-fogo", calibre: "fuzil", carga: 7, recargaAC: 2, mecanismo: "tubo",
    cadencia: "Um tiro adicional na 1ª AC do turno, com −1 em Violência", decisao: CALIBRE_PENDENTE,
  },

  /* ── Munição e porte (p. 53 e 56) ── */
  "balas-revolver": { tipo: "municao", calibre: "revolver", balasPorCaixa: 12 },
  "balas-espingarda": { tipo: "municao", calibre: "espingarda", balasPorCaixa: 6 },
  "balas-fuzil": { tipo: "municao", calibre: "fuzil", balasPorCaixa: 6 },
  coldre: { tipo: "porte", suporte: "coldre", balas: { max: 36 } },
  bandoleira: {
    tipo: "porte", suporte: "bandoleira", balas: { max: 24 },
    decisao: "Texto diz 24 balas; a ilustração anuncia 12.",
  },
  bainha: { tipo: "porte", suporte: "bainha" },

  /* ── Arremesso ── */
  dinamite: {
    tipo: "arremesso", custo: "1 AC + 1 M, 5V em 1,5 m",
    decisao: "Tabela cobra 3 AC de recarga; arremesso é 1 AC + 1 M — não somar os dois.",
  },

  /* ── Farmácia (p. 64) ── */
  canfora: { tipo: "remedio", efeito: "Cura 1V em combate", custoAC: 1, curaV: 1 },
  adrenalina: { tipo: "remedio", efeito: "Recupera 3V; rebote de −1 Ação/−1 Mov.", curaV: 3 },
  "tonico-milagroso": { tipo: "remedio", efeito: "Tira uma carta: preta cura 3V, vermelha envenena", carta: true },
  "unguento-pasta": { tipo: "remedio", efeito: "Cura 1V no descanso", soDescanso: true },
  "pomada-cavalo": { tipo: "remedio", efeito: "Montaria recupera 3V no descanso", soDescanso: true },
  morfina: { tipo: "remedio", efeito: "Efeito a critério do Juiz" },

  /* ── Fogo e luz ── */
  "fosforos-mercearia": { tipo: "fogo", usos: 10, verbo: "Riscar" },
  "fosforos-armazem": { tipo: "fogo", usos: null, verbo: "Riscar" },
  isqueiro: { tipo: "fogo", usos: null, verbo: "Acender" },
  pederneira: { tipo: "fogo", usos: null, verbo: "Bater" },
  lanterna: { tipo: "luz", combustivel: "oleo-lanterna" },

  /* ── Comer, beber, fumar (só baixa a quantidade) ── */
  "carne-seca": { tipo: "consumivel", verbo: "comer" },
  cerveja: { tipo: "consumivel", verbo: "beber" },
  pinga: { tipo: "consumivel", verbo: "beber" },
  vinho: { tipo: "consumivel", verbo: "beber" },
  uisque: { tipo: "consumivel", verbo: "beber" },
  conhaque: { tipo: "consumivel", verbo: "beber" },
  paierinhos: { tipo: "consumivel", verbo: "fumar" },
  feijao: { tipo: "consumivel", verbo: "comer" },
  farinha: { tipo: "consumivel", verbo: "comer" },
  acucar: { tipo: "consumivel", verbo: "comer" },
  queijo: { tipo: "consumivel", verbo: "comer" },
  ovos: { tipo: "consumivel", verbo: "comer" },
  "pao-de-queijo": { tipo: "consumivel", verbo: "comer" },
  biscoitos: { tipo: "consumivel", verbo: "comer" },
  maras: { tipo: "consumivel", verbo: "comer" },
  cenouras: { tipo: "consumivel", verbo: "comer" },
  milho: { tipo: "consumivel", verbo: "comer" },
  ervilhas: { tipo: "consumivel", verbo: "comer" },
  atum: { tipo: "consumivel", verbo: "comer" },
  sardinha: { tipo: "consumivel", verbo: "comer" },
  sopa: { tipo: "consumivel", verbo: "comer" },
  chocolate: { tipo: "consumivel", verbo: "comer" },
  alcacuz: { tipo: "consumivel", verbo: "comer" },
  cafe: { tipo: "consumivel", verbo: "beber" },
  leite: { tipo: "consumivel", verbo: "beber" },
  "folhas-cha": { tipo: "consumivel", verbo: "beber" },
  tabaco: { tipo: "consumivel", verbo: "fumar" },

  /* ── Recipientes (p. 52 e 55) ── */
  mochila: { tipo: "recipiente", espacos: 10 },
  "bolsa-montaria": { tipo: "recipiente", espacos: 10, decisao: "Relação com os 15 espaços da montaria é ambígua." },
  carroca: { tipo: "recipiente", espacos: 30 },
  carro: { tipo: "recipiente", espacos: 20 },

  /* ── Pequenos objetos com graça no celular ── */
  bussola: { tipo: "gadget", gadget: "bussola" },
  "relogio-bolso": { tipo: "gadget", gadget: "relogio" },
  binoculo: { tipo: "gadget", gadget: "binoculo" },
  dados: { tipo: "gadget", gadget: "dados" },
  baralho: { tipo: "gadget", gadget: "baralho" },
  cantil: { tipo: "gadget", gadget: "cantil" },
  gazuas: { tipo: "contador", verbo: "Usar gazua", usos: 20 },
};

export function usoDoItem(id: string | undefined): UsoItem | null {
  return (id && USO_ITENS[id]) || null;
}

/** Armas que aceitam a munição de uma caixa. */
export function armasDoCalibre(calibre: Calibre): string[] {
  return Object.entries(USO_ITENS)
    .filter(([, u]) => u.tipo === "arma-fogo" && u.calibre === calibre)
    .map(([id]) => id);
}
