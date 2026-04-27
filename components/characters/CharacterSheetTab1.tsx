"use client";

import type { Character } from "@/lib/types";
import {
  modifierOf,
  proficiencyBonusOf,
  SKILLS_5E,
  STAT_LABELS,
  skillsMetaOf,
  statsOf,
} from "./types";

export function CharacterSheetTab1({ character }: { character: Character }) {
  const stats = statsOf(character);
  const meta = skillsMetaOf(character);
  const profBonus = proficiencyBonusOf(character.level);
  const initial = character.name.charAt(0).toUpperCase();

  function fmt(n: number): string {
    return n >= 0 ? `+${n}` : `${n}`;
  }

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-center gap-3">
        {character.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={character.avatar_url}
            alt={character.name}
            className="h-20 w-20 rounded border border-zinc-800 object-cover"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded border border-zinc-800 bg-zinc-800 text-2xl">
            {initial}
          </div>
        )}
        <div>
          <h2 className="text-lg font-semibold text-zinc-100">{character.name}</h2>
          <p className="text-xs text-zinc-400">
            {character.race} · {character.class} · Nv {character.level}
          </p>
          {meta.alignment && (
            <p className="text-xs italic text-zinc-500">{meta.alignment}</p>
          )}
          {meta.background && (
            <p className="text-xs text-zinc-500">{meta.background}</p>
          )}
        </div>
      </header>

      <section className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {(Object.keys(STAT_LABELS) as (keyof typeof STAT_LABELS)[]).map((key) => {
          const score = stats[key];
          return (
            <div
              key={key}
              className="flex flex-col items-center gap-1 rounded-md border border-zinc-800 bg-zinc-900 p-2"
            >
              <span className="text-[10px] uppercase tracking-wide text-zinc-500">
                {STAT_LABELS[key]}
              </span>
              <span className="text-lg font-semibold text-zinc-100">{score}</span>
              <span className="text-xs text-emerald-400">{fmt(modifierOf(score))}</span>
            </div>
          );
        })}
      </section>

      <section className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="HP" value={`${character.hp}/${character.max_hp}`} />
        <Stat label="CA" value={String(character.ac)} />
        <Stat label="Velocidade" value={String(character.speed)} />
        <Stat label="Iniciativa" value={fmt(character.initiative)} />
        <Stat label="Bônus prof." value={fmt(profBonus)} />
        <Stat label="XP" value={String(character.xp)} />
        <Stat label="Ouro" value={String(character.gold)} />
        <Stat
          label="Death saves"
          value={`${character.death_saves.successes}✓ / ${character.death_saves.failures}✗`}
        />
      </section>

      <section className="flex flex-col gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Perícias
        </h3>
        <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
          {SKILLS_5E.map((s) => {
            const proficient = (meta.proficient ?? []).includes(s.id);
            const mod = modifierOf(stats[s.ability]);
            const bonus = mod + (proficient ? profBonus : 0);
            return (
              <div
                key={s.id}
                className="flex items-center justify-between gap-2 rounded border border-zinc-800 bg-zinc-900 px-2 py-1 text-xs"
              >
                <span className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      proficient ? "bg-emerald-500" : "bg-zinc-700"
                    }`}
                  />
                  <span className="text-zinc-200">{s.label}</span>
                  <span className="text-zinc-500">({STAT_LABELS[s.ability]})</span>
                </span>
                <span className={proficient ? "text-emerald-400" : "text-zinc-500"}>
                  {fmt(bonus)}
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-md border border-zinc-800 bg-zinc-900 p-2">
      <span className="text-[10px] uppercase tracking-wide text-zinc-500">{label}</span>
      <span className="text-sm text-zinc-100">{value}</span>
    </div>
  );
}
