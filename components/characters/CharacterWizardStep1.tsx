"use client";

import { ALIGNMENTS } from "./types";
import type { CharacterDraft, DraftSetter } from "./CharacterWizard";

export function CharacterWizardStep1({
  draft,
  setDraft,
}: {
  draft: CharacterDraft;
  setDraft: DraftSetter;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-sm text-zinc-400">
          Nome <span className="text-red-400">*</span>
        </label>
        <input
          id="name"
          type="text"
          required
          maxLength={120}
          value={draft.name}
          onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
          className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="race" className="text-sm text-zinc-400">
            Raça
          </label>
          <input
            id="race"
            type="text"
            value={draft.race}
            onChange={(e) => setDraft((d) => ({ ...d, race: e.target.value }))}
            placeholder="ex: Elfo, Anão, Humano..."
            className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="class" className="text-sm text-zinc-400">
            Classe
          </label>
          <input
            id="class"
            type="text"
            value={draft.class}
            onChange={(e) => setDraft((d) => ({ ...d, class: e.target.value }))}
            placeholder="ex: Mago, Guerreiro..."
            className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="level" className="text-sm text-zinc-400">
            Nível
          </label>
          <input
            id="level"
            type="number"
            min={1}
            max={20}
            value={draft.level}
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                level: Math.max(1, Math.min(20, Number(e.target.value) || 1)),
              }))
            }
            className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="alignment" className="text-sm text-zinc-400">
            Alinhamento
          </label>
          <select
            id="alignment"
            value={draft.alignment}
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                alignment: e.target.value as CharacterDraft["alignment"],
              }))
            }
            className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          >
            <option value="">— selecione —</option>
            {ALIGNMENTS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="background" className="text-sm text-zinc-400">
          Antecedente / Background
        </label>
        <input
          id="background"
          type="text"
          value={draft.background}
          onChange={(e) => setDraft((d) => ({ ...d, background: e.target.value }))}
          placeholder="ex: Soldado, Eremita, Nobre..."
          className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="backstory" className="text-sm text-zinc-400">
          História do personagem
        </label>
        <textarea
          id="backstory"
          rows={4}
          maxLength={2000}
          value={draft.backstory}
          onChange={(e) => setDraft((d) => ({ ...d, backstory: e.target.value }))}
          className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
        />
      </div>
    </div>
  );
}
