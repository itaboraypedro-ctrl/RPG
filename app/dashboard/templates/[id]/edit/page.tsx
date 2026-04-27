import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import type { Genre, StoryTemplate } from "@/lib/types";
import {
  TemplateWizard,
  type TemplateDraft,
} from "@/components/templates/TemplateWizard";

type PersistedContent = Partial<TemplateDraft["content"]>;

export default async function EditTemplatePage({
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

  const content = template.content as PersistedContent;
  const initial: TemplateDraft = {
    title: template.title,
    genre: template.genre as Genre,
    description: template.description,
    tags: template.tags,
    cover_image_url: template.cover_image_url ?? "",
    is_public: template.is_public,
    ai_generated: template.ai_generated,
    content: {
      synopsis: content.synopsis ?? "",
      acts: content.acts ?? [],
      npcs: content.npcs ?? [],
      locations: content.locations ?? [],
      music_cues: content.music_cues ?? [],
    },
  };

  return (
    <div className="flex flex-1 flex-col gap-4 px-4 py-6">
      <Link
        href={`/dashboard/templates/${id}`}
        className="text-xs text-zinc-500 hover:text-zinc-300"
      >
        ← Voltar
      </Link>
      <h1 className="text-lg font-bold tracking-tight">Editar template</h1>
      <TemplateWizard mode="edit" templateId={id} initial={initial} />
    </div>
  );
}
