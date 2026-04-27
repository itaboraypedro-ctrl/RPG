"use client";

import type { DraftSetter, TemplateDraft } from "./TemplateWizard";

export function TemplateWizardStep3({
  draft,
  setDraft,
}: {
  draft: TemplateDraft;
  setDraft: DraftSetter;
}) {
  function updateCue(idx: number, field: "scene" | "suggestion", value: string) {
    setDraft((d) => ({
      ...d,
      content: {
        ...d.content,
        music_cues: d.content.music_cues.map((c, i) =>
          i === idx ? { ...c, [field]: value } : c
        ),
      },
    }));
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-2">
        <header className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-zinc-200">
            Trilha sonora ({draft.content.music_cues.length})
          </h3>
          <button
            type="button"
            onClick={() =>
              setDraft((d) => ({
                ...d,
                content: {
                  ...d.content,
                  music_cues: [
                    ...d.content.music_cues,
                    { scene: "", suggestion: "" },
                  ],
                },
              }))
            }
            className="rounded-md bg-zinc-800 px-2 py-1 text-xs text-zinc-100 hover:bg-zinc-700"
          >
            + Adicionar
          </button>
        </header>
        {draft.content.music_cues.map((cue, idx) => (
          <div
            key={idx}
            className="flex flex-col gap-2 rounded-md border border-zinc-800 bg-zinc-900 p-3"
          >
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Cena"
                value={cue.scene}
                onChange={(e) => updateCue(idx, "scene", e.target.value)}
                className="flex-1 rounded-md border border-zinc-800 bg-zinc-950 px-2 py-1 text-sm focus:border-emerald-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() =>
                  setDraft((d) => ({
                    ...d,
                    content: {
                      ...d.content,
                      music_cues: d.content.music_cues.filter((_, i) => i !== idx),
                    },
                  }))
                }
                className="rounded bg-red-900/40 px-2 py-1 text-xs text-red-300 hover:bg-red-900/60"
              >
                ×
              </button>
            </div>
            <input
              type="text"
              placeholder="Sugestão musical"
              value={cue.suggestion}
              onChange={(e) => updateCue(idx, "suggestion", e.target.value)}
              className="rounded-md border border-zinc-800 bg-zinc-950 px-2 py-1 text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>
        ))}
      </section>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="cover" className="text-sm text-zinc-400">
          URL da imagem de capa
        </label>
        <input
          id="cover"
          type="url"
          placeholder="https://..."
          value={draft.cover_image_url}
          onChange={(e) =>
            setDraft((d) => ({ ...d, cover_image_url: e.target.value }))
          }
          className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
        />
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm text-zinc-400">Visibilidade</legend>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name="visibility"
            checked={!draft.is_public}
            onChange={() => setDraft((d) => ({ ...d, is_public: false }))}
            className="accent-emerald-500"
          />
          Privado
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name="visibility"
            checked={draft.is_public}
            onChange={() => setDraft((d) => ({ ...d, is_public: true }))}
            className="accent-emerald-500"
          />
          Público
        </label>
      </fieldset>
    </div>
  );
}
