"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { StoryTemplate } from "@/lib/types";
import { duplicateTemplate, deleteTemplate } from "@/app/dashboard/templates/[id]/actions";

const GENRE_LABEL: Record<StoryTemplate["genre"], string> = {
  fantasy: "Fantasia",
  "sci-fi": "Sci-Fi",
  horror: "Horror",
  western: "Western",
  modern: "Moderno",
  custom: "Outro",
};

type Act = { title: string; description: string };
type Npc = { name: string; role: string; motivation: string };
type Location = { name: string; description: string; atmosphere: string };
type MusicCue = { scene: string; suggestion: string };

export function TemplateViewer({ template }: { template: StoryTemplate }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const content = template.content as {
    synopsis?: string;
    acts?: Act[];
    npcs?: Npc[];
    locations?: Location[];
    music_cues?: MusicCue[];
  };

  function onDuplicate() {
    startTransition(async () => {
      const result = await duplicateTemplate(template.id);
      if (result.error) {
        alert(result.error);
      } else if (result.id) {
        router.push(`/dashboard/templates/${result.id}`);
      }
    });
  }

  function onDelete() {
    if (!confirm("Excluir este template? Esta ação não pode ser desfeita.")) return;
    startTransition(async () => {
      const result = await deleteTemplate(template.id);
      if (result.error) {
        alert(result.error);
      } else {
        router.push("/dashboard/templates");
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-xl font-bold">{template.title}</h2>
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
        <p className="text-xs text-zinc-500">{GENRE_LABEL[template.genre]}</p>
        {template.description && (
          <p className="text-sm text-zinc-300">{template.description}</p>
        )}
        {template.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {template.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-300"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>

      {template.cover_image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={template.cover_image_url}
          alt={template.title}
          className="rounded-md border border-zinc-800"
        />
      )}

      {content.synopsis && (
        <section className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
            Sinopse
          </h3>
          <p className="whitespace-pre-wrap text-sm text-zinc-200">
            {content.synopsis}
          </p>
        </section>
      )}

      {content.acts && content.acts.length > 0 && (
        <section className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
            Atos
          </h3>
          {content.acts.map((act, i) => (
            <div key={i} className="rounded-md border border-zinc-800 bg-zinc-900 p-3">
              <p className="text-sm font-medium text-zinc-100">
                {i + 1}. {act.title}
              </p>
              <p className="mt-1 text-sm text-zinc-300">{act.description}</p>
            </div>
          ))}
        </section>
      )}

      {content.npcs && content.npcs.length > 0 && (
        <section className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
            NPCs
          </h3>
          {content.npcs.map((npc, i) => (
            <div key={i} className="rounded-md border border-zinc-800 bg-zinc-900 p-3">
              <p className="text-sm font-medium text-zinc-100">{npc.name}</p>
              <p className="text-xs text-zinc-500">{npc.role}</p>
              <p className="mt-1 text-sm text-zinc-300">{npc.motivation}</p>
            </div>
          ))}
        </section>
      )}

      {content.locations && content.locations.length > 0 && (
        <section className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
            Locais
          </h3>
          {content.locations.map((loc, i) => (
            <div key={i} className="rounded-md border border-zinc-800 bg-zinc-900 p-3">
              <p className="text-sm font-medium text-zinc-100">{loc.name}</p>
              <p className="text-xs text-zinc-500 italic">{loc.atmosphere}</p>
              <p className="mt-1 text-sm text-zinc-300">{loc.description}</p>
            </div>
          ))}
        </section>
      )}

      {content.music_cues && content.music_cues.length > 0 && (
        <section className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
            Trilha sonora
          </h3>
          {content.music_cues.map((cue, i) => (
            <div key={i} className="rounded-md border border-zinc-800 bg-zinc-900 p-3">
              <p className="text-sm font-medium text-zinc-100">{cue.scene}</p>
              <p className="mt-1 text-sm text-zinc-300">{cue.suggestion}</p>
            </div>
          ))}
        </section>
      )}

      <div className="flex flex-col gap-2">
        <Link
          href={`/dashboard/sessions/new?template=${template.id}`}
          className="rounded-md bg-emerald-600 px-3 py-2 text-center text-sm font-medium text-white hover:bg-emerald-500"
        >
          Usar em nova sessão
        </Link>
        <div className="flex gap-2">
          <Link
            href={`/dashboard/templates/${template.id}/edit`}
            className="flex-1 rounded-md bg-zinc-800 px-3 py-2 text-center text-sm font-medium text-zinc-100 hover:bg-zinc-700"
          >
            Editar
          </Link>
          <button
            type="button"
            onClick={onDuplicate}
            disabled={pending}
            className="flex-1 rounded-md bg-zinc-800 px-3 py-2 text-sm font-medium text-zinc-100 hover:bg-zinc-700 disabled:opacity-50"
          >
            Duplicar
          </button>
        </div>
        <button
          type="button"
          onClick={onDelete}
          disabled={pending}
          className="rounded-md border border-red-900/50 bg-red-950/30 px-3 py-2 text-sm font-medium text-red-300 hover:bg-red-950/50 disabled:opacity-50"
        >
          Excluir
        </button>
      </div>
    </div>
  );
}
