// Efeitos que o Juiz causa na ficha e que saltam na tela do jogador como popup.
// Vão no payload do evento da mesa (payload.efeitos); a arte fica em public/story/uso/popups.

export const CAUSAS_DANO = [
  { id: "soco", nome: "Soco", emoji: "👊" },
  { id: "tiro", nome: "Tiro", emoji: "🔫" },
  { id: "faca", nome: "Faca / lâmina", emoji: "🔪" },
  { id: "pancada", nome: "Pancada", emoji: "🪵" },
  { id: "queda-cavalo", nome: "Queda de cavalo", emoji: "🐎" },
  { id: "queda", nome: "Queda", emoji: "🪨" },
  { id: "explosao", nome: "Explosão", emoji: "🧨" },
  { id: "flecha", nome: "Flecha", emoji: "🏹" },
  { id: "mordida", nome: "Animal", emoji: "🐆" },
  { id: "veneno", nome: "Veneno", emoji: "🐍" },
  { id: "fogo", nome: "Fogo", emoji: "🔥" },
] as const;

export type CausaDano = (typeof CAUSAS_DANO)[number]["id"];

export type Efeito =
  | { tipo: "dinheiro"; valor: number }
  | { tipo: "cura"; canal: "vida" | "dor"; valor: number; descanso?: boolean }
  | { tipo: "dano"; canal: "vida" | "dor"; valor: number; causa?: CausaDano }
  | { tipo: "xp"; valor: number }
  | { tipo: "morte" };

export function causaValida(c: unknown): CausaDano | undefined {
  return CAUSAS_DANO.some((x) => x.id === c) ? (c as CausaDano) : undefined;
}

const POP = (n: string) => `/story/uso/popups/${n}.webp`;

/** Imagem por faixa de valor (em réis da mesa). */
function arteDinheiro(v: number): string {
  const a = Math.abs(v);
  if (a <= 5) return POP("dinheiro-moeda");
  if (a <= 25) return POP("dinheiro-moedas");
  if (a <= 150) return POP("dinheiro-notas");
  if (a <= 1000) return POP("dinheiro-saco");
  return POP("dinheiro-barra");
}

export type VisualEfeito = { imagem: string | null; emoji: string; cor: string; titulo: string; valor: string; sai?: boolean };

const reais = (v: number) => `$${Math.abs(v).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}`;

export function visualDoEfeito(e: Efeito): VisualEfeito {
  switch (e.tipo) {
    case "dinheiro":
      return {
        imagem: arteDinheiro(e.valor),
        emoji: "💰",
        cor: e.valor >= 0 ? "#d1ab55" : "#8a6a3a",
        titulo: e.valor >= 0 ? "Dinheiro recebido" : "Dinheiro pago",
        valor: `${e.valor >= 0 ? "+" : "−"}${reais(e.valor)}`,
        sai: e.valor < 0,
      };
    case "cura":
      return {
        imagem: POP(e.descanso ? "cura-descanso" : "cura-atadura"),
        emoji: "✚",
        cor: "#4ecb8a",
        titulo: e.descanso ? "Descanso" : "Cura",
        valor: e.canal === "vida" ? `+${e.valor} V` : `−${e.valor} D`,
      };
    case "dano": {
      const c = CAUSAS_DANO.find((x) => x.id === e.causa);
      return {
        imagem: c ? POP(`dano-${c.id}`) : null,
        emoji: c?.emoji ?? "💥",
        cor: e.canal === "vida" ? "#c8302a" : "#e08a2a",
        titulo: c?.nome ?? (e.canal === "vida" ? "Ferimento" : "Dor"),
        valor: e.canal === "vida" ? `−${e.valor} V` : `+${e.valor} D`,
      };
    }
    case "xp":
      return { imagem: POP("xp"), emoji: "⭐", cor: "#f0cc6a", titulo: "Experiência", valor: `${e.valor >= 0 ? "+" : "−"}${Math.abs(e.valor)} XP` };
    case "morte":
      return { imagem: POP("morte"), emoji: "💀", cor: "#7a7a80", titulo: "À beira da morte", valor: "Vida zerada" };
  }
}
