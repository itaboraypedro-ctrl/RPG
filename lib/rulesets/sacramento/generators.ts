// Geradores por cartas do livro — determinísticos, sem IA.
// Gerador de NPC: Doc 2 §12.2 (pp. 119–120). Gerador de missão: Doc 2 §16.5 (p. 104).
// Baralho comum de 52 cartas, sem curingas (Doc 2 §20.4).
// São ferramentas de inspiração, não regras obrigatórias de criação.

import type { Carta, CartaValor, Naipe } from "./types";

export const NAIPES: Naipe[] = ["paus", "copas", "espadas", "ouros"];
export const VALORES: CartaValor[] = [
  "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A",
];

export const NAIPE_SYMBOL: Record<Naipe, string> = {
  paus: "♣",
  copas: "♥",
  espadas: "♠",
  ouros: "♦",
};

export function buildDeck(): Carta[] {
  return NAIPES.flatMap((naipe) => VALORES.map((valor) => ({ valor, naipe })));
}

/** Saca `n` cartas distintas de um baralho novo embaralhado. */
export function drawCards(n: number): Carta[] {
  const deck = buildDeck();
  // Fisher–Yates
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck.slice(0, n);
}

/* ── Gerador de NPC (§12.2): uma carta por coluna; reação pelo naipe da ÚLTIMA carta ── */

type NpcTableRow = {
  nome: string;
  sobrenome: string;
  atividade: string;
  caracteristica: string;
};

const NPC_TABLE: Record<CartaValor, NpcTableRow> = {
  "2": { nome: "Valentina", sobrenome: "Santana", atividade: "Almofadinha", caracteristica: "Cicatriz marcante" },
  "3": { nome: "Marquinhos", sobrenome: "Fernandes", atividade: "Bandido", caracteristica: "Sotaque carregado" },
  "4": { nome: "Mariquita", sobrenome: "Camargo", atividade: "Cozinheiro", caracteristica: "Tique nervoso" },
  "5": { nome: "Bento/Bentinho", sobrenome: "Araújo", atividade: "Letrado", caracteristica: "Item curioso" },
  "6": { nome: "Maria", sobrenome: "Silva", atividade: "Médico", caracteristica: "Piadista" },
  "7": { nome: "Ana Rosa", sobrenome: "Santos", atividade: "Alfaiate", caracteristica: "Nariz quebrado" },
  "8": { nome: "Leôncio", sobrenome: "Prado", atividade: "Aposentado", caracteristica: "Muito forte" },
  "9": { nome: "Joana", sobrenome: "Mentes", atividade: "Militar", caracteristica: "Pouco perspicaz" },
  "10": { nome: "João", sobrenome: "Batista", atividade: "Xerife", caracteristica: "Voz melodiosa" },
  J: { nome: "Marília", sobrenome: "Azevedo", atividade: "Músico", caracteristica: "Elegante" },
  Q: { nome: "Luan", sobrenome: "Reis", atividade: "Gigolô", caracteristica: "Mau hálito" },
  K: { nome: "Castela", sobrenome: "Moraes", atividade: "Minerador", caracteristica: "Tapa-olho" },
  A: { nome: "Enzo", sobrenome: "Pereira", atividade: "Fazendeiro", caracteristica: "Mau cheiro" },
};

// Reação determinada pelo naipe da última carta (característica).
export const NPC_REACTION: Record<Naipe, string> = {
  paus: "Hostil",
  ouros: "Indiferente",
  espadas: "Amigável",
  copas: "Muito amigável",
};

export type GeneratedNpc = {
  cartas: { nome: Carta; sobrenome: Carta; atividade: Carta; caracteristica: Carta };
  nome: string;
  sobrenome: string;
  atividade: string;
  caracteristica: string;
  reacao: string;
};

export function generateNpc(): GeneratedNpc {
  const [c1, c2, c3, c4] = drawCards(4);
  return {
    cartas: { nome: c1, sobrenome: c2, atividade: c3, caracteristica: c4 },
    nome: NPC_TABLE[c1.valor].nome,
    sobrenome: NPC_TABLE[c2.valor].sobrenome,
    atividade: NPC_TABLE[c3.valor].atividade,
    caracteristica: NPC_TABLE[c4.valor].caracteristica,
    reacao: NPC_REACTION[c4.naipe],
  };
}

/* ── Gerador de missão de NPC (§16.5): três cartas, naipes ignorados ──
   1ª = pedido; 2ª = pessoa/vínculo; 3ª = reviravolta. O Juiz costura a
   combinação — a tabela fornece sementes, não frases prontas. */

type MissionTableRow = { pedido: string; vinculo: string; reviravolta: string };

const MISSION_TABLE: Record<CartaValor, MissionTableRow> = {
  A: { pedido: "Encontrar", vinculo: "Mãe", reviravolta: "Tornou-se xerife corrupto" },
  "2": { pedido: "Proteger", vinculo: "Irmã", reviravolta: "Foi sequestrada por bandidos" },
  "3": { pedido: "Provar", vinculo: "Amigo de infância", reviravolta: "Deve dinheiro a gangue" },
  "4": { pedido: "Resgatar", vinculo: "Filha", reviravolta: "Foi presa injustamente" },
  "5": { pedido: "Ajudar", vinculo: "Pai", reviravolta: "Adoeceu nas minas de Araguari" },
  "6": { pedido: "Recuperar", vinculo: "Mentor", reviravolta: "Lidera gangue perigosa" },
  "7": { pedido: "Descobrir", vinculo: "Interesse romântico", reviravolta: "Perdeu-se nos ermos" },
  "8": { pedido: "Investigar", vinculo: "Criança órfã", reviravolta: "Tornou-se cultista fanático" },
  "9": { pedido: "Revelar", vinculo: "Filho", reviravolta: "Abriu bar e precisa de suprimentos" },
  "10": { pedido: "Curar", vinculo: "Irmão", reviravolta: "Quer vingança contra antigo inimigo" },
  J: { pedido: "Defender", vinculo: "Cunhado", reviravolta: "Sabe a localização de tesouro" },
  Q: { pedido: "Capturar", vinculo: "Avô", reviravolta: "Tornou-se ladrão de tumbas" },
  K: { pedido: "Rastrear", vinculo: "Parceiro de bando", reviravolta: "É magnata ferroviário rico e corrupto" },
};

export type GeneratedMission = {
  cartas: { pedido: Carta; vinculo: Carta; reviravolta: Carta };
  pedido: string;
  vinculo: string;
  reviravolta: string;
};

export function generateMission(): GeneratedMission {
  const [c1, c2, c3] = drawCards(3);
  return {
    cartas: { pedido: c1, vinculo: c2, reviravolta: c3 },
    pedido: MISSION_TABLE[c1.valor].pedido,
    vinculo: MISSION_TABLE[c2.valor].vinculo,
    reviravolta: MISSION_TABLE[c3.valor].reviravolta,
  };
}

export function formatCard(c: Carta): string {
  return `${c.valor}${NAIPE_SYMBOL[c.naipe]}`;
}
