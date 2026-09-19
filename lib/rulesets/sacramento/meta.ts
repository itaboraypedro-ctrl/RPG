// Metadados do preset Sacramento.
// Fonte: Sacramento RPG, 1ª edição, dezembro de 2024 (docs/01 e docs/02).

export const SACRAMENTO_META = {
  id: "sacramento" as const,
  nome: "Sacramento",
  subtitulo: "Faroeste à mineira",
  fonte: "Sacramento RPG, 1ª edição, dezembro de 2024",
  resumo:
    "Faroeste fictício inspirado em Minas Gerais: humanos, armas, conflitos sociais, " +
    "sobrevivência e redenção. Sem magia, raças fantásticas ou classes — testes em 1d6, " +
    "iniciativa e Sina por cartas de baralho, duelos decididos no pôquer do próprio livro.",
  vocabulario: {
    mestre: "Juiz",
    grupo: "Bando",
    moeda: "réis",
    simboloMoeda: "$",
  },
  defaults: {
    epoca: 1880, // padrão editorial do cenário (Doc 2 §3.1)
    naPadrao: 6, // Nível de Ameaça padrão dos testes (Doc 2 §6)
    jogadores: 5,
  },
  paginasReferencia: { premissas: [14, 68], epoca: [131, 132] },
};
