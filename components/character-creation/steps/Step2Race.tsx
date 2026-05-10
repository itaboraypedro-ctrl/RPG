"use client";

import { RaceCard } from "@/components/character-creation/cards/RaceCard";
import { RACES } from "@/lib/character-creation/race-data";
import type {
  AbilityKey,
  CharacterCreationData,
} from "@/lib/character-creation/types";

type Props = {
  data: Partial<CharacterCreationData>;
  onUpdate: (partial: Partial<CharacterCreationData>) => void;
  onNext: () => void;
  onBack: () => void;
  onGenerateImage: (step: 2) => void;
};

const ABILITY_LABEL: Record<AbilityKey, string> = {
  str: "FOR",
  dex: "DES",
  con: "CON",
  int: "INT",
  wis: "SAB",
  cha: "CAR",
};

export default function Step2Race({
  data,
  onUpdate,
  onNext,
  onBack,
  onGenerateImage,
}: Props) {
  const selectedRace = RACES.find((r) => r.id === data.raceId);
  const selectedSubrace = selectedRace?.subraces.find(
    (s) => s.id === data.subraceId,
  );

  const hasSubraces = !!selectedRace && selectedRace.subraces.length > 0;
  const canProceed =
    !!data.raceId && (!hasSubraces || !!data.subraceId);

  const handleRaceSelect = (raceId: string, subraceId?: string) => {
    onUpdate({ raceId, subraceId });
    const race = RACES.find((r) => r.id === raceId);
    if (!race) return;
    const raceHasSubraces = race.subraces.length > 0;
    if (!raceHasSubraces || subraceId) {
      onGenerateImage(2);
    }
  };

  // Combina bônus de raça + sub-raça selecionada
  const combinedBonuses: Partial<Record<AbilityKey, number>> = {};
  if (selectedRace) {
    for (const [k, v] of Object.entries(selectedRace.abilityBonus)) {
      if (typeof v === "number") {
        combinedBonuses[k as AbilityKey] =
          (combinedBonuses[k as AbilityKey] ?? 0) + v;
      }
    }
  }
  if (selectedSubrace) {
    for (const [k, v] of Object.entries(selectedSubrace.abilityBonus)) {
      if (typeof v === "number") {
        combinedBonuses[k as AbilityKey] =
          (combinedBonuses[k as AbilityKey] ?? 0) + v;
      }
    }
  }

  const combinedTraits = [
    ...(selectedRace?.traits ?? []),
    ...(selectedSubrace?.traits ?? []),
  ];

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-6 overflow-y-auto px-1 pb-4">
        <header className="space-y-1">
          <h2 className="font-cinzel text-2xl uppercase tracking-[0.25em] text-arcana-gold-bright">
            Escolha sua Raça
          </h2>
          <p className="font-crimson text-arcana-text-dim">
            A herança que define seus traços
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {RACES.map((race) => (
            <RaceCard
              key={race.id}
              race={race}
              selected={data.raceId === race.id}
              selectedSubraceId={data.subraceId}
              onSelect={handleRaceSelect}
            />
          ))}
        </div>

        {selectedRace && (
          <div className="rounded-md border border-arcana-border bg-arcana-surface p-4 space-y-3">
            <div>
              <h3 className="font-cinzel text-lg uppercase tracking-[0.2em] text-arcana-gold-bright">
                {selectedRace.name}
                {selectedSubrace ? (
                  <span className="text-arcana-text-dim font-crimson normal-case tracking-normal text-base">
                    {" "}— {selectedSubrace.name}
                  </span>
                ) : null}
              </h3>
            </div>

            {Object.keys(combinedBonuses).length > 0 && (
              <div className="flex flex-wrap gap-2">
                {(Object.entries(combinedBonuses) as [AbilityKey, number][]).map(
                  ([key, value]) => (
                    <span
                      key={key}
                      className="rounded-full border border-arcana-gold/40 bg-arcana-gold/10 px-3 py-1 font-cinzel text-xs uppercase tracking-[0.2em] text-arcana-gold"
                    >
                      {value >= 0 ? `+${value}` : value} {ABILITY_LABEL[key]}
                    </span>
                  ),
                )}
              </div>
            )}

            <p className="font-crimson text-sm text-arcana-text-dim">
              Velocidade: {selectedRace.speed}m · Tamanho:{" "}
              {selectedRace.size === "small" ? "Pequeno" : "Médio"}
            </p>

            {combinedTraits.length > 0 && (
              <ul className="list-disc pl-5 font-crimson text-sm text-arcana-text">
                {combinedTraits.slice(0, 6).map((trait) => (
                  <li key={trait}>{trait}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t border-arcana-border bg-arcana-bg/95 pt-4 backdrop-blur">
        <button
          type="button"
          onClick={onBack}
          className="font-cinzel uppercase tracking-[0.3em] px-6 py-3 rounded-md border border-arcana-border text-arcana-text-dim hover:border-arcana-gold/40 hover:text-arcana-gold"
        >
          ← Voltar
        </button>
        <button
          type="button"
          disabled={!canProceed}
          onClick={onNext}
          className={`font-cinzel uppercase tracking-[0.3em] px-8 py-3 rounded-md transition ${
            canProceed
              ? "bg-arcana-gold text-arcana-bg hover:bg-arcana-gold-bright"
              : "bg-arcana-gold text-arcana-bg opacity-50 cursor-not-allowed"
          }`}
        >
          Próximo →
        </button>
      </div>
    </div>
  );
}
