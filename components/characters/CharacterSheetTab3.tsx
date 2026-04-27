"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase";
import type { Character } from "@/lib/types";
import { SpellSlots } from "./SpellSlots";
import {
  type CharacterAbility,
  type CharacterSkillsMeta,
  type CharacterSpell,
  type SpellSlotsState,
  DEFAULT_SPELL_SLOTS,
  skillsMetaOf,
  spellsOf,
} from "./types";

type Props = {
  character: Character;
  editable: boolean;
};

export function CharacterSheetTab3({ character, editable }: Props) {
  const initialMeta = skillsMetaOf(character);
  const initialSpells = spellsOf(character);
  const [abilities, setAbilities] = useState<CharacterAbility[]>(
    initialMeta.abilities ?? []
  );
  const [spells, setSpells] = useState<CharacterSpell[]>(initialSpells);
  const [slots, setSlots] = useState<SpellSlotsState>(
    initialMeta.spell_slots ?? DEFAULT_SPELL_SLOTS
  );
  const [error, setError] = useState<string | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function persistMeta(nextMeta: CharacterSkillsMeta, nextSpells: CharacterSpell[]) {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      const supabase = createClient();
      const { error: updateError } = await supabase
        .from("characters")
        .update({ skills: nextMeta, spells: nextSpells })
        .eq("id", character.id);
      if (updateError) setError(updateError.message);
      else setError(null);
    }, 400);
  }

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  function commit(nextAbilities: CharacterAbility[], nextSpells: CharacterSpell[], nextSlots: SpellSlotsState) {
    const meta: CharacterSkillsMeta = {
      ...initialMeta,
      abilities: nextAbilities,
      spell_slots: nextSlots,
    };
    persistMeta(meta, nextSpells);
  }

  function addAbility() {
    const next = [...abilities, { name: "", description: "", type: "passive" as const }];
    setAbilities(next);
    commit(next, spells, slots);
  }
  function updateAbility(idx: number, patch: Partial<CharacterAbility>) {
    const next = abilities.map((a, i) => (i === idx ? { ...a, ...patch } : a));
    setAbilities(next);
    commit(next, spells, slots);
  }
  function removeAbility(idx: number) {
    const next = abilities.filter((_, i) => i !== idx);
    setAbilities(next);
    commit(next, spells, slots);
  }

  function addSpell() {
    const next: CharacterSpell[] = [
      ...spells,
      { name: "", school: "", level: 1, description: "", components: "" },
    ];
    setSpells(next);
    commit(abilities, next, slots);
  }
  function updateSpell(idx: number, patch: Partial<CharacterSpell>) {
    const next = spells.map((s, i) => (i === idx ? { ...s, ...patch } : s));
    setSpells(next);
    commit(abilities, next, slots);
  }
  function removeSpell(idx: number) {
    const next = spells.filter((_, i) => i !== idx);
    setSpells(next);
    commit(abilities, next, slots);
  }

  function setSlotsAndCommit(next: SpellSlotsState) {
    setSlots(next);
    commit(abilities, spells, next);
  }

  const spellsByLevel = spells.reduce<Record<number, CharacterSpell[]>>((acc, s) => {
    (acc[s.level] ??= []).push(s);
    return acc;
  }, {});
  const sortedLevels = Object.keys(spellsByLevel)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="flex flex-col gap-5">
      <section className="flex flex-col gap-2">
        <header className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Habilidades ({abilities.length})
          </h3>
          {editable && (
            <button
              type="button"
              onClick={addAbility}
              className="rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-200 hover:bg-zinc-700"
            >
              + Habilidade
            </button>
          )}
        </header>
        {abilities.length === 0 ? (
          <p className="text-xs text-zinc-500">Nenhuma habilidade.</p>
        ) : (
          abilities.map((a, i) => (
            <div key={i} className="rounded-md border border-zinc-800 bg-zinc-900 p-3">
              {editable ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={a.name}
                      placeholder="Nome"
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
              ) : (
                <>
                  <p className="text-sm font-medium text-zinc-100">
                    {a.name}{" "}
                    <span className="text-[10px] uppercase text-zinc-500">
                      ({a.type === "passive" ? "passiva" : "ativa"})
                    </span>
                  </p>
                  {a.description && (
                    <p className="mt-1 text-xs text-zinc-300">{a.description}</p>
                  )}
                </>
              )}
            </div>
          ))
        )}
      </section>

      <section className="flex flex-col gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Spell slots
        </h3>
        <SpellSlots slots={slots} editable={editable} onChange={setSlotsAndCommit} />
      </section>

      <section className="flex flex-col gap-2">
        <header className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Feitiços ({spells.length})
          </h3>
          {editable && (
            <button
              type="button"
              onClick={addSpell}
              className="rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-200 hover:bg-zinc-700"
            >
              + Feitiço
            </button>
          )}
        </header>
        {spells.length === 0 ? (
          <p className="text-xs text-zinc-500">Nenhum feitiço.</p>
        ) : (
          sortedLevels.map((lvl) => (
            <div key={lvl} className="flex flex-col gap-1">
              <p className="text-[10px] uppercase tracking-wide text-zinc-500">
                Nível {lvl}
              </p>
              {spellsByLevel[lvl].map((s) => {
                const idx = spells.findIndex((x) => x === s);
                return (
                  <div
                    key={idx}
                    className="rounded-md border border-zinc-800 bg-zinc-900 p-3"
                  >
                    {editable ? (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={s.name}
                            placeholder="Nome"
                            onChange={(e) => updateSpell(idx, { name: e.target.value })}
                            className="flex-1 rounded border border-zinc-800 bg-zinc-950 px-2 py-1 text-sm"
                          />
                          <input
                            type="number"
                            min={0}
                            max={9}
                            value={s.level}
                            onChange={(e) =>
                              updateSpell(idx, { level: Number(e.target.value) || 0 })
                            }
                            className="w-12 rounded border border-zinc-800 bg-zinc-950 px-2 py-1 text-center text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => removeSpell(idx)}
                            className="rounded bg-red-900/40 px-2 py-1 text-xs text-red-300 hover:bg-red-900/60"
                          >
                            ×
                          </button>
                        </div>
                        <input
                          type="text"
                          placeholder="Escola"
                          value={s.school}
                          onChange={(e) => updateSpell(idx, { school: e.target.value })}
                          className="rounded border border-zinc-800 bg-zinc-950 px-2 py-1 text-xs"
                        />
                        <textarea
                          rows={2}
                          placeholder="Descrição"
                          value={s.description}
                          onChange={(e) =>
                            updateSpell(idx, { description: e.target.value })
                          }
                          className="rounded border border-zinc-800 bg-zinc-950 px-2 py-1 text-sm"
                        />
                      </div>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-zinc-100">{s.name}</p>
                        <p className="text-[10px] uppercase text-zinc-500">
                          {s.school} · {s.components}
                        </p>
                        {s.description && (
                          <p className="mt-1 text-xs text-zinc-300">{s.description}</p>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          ))
        )}
      </section>

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
