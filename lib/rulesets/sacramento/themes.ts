// Temas e tons sugeridos para campanhas de Sacramento.
// Derivados das seis trilhas de redenção (Doc 1 §6.1) e das premissas do cenário
// (Doc 2 §5.1). São sugestões de produto (PRODUTO) — o campo é aberto: o Juiz pode
// digitar temas próprios; nada aqui concede bônus mecânico.

export type SacramentoTheme = { id: string; nome: string; descricao: string };

export const SACRAMENTO_THEMES: SacramentoTheme[] = [
  { id: "redencao", nome: "Redenção", descricao: "Problemas do passado e o percurso para enfrentá-los (as trilhas do bando no centro)" },
  { id: "vinganca", nome: "Vingança", descricao: "Uma perda causada por alguém — e o preço de cobrá-la" },
  { id: "fuga", nome: "Fuga", descricao: "Procurados, caçadores de recompensa e a liberdade a comprar" },
  { id: "divida", nome: "Dívida", descricao: "Figuras poderosas, prazos e o que se sacrifica para pagar" },
  { id: "ambicao", nome: "Ambição", descricao: "Tornar-se o maior em algo, custe o que custar" },
  { id: "sobrevivencia", nome: "Sobrevivência", descricao: "Sertões, desertos, neve e a dureza do Oeste" },
  { id: "conflito-social", nome: "Conflito social", descricao: "Desigualdade, corrupção, capital e trabalho" },
  { id: "misterio", nome: "Mistério", descricao: "Segredos, cultos, lendas e rumores — crença não é magia" },
  { id: "faroeste-classico", nome: "Faroeste clássico", descricao: "Assaltos a trem, duelos ao meio-dia, salões e diligências" },
];

export type SacramentoTone = { id: string; nome: string; descricao: string };

export const SACRAMENTO_TONES: SacramentoTone[] = [
  { id: "dramatico", nome: "Dramático", descricao: "Pesado e emocional; consequências duras e redenções caras" },
  { id: "aventuresco", nome: "Aventuresco", descricao: "Ação, perseguições e façanhas; morte possível, clima de matinê" },
  { id: "sombrio", nome: "Sombrio", descricao: "Violência crua, pestes, guerra e luto do cenário em primeiro plano" },
  { id: "leve", nome: "Leve", descricao: "Humor de salão, bebedeiras e confusões — sem perder o revólver do coldre" },
];

// Sugestões de linhas e véus para a sessão zero (Doc 2 §4 — LIVRO pp. 16, 47, 125–127).
// Chips iniciais; o grupo sempre pode adicionar/remover livremente.
export const SESSION_ZERO_SUGGESTIONS = {
  linhas: [
    "Violência contra crianças",
    "Violência sexual",
    "Tortura detalhada",
    "Crueldade contra animais",
  ],
  veus: [
    "Cenas íntimas",
    "Execuções",
    "Doença terminal",
    "Uso de drogas",
  ],
};
