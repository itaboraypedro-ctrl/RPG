// Kits visuais — variações de vestuário pré-geradas sobre as 120 bases.
// 9 kits × 120 bases = 1.080 imagens (em produção). Enquanto um kit não tem
// assets, ele aparece como "em breve" e o retrato usa a base.
// Escolha de kit é aparência, sem efeito mecânico (docs/01 §2).

import type { BaseVisual } from "./types";
import { baseId, baseImagePath } from "./bases";

export interface KitVisual {
  id: string;
  nome: string;
  descricao: string;
  /** false enquanto as imagens do kit não foram adicionadas a public/characters/kits/<id>/ */
  disponivel: boolean;
}

export const KITS: KitVisual[] = [
  { id: "base", nome: "Básico", descricao: "Camisa simples e calça de trabalho", disponivel: true },
  { id: "viajante", nome: "Viajante", descricao: "Chapéu de feltro, camisa, colete e bolsa", disponivel: false },
  { id: "tropeiro", nome: "Tropeiro", descricao: "Chapéu de couro, lenço, roupa resistente e botas", disponivel: false },
  { id: "elegante", nome: "Elegante", descricao: "Alfaiataria, cabelo arrumado e acessórios discretos", disponivel: false },
  { id: "trabalhador", nome: "Trabalhador", descricao: "Mangas dobradas, suspensórios e roupa desgastada", disponivel: false },
  { id: "forasteiro", nome: "Forasteiro", descricao: "Chapéu de aba larga, casaco comprido e lenço", disponivel: false },
  { id: "sertanejo", nome: "Sertanejo", descricao: "Roupa leve, tecidos rústicos e chapéu de palha", disponivel: false },
  { id: "bandido", nome: "Bandido", descricao: "Lenço no rosto, coldres e roupa escura", disponivel: false },
  { id: "cacador", nome: "Caçador de recompensas", descricao: "Sobretudo, distintivo improvisado e bandoleira", disponivel: false },
  { id: "indigena", nome: "Indígena", descricao: "Vestes tradicionais dos povos originários", disponivel: false },
];

export function kitById(id: string): KitVisual | undefined {
  return KITS.find((k) => k.id === id);
}

/** Retrato final: base pura ou variação do kit (quando os assets existirem). */
export function characterImagePath(base: BaseVisual, kitId: string | undefined): string {
  const kit = kitId ? kitById(kitId) : undefined;
  if (!kit || kit.id === "base" || !kit.disponivel) return baseImagePath(base);
  return `/characters/kits/${kit.id}/${baseId(base)}.webp`;
}
