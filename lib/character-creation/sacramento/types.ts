// Tipos do wizard Sacramento de criação de personagem.
// Regra normativa (docs/01 §2): aparência e história são identidade narrativa —
// nenhuma escolha aqui concede atributos, itens, dinheiro ou habilidades.

export type WizardStep = 1 | 2 | 3 | 4 | 5 | 6;

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

export type RostoModo = "foto" | "descricao" | "manter";

export interface RostoEscolha {
  modo: RostoModo;
  descricao?: string;
  aplicado: boolean;
}

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

export interface SacramentoCreationData {
  name?: string;
  base?: BaseVisual;
  /** Pedidos de personalização já aplicados na imagem atual, em ordem. */
  customizacoes?: string[];
  currentImageUrl?: string;
  imageHistory?: string[];
  rosto?: RostoEscolha;
  historiaModo?: "manual" | "ia";
  historia?: HistoriaEstruturada;
  historiaAprovada?: boolean;
  elementos?: ElementosHistoria;
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
