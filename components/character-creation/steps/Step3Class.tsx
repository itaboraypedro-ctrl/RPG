"use client";

import { ClassCard } from "@/components/character-creation/cards/ClassCard";
import { CLASSES } from "@/lib/character-creation/class-data";
import type { AbilityKey, CharacterCreationData } from "@/lib/character-creation/types";

type Props = {
  data: Partial<CharacterCreationData>;
  onUpdate: (partial: Partial<CharacterCreationData>) => void;
  onGenerateImage: (step: 3) => void;
};

const ABILITY_LABEL: Record<AbilityKey, string> = {
  str: "FOR", dex: "DES", con: "CON", int: "INT", wis: "SAB", cha: "CAR",
};

export default function Step3Class({ data, onUpdate, onGenerateImage }: Props) {
  const selectedClass = CLASSES.find((c) => c.id === data.classId);

  const handleClassSelect = (classId: string) => {
    onUpdate({ classId });
    onGenerateImage(3);
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-5">

        {/* Lista */}
        <div>
          <p className="mb-2 font-cinzel text-[9px] uppercase tracking-[0.4em] text-arcana-text-dim">
            Vocação
          </p>
          <div className="arcana-list rounded-sm">
            {CLASSES.map((classData) => (
              <ClassCard
                key={classData.id}
                classData={classData}
                selected={data.classId === classData.id}
                onSelect={handleClassSelect}
              />
            ))}
          </div>
        </div>

        {/* Painel de detalhes */}
        {selectedClass ? (
          <div className="arcana-panel rounded-sm p-5 space-y-5">
            <div>
              <h3 className="font-cinzel text-xl uppercase tracking-[0.2em] text-arcana-gold-bright mb-2">
                {selectedClass.name}
              </h3>
              <p className="font-crimson italic text-arcana-text-dim leading-relaxed text-sm">
                {selectedClass.vibe}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <StatTile label="Dado de vida" value={`d${selectedClass.hitDie}`} />
              <StatTile label="Atributo principal" value={selectedClass.primaryAbility} />
              <StatTile
                label="Resistências"
                value={selectedClass.savingThrows.map((k) => ABILITY_LABEL[k]).join(", ")}
              />
              <StatTile label="HP nível 1" value={`${selectedClass.hitDie} + mod CON`} />
            </div>

            {selectedClass.armorProficiency.length > 0 && (
              <div className="space-y-1 pt-3 border-t border-arcana-border-dim">
                <p className="font-cinzel text-[9px] uppercase tracking-[0.35em] text-arcana-text-dim">
                  Proficiência em armaduras
                </p>
                <p className="font-crimson text-sm text-arcana-text">
                  {selectedClass.armorProficiency.join(", ")}
                </p>
              </div>
            )}

            <div className="space-y-1">
              <p className="font-cinzel text-[9px] uppercase tracking-[0.35em] text-arcana-text-dim">
                Proficiência em armas
              </p>
              <p className="font-crimson text-sm text-arcana-text">
                {selectedClass.weaponProficiency.join(", ")}
              </p>
            </div>

            {selectedClass.isSpellcaster && (
              <div className="rounded-sm border border-arcana-gold/20 bg-arcana-gold/6 px-4 py-3">
                <p className="font-cinzel text-[9px] uppercase tracking-[0.35em] text-arcana-gold/70 mb-1">
                  Conjurador
                </p>
                <p className="font-crimson text-sm text-arcana-text">
                  Conjuração via{" "}
                  <span className="text-arcana-gold">
                    {ABILITY_LABEL[selectedClass.spellcastingAbility as AbilityKey] ??
                      selectedClass.spellcastingAbility}
                  </span>
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="arcana-panel rounded-sm flex items-center justify-center min-h-[200px]">
            <p className="font-crimson italic text-arcana-text-dim text-sm">
              Selecione uma vocação
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="arcana-stat-chip rounded-sm px-3 py-2.5">
      <p className="font-cinzel text-[9px] uppercase tracking-[0.25em] text-arcana-text-dim">
        {label}
      </p>
      <p className="mt-0.5 font-cinzel text-sm text-arcana-gold">{value}</p>
    </div>
  );
}
