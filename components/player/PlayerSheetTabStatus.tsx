"use client";

import { useState } from "react";
import type { Character } from "@/lib/types";
import {
  type CharacterStatBlock,
  modifierOf,
  proficiencyBonusOf,
  skillsMetaOf,
  STAT_LABELS,
  statsOf,
} from "@/components/characters/types";
import { PlayerBottomSheet } from "./PlayerBottomSheet";
import { commitCharacterField } from "./sheet-utils";

const STAT_DESCRIPTIONS: Record<keyof CharacterStatBlock, string> = {
  strength: "Força mede capacidade física, atletismo e poder bruto.",
  dexterity: "Destreza mede agilidade, reflexos e equilíbrio.",
  constitution: "Constituição mede resistência, vitalidade e força vital.",
  intelligence: "Inteligência mede memória, raciocínio e conhecimento.",
  wisdom: "Sabedoria mede percepção, intuição e discernimento.",
  charisma: "Carisma mede força de personalidade, persuasão e liderança.",
};

type Props = {
  character: Character;
  editable: boolean;
  onError: (message: string | null) => void;
};

export function PlayerSheetTabStatus({ character, editable, onError }: Props) {
  const [statOpen, setStatOpen] = useState<keyof CharacterStatBlock | null>(null);

  const stats = statsOf(character);
  const meta = skillsMetaOf(character);
  const profBonus = proficiencyBonusOf(character.level);
  const dead = character.hp === 0;
  const xpPct =
    character.xp_next_level > 0
      ? Math.min(100, (character.xp / character.xp_next_level) * 100)
      : 0;

  const proficientSaves =
    ((meta as Record<string, unknown>).proficient_saves as string[]) ?? [];

  async function bumpDeathSave(kind: "successes" | "failures") {
    if (!editable) return;
    const next = {
      ...character.death_saves,
      [kind]: Math.min(3, (character.death_saves[kind] ?? 0) + 1),
    };
    const { error } = await commitCharacterField(character.id, { death_saves: next });
    onError(error);
  }

  async function resetDeathSaves() {
    if (!editable) return;
    const { error } = await commitCharacterField(character.id, {
      death_saves: { successes: 0, failures: 0 },
    });
    onError(error);
  }

  return (
    <div className="flex flex-col gap-4">
      {dead && (
        <section className="relative overflow-hidden rounded border border-red-500/30 bg-red-950/20 p-3">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500 to-transparent" />
          <p className="mb-2 text-sm font-semibold text-red-400" style={{ fontFamily: "var(--font-rpg-numbers)" }}>
            Inconsciente — Death saves
          </p>
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => bumpDeathSave("successes")}
              disabled={!editable}
              className="flex-1 rounded border border-emerald-500/40 bg-emerald-950/30 py-2 text-emerald-400 hover:bg-emerald-950/50 disabled:opacity-40"
            >
              {Array.from({ length: 3 }).map((_, i) => (
                <span key={i} className={`mx-0.5 inline-block h-2.5 w-2.5 rounded-full ${i < (character.death_saves.successes ?? 0) ? "bg-emerald-400" : "bg-emerald-900"}`} />
              ))}
              <span className="ml-2 text-xs">Sucesso</span>
            </button>
            <button
              type="button"
              onClick={() => bumpDeathSave("failures")}
              disabled={!editable}
              className="flex-1 rounded border border-red-500/40 bg-red-950/30 py-2 text-red-400 hover:bg-red-950/50 disabled:opacity-40"
            >
              {Array.from({ length: 3 }).map((_, i) => (
                <span key={i} className={`mx-0.5 inline-block h-2.5 w-2.5 rounded-full ${i < (character.death_saves.failures ?? 0) ? "bg-red-400" : "bg-red-950"}`} />
              ))}
              <span className="ml-2 text-xs">Falha</span>
            </button>
          </div>
          <button
            type="button"
            onClick={resetDeathSaves}
            disabled={!editable}
            className="mt-2 self-end text-[10px] uppercase tracking-wider text-zinc-500 hover:text-zinc-300"
          >
            Resetar
          </button>
        </section>
      )}

      <section>
        <SectionLabel>Atributos</SectionLabel>
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(STAT_LABELS) as (keyof CharacterStatBlock)[]).map((key) => {
            const score = stats[key];
            const mod = modifierOf(score);
            return (
              <button
                key={key}
                type="button"
                onClick={() => setStatOpen(key)}
                className="relative flex flex-col items-center gap-0.5 overflow-hidden rounded border border-zinc-800 bg-zinc-900 py-3 transition-colors hover:border-blue-500/50"
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />
                <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-500" style={{ fontFamily: "var(--font-rpg-hud)" }}>
                  {STAT_LABELS[key]}
                </span>
                <span className="text-xl tabular-nums text-zinc-100" style={{ fontFamily: "var(--font-rpg-numbers)" }}>
                  {score}
                </span>
                <span className="text-[11px] tabular-nums text-blue-400" style={{ fontFamily: "var(--font-rpg-numbers)" }}>
                  {fmtMod(mod)}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <SectionLabel>Salvaguardas</SectionLabel>
        <div className="grid grid-cols-2 gap-1.5">
          {(Object.keys(STAT_LABELS) as (keyof CharacterStatBlock)[]).map((key) => {
            const proficient = proficientSaves.includes(key);
            const value = modifierOf(stats[key]) + (proficient ? profBonus : 0);
            return (
              <div key={key} className="flex items-center gap-2 rounded border border-zinc-800 bg-zinc-900 px-2 py-2">
                <span className={`h-2 w-2 rounded-full ${proficient ? "bg-emerald-400" : "bg-zinc-700"}`} />
                <span className="flex-1 text-[11px] uppercase tracking-wider text-zinc-500" style={{ fontFamily: "var(--font-rpg-hud)" }}>
                  {STAT_LABELS[key]}
                </span>
                <span className="text-sm tabular-nums text-zinc-200" style={{ fontFamily: "var(--font-rpg-numbers)" }}>
                  {fmtMod(value)}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between">
          <SectionLabel>Experiência</SectionLabel>
          <span className="text-xs tabular-nums text-zinc-400" style={{ fontFamily: "var(--font-rpg-numbers)" }}>
            {character.xp} / {character.xp_next_level}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full border border-zinc-800 bg-zinc-950">
          <div
            className="h-full bg-violet-500 transition-[width] duration-[400ms] ease-out"
            style={{ width: `${xpPct}%` }}
          />
        </div>
      </section>

      <PlayerBottomSheet
        open={statOpen !== null}
        onClose={() => setStatOpen(null)}
        title={statOpen ? STAT_LABELS[statOpen] : undefined}
        subtitle="Atributo"
        accent="blue"
      >
        {statOpen && (
          <div className="flex flex-col gap-3">
            <p className="text-sm leading-relaxed text-zinc-300">
              {STAT_DESCRIPTIONS[statOpen]}
            </p>
            <div className="grid grid-cols-3 gap-2 rounded border border-zinc-800 bg-zinc-950 p-3">
              <DetailStat label="Valor" value={String(stats[statOpen])} />
              <DetailStat label="Modificador" value={fmtMod(modifierOf(stats[statOpen]))} />
              <DetailStat
                label="Salvaguarda"
                value={fmtMod(modifierOf(stats[statOpen]) + (proficientSaves.includes(statOpen) ? profBonus : 0))}
              />
            </div>
            <p className="text-[11px] text-zinc-500">
              {proficientSaves.includes(statOpen)
                ? "Você é proficiente nesta salvaguarda."
                : "Você não é proficiente nesta salvaguarda."}
            </p>
          </div>
        )}
      </PlayerBottomSheet>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-zinc-500" style={{ fontFamily: "var(--font-rpg-hud)" }}>
      {children}
    </h3>
  );
}

function DetailStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-500" style={{ fontFamily: "var(--font-rpg-hud)" }}>
        {label}
      </span>
      <span className="text-base tabular-nums text-zinc-100" style={{ fontFamily: "var(--font-rpg-numbers)" }}>
        {value}
      </span>
    </div>
  );
}

function fmtMod(n: number): string {
  return n >= 0 ? `+${n}` : `${n}`;
}
