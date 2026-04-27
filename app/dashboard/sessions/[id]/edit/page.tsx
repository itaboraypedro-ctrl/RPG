import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { SessionForm } from "@/components/sessions/SessionForm";
import type { Session } from "@/lib/types";

export default async function EditSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: session } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", id)
    .maybeSingle<Session>();

  if (!session) notFound();

  if (session.status === "active" || session.status === "paused") {
    redirect(`/dashboard/sessions/${id}/play`);
  }
  if (session.status === "finished") {
    redirect(`/dashboard/sessions/${id}`);
  }

  const { data: templates } = await supabase
    .from("story_templates")
    .select("id, title")
    .order("created_at", { ascending: false })
    .returns<{ id: string; title: string }[]>();

  return (
    <div className="flex flex-1 flex-col gap-4 px-4 py-6">
      <Link
        href={`/dashboard/sessions/${id}`}
        className="text-xs text-zinc-500 hover:text-zinc-300"
      >
        ← Voltar
      </Link>
      <h1 className="text-lg font-bold tracking-tight">Editar sessão</h1>
      <SessionForm mode="edit" session={session} templates={templates ?? []} />
    </div>
  );
}
