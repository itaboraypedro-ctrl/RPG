// Tipos de domínio do preset Sacramento.
// Fonte: docs/01_Sacramento_Criador_de_Personagens.md e
//        docs/02_Sacramento_Gerenciador_de_Partidas.md (Sacramento RPG, 1ª ed., dez/2024).
// `paginas` sempre referencia a paginação impressa do livro.

/** Rótulo normativo dos docs (Doc 1 §1.1). */
export type OrigemRegra = "livro" | "interpretacao" | "regra_de_mesa";

/** Elemento canônico do livro vs. criação da campanha (Doc 2 §5.3 / GM-41). */
export type OrigemElemento = "canon" | "campanha";

export type Naipe = "paus" | "copas" | "espadas" | "ouros";

export type CartaValor =
  | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10"
  | "J" | "Q" | "K" | "A";

export type Carta = { valor: CartaValor; naipe: Naipe };

/* ── Lugares (Doc 2 §5.3 — guia condensado) ── */
export type SacramentoPlace = {
  id: string;
  nome: string;
  caracteristicas: string;
  conflitos: string;
  paginas: [number, number];
  /** Arte do lugar em public/ (ex.: /story/places/tupaciguara.webp). */
  imagem?: string;
};

/* ── Facções (Doc 2 §14) ── */
export type SacramentoFactionMember = {
  papel: string;
  tipo: "comum" | "especial";
  ndc: string; // faixa como impressa, ex.: "2–4" ou "6"
  habilidades: string[];
  /** Nomes sem verbete ("Dedo Furioso", "Artes Marciais") — exigem decisão do Juiz (G21). */
  habilidadesPendentes?: string[];
  paginas: number[];
};

export type SacramentoFaction = {
  id: string;
  nome: string;
  categoria: "gangue" | "lei";
  resumo: string;
  membros: SacramentoFactionMember[];
  paginas: number[];
  /** Brasão pintado em public/ (ex.: /story/factions/curupira.webp). */
  emblema?: string;
};

/* ── Timeline (Doc 2 §5.2) ── */
export type TimelineAnchor = { ano: string; marco: string };

/* ── Elementos da campanha (payload de campaign_elements.data) ── */

export type CampaignPlaceData = {
  nome: string;
  origem: OrigemElemento;
  /** Preenchido quando origem === 'canon'. */
  canonId?: string;
  descricao?: string;
  conflitos?: string;
  notasDoJuiz?: string;
  paginas?: number[];
  /** URL pública no bucket `campaign-images` (migration 006). */
  imagem?: string;
};

export type CampaignFactionData = {
  nome: string;
  origem: OrigemElemento;
  canonId?: string;
  resumo?: string;
  agenda?: string;
  ameaca?: string;
  notasDoJuiz?: string;
  paginas?: number[];
  /** Brasão da facção (arte canônica em public/ ou upload no storage). */
  emblema?: string;
};

/** Campos narrativos de NPC (Doc 2 §12.1) + ficha mecânica opcional (§12). */
export type CampaignNpcData = {
  nome: string;
  origem: OrigemElemento;
  apelido?: string;
  ocupacao?: string;
  descricao?: string;
  desejo?: string;
  medo?: string;
  segredo?: string; // sempre gm_only na prática (o elemento inteiro controla visibilidade)
  vinculos?: string;
  atitude?: string;
  faccao?: string;
  localizacao?: string;
  agenda?: string;
  /** Sorteio do gerador §12.2, quando usado. */
  cartasGeradas?: { nome: Carta; sobrenome: Carta; atividade: Carta; caracteristica: Carta };
  /** Ficha mecânica opcional — derivados são calculados por npc-stats, nunca digitados. */
  ficha?: {
    tipo: "comum" | "especial";
    ndc: 1 | 2 | 3 | 4 | 5 | 6;
    habilidades?: string[];
  };
};

/**
 * Cena (Doc 2 §3.2). Nenhum campo obrigatório além do título:
 * "Não tornar todos os campos obrigatórios para iniciar uma cena."
 * Fatos verdadeiros e segredos são do Juiz → elemento gm_only.
 */
export type CampaignSceneData = {
  titulo: string;
  lugar?: string;
  momento?: string;
  participantes?: string;
  descricaoPublica?: string;
  fatosVerdadeiros?: string;
  rumores?: string;
  segredosDoJuiz?: string;
  elementosInterativos?: string;
  testesPossiveis?: string; // possíveis, nunca automaticamente exigidos (§3.2)
  consequenciasPossiveis?: string;
};

/** Missão (Doc 2 §3.2). Prazo ficcional só se houver fonte ou decisão do Juiz. */
export type CampaignMissionData = {
  titulo: string;
  proponente?: string;
  objetivo?: string;
  envolvidos?: string;
  local?: string;
  motivo?: string;
  recompensa?: string;
  prazoFiccional?: string;
  criteriosDeConclusao?: string;
  vinculo?: string; // redenção, base ou facção
  consequencias?: string; // sucesso, fracasso e abandono
  /** Sorteio do gerador §16.5, quando usado. */
  cartasGeradas?: { pedido: Carta; vinculo: Carta; reviravolta: Carta };
};

export type CampaignCalendarEventData = {
  titulo: string;
  origem: OrigemElemento;
  quando: string; // data/mês ficcional — não confundir com data real
  descricao?: string;
  paginas?: number[];
};

export type CampaignSecretNoteData = {
  titulo: string;
  texto: string;
};
