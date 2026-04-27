import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import type { Session } from "@/lib/types";
import { StatusBadge } from "@/components/sessions/SessionCard";

export default async function PlayPage({
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

  if (session.status !== "active" && session.status !== "paused") {
    redirect(`/dashboard/sessions/${id}`);
  }

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 py-6">
      <header className="flex flex-col gap-2">
        <Link
          href={`/dashboard/sessions/${id}`}
          className="text-xs text-zinc-500 hover:text-zinc-300"
        >
          ← Voltar ao lobby
        </Link>
        <div className="flex items-start justify-between gap-2">
          <h1 className="text-xl font-bold tracking-tight">{session.title}</h1>
          <StatusBadge status={session.status} />
        </div>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
        <span className="text-4xl">🛠️</span>
        <p className="text-zinc-400">Painel do GM em construção.</p>
        <p className="text-xs text-zinc-500">
          Esta página será preenchida pelo SPEC_GM_PANEL.
        </p>
      </div>
    </div>
  );
}
