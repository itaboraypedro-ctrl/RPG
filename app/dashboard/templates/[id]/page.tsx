import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import type { StoryTemplate } from "@/lib/types";
import { TemplateViewer } from "@/components/templates/TemplateViewer";

export default async function TemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: template } = await supabase
    .from("story_templates")
    .select("*")
    .eq("id", id)
    .maybeSingle<StoryTemplate>();

  if (!template) notFound();

  return (
    <div className="flex flex-1 flex-col gap-4 px-4 py-6">
      <Link href="/dashboard/templates" className="text-xs text-zinc-500 hover:text-zinc-300">
        ← Voltar
      </Link>
      <TemplateViewer template={template} />
    </div>
  );
}
