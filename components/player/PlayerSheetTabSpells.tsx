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
    const { error } = await commitSkillsField(
      character.id,
      meta,
      "spell_slots",
      nextSlots
    );
    onError(error);
  }

  return (
    <div className="flex flex-col gap-4">
      <section className="grid grid-cols-3 gap-2">
        <Stat label="Atrib." value="INT" />
        <Stat label="CD Magia" value={String(spellDc)} />
        <Stat label="Bônus Atq" value={fmtMod(spellAtk)} />
      </section>

      <section>
        <h3
          className="mb-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-rpg-text-dim"
          style={{ fontFamily: "var(--font-rpg-hud)" }}
        >
          Spell slots
        </h3>
        <PlayerSpellSlots
          slots={slots}
          disabled={!editable}
          onToggle={toggleSlot}
        />
      </section>

      <section>
        <h3
          className="mb-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-rpg-text-dim"
          style={{ fontFamily: "var(--font-rpg-hud)" }}
        >
          Magias conhecidas
        </h3>
        {grouped.length === 0 ? (
          <p className="rounded-md border border-rpg-border bg-rpg-bg p-3 text-xs text-rpg-text-dim">
            Nenhuma magia cadastrada.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {grouped.map(([level, list]) => (
              <div key={level} className="flex flex-col gap-1">
                <h4
                  className="text-[10px] font-semibold uppercase tracking-[0.25em] text-rpg-purple"
                  style={{ fontFamily: "var(--font-rpg-hud)" }}
                >
                  {LEVEL_LABEL(level)}
                </h4>
                <div className="flex flex-col gap-1">
                  {list.map((sp, i) => (
                    <button
                      key={`${sp.name}-${i}`}
                      type="button"
                      onClick={() => setOpenSpell(sp)}
                      className="flex items-baseline justify-between gap-2 rounded-md border border-rpg-border bg-rpg-bg px-3 py-2 text-left transition-colors hover:border-rpg-purple/60"
                    >
                      <span className="flex items-baseline gap-2">
                        {level > 0 && (
                          <span className="text-rpg-purple">♦</span>
                        )}
                        <span
                          className="text-sm text-rpg-text"
                          style={{ fontFamily: "var(--font-rpg-numbers)" }}
                        >
                          {sp.name}
                        </span>
                      </span>
                      {sp.school && (
                        <span
                          className="text-[10px] uppercase tracking-wider text-rpg-text-dim"
                          style={{ fontFamily: "var(--font-rpg-hud)" }}
                        >
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
              <div className="grid grid-cols-2 gap-2 rounded-md border border-rpg-border bg-rpg-bg p-3">
                <DetailRow label="Escola" value={openSpell.school} />
                {openSpell.components && (
                  <DetailRow label="Componentes" value={openSpell.components} />
                )}
              </div>
            )}
            {openSpell.description && (
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-rpg-text">
                {openSpell.description}
              </p>
            )}
          </div>
        )}
      </PlayerBottomSheet>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 rounded-md border border-rpg-border bg-rpg-bg py-2">
      <span
        className="text-[9px] uppercase tracking-[0.2em] text-rpg-text-dim"
        style={{ fontFamily: "var(--font-rpg-hud)" }}
      >
        {label}
      </span>
      <span
        className="text-base tabular-nums text-rpg-purple"
        style={{ fontFamily: "var(--font-rpg-numbers)" }}
      >
        {value}
      </span>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <span
        className="text-[10px] uppercase tracking-[0.2em] text-rpg-text-dim"
        style={{ fontFamily: "var(--font-rpg-hud)" }}
      >
        {label}
      </span>
      <span
        className="text-sm text-rpg-text"
        style={{ fontFamily: "var(--font-rpg-numbers)" }}
      >
        {value}
      </span>
    </div>
  );
}

function fmtMod(n: number): string {
  return n >= 0 ? `+${n}` : `${n}`;
}
