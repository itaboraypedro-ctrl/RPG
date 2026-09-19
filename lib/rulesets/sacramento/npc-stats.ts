// Fórmulas de NPC (Doc 2 §12, pp. 96–97 e 254–255) — LIVRO.
// NPC não usa os 4 atributos/8 antecedentes de PJ; a estatística central é o
// Nível de Canalhice (NdC), inteiro de 1 a 6. Derivados são sempre calculados,
// nunca digitados. Fichas publicadas com contagem divergente de habilidades são
// templates específicos com fonte (ex.: Hermes, 6 habilidades, p. 264) — não
// "corrigir" ao importar (lacuna G20).

export type NpcTipo = "comum" | "especial";
export type Ndc = 1 | 2 | 3 | 4 | 5 | 6;

export type NpcDerivedStats = {
  vida: number;
  dor: number;
  defesa: number;
  acoes: number; // reserva única, serve para mover E combater (não dividir em AC/M)
  testeBonus: number; // testes/ataques: 1d6 + NdC; 1 natural falha (p. 96)
  habilidadesModelo: number; // quantidade de habilidades do modelo especial (0 para comum)
};

// Habilidades por NdC no modelo especial (tabela p. 97).
const SPECIAL_ABILITY_COUNT: Record<Ndc, number> = {
  1: 1,
  2: 1,
  3: 2,
  4: 2,
  5: 4,
  6: 5,
};

export function deriveNpcStats(tipo: NpcTipo, ndc: Ndc): NpcDerivedStats {
  return {
    vida: (tipo === "comum" ? 3 : 6) * ndc,
    dor: 6,
    defesa: 5,
    acoes: ndc + (tipo === "comum" ? 1 : 3),
    testeBonus: ndc,
    habilidadesModelo: tipo === "especial" ? SPECIAL_ABILITY_COUNT[ndc] : 0,
  };
}
