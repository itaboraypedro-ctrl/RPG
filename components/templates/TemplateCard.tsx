import Link from "next/link";
import type { StoryTemplate } from "@/lib/types";

const GENRE_LABEL: Record<StoryTemplate["genre"], string> = {
  fantasy: "Fantasia",
  "sci-fi": "Sci-Fi",
  horror: "Horror",
  western: "Western",
  modern: "Moderno",
  custom: "Outro",
};

export function TemplateCard({ template }: { template: StoryTemplate }) {
  const date = new Date(template.created_at).toLocaleDateString("pt-BR");

  return (
    <Link
      href={`/dashboard/templates/${template.id}`}
      className="flex flex-col gap-2 rounded-md border border-zinc-800 bg-zinc-900 p-4 transition-colors hover:border-zinc-700"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium leading-tight text-zinc-100">{template.title}</h3>
        <div className="flex shrink-0 gap-1">
          {template.ai_generated && (
            <span className="rounded-full bg-emerald-900/50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-emerald-400">
              IA
            </span>
          )}
          {template.is_public && (
            <span className="rounded-full bg-amber-900/50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-400">
              Público
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs text-zinc-500">
        <span>{GENRE_LABEL[template.genre]}</span>
        <span>·</span>
        <span>{date}</span>
      </div>
      {template.description && (
        <p className="line-clamp-2 text-sm text-zinc-400">{template.description}</p>
      )}
    </Link>
  );
}
