// Kits visuais — variações de vestuário pré-geradas sobre as 120 bases.
// 9 kits × 120 bases = 1.080 imagens quando completo. A coleção chega em
// pacotes parciais, então a disponibilidade é POR COMBINAÇÃO kit×base
// (KIT_COMBOS em kits-manifest.ts, gerado a partir dos assets em
// public/characters/kits/<id>/). Combinação ausente cai na base pura.
// Escolha de kit é aparência, sem efeito mecânico (docs/01 §2).

import type { BaseVisual } from "./types";
import { baseId, baseImagePath } from "./bases";
import { KIT_COMBOS } from "./kits-manifest";

export interface KitVisual {
  id: string;
  nome: string;
  descricao: string;
  /** false enquanto NENHUMA imagem do kit existe em public/characters/kits/<id>/ */
  disponivel: boolean;
}

function temAlgumAsset(id: string): boolean {
  for (const combo of KIT_COMBOS) if (combo.startsWith(`${id}/`)) return true;
  return false;
}

export const KITS: KitVisual[] = [
  { id: "base", nome: "Básico", descricao: "Camisa simples e calça de trabalho", disponivel: true },
  { id: "viajante", nome: "Viajante", descricao: "Chapéu de feltro, camisa, colete e bolsa", disponivel: temAlgumAsset("viajante") },
  { id: "tropeiro", nome: "Tropeiro", descricao: "Chapéu de couro, lenço, roupa resistente e botas", disponivel: temAlgumAsset("tropeiro") },
  { id: "elegante", nome: "Elegante", descricao: "Alfaiataria, cabelo arrumado e acessórios discretos", disponivel: temAlgumAsset("elegante") },
  { id: "trabalhador", nome: "Trabalhador", descricao: "Mangas dobradas, suspensórios e roupa desgastada", disponivel: temAlgumAsset("trabalhador") },
  { id: "forasteiro", nome: "Forasteiro", descricao: "Chapéu de aba larga, casaco comprido e lenço", disponivel: temAlgumAsset("forasteiro") },
  { id: "sertanejo", nome: "Sertanejo", descricao: "Roupa leve, tecidos rústicos e chapéu de palha", disponivel: temAlgumAsset("sertanejo") },
  { id: "bandido", nome: "Bandido", descricao: "Lenço no rosto, coldres e roupa escura", disponivel: temAlgumAsset("bandido") },
  { id: "cacador", nome: "Caçador de recompensas", descricao: "Sobretudo, distintivo improvisado e bandoleira", disponivel: temAlgumAsset("cacador") },
  { id: "indigena", nome: "Indígena", descricao: "Vestes tradicionais dos povos originários", disponivel: temAlgumAsset("indigena") },
];

export function kitById(id: string): KitVisual | undefined {
  return KITS.find((k) => k.id === id);
}

/** true quando existe imagem pronta deste kit para esta base exata. */
export function kitAvailableForBase(kitId: string, base: BaseVisual): boolean {
  if (kitId === "base") return true;
  return KIT_COMBOS.has(`${kitId}/${baseId(base)}`);
}

/** Retrato final: variação do kit quando o asset existe; senão, base pura. */
export function characterImagePath(base: BaseVisual, kitId: string | undefined): string {
  if (!kitId || !kitAvailableForBase(kitId, base) || kitId === "base") return baseImagePath(base);
  return `/characters/kits/${kitId}/${baseId(base)}.webp`;
}
