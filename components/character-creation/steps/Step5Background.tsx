"use client";

import { useMemo, useState } from "react";
import type { CharacterCreationData } from "@/lib/character-creation/types";
import { BACKGROUNDS } from "@/lib/character-creation/background-data";
import { BackgroundCard } from "@/components/character-creation/cards/BackgroundCard";

type Props = {
  data: Partial<CharacterCreationData>;
  onUpdate: (partial: Partial<CharacterCreationData>) => void;
  onGenerateImage: (step: 5) => void;
};

type PersonalityField = "trait" | "ideal" | "bond" | "flaw";

const PERSONALITY_LABELS: Record<PersonalityField, string> = {
  trait: "Traço",
  ideal: "Ideal",
  bond: "Vínculo",
  flaw: "Defeito",
};

const PERSONALITY_DESC: Record<PersonalityField, string> = {
  trait: "Como você age",
  ideal: "O que te move",
  bond: "A que você está preso",
  flaw: "Sua fraqueza",
};

export default function Step5Background({ data, onUpdate, onGenerateImage }: Props) {
  const [openPickerField, setOpenPickerField] = useState<PersonalityField | null>(null);

  const selectedBg = useMemo(
    () => BACKGROUNDS.find((bg) => bg.id === data.backgroundId),
    [data.backgroundId],
  );

  const personality = data.personality ?? {};

  const updatePersonality = (field: PersonalityField, value: string) => {
    onUpdate({ personality: { ...personality, [field]: value || undefined } });
    setOpenPickerField(null);
  };

  const personalityOptions: Record<PersonalityField, string[]> = {
    trait: selectedBg?.personalityTraits ?? [],
    ideal: selectedBg?.ideals ?? [],
    bond: selectedBg?.bonds ?? [],
    flaw: selectedBg?.flaws ?? [],
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-5">

        {/* Lista */}
        <div>
          <p className="mb-2 font-cinzel text-[9px] uppercase tracking-[0.4em] text-arcana-text-dim">
            Antecedente
          </p>
          <div className="arcana-list rounded-xl">
            {BACKGROUNDS.map((bg) => (
              <BackgroundCard
                key={bg.id}
                background={bg}
                selected={data.backgroundId === bg.id}
                onSelect={(id) => {
                  onUpdate({ backgroundId: id });
                  setOpenPickerField(null);
                }}
              />
            ))}
          </div>
        </div>

        {/* Painel */}
        {selectedBg ? (
          <div className="arcana-panel rounded-xl p-5 space-y-5">
            <div>
              <h3 className="font-cinzel text-xl uppercase tracking-[0.2em] text-arcana-gold-bright mb-2">
                {selectedBg.name}
              </h3>
              {selectedBg.visualDetail && (
                <p className="font-crimson italic text-arcana-text-dim text-sm leading-relaxed">
                  {selectedBg.visualDetail}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              {selectedBg.skills.length > 0 && (
                <div className="col-span-2 arcana-stat-chip rounded-xl px-3 py-2.5">
                  <p className="font-cinzel text-[9px] uppercase tracking-[0.25em] text-arcana-text-dim">
                    Perícias treinadas
                  </p>
                  <p className="mt-0.5 font-crimson text-sm text-arcana-gold">
                    {selectedBg.skills.join(", ")}
                  </p>
                </div>
              )}
            </div>

            {selectedBg.equipment.length > 0 && (
              <div className="space-y-1.5 pt-3 border-t border-arcana-border-dim">
                <p className="font-cinzel text-[9px] uppercase tracking-[0.35em] text-arcana-text-dim">
                  Equipamento inicial
                </p>
                <ul className="space-y-1">
                  {selectedBg.equipment.map((item, i) => (
                    <li key={`${item}-${i}`} className="flex items-start gap-2.5 font-crimson text-sm text-arcana-text">
                      <span className="mt-[7px] block h-px w-3 shrink-0 bg-arcana-gold/40" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {selectedBg.feature && (
              <div className="space-y-1 pt-3 border-t border-arcana-border-dim">
                <p className="font-cinzel text-[9px] uppercase tracking-[0.35em] text-arcana-gold/70">
                  {selectedBg.feature}
                </p>
                {selectedBg.featureDesc && (
                  <p className="font-crimson text-sm text-arcana-text-dim">{selectedBg.featureDesc}</p>
                )}
              </div>
            )}

            {/* Personalidade */}
            <div className="space-y-2 pt-3 border-t border-arcana-border-dim">
              <p className="font-cinzel text-[9px] uppercase tracking-[0.35em] text-arcana-text-dim">
                Personalidade — opcional
              </p>
              <div className="grid grid-cols-2 gap-2">
                {(["trait", "ideal", "bond", "flaw"] as PersonalityField[]).map((field) => {
                  const chosen = personality[field];
                  const options = personalityOptions[field];
                  const isOpen = openPickerField === field;

                  return (
                    <div key={field} className="relative">
                      <button
                        type="button"
                        onClick={() => setOpenPickerField(isOpen ? null : field)}
                        className={[
                          "w-full text-left px-3 py-2.5 rounded-xl border transition-all duration-150",
                          isOpen
                            ? "border-arcana-gold bg-arcana-gold/8"
                            : chosen
                              ? "arcana-stat-chip"
                              : "border-arcana-border-dim bg-arcana-surface hover:border-arcana-border",
                        ].join(" ")}
                      >
                        <p className="font-cinzel text-[9px] uppercase tracking-[0.25em] text-arcana-text-dim mb-1">
                          {PERSONALITY_LABELS[field]}
                        </p>
                        {chosen ? (
                          <p className="font-crimson text-xs text-arcana-text leading-snug line-clamp-2">{chosen}</p>
                        ) : (
                          <p className="font-crimson text-xs text-arcana-text-muted italic">{PERSONALITY_DESC[field]}</p>
                        )}
                      </button>

                      {isOpen && options.length > 0 && (
                        <div className="absolute left-0 top-full z-20 mt-1 w-[280px] max-h-[240px] overflow-y-auto rounded-xl arcana-panel-elevated">
                          {chosen && (
                            <button
                              type="button"
                              onClick={() => { onUpdate({ personality: { ...personality, [field]: undefined } }); setOpenPickerField(null); }}
                              className="w-full text-left px-4 py-2.5 font-crimson text-xs text-arcana-text-dim hover:text-arcana-text hover:bg-arcana-surface-3 border-b border-arcana-border-dim"
                            >
                              Nenhum
                            </button>
                          )}
                          {options.map((opt, i) => (
                            <button
                              key={`${opt}-${i}`}
                              type="button"
                              onClick={() => updatePersonality(field, opt)}
                              className={[
                                "w-full text-left px-4 py-3 font-crimson text-sm leading-snug transition-colors border-b border-arcana-border-dim last:border-b-0",
                                opt === chosen
                                  ? "bg-arcana-gold/10 text-arcana-gold"
                                  : "text-arcana-text hover:bg-arcana-surface-3",
                              ].join(" ")}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => onGenerateImage(5)}
                className="arcana-btn-ghost text-xs"
              >
                Atualizar retrato com antecedente
              </button>
            </div>
          </div>
        ) : (
          <div className="arcana-panel rounded-xl flex items-center justify-center min-h-[200px]">
            <p className="font-crimson italic text-arcana-text-dim text-sm">
              Selecione um antecedente
            </p>
          </div>
        )}
      </div>

      {openPickerField && (
        <div className="fixed inset-0 z-10" onClick={() => setOpenPickerField(null)} />
      )}
    </div>
  );
}
