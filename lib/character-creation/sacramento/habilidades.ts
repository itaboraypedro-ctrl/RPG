// Catálogo das 30 habilidades de PJ — fonte: docs/01 §5 (LIVRO pp. 34–40).
// Resumos operacionais fiéis; não incluir as 9 habilidades exclusivas de vilão.
// Só Parrudeza pode ser adquirida mais de uma vez.

export type HabilidadeCategoria = "combate" | "profissao";

export interface HabilidadeInfo {
  id: string;
  nome: string;
  categoria: HabilidadeCategoria;
  resumo: string;
  pagina: number;
  repetivel?: boolean;
  /** Requisito de funcionamento (a aquisição fica inativa se violado — PJ-08/09). */
  requisito?: { texto: string; valida: (atributos: { intelecto: number }, violencia: number) => boolean };
}

export const HABILIDADES: HabilidadeInfo[] = [
  // ---- Combate (15) ----
  {
    id: "armas-da-natureza",
    nome: "Armas da Natureza",
    categoria: "combate",
    resumo: "Com armas rústicas ou rudimentares, adiciona Físico em Vida ao dano.",
    pagina: 35,
  },
  {
    id: "ataque-sacana",
    nome: "Ataque Sacana",
    categoria: "combate",
    resumo: "Ataque surpresa com faca, navalha ou lâmina oculta causa dano adicional de 1/2/3 Vida.",
    pagina: 35,
  },
  {
    id: "briga-de-bar",
    nome: "Briga de Bar",
    categoria: "combate",
    resumo: "Arma improvisada pequena/média causa 3 Dor; grande causa 1 Vida com −1 em Violência.",
    pagina: 35,
  },
  {
    id: "coldre-de-sabao",
    nome: "Coldre de Sabão",
    categoria: "combate",
    resumo: "Saca duas cartas de iniciativa e escolhe a que preferir.",
    pagina: 35,
  },
  {
    id: "dedo-quente",
    nome: "Dedo Quente",
    categoria: "combate",
    resumo: "+1 em Violência com revólver; contra alvo sem cobertura, +1/2/3 Vida no dano.",
    pagina: 35,
  },
  {
    id: "furia-dos-aflitos",
    nome: "Fúria dos Aflitos",
    categoria: "combate",
    resumo: "No combate, −1 Defesa e +3 Dor no dano dos ataques corpo a corpo.",
    pagina: 36,
  },
  {
    id: "gatilho-furioso",
    nome: "Gatilho Furioso",
    categoria: "combate",
    resumo: "Com revólver, gasta 1 Ação + 1 Movimento para efetuar dois tiros.",
    pagina: 36,
  },
  {
    id: "livramento",
    nome: "Livramento",
    categoria: "combate",
    resumo: "Na primeira queda do combate, cai e recupera 2 Vida em vez de testar a morte.",
    pagina: 36,
  },
  {
    id: "marretada",
    nome: "Marretada",
    categoria: "combate",
    resumo: "Ataques desarmados recebem +Físico em Dor.",
    pagina: 36,
  },
  {
    id: "parrudeza",
    nome: "Parrudeza",
    categoria: "combate",
    resumo: "+2 Vida máxima. Pode ser escolhida várias vezes, gastando uma escolha a cada vez.",
    pagina: 36,
    repetivel: true,
  },
  {
    id: "punhos-do-oriente",
    nome: "Punhos do Oriente",
    categoria: "combate",
    resumo: "Permite usar Movimentos para realizar ataques desarmados.",
    pagina: 36,
  },
  {
    id: "quebra-ossos",
    nome: "Quebra-Ossos",
    categoria: "combate",
    resumo: "Por 1 Movimento + 1 Ação, imobiliza ou causa 1V+1D / 1V+2D / 2V+3D.",
    pagina: 37,
  },
  {
    id: "sorte-dos-covardes",
    nome: "Sorte dos Covardes",
    categoria: "combate",
    resumo: "Saca uma carta no início do combate: paus +2 Ações; copas +2 Vida; espadas +2 Movimentos; ouros +1 Violência.",
    pagina: 37,
    requisito: {
      texto: "Só funciona com Intelecto ≤ 1 e Violência ≤ 2",
      valida: (atributos, violencia) => atributos.intelecto <= 1 && violencia <= 2,
    },
  },
  {
    id: "valei-me",
    nome: "Valei-me",
    categoria: "combate",
    resumo: "Fabrica explosivos (Tradição NA 7) com dano 2/3/4 Vida; usar custa 2 Ações + 1 Movimento.",
    pagina: 37,
  },
  {
    id: "zoi-de-gaviao",
    nome: "Zói de Gavião",
    categoria: "combate",
    resumo: "+1 em Violência com fuzil ou arco longo; em posição vantajosa, +1/2/3 Vida no disparo.",
    pagina: 37,
  },
  // ---- Profissão (15) ----
  {
    id: "as-na-manga",
    nome: "Às na Manga",
    categoria: "profissao",
    resumo: "Em testes envolvendo jogos de cartas, rola 2d6 e usa o melhor.",
    pagina: 38,
  },
  {
    id: "boca-na-botija",
    nome: "Boca na Botija",
    categoria: "profissao",
    resumo: "Melhor de 2d6 em Atenção; a Defesa não cai por surpresa antes do combate.",
    pagina: 38,
  },
  {
    id: "cancao-da-emocao",
    nome: "Canção da Emoção",
    categoria: "profissao",
    resumo: "Uma vez por sessão, performa e paga 2 Ações por benefício ao bando (+1 Movimento no nível 1; mais efeitos ao subir).",
    pagina: 38,
  },
  {
    id: "chamego",
    nome: "Chamego",
    categoria: "profissao",
    resumo: "Melhor de 2d6 para laçar; −1 nos testes de quem tenta se soltar do laço.",
    pagina: 39,
  },
  {
    id: "cuspe-e-cola",
    nome: "Cuspe e Cola",
    categoria: "profissao",
    resumo: "Cura em combate junto do paciente: 2 Ações por Vida curada, com limite de usos por combate.",
    pagina: 39,
  },
  {
    id: "fogo-no-ceu",
    nome: "Fogo no Céu",
    categoria: "profissao",
    resumo: "Melhor de 2d6 com explosivos; falha crítica não atinge o próprio usuário.",
    pagina: 39,
  },
  {
    id: "fumaca-na-agua",
    nome: "Fumaça na Água",
    categoria: "profissao",
    resumo: "Melhor de 2d6 em Roubo para furtar, esconder-se ou mover-se em silêncio.",
    pagina: 39,
  },
  {
    id: "galope-certeiro",
    nome: "Galope Certeiro",
    categoria: "profissao",
    resumo: "Melhor de 2d6 em Montaria sobre o próprio cavalo; ignora penalidade de montaria estranha.",
    pagina: 39,
  },
  {
    id: "nao-vai-doer-nadinha",
    nome: "Não Vai Doer Nadinha",
    categoria: "profissao",
    resumo: "Melhor de 2d6 em Medicina e cura adicional de 1/2/4 Vida.",
    pagina: 39,
  },
  {
    id: "natural-da-natureza",
    nome: "Natural da Natureza",
    categoria: "profissao",
    resumo: "Melhor de 2d6 em Suor; acha plantas, ervas e abrigo no mato sem teste.",
    pagina: 40,
  },
  {
    id: "sabia-imperatriz",
    nome: "Sabiá Imperatriz",
    categoria: "profissao",
    resumo: "Melhor de 2d6 em Negócios.",
    pagina: 40,
  },
  {
    id: "sabugos-e-peconhas",
    nome: "Sabugos e Peçonhas",
    categoria: "profissao",
    resumo: "Produz venenos que causam 1 Dor por ação do alvo envenenado, até cura ou inconsciência.",
    pagina: 40,
  },
  {
    id: "salve-se-quem-puder",
    nome: "Salve-se Quem Puder",
    categoria: "profissao",
    resumo: "Melhor de 2d6 para escapar ou fugir; +1 Movimento exclusivo para fuga.",
    pagina: 40,
  },
  {
    id: "sorrisao-chapeu-na-mao",
    nome: "Sorrisão, Chapéu na Mão",
    categoria: "profissao",
    resumo: "Compra itens comuns com 25% de desconto e vende por 25% a mais.",
    pagina: 40,
  },
  {
    id: "zoi-de-coruja",
    nome: "Zói de Coruja",
    categoria: "profissao",
    resumo: "Melhor de 2d6 em Tradição para recordar conhecimento.",
    pagina: 40,
  },
];

export function habilidadeById(id: string): HabilidadeInfo | undefined {
  return HABILIDADES.find((h) => h.id === id);
}

export function contarParrudeza(habilidades: string[]): number {
  return habilidades.filter((id) => id === "parrudeza").length;
}
