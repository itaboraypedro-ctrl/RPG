"use client";

import type { CharacterAbility, CharacterSpell } from "./types";
import type { CharacterDraft, DraftSetter } from "./CharacterWizard";
import { SpellSlots } from "./SpellSlots";

export function CharacterWizardStep3({
  draft,
  setDraft,
}: {
  draft: CharacterDraft;
  setDraft: DraftSetter;
}) {
  function addAbility() {
    setDraft((d) => ({
      ...d,
      abilities: [...d.abilities, { name: "", description: "", type: "passive" }],
    }));
  }
  function updateAbility(idx: number, patch: Partial<CharacterAbility>) {
    setDraft((d) => ({
      ...d,
      abilities: d.abilities.map((a, i) => (i === idx ? { ...a, ...patch } : a)),
    }));
  }
  function removeAbility(idx: number) {
    setDraft((d) => ({
      ...d,
      abilities: d.abilities.filter((_, i) => i !== idx),
    }));
  }

  function addSpell() {
    setDraft((d) => ({
      ...d,
      spells: [
        ...d.spells,
        { name: "", school: "", level: 1, description: "", components: "" },
      ],
    }));
  }
  function updateSpell(idx: number, patch: Partial<CharacterSpell>) {
    setDraft((d) => ({
      ...d,
      spells: d.spells.map((s, i) => (i === idx ? { ...s, ...patch } : s)),
    }));
  }
  function removeSpell(idx: number) {
    setDraft((d) => ({
      ...d,
      spells: d.spells.filter((_, i) => i !== idx),
    }));
  }

  return (
    <div className="flex flex-col gap-5">
      <section className="flex flex-col gap-2">
        <header className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Habilidades ({draft.abilities.length})
          </h3>
          <button
            type="button"
            onClick={addAbility}
            className="rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-200 hover:bg-zinc-700"
          >
            + Habilidade
          </button>
        </header>
        {draft.abilities.map((a, i) => (
          <div
            key={i}
            className="flex flex-col gap-2 rounded-md border border-zinc-800 bg-zinc-900 p-3"
          >
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Nome"
                value={a.name}
                onChange={(e) => updateAbility(i, { name: e.target.value })}
                className="flex-1 rounded border border-zinc-800 bg-zinc-950 px-2 py-1 text-sm"
              />
              <select
                value={a.type}
                onChange={(e) =>
                  updateAbility(i, { type: e.target.value as "passive" | "active" })
                }
                className="rounded border border-zinc-800 bg-zinc-950 px-2 py-1 text-xs"
              >
                <option value="passive">Passiva</option>
                <option value="active">Ativa</option>
              </select>
              <button
                type="button"
                onClick={() => removeAbility(i)}
                className="rounded bg-red-900/40 px-2 py-1 text-xs text-red-300 hover:bg-red-900/60"
              >
                ×
              </button>
            </div>
            <textarea
              rows={2}
              placeholder="Descrição"
              value={a.description}
              onChange={(e) => updateAbility(i, { description: e.target.value })}
              className="rounded border border-zinc-800 bg-zinc-950 px-2 py-1 text-sm"
            />
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Spell slots
        </h3>
        <SpellSlots
          slots={draft.spell_slots}
          editable
          onChange={(slots) => setDraft((d) => ({ ...d, spell_slots: slots }))}
        />
      </section>

      <section className="flex flex-col gap-2">
        <header className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Feitiços ({draft.spells.length})
          </h3>
          <button
            type="button"
            onClick={addSpell}
            className="rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-200 hover:bg-zinc-700"
          >
            + Feitiço
          </button>
        </header>
        {draft.spells.map((s, i) => (
          <div
            key={i}
            className="flex flex-col gap-2 rounded-md border border-zinc-800 bg-zinc-900 p-3"
          >
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Nome"
                value={s.name}
                onChange={(e) => updateSpell(i, { name: e.target.value })}
                className="flex-1 rounded border border-zinc-800 bg-zinc-950 px-2 py-1 text-sm"
              />
              <input
                type="number"
                min={0}
                max={9}
                value={s.level}
                onChange={(e) => updateSpell(i, { level: Number(e.target.value) || 0 })}
                title="Nível"
                className="w-12 rounded border border-zinc-800 bg-zinc-950 px-2 py-1 text-center text-xs"
              />
              <button
                type="button"
                onClick={() => removeSpell(i)}
                className="rounded bg-red-900/40 px-2 py-1 text-xs text-red-300 hover:bg-red-900/60"
              >
                ×
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Escola"
                value={s.school}
                onChange={(e) => updateSpell(i, { school: e.target.value })}
                className="flex-1 rounded border border-zinc-800 bg-zinc-950 px-2 py-1 text-xs"
              />
              <input
                type="text"
                placeholder="Componentes (V, S, M)"
                value={s.components}
                onChange={(e) => updateSpell(i, { components: e.target.value })}
                className="flex-1 rounded border border-zinc-800 bg-zinc-950 px-2 py-1 text-xs"
              />
            </div>
            <textarea
              rows={2}
              placeholder="Descrição"
              value={s.description}
              onChange={(e) => updateSpell(i, { description: e.target.value })}
              className="rounded border border-zinc-800 bg-zinc-950 px-2 py-1 text-sm"
            />
          </div>
        ))}
      </section>
    </div>
  );
}
