// Regras mecânicas de criação — fonte: docs/01_Sacramento_Criador_de_Personagens.md.
// §3 condições iniciais e atributos · §4 antecedentes · §8 montaria · §10 evolução.
// Interpretações explicitadas (lacunas do livro) estão comentadas com o ID da lacuna.

import type {
  AntecedenteId,
  AtributoId,
  FichaMecanica,
  Nivel,
} from "./types";

export interface AtributoInfo {
  id: AtributoId;
  nome: string;
  efeito: string;
  resistencias: string;
}

/** LIVRO pp. 25–30: 4 pontos entre os quatro atributos; podem ficar em 0. */
export const ATRIBUTOS: AtributoInfo[] = [
  {
    id: "fisico",
    nome: "Físico",
    efeito: "+1 Círculo de Vida por ponto",
    resistencias: "Resistir a veneno, doença, temperatura, drogas e ferimentos",
  },
  {
    id: "velocidade",
    nome: "Velocidade",
    efeito: "+1 Movimento por turno",
    resistencias: "Reflexos, esquiva de perigos e explosões",
  },
  {
    id: "intelecto",
    nome: "Intelecto",
    efeito: "+1 ponto para distribuir em Antecedentes",
    resistencias: "Memória, perceber mentiras e influências mentais",
  },
  {
    id: "coragem",
    nome: "Coragem",
    efeito: "+1 Ação de Combate por turno",
    resistencias: "Medo, intimidação, estresse e força de vontade",
  },
];

export interface AntecedenteInfo {
  id: AntecedenteId;
  nome: string;
  abrangencia: string;
}

/** LIVRO pp. 30–33. Exemplos de uso, não pré-requisitos de profissão. */
export const ANTECEDENTES: AntecedenteInfo[] = [
  { id: "atencao", nome: "Atenção", abrangencia: "Notar detalhes, emboscadas, passagens e armadilhas" },
  { id: "medicina", nome: "Medicina", abrangencia: "Tratar pessoas e animais, avaliar doença e veneno" },
  { id: "montaria", nome: "Montaria", abrangencia: "Cavalgar, laçar, adestrar e lidar com animais" },
  { id: "negocios", nome: "Negócios", abrangencia: "Convencer, mentir, vender, seduzir e negociar" },
  { id: "roubo", nome: "Roubo", abrangencia: "Furtividade, furtar, esconder e trapacear" },
  { id: "suor", nome: "Suor", abrangencia: "Nadar, correr, saltar, escalar e ofícios manuais" },
  { id: "tradicao", nome: "Tradição", abrangencia: "Cultura, regiões, plantas, animais e saberes" },
  { id: "violencia", nome: "Violência", abrangencia: "Atirar, lutar e estratégias de combate" },
];

/** LIVRO p. 49 — XP acumulado por marco (interpretação C09, confirmável pela mesa). */
export const XP_POR_NIVEL: Record<Nivel, number> = { 1: 0, 2: 10, 3: 20, 4: 30, 5: 45, 6: 65 };

/** Ganhos acumulados até o nível (LIVRO p. 49). O nível 5 não concede habilidade. */
export function ganhosAteNivel(nivel: Nivel) {
  return {
    pontosAtributoExtras: ([3, 4, 5, 6] as number[]).filter((n) => n <= nivel).length,
    pontosAntecedenteExtras: nivel >= 2 ? 1 : 0,
    habilidadesExtras: ([2, 3, 4, 6] as number[]).filter((n) => n <= nivel).length,
    // Vida por nível: max(Físico,1) nos níveis 2/4/5 e +3 no nível 6.
    // Lacuna C10: usamos o Físico atual da ficha (interpretação explicitada).
    niveisComVidaPorFisico: ([2, 4, 5] as number[]).filter((n) => n <= nivel).length,
    vidaFixaNivel6: nivel >= 6 ? 3 : 0,
  };
}

export function orcamentoAtributos(nivel: Nivel): number {
  return 4 + ganhosAteNivel(nivel).pontosAtributoExtras;
}

export function orcamentoAntecedentes(nivel: Nivel, intelecto: number): number {
  return 4 + intelecto + ganhosAteNivel(nivel).pontosAntecedenteExtras;
}

export function totalHabilidades(nivel: Nivel): number {
  return 2 + ganhosAteNivel(nivel).habilidadesExtras;
}

