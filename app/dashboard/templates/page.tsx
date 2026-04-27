import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import type { StoryTemplate } from "@/lib/types";
import { TemplatesList } from "@/components/templates/TemplatesList";

export default async function TemplatesPage() {
  const supabase = await createClient();
  const { data: templates } = await supabase
    .from("story_templates")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<StoryTemplate[]>();

  return (
    <div className="flex flex-1 flex-col gap-4 px-4 py-6">
      <header className="flex items-center justify-between">
        <h1 className="text-lg font-bold tracking-tight">Banco de Histórias</h1>
        <Link
          href="/dashboard/templates/new"
          className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-500"
        >
          Novo template
        </Link>
      </header>

      <TemplatesList templates={templates ?? []} />
    </div>
  );
}
