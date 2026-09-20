// Tipos do wizard Sacramento de criação de personagem.
// Regra normativa (docs/01 §2): aparência e história são identidade narrativa —
// nenhuma escolha visual concede atributos, itens, dinheiro ou habilidades.
// A ficha mecânica segue docs/01 §3 (condições iniciais), §4 (antecedentes),
// §5 (habilidades), §8 (montaria) e §10 (evolução por nível).

export type WizardStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type Apresentacao = "feminino" | "masculino";
export type TomDePele = "muito-claro" | "claro" | "medio" | "escuro" | "muito-escuro";
export type FaixaEtaria = "jovem-adulto" | "adulto" | "idoso";
export type TipoFisico = "magro" | "mediano" | "musculoso" | "corpulento";

export interface BaseVisual {
  apresentacao: Apresentacao;
  tomDePele: TomDePele;
  faixaEtaria: FaixaEtaria;
  tipoFisico: TipoFisico;
}

// ---------- Narrativa ----------

export interface VinculoNarrativo {
  nome: string;
  relacao: string;
  detalhe?: string;
}

export interface ElementosHistoria {
  conceito: string;
  origem: string;
  ocupacao: string;
  familia: "sim" | "nao" | "complicada" | "";
  familiaDetalhe: string;
  passadoSombrio: boolean;
  passadoDetalhe: string;
  faccaoId: string; // "nenhuma", id canônico ou "outra"
  faccaoRelacao: string;
  vinculos: VinculoNarrativo[];
  redencaoTrilhaId: string; // id de modelo do livro ou "propria"
  redencaoPremissa: string;
}

export interface RedencaoGerada {
  trilhaId: string;
  trilhaNome: string;
  premissa: string;
  /** Sempre 6 passos; o último é o encerramento (docs/01 §6). */
  passos: string[];
}

export interface CapituloHistoria {
  titulo: string;
  texto: string;
}

export interface HistoriaEstruturada {
  resumo: string;
  capitulos: CapituloHistoria[];
  familia: string;
  vinculos: VinculoNarrativo[];
  redencao: RedencaoGerada;
  /** Ganchos abertos para o Juiz — situações, nunca resultados (docs/02 §3.3). */
  ganchos: string[];
}

export type HistoriaSecao = "resumo" | "capitulos" | "familia" | "vinculos" | "redencao" | "ganchos";

// ---------- Ficha mecânica ----------

export type AtributoId = "fisico" | "velocidade" | "intelecto" | "coragem";

export type AntecedenteId =
  | "atencao"
  | "medicina"
  | "montaria"
  | "negocios"
  | "roubo"
  | "suor"
  | "tradicao"
  | "violencia";

export type Nivel = 1 | 2 | 3 | 4 | 5 | 6;

export interface MontariaCriacao {
  /** Qual animal comprado esta ficha configura. */
  animal: "cavalo" | "mula";
  nome: string;
  descricao: string;
  potencia: number;
  resistencia: number;
  /** C01: o livro não dá cavalo grátis — registrar como a montaria foi obtida. */
  origem: "juiz" | "comprar" | "";
}

export interface CompraItem {
  id: string;
  quantidade: number;
}

export interface FichaMecanica {
  nivel: Nivel;
  atributos: Record<AtributoId, number>;
  antecedentes: Record<AntecedenteId, number>;
  /** IDs das habilidades adquiridas; só Parrudeza pode repetir (docs/01 §5). */
  habilidades: string[];
  /** Uma ficha por animal comprado na loja (cavalo/mula). */
  montarias: MontariaCriacao[];
  /** Compras iniciais com os $200 (preço máximo, sem barganha — p. 52). */
  compras: CompraItem[];
}

export const FICHA_INICIAL: FichaMecanica = {
  nivel: 1,
  atributos: { fisico: 0, velocidade: 0, intelecto: 0, coragem: 0 },
  antecedentes: {
    atencao: 0,
    medicina: 0,
    montaria: 0,
    negocios: 0,
    roubo: 0,
    suor: 0,
    tradicao: 0,
    violencia: 0,
  },
  habilidades: [],
  montarias: [],
  compras: [],
};

// ---------- Estado do wizard ----------

export interface SacramentoCreationData {
  name?: string;
  base?: BaseVisual;
  /** Kit visual aplicado sobre a base ("base" = sem kit). */
  kitId?: string;
  elementos?: ElementosHistoria;
  historiaModo?: "manual" | "ia";
  historia?: HistoriaEstruturada;
  historiaAprovada?: boolean;
  ficha?: FichaMecanica;
}

export const ELEMENTOS_VAZIOS: ElementosHistoria = {
  conceito: "",
  origem: "",
  ocupacao: "",
  familia: "",
  familiaDetalhe: "",
  passadoSombrio: false,
  passadoDetalhe: "",
  faccaoId: "nenhuma",
  faccaoRelacao: "",
  vinculos: [],
  redencaoTrilhaId: "",
  redencaoPremissa: "",
};
