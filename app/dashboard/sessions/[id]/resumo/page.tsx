import { notFound, redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase-server";
import { montarResumo } from "@/lib/resumo-sessao";
import { ResumoDaSessao } from "@/components/mesa/ResumoDaSessao";
import type { Session } from "@/lib/types";

/** Resumo de uma sessão (?sessao=N) ou da campanha inteira, visto pelo Juiz. */
export default async function ResumoJuizPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ sessao?: string }>;
}) {
  const { id } = await params;
  const { sessao } = await searchParams;
  const auth = await getProfile();
  if (!auth) redirect(`/login?redirect=/dashboard/sessions/${id}/resumo`);

  const supabase = await createClient();
  const { data: session } = await supabase.from("sessions").select("*").eq("id", id).maybeSingle<Session>();
  if (!session) notFound();
  if (session.gm_id !== auth.user.id) redirect("/unauthorized");

  const resumo = await montarResumo(createAdminClient(), session, sessao ? Number(sessao) : null);
  if (!resumo) notFound();

  return (
    <ResumoDaSessao
      sessionId={id}
      titulo={session.title}
      resumo={resumo}
      voltar={{ href: `/dashboard/sessions/${id}`, rotulo: "← Voltar ao lobby" }}
    />
  );
}