export interface Derivados {
  vidaMaxima: number;
  capacidadeDor: number;
  defesa: number;
  movimentos: number;
  acoesCombate: number;
  /** Iniciativa usa cartas na partida, não um número (pp. 26, 78). */
  cartasIniciativa: number;
  xp: number;
}

export function calcularDerivados(ficha: FichaMecanica, parrudezaCount: number): Derivados {
  const { fisico, velocidade, coragem } = ficha.atributos;
  const g = ganhosAteNivel(ficha.nivel);
  const vidaPorNiveis = g.niveisComVidaPorFisico * Math.max(fisico, 1) + g.vidaFixaNivel6;
  return {
    vidaMaxima: 6 + fisico + 2 * parrudezaCount + vidaPorNiveis,
    capacidadeDor: 6,
    defesa: 5, // Velocidade não aumenta a Defesa (p. 26)
    movimentos: 1 + velocidade,
    acoesCombate: 1 + coragem,
    cartasIniciativa: 1, // Coldre de Sabão e redenção completa mudam isso em jogo
    xp: XP_POR_NIVEL[ficha.nivel],
  };
}

export interface ValidacaoFicha {
  atributosGastos: number;
  atributosOrcamento: number;
  antecedentesGastos: number;
  antecedentesOrcamento: number;
  habilidadesEscolhidas: number;
  habilidadesTotal: number;
  erros: string[];
}

export function validarFicha(ficha: FichaMecanica): ValidacaoFicha {
  const erros: string[] = [];
  const atributosGastos = Object.values(ficha.atributos).reduce((a, b) => a + b, 0);
  const atributosOrcamento = orcamentoAtributos(ficha.nivel);
  const antecedentesGastos = Object.values(ficha.antecedentes).reduce((a, b) => a + b, 0);
  const antecedentesOrcamento = orcamentoAntecedentes(ficha.nivel, ficha.atributos.intelecto);
  const habilidadesTotal = totalHabilidades(ficha.nivel);

  if (atributosGastos !== atributosOrcamento) {
    erros.push(
      `Distribua exatamente ${atributosOrcamento} pontos de atributo (faltam ${atributosOrcamento - atributosGastos}).`,
    );
  }
  if (antecedentesGastos !== antecedentesOrcamento) {
    erros.push(
      `Distribua exatamente ${antecedentesOrcamento} pontos de antecedente (faltam ${antecedentesOrcamento - antecedentesGastos}).`,
    );
  }

  // Teto de 2 por antecedente é regra do NÍVEL 1 (p. 30). No nível 2+ existe
  // um único ponto de progressão, então no máximo um antecedente pode ir a 3.
  const acimaDe2 = Object.values(ficha.antecedentes).filter((v) => v > 2);
  if (ficha.nivel === 1 && acimaDe2.length > 0) {
    erros.push("No nível 1, cada antecedente comporta no máximo 2 pontos.");
  } else if (ficha.nivel >= 2) {
    if (acimaDe2.some((v) => v > 3)) erros.push("Nenhum antecedente pode passar de 3 na criação.");
    if (acimaDe2.length > 1)
      erros.push("Só o ponto de progressão do nível 2 pode elevar um antecedente acima de 2.");
  }

  if (ficha.habilidades.length !== habilidadesTotal) {
    erros.push(
      `Escolha ${habilidadesTotal} habilidade${habilidadesTotal > 1 ? "s" : ""} (${ficha.habilidades.length} escolhida${ficha.habilidades.length === 1 ? "" : "s"}).`,
    );
  }

  if (ficha.montaria) {
    const soma = ficha.montaria.potencia + ficha.montaria.resistencia;
    if (soma !== 3) erros.push("A montaria distribui exatamente 3 pontos entre Potência e Resistência.");
  }

  return {
    atributosGastos,
    atributosOrcamento,
    antecedentesGastos,
    antecedentesOrcamento,
    habilidadesEscolhidas: ficha.habilidades.length,
    habilidadesTotal,
    erros,
  };
}

/** LIVRO pp. 50–51: vida da montaria = 6 + Resistência; dor 6; fidelidade 0. */
export function derivadosMontaria(potencia: number, resistencia: number) {
  return {
    vidaMaxima: 6 + resistencia,
    capacidadeDor: 6,
    fidelidade: 0,
    deslocamentoPorMovimento: 10, // metros
    testeCorridaBonus: potencia, // 1d6 + Potência + Montaria do PJ, NA 6
  };
}
