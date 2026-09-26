import { createAdminClient } from "./supabase-admin";

// Convites de campanha por e-mail (migration 008). Tudo aqui usa service role:
// sob RLS, um jogador 'invited' ainda não enxerga a session (sessions_select_member
// exige 'joined'), então a checagem de convite é feita no servidor.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Extrai e-mails válidos (minúsculos, sem repetição) de texto livre ou lista. */
export function normalizeEmails(input: string | string[]): string[] {
  const parts = (Array.isArray(input) ? input : [input])
    .flatMap((s) => s.split(/[\s,;]+/))
    .map((s) => s.trim().toLowerCase())
    .filter((s) => EMAIL_RE.test(s));
  return [...new Set(parts)].slice(0, 50);
}

/**
 * Transforma convites pendentes do e-mail do usuário em session_players 'invited'.
 * Idempotente: roda a cada visita ao Hub/criador sem rebaixar quem já é 'joined'.
 * Falhas (ex.: migration 008 ausente) são silenciosas — o resto da página segue.
 */
export async function claimEmailInvites(userId: string, email: string | undefined | null) {
  if (!email) return;
  const admin = createAdminClient();
  const { data: pending, error } = await admin
    .from("campaign_invites")
    .select("id, session_id, sessions(gm_id)")
    .eq("email", email.toLowerCase())
    .is("player_id", null);
  if (error || !pending || pending.length === 0) return;

  for (const invite of pending as unknown as {
    id: string;
    session_id: string;
    sessions: { gm_id: string } | null;
  }[]) {
    // O Juiz não se convida para a própria mesa.
    if (invite.sessions?.gm_id === userId) continue;
    const { error: upsertError } = await admin
      .from("session_players")
      .upsert(
        { session_id: invite.session_id, player_id: userId, status: "invited" },
        { onConflict: "session_id,player_id", ignoreDuplicates: true },
      );
    if (upsertError) continue;
    await admin
      .from("campaign_invites")
      .update({ player_id: userId, claimed_at: new Date().toISOString() })
      .eq("id", invite.id);
  }
}

export type MesaAcesso =
  | { ok: true; session: { id: string; title: string; ruleset: string; settings: Record<string, unknown> | null; gm_id: string } }
  | { ok: false; motivo: "inexistente" | "sem-convite" | "modelo" };

/** O usuário pode criar personagem nesta campanha? (convidado/joined ou Juiz dela) */
export async function acessoMesa(userId: string, sessionId: string): Promise<MesaAcesso> {
  const admin = createAdminClient();
  const { data: session } = await admin
    .from("sessions")
    .select("id, title, ruleset, settings, gm_id, status")
    .eq("id", sessionId)
    .maybeSingle<{
      id: string;
      title: string;
      ruleset: string;
      settings: Record<string, unknown> | null;
      gm_id: string;
      status: string;
    }>();
  if (!session || session.status === "finished") return { ok: false, motivo: "inexistente" };
  // Cada modelo de RPG tem sua própria jornada de criação; hoje só existe Sacramento.
  if (session.ruleset !== "sacramento") return { ok: false, motivo: "modelo" };
  if (session.gm_id === userId) return { ok: true, session };

  const { data: membro } = await admin
    .from("session_players")
    .select("status")
    .eq("session_id", sessionId)
    .eq("player_id", userId)
    .maybeSingle<{ status: string }>();
  if (!membro || (membro.status !== "invited" && membro.status !== "joined")) {
    return { ok: false, motivo: "sem-convite" };
  }
  return { ok: true, session };
}

/** Campanhas Sacramento em que o jogador foi convidado e ainda não tem personagem. */
export async function mesasSemPersonagem(userId: string): Promise<{ id: string; title: string }[]> {
  const admin = createAdminClient();
  const { data: linhas } = await admin
    .from("session_players")
    .select("session_id, sessions(id, title, ruleset, status)")
    .eq("player_id", userId)
    .in("status", ["invited", "joined"]);
  const mesas = ((linhas ?? []) as unknown as {
    sessions: { id: string; title: string; ruleset: string; status: string } | null;
  }[])
    .map((l) => l.sessions)
    .filter(
      (s): s is { id: string; title: string; ruleset: string; status: string } =>
        !!s && s.ruleset === "sacramento" && s.status !== "finished",
    );
  if (mesas.length === 0) return [];

  const { data: chars } = await admin
    .from("characters")
    .select("session_id")
    .eq("owner_id", userId)
    .in(
      "session_id",
      mesas.map((m) => m.id),
    );
  const comPersonagem = new Set((chars ?? []).map((c) => c.session_id as string));
  return mesas.filter((m) => !comPersonagem.has(m.id)).map(({ id, title }) => ({ id, title }));
}
