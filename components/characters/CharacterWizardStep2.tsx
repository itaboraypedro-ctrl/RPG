"use client";

import {
  type CharacterStatBlock,
  modifierOf,
  proficiencyBonusOf,
  SKILLS_5E,
  STAT_LABELS,
} from "./types";
import type { CharacterDraft, DraftSetter } from "./CharacterWizard";

const STAT_KEYS: (keyof CharacterStatBlock)[] = [
  "strength",
  "dexterity",
  "constitution",
  "intelligence",
  "wisdom",
  "charisma",
];

export function CharacterWizardStep2({
  draft,
  setDraft,
}: {
  draft: CharacterDraft;
  setDraft: DraftSetter;
}) {
  const profBonus = proficiencyBonusOf(draft.level);

  function setStat(key: keyof CharacterStatBlock, value: number) {
    setDraft((d) => ({
      ...d,
      stats: { ...d.stats, [key]: Math.max(1, Math.min(30, value)) },
    }));
  }

  function toggleProficient(skillId: string) {
    setDraft((d) => {
      const has = d.proficient.includes(skillId);
      return {
        ...d,
        proficient: has
          ? d.proficient.filter((s) => s !== skillId)
          : [...d.proficient, skillId],
      };
    });
  }

  function fmtMod(n: number): string {
    return n >= 0 ? `+${n}` : `${n}`;
  }

  return (
    <div className="flex flex-col gap-5">
      <section className="flex flex-col gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Atributos
        </h3>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {STAT_KEYS.map((key) => {
            const score = draft.stats[key];
            const mod = modifierOf(score);
            return (
              <div
                key={key}
                className="flex flex-col items-center gap-1 rounded-md border border-zinc-800 bg-zinc-900 p-2"
              >
                <span className="text-[10px] uppercase tracking-wide text-zinc-500">
                  {STAT_LABELS[key]}
                </span>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={score}
                  onChange={(e) => setStat(key, Number(e.target.value) || 1)}
                  className="w-full rounded border border-zinc-800 bg-zinc-950 py-1 text-center text-sm"
                />
                <span className="text-xs text-emerald-400">{fmtMod(mod)}</span>
              </div>
            );
          })}
        </div>
        <p className="text-[10px] text-zinc-500">
          Bônus de proficiência: <span className="text-zinc-300">{fmtMod(profBonus)}</span>
        </p>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="hp" className="text-xs text-zinc-400">
            HP atual
          </label>
          <input
            id="hp"
            type="number"
            min={0}
            value={draft.hp}
            onChange={(e) =>
              setDraft((d) => ({ ...d, hp: Math.max(0, Number(e.target.value) || 0) }))
            }
            className="rounded border border-zinc-800 bg-zinc-900 px-2 py-1.5 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="max_hp" className="text-xs text-zinc-400">
            HP máximo
          </label>
          <input
            id="max_hp"
            type="number"
            min={1}
            value={draft.max_hp}
            onChange={(e) => {
              const v = Math.max(1, Number(e.target.value) || 1);
              setDraft((d) => ({ ...d, max_hp: v, hp: Math.min(d.hp, v) }));
            }}
            className="rounded border border-zinc-800 bg-zinc-900 px-2 py-1.5 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="ac" className="text-xs text-zinc-400">
            CA
          </label>
          <input
            id="ac"
            type="number"
            min={0}
            value={draft.ac}
            onChange={(e) =>
              setDraft((d) => ({ ...d, ac: Math.max(0, Number(e.target.value) || 0) }))
            }
            className="rounded border border-zinc-800 bg-zinc-900 px-2 py-1.5 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="speed" className="text-xs text-zinc-400">
            Velocidade
          </label>
          <input
            id="speed"
            type="number"
            min={0}
            value={draft.speed}
            onChange={(e) =>
              setDraft((d) => ({ ...d, speed: Math.max(0, Number(e.target.value) || 0) }))
            }
            className="rounded border border-zinc-800 bg-zinc-900 px-2 py-1.5 text-sm"
          />
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Perícias
        </h3>
        <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
          {SKILLS_5E.map((s) => {
            const proficient = draft.proficient.includes(s.id);
            const mod = modifierOf(draft.stats[s.ability]);
            const bonus = mod + (proficient ? profBonus : 0);
            return (
              <label
                key={s.id}
                className="flex items-center justify-between gap-2 rounded border border-zinc-800 bg-zinc-900 px-2 py-1 text-xs"
              >
                <span className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={proficient}
                    onChange={() => toggleProficient(s.id)}
                    className="accent-emerald-500"
                  />
                  <span className="text-zinc-200">{s.label}</span>
                  <span className="text-zinc-500">
                    ({STAT_LABELS[s.ability]})
                  </span>
                </span>
                <span
                  className={proficient ? "text-emerald-400" : "text-zinc-500"}
                >
                  {fmtMod(bonus)}
                </span>
              </label>
            );
          })}
        </div>
      </section>
    </div>
  );
}
