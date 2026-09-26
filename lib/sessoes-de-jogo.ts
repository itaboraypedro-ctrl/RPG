/**
 * Sessões de jogo dentro de uma campanha (sessions.settings.sessoes).
 *
 * A linha `sessions` é a campanha inteira; cada noite de jogo é uma sessão
 * numerada. Status da campanha:
 * - lobby    → entre sessões (ou antes da primeira)
 * - active   → sessão em andamento
 * - paused   → sessão em andamento, pausa curta
 * - finished → campanha encerrada (pode ser reaberta)
 */
export type SessaoDeJogo = { numero: number; inicio: string; fim?: string };

export function sessoesDaMesa(settings: unknown): SessaoDeJogo[] {
  const s = (settings as { sessoes?: SessaoDeJogo[] } | null)?.sessoes;
  return Array.isArray(s) ? s : [];
}

/** Sessão aberta agora (sem fim), se houver. */
export function sessaoAberta(sessoes: SessaoDeJogo[]): SessaoDeJogo | null {
  const ultima = sessoes[sessoes.length - 1];
  return ultima && !ultima.fim ? ultima : null;
}

export function numeroSessao(n: number): string {
  return String(n).padStart(2, "0");
}
