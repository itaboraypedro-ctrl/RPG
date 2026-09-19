"use client";

import { useMemo, useState } from "react";
import type { Character } from "@/lib/types";
import {
  type CharacterSpell,
  DEFAULT_SPELL_SLOTS,
  modifierOf,
  proficiencyBonusOf,
  skillsMetaOf,
  type SpellSlotsState,
  spellsOf,
  statsOf,
} from "@/components/characters/types";
import { PlayerBottomSheet } from "./PlayerBottomSheet";
import { PlayerSpellSlots } from "./PlayerSpellSlots";
import { commitSkillsField } from "./sheet-utils";

type Props = {
  character: Character;
  editable: boolean;
  onError: (message: string | null) => void;
};

const LEVEL_LABEL = (level: number) =>
  level === 0 ? "Truques" : `${level}º Círculo`;

export function PlayerSheetTabSpells({ character, editable, onError }: Props) {
  const stats = statsOf(character);
  const meta = skillsMetaOf(character);
  const slots: SpellSlotsState = meta.spell_slots ?? DEFAULT_SPELL_SLOTS;
  const allSpells = spellsOf(character);

  const profBonus = proficiencyBonusOf(character.level);
  const intMod = modifierOf(stats.intelligence);
  const spellDc = 8 + profBonus + intMod;
  const spellAtk = profBonus + intMod;

  const [openSpell, setOpenSpell] = useState<CharacterSpell | null>(null);

  const grouped = useMemo(() => {
    const map = new Map<number, CharacterSpell[]>();
    for (const sp of allSpells) {
      const lvl = typeof sp.level === "number" ? sp.level : 0;
      if (!map.has(lvl)) map.set(lvl, []);
      map.get(lvl)!.push(sp);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a - b);
  }, [allSpells]);

  async function toggleSlot(level: number, nextUsed: number) {
    if (!editable) return;
    const idx = level - 1;
    const total = slots.total[idx] ?? 0;
    const used = Math.max(0, Math.min(total, nextUsed));
    const nextSlots: SpellSlotsState = {
      total: slots.total.slice(),
      used: slots.used.slice(),
    };
    nextSlots.used[idx] = used;
    const { error } = await commitSkillsField(character.id, meta, "spell_slots", nextSlots);
    onError(error);
  }

  return (
    <div className="flex flex-col gap-4">
      <section className="relative overflow-hidden rounded border border-blue-500/20 bg-zinc-900">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent" />
        <div className="grid grid-cols-3 divide-x divide-zinc-800 p-1">
          <SpellStat label="Atrib." value="INT" />
          <SpellStat label="CD Magia" value={String(spellDc)} />
          <SpellStat label="Bônus Atq" value={fmtMod(spellAtk)} />
        </div>
      </section>

      <section>
        <SectionLabel>Spell slots</SectionLabel>
        <div className="rounded border border-zinc-800 bg-zinc-900 p-3">
          <PlayerSpellSlots slots={slots} disabled={!editable} onToggle={toggleSlot} />
        </div>
      </section>

      <section>
        <SectionLabel>Magias conhecidas</SectionLabel>
        {grouped.length === 0 ? (
          <p className="rounded border border-zinc-800 bg-zinc-900 p-3 text-xs text-zinc-500">
            Nenhuma magia cadastrada.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {grouped.map(([level, list]) => (
              <div key={level} className="flex flex-col gap-1">
                <h4 className="text-[10px] font-semibold uppercase tracking-[0.25em] text-violet-400" style={{ fontFamily: "var(--font-rpg-hud)" }}>
                  {LEVEL_LABEL(level)}
                </h4>
                <div className="flex flex-col gap-1">
                  {list.map((sp, i) => (
                    <button
                      key={`${sp.name}-${i}`}
                      type="button"
                      onClick={() => setOpenSpell(sp)}
                      className="relative flex items-baseline justify-between gap-2 overflow-hidden rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-left transition-colors hover:border-violet-500/50"
                    >
                      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />
                      <span className="flex items-baseline gap-2">
                        {level > 0 && <span className="text-violet-500 text-xs">♦</span>}
                        <span className="text-sm text-zinc-200" style={{ fontFamily: "var(--font-rpg-numbers)" }}>
                          {sp.name}
                        </span>
                      </span>
                      {sp.school && (
                        <span className="text-[10px] uppercase tracking-wider text-zinc-500" style={{ fontFamily: "var(--font-rpg-hud)" }}>
                          {sp.school}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <PlayerBottomSheet
        open={openSpell !== null}
        onClose={() => setOpenSpell(null)}
        title={openSpell?.name}
        subtitle={openSpell ? LEVEL_LABEL(openSpell.level) : undefined}
        accent="purple"
      >
        {openSpell && (
          <div className="flex flex-col gap-3">
            {openSpell.school && (
              <div className="grid grid-cols-2 gap-2 rounded border border-zinc-800 bg-zinc-950 p-3">
                <DetailRow label="Escola" value={openSpell.school} />
                {openSpell.components && (
                  <DetailRow label="Componentes" value={openSpell.components} />
                )}
              </div>
            )}
            {openSpell.description && (
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
                {openSpell.description}
              </p>
            )}
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

function SpellStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 py-2">
      <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-500" style={{ fontFamily: "var(--font-rpg-hud)" }}>
        {label}
      </span>
      <span className="text-base tabular-nums text-blue-400" style={{ fontFamily: "var(--font-rpg-numbers)" }}>
        {value}
      </span>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500" style={{ fontFamily: "var(--font-rpg-hud)" }}>
        {label}
      </span>
      <span className="text-sm text-zinc-200" style={{ fontFamily: "var(--font-rpg-numbers)" }}>
        {value}
      </span>
    </div>
  );
}

function fmtMod(n: number): string {
  return n >= 0 ? `+${n}` : `${n}`;
}
