"use client";

import type { DraftSetter, TemplateDraft } from "./TemplateWizard";

const ACT_LIMIT = 10;
const NPC_LIMIT = 20;
const LOCATION_LIMIT = 20;

export function TemplateWizardStep2({
  draft,
  setDraft,
}: {
  draft: TemplateDraft;
  setDraft: DraftSetter;
}) {
  function updateAct(idx: number, field: "title" | "description", value: string) {
    setDraft((d) => ({
      ...d,
      content: {
        ...d.content,
        acts: d.content.acts.map((a, i) => (i === idx ? { ...a, [field]: value } : a)),
      },
    }));
  }
  function moveAct(idx: number, dir: -1 | 1) {
    setDraft((d) => {
      const next = [...d.content.acts];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return d;
      [next[idx], next[target]] = [next[target], next[idx]];
      return { ...d, content: { ...d.content, acts: next } };
    });
  }

  function updateNpc(
    idx: number,
    field: "name" | "role" | "motivation",
    value: string
  ) {
    setDraft((d) => ({
      ...d,
      content: {
        ...d.content,
        npcs: d.content.npcs.map((n, i) => (i === idx ? { ...n, [field]: value } : n)),
      },
    }));
  }

  function updateLocation(
    idx: number,
    field: "name" | "description" | "atmosphere",
    value: string
  ) {
    setDraft((d) => ({
      ...d,
      content: {
        ...d.content,
        locations: d.content.locations.map((l, i) =>
          i === idx ? { ...l, [field]: value } : l
        ),
      },
    }));
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="synopsis" className="text-sm text-zinc-400">
          Sinopse
        </label>
        <textarea
          id="synopsis"
          rows={6}
          value={draft.content.synopsis}
          onChange={(e) =>
            setDraft((d) => ({
              ...d,
              content: { ...d.content, synopsis: e.target.value },
            }))
          }
          className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
        />
      </div>

      <section className="flex flex-col gap-2">
        <header className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-zinc-200">
            Atos ({draft.content.acts.length}/{ACT_LIMIT})
          </h3>
          <button
            type="button"
            disabled={draft.content.acts.length >= ACT_LIMIT}
            onClick={() =>
              setDraft((d) => ({
                ...d,
                content: {
                  ...d.content,
                  acts: [...d.content.acts, { title: "", description: "" }],
                },
              }))
            }
            className="rounded-md bg-zinc-800 px-2 py-1 text-xs text-zinc-100 hover:bg-zinc-700 disabled:opacity-50"
          >
            + Adicionar
          </button>
        </header>
        {draft.content.acts.map((act, idx) => (
          <div
            key={idx}
            className="flex flex-col gap-2 rounded-md border border-zinc-800 bg-zinc-900 p-3"
          >
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Título do ato"
                value={act.title}
                onChange={(e) => updateAct(idx, "title", e.target.value)}
                className="flex-1 rounded-md border border-zinc-800 bg-zinc-950 px-2 py-1 text-sm focus:border-emerald-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => moveAct(idx, -1)}
                disabled={idx === 0}
                className="rounded bg-zinc-800 px-2 py-1 text-xs disabled:opacity-30"
                aria-label="Mover para cima"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => moveAct(idx, 1)}
                disabled={idx === draft.content.acts.length - 1}
                className="rounded bg-zinc-800 px-2 py-1 text-xs disabled:opacity-30"
                aria-label="Mover para baixo"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() =>
                  setDraft((d) => ({
                    ...d,
                    content: {
                      ...d.content,
                      acts: d.content.acts.filter((_, i) => i !== idx),
                    },
                  }))
                }
                className="rounded bg-red-900/40 px-2 py-1 text-xs text-red-300 hover:bg-red-900/60"
                aria-label="Remover ato"
              >
                ×
              </button>
            </div>
            <textarea
              rows={2}
              placeholder="Descrição"
              value={act.description}
              onChange={(e) => updateAct(idx, "description", e.target.value)}
              className="rounded-md border border-zinc-800 bg-zinc-950 px-2 py-1 text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-2">
        <header className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-zinc-200">
            NPCs ({draft.content.npcs.length}/{NPC_LIMIT})
          </h3>
          <button
            type="button"
            disabled={draft.content.npcs.length >= NPC_LIMIT}
            onClick={() =>
              setDraft((d) => ({
                ...d,
                content: {
                  ...d.content,
                  npcs: [
                    ...d.content.npcs,
                    { name: "", role: "", motivation: "" },
                  ],
                },
              }))
            }
            className="rounded-md bg-zinc-800 px-2 py-1 text-xs text-zinc-100 hover:bg-zinc-700 disabled:opacity-50"
          >
            + Adicionar
          </button>
        </header>
        {draft.content.npcs.map((npc, idx) => (
          <div
            key={idx}
            className="flex flex-col gap-2 rounded-md border border-zinc-800 bg-zinc-900 p-3"
          >
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Nome"
                value={npc.name}
                onChange={(e) => updateNpc(idx, "name", e.target.value)}
                className="flex-1 rounded-md border border-zinc-800 bg-zinc-950 px-2 py-1 text-sm focus:border-emerald-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() =>
                  setDraft((d) => ({
                    ...d,
                    content: {
                      ...d.content,
                      npcs: d.content.npcs.filter((_, i) => i !== idx),
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
              placeholder="Papel"
              value={npc.role}
              onChange={(e) => updateNpc(idx, "role", e.target.value)}
              className="rounded-md border border-zinc-800 bg-zinc-950 px-2 py-1 text-sm focus:border-emerald-500 focus:outline-none"
            />
            <input
              type="text"
              placeholder="Motivação"
              value={npc.motivation}
              onChange={(e) => updateNpc(idx, "motivation", e.target.value)}
              className="rounded-md border border-zinc-800 bg-zinc-950 px-2 py-1 text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-2">
        <header className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-zinc-200">
            Locais ({draft.content.locations.length}/{LOCATION_LIMIT})
          </h3>
          <button
            type="button"
            disabled={draft.content.locations.length >= LOCATION_LIMIT}
            onClick={() =>
              setDraft((d) => ({
                ...d,
                content: {
                  ...d.content,
                  locations: [
                    ...d.content.locations,
                    { name: "", description: "", atmosphere: "" },
                  ],
                },
              }))
            }
            className="rounded-md bg-zinc-800 px-2 py-1 text-xs text-zinc-100 hover:bg-zinc-700 disabled:opacity-50"
          >
            + Adicionar
          </button>
        </header>
        {draft.content.locations.map((loc, idx) => (
          <div
            key={idx}
            className="flex flex-col gap-2 rounded-md border border-zinc-800 bg-zinc-900 p-3"
          >
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Nome"
                value={loc.name}
                onChange={(e) => updateLocation(idx, "name", e.target.value)}
                className="flex-1 rounded-md border border-zinc-800 bg-zinc-950 px-2 py-1 text-sm focus:border-emerald-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() =>
                  setDraft((d) => ({
                    ...d,
                    content: {
                      ...d.content,
                      locations: d.content.locations.filter((_, i) => i !== idx),
                    },
                  }))
                }
                className="rounded bg-red-900/40 px-2 py-1 text-xs text-red-300 hover:bg-red-900/60"
              >
                ×
              </button>
            </div>
            <textarea
              rows={2}
              placeholder="Descrição"
              value={loc.description}
              onChange={(e) => updateLocation(idx, "description", e.target.value)}
              className="rounded-md border border-zinc-800 bg-zinc-950 px-2 py-1 text-sm focus:border-emerald-500 focus:outline-none"
            />
            <input
              type="text"
              placeholder="Atmosfera"
              value={loc.atmosphere}
              onChange={(e) => updateLocation(idx, "atmosphere", e.target.value)}
              className="rounded-md border border-zinc-800 bg-zinc-950 px-2 py-1 text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>
        ))}
      </section>
    </div>
  );
}
