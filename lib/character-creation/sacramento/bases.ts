// Catálogo das 120 bases visuais (2 apresentações × 5 tons × 3 idades × 4 físicos).
// Imagens em public/characters/bases/, nomeadas de forma determinística.
// Escolha visual é livre e sem efeito mecânico (docs/01 §2).

import type {
  Apresentacao,
  BaseVisual,
  FaixaEtaria,
  TipoFisico,
  TomDePele,
} from "./types";

export const APRESENTACOES: { id: Apresentacao; label: string }[] = [
  { id: "feminino", label: "Feminina" },
  { id: "masculino", label: "Masculina" },
];

export const TONS_DE_PELE: { id: TomDePele; label: string; swatch: string }[] = [
  { id: "muito-claro", label: "Muito claro", swatch: "#f3d9c2" },
  { id: "claro", label: "Claro", swatch: "#e3b592" },
  { id: "medio", label: "Médio", swatch: "#b97f57" },
  { id: "escuro", label: "Escuro", swatch: "#7c4a2d" },
  { id: "muito-escuro", label: "Muito escuro", swatch: "#4a2c1a" },
];

// Idades aparentes aproximadas, não limites de regra.
export const FAIXAS_ETARIAS: { id: FaixaEtaria; label: string; hint: string }[] = [
  { id: "jovem-adulto", label: "Jovem", hint: "~25 anos" },
  { id: "adulto", label: "Adulto", hint: "~45 anos" },
  { id: "idoso", label: "Veterano", hint: "~70 anos" },
];

export const TIPOS_FISICOS: { id: TipoFisico; label: string }[] = [
  { id: "magro", label: "Magro" },
  { id: "mediano", label: "Mediano" },
  { id: "musculoso", label: "Musculoso" },
  { id: "corpulento", label: "Corpulento" },
];

export const BASE_PADRAO: BaseVisual = {
  apresentacao: "masculino",
  tomDePele: "medio",
  faixaEtaria: "adulto",
  tipoFisico: "mediano",
};

export function baseId(base: BaseVisual): string {
  return `${base.apresentacao}_${base.tomDePele}_${base.faixaEtaria}_${base.tipoFisico}`;
}

/** Caminho público servido pelo app (WebP otimizado). */
export function baseImagePath(base: BaseVisual): string {
  return `/characters/bases/${baseId(base)}.webp`;
}
