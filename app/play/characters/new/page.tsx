import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase-admin";
import { LIMITES_PADRAO, limitesDaMesa } from "@/lib/character-creation/sacramento/rules";
import { CharacterWizard } from "./CharacterWizard";

export default async function NewCharacterPage({
  searchParams,
}: {
  searchParams: Promise<{ mesa?: string }>;
}) {
  const auth = await getProfile();
  if (!auth) redirect("/login?redirect=/play/characters/new");

  // Link da mesa (?mesa=<sessionId>): aplica as regras de criação do Juiz.
  const { mesa } = await searchParams;
  let limites = LIMITES_PADRAO;
  let mesaNome: string | undefined;
  if (mesa) {
    const { data: sessao } = await createAdminClient()
      .from("sessions")
      .select("id, title, settings")
      .eq("id", mesa)
      .maybeSingle<{ id: string; title: string; settings: { regrasCriacao?: unknown } | null }>();
    if (sessao) {
      limites = limitesDaMesa(sessao.settings?.regrasCriacao);
      mesaNome = sessao.title;
    }
  }

  return <CharacterWizard limites={limites} mesaNome={mesaNome} />;
}
