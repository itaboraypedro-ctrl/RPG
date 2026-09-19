"use client";

import { RaceCard } from "@/components/character-creation/cards/RaceCard";
import { RACES } from "@/lib/character-creation/race-data";
import type { AbilityKey, CharacterCreationData } from "@/lib/character-creation/types";

function getAgeLabel(age: number, maturity: number, max: number): string {
  const span = max - maturity;
  if (age < maturity + span * 0.2) return "Jovem";
  if (age < maturity + span * 0.5) return "Adulto";
  if (age < maturity + span * 0.75) return "Maduro";
  return "Ancião";
}

type Props = {
  data: Partial<CharacterCreationData>;
  onUpdate: (partial: Partial<CharacterCreationData>) => void;
  onGenerateImage: (step: 2) => void;
};

const ABILITY_LABEL: Record<AbilityKey, string> = {
  str: "FOR", dex: "DES", con: "CON", int: "INT", wis: "SAB", cha: "CAR",
};

export default function Step2Race({ data, onUpdate, onGenerateImage }: Props) {
  const selectedRace = RACES.find((r) => r.id === data.raceId);
  const selectedSubrace = selectedRace?.subraces.find((s) => s.id === data.subraceId);
  const hasSubraces = !!selectedRace && selectedRace.subraces.length > 0;
  const ageRange = selectedRace?.ageRange;
  const currentAge = data.age ?? ageRange?.maturity ?? 25;

  const handleRaceSelect = (raceId: string) => {
    const race = RACES.find((r) => r.id === raceId);
    onUpdate({ raceId, subraceId: undefined, age: race?.ageRange.maturity });
    if (race && race.subraces.length === 0) onGenerateImage(2);
  };

  const handleSubraceSelect = (subraceId: string) => {
    onUpdate({ subraceId });
    onGenerateImage(2);
  };

  const combinedBonuses: Partial<Record<AbilityKey, number>> = {};
  for (const [k, v] of Object.entries(selectedRace?.abilityBonus ?? {})) {
    if (typeof v === "number") combinedBonuses[k as AbilityKey] = (combinedBonuses[k as AbilityKey] ?? 0) + v;
  }
  for (const [k, v] of Object.entries(selectedSubrace?.abilityBonus ?? {})) {
    if (typeof v === "number") combinedBonuses[k as AbilityKey] = (combinedBonuses[k as AbilityKey] ?? 0) + v;
  }

  const combinedTraits = [...(selectedRace?.traits ?? []), ...(selectedSubrace?.traits ?? [])];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-5">

        {/* Lista */}
        <div>
          <p className="mb-2 font-cinzel text-[9px] uppercase tracking-[0.4em] text-arcana-text-dim">
            Origem
          </p>
          <div className="arcana-list rounded-sm">
            {RACES.map((race) => (
              <RaceCard
                key={race.id}
                race={race}
                selected={data.raceId === race.id}
                onSelect={handleRaceSelect}
              />
            ))}
          </div>
        </div>

        {/* Painel de detalhes */}
        {selectedRace ? (
          <div className="arcana-panel rounded-sm p-5 space-y-5">
            {/* Header */}
            <div>
              <div className="flex items-baseline gap-2 mb-2">
                <h3 className="font-cinzel text-xl uppercase tracking-[0.2em] text-arcana-gold-bright">
                  {selectedRace.name}
                </h3>
                {selectedSubrace && (
                  <span className="font-crimson text-arcana-text-dim">
                    {selectedSubrace.name}
                  </span>
                )}
              </div>

              {/* Ability bonuses */}
              {Object.keys(combinedBonuses).length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {(Object.entries(combinedBonuses) as [AbilityKey, number][]).map(([key, value]) => (
                    <span
                      key={key}
                      className="arcana-stat-chip rounded-sm px-2.5 py-1 font-cinzel text-[10px] uppercase tracking-[0.2em] text-arcana-gold"
                    >
                      {value >= 0 ? `+${value}` : value} {ABILITY_LABEL[key]}
                    </span>
                  ))}
                  <span className="arcana-stat-chip rounded-sm px-2.5 py-1 font-cinzel text-[10px] uppercase tracking-[0.15em] text-arcana-text-dim">
                    {selectedRace.speed}m
                  </span>
                  <span className="arcana-stat-chip rounded-sm px-2.5 py-1 font-cinzel text-[10px] uppercase tracking-[0.15em] text-arcana-text-dim">
                    {selectedRace.size === "small" ? "Pequeno" : "Médio"}
                  </span>
                </div>
              )}
            </div>

            {/* Traits */}
            {combinedTraits.length > 0 && (
              <div className="space-y-1.5">
                <p className="font-cinzel text-[9px] uppercase tracking-[0.35em] text-arcana-text-dim">
                  Traços
                </p>
                <ul className="space-y-1">
                  {combinedTraits.slice(0, 6).map((trait) => (
                    <li key={trait} className="flex items-start gap-2.5 font-crimson text-sm text-arcana-text">
                      <span className="mt-[7px] block h-px w-3 shrink-0 bg-arcana-gold/50" />
                      {trait}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Subraça */}
            {hasSubraces && (
              <div className="space-y-2 pt-4 border-t border-arcana-border-dim">
                <p className="font-cinzel text-[9px] uppercase tracking-[0.35em] text-arcana-text-dim">
                  Linhagem
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedRace.subraces.map((sub) => {
                    const isActive = data.subraceId === sub.id;
                    const subBonuses = Object.entries(sub.abilityBonus);
                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => handleSubraceSelect(sub.id)}
                        className={[
                          "text-left px-4 py-3 rounded-sm border transition-all duration-150",
                          isActive
                            ? "arcana-stat-chip-active text-arcana-gold-bright"
                            : "border-arcana-border-dim bg-arcana-surface hover:border-arcana-border text-arcana-text-dim",
                        ].join(" ")}
                      >
                        <span className="font-cinzel text-sm uppercase tracking-[0.15em] block">
                          {sub.name}
                        </span>
                        {subBonuses.length > 0 && (
                          <span className="mt-0.5 font-cinzel text-[9px] tracking-[0.1em] text-arcana-gold/60 block">
                            {subBonuses.map(([k, v]) =>
                              `${v >= 0 ? "+" : ""}${v} ${ABILITY_LABEL[k as AbilityKey] ?? k.toUpperCase()}`
                            ).join("  ")}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Idade */}
            {ageRange && (
              <div className="space-y-3 pt-4 border-t border-arcana-border-dim">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="font-cinzel text-[9px] uppercase tracking-[0.35em] text-arcana-text-dim mb-1">
                      Idade
                    </p>
                    <p className="font-cinzel text-3xl text-arcana-gold-bright leading-none">
                      {currentAge}
                      <span className="font-crimson text-sm text-arcana-text-dim ml-1.5">anos</span>
                    </p>
                    <p className="font-cinzel text-[9px] uppercase tracking-[0.2em] text-arcana-text-dim mt-0.5">
                      {getAgeLabel(currentAge, ageRange.maturity, ageRange.max)}
                    </p>
                  </div>
                  <p className="font-crimson text-xs text-arcana-text-dim text-right">
                    Longevidade até<br />{ageRange.max} anos
                  </p>
                </div>
                <input
                  type="range"
                  min={ageRange.min}
                  max={ageRange.max}
                  step={1}
                  value={currentAge}
                  onChange={(e) => onUpdate({ age: Number(e.target.value) })}
                  className="w-full accent-[var(--color-arcana-gold,#c9a84c)] cursor-pointer"
                />
                <div className="flex justify-between font-cinzel text-[9px] tracking-[0.15em] text-arcana-text-dim/50">
                  <span>{ageRange.min}</span>
                  <span>{Math.round((ageRange.min + ageRange.max) / 2)}</span>
                  <span>{ageRange.max}</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="arcana-panel rounded-sm flex items-center justify-center min-h-[200px]">
            <p className="font-crimson italic text-arcana-text-dim text-sm">
              Selecione uma origem
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
