import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import { SessionForm } from "@/components/sessions/SessionForm";

export default async function NewSessionPage() {
  const supabase = await createClient();
  const { data: templates } = await supabase
    .from("story_templates")
    .select("id, title")
    .order("created_at", { ascending: false })
    .returns<{ id: string; title: string }[]>();

  return (
    <div className="flex flex-1 flex-col gap-4 px-4 py-6">
      <Link
        href="/dashboard/sessions"
        className="text-xs text-zinc-500 hover:text-zinc-300"
      >
        ← Voltar
      </Link>
      <h1 className="text-lg font-bold tracking-tight">Nova sessão</h1>
      <SessionForm mode="create" templates={templates ?? []} />
    </div>
  );
}
