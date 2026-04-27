import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import type { SessionWithMeta } from "@/components/sessions/SessionCard";
import { SessionsList } from "@/components/sessions/SessionsList";

export default async function SessionsPage() {
  const supabase = await createClient();
  const { data: sessions } = await supabase
    .from("sessions")
    .select(
      "*, template:story_templates(title), session_players(player_id, status)"
    )
    .order("created_at", { ascending: false })
    .returns<SessionWithMeta[]>();

  return (
    <div className="flex flex-1 flex-col gap-4 px-4 py-6">
      <header className="flex items-center justify-between">
        <h1 className="text-lg font-bold tracking-tight">Sessões</h1>
        <Link
          href="/dashboard/sessions/new"
          className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-500"
        >
          Nova sessão
        </Link>
      </header>

      <SessionsList sessions={sessions ?? []} />
    </div>
  );
}
