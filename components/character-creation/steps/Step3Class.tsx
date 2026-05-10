"use client";

import { ClassCard } from "@/components/character-creation/cards/ClassCard";
import { CLASSES } from "@/lib/character-creation/class-data";
import type {
  AbilityKey,
  CharacterCreationData,
} from "@/lib/character-creation/types";

type Props = {
  data: Partial<CharacterCreationData>;
  onUpdate: (partial: Partial<CharacterCreationData>) => void;
  onNext: () => void;
  onBack: () => void;
  onGenerateImage: (step: 3) => void;
};

const ABILITY_LABEL: Record<AbilityKey, string> = {
  str: "FOR",
  dex: "DES",
  con: "CON",
  int: "INT",
  wis: "SAB",
  cha: "CAR",
};

export default function Step3Class({
  data,
  onUpdate,
  onNext,
  onBack,
  onGenerateImage,
}: Props) {
  const selectedClass = CLASSES.find((c) => c.id === data.classId);
  const canProceed = !!data.classId;

  const handleClassSelect = (classId: string) => {
    onUpdate({ classId });
    onGenerateImage(3);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-6 overflow-y-auto px-1 pb-4">
        <header className="space-y-1">
          <h2 className="font-cinzel text-2xl uppercase tracking-[0.25em] text-arcana-gold-bright">
            Escolha sua Classe
          </h2>
          <p className="font-crimson text-arcana-text-dim">
            O caminho que define suas habilidades
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CLASSES.map((classData) => (
            <ClassCard
              key={classData.id}
              classData={classData}
              selected={data.classId === classData.id}
              onSelect={handleClassSelect}
            />
          ))}
        </div>

        {selectedClass && (
          <div className="rounded-md border border-arcana-border bg-arcana-surface p-4 space-y-3">
            <h3 className="font-cinzel text-2xl uppercase tracking-[0.2em] text-arcana-gold-bright">
              {selectedClass.name}
            </h3>

            <p className="font-crimson text-sm text-arcana-text">
              Dado de Vida: d{selectedClass.hitDie} · HP inicial:{" "}
              {selectedClass.hitDie} + mod CON
            </p>

            <p className="font-crimson text-sm text-arcana-text">
              Atributo principal:{" "}
              <span className="text-arcana-gold">
                {selectedClass.primaryAbility}
              </span>
            </p>

            <p className="font-crimson text-sm text-arcana-text">
              Resistências:{" "}
              <span className="text-arcana-gold">
                {selectedClass.savingThrows
                  .map((k) => ABILITY_LABEL[k])
                  .join(", ")}
              </span>
            </p>

            <p className="font-crimson text-sm text-arcana-text">
              Armaduras:{" "}
              <span className="text-arcana-text-dim">
                {selectedClass.armorProficiency.length > 0
                  ? selectedClass.armorProficiency.join(", ")
                  : "Nenhuma"}
              </span>
            </p>

            <p className="font-crimson text-sm text-arcana-text">
              Armas:{" "}
              <span className="text-arcana-text-dim">
                {selectedClass.weaponProficiency.join(", ")}
              </span>
            </p>

            <p className="font-crimson text-sm italic text-arcana-text-dim">
              {selectedClass.vibe}
            </p>
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
