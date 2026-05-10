"use client";

import { useMemo } from "react";
import type { CharacterCreationData } from "@/lib/character-creation/types";
import { BACKGROUNDS } from "@/lib/character-creation/background-data";
import { BackgroundCard } from "@/components/character-creation/cards/BackgroundCard";

type Props = {
  data: Partial<CharacterCreationData>;
  onUpdate: (partial: Partial<CharacterCreationData>) => void;
  onNext: () => void;
  onBack: () => void;
  onGenerateImage: (step: 5) => void;
};

export default function Step5Background({
  data,
  onUpdate,
  onNext,
  onBack,
  onGenerateImage,
}: Props) {
  const selectedBg = useMemo(
    () => BACKGROUNDS.find((bg) => bg.id === data.backgroundId),
    [data.backgroundId]
  );

  const personality = data.personality ?? {};

  const updatePersonality = (
    field: "trait" | "ideal" | "bond" | "flaw",
    value: string
  ) => {
    onUpdate({
      personality: {
        ...personality,
        [field]: value || undefined,
      },
    });
  };

  const isValid = !!data.backgroundId;

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-6 overflow-y-auto px-1 pb-4">
        <header className="space-y-1">
          <h2 className="font-cinzel text-2xl uppercase tracking-[0.25em] text-arcana-gold-bright">
            Escolha seu Antecedente
          </h2>
          <p className="font-crimson text-arcana-text-dim">
            A história que te trouxe até aqui.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {BACKGROUNDS.map((bg) => (
            <BackgroundCard
              key={bg.id}
              background={bg}
              selected={data.backgroundId === bg.id}
              onSelect={(id) => onUpdate({ backgroundId: id })}
            />
          ))}
        </div>

        {selectedBg ? (
          <div className="space-y-5 rounded-md border border-arcana-gold/30 bg-arcana-surface/60 p-5">
            {/* Perícias */}
            {selectedBg.skills.length > 0 ? (
              <div className="space-y-1">
                <p className="font-cinzel text-xs uppercase tracking-[0.2em] text-arcana-gold">
                  Perícias treinadas
                </p>
                <p className="font-crimson text-arcana-text">
                  {selectedBg.skills.join(", ")}
                </p>
              </div>
            ) : null}

            {/* Equipamento */}
            {selectedBg.equipment.length > 0 ? (
              <div className="space-y-1">
                <p className="font-cinzel text-xs uppercase tracking-[0.2em] text-arcana-gold">
                  Equipamento inicial
                </p>
                <ul className="font-crimson text-arcana-text">
                  {selectedBg.equipment.map((item, i) => (
                    <li key={`${item}-${i}`}>· {item}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {/* Característica */}
            {selectedBg.feature ? (
              <div className="space-y-1">
                <p className="font-cinzel text-xs uppercase tracking-[0.2em] text-arcana-gold">
                  Característica especial: {selectedBg.feature}
                </p>
                {selectedBg.featureDesc ? (
                  <p className="font-crimson text-arcana-text-dim">
                    {selectedBg.featureDesc}
                  </p>
                ) : null}
              </div>
            ) : null}

            {/* Detalhe visual */}
            {selectedBg.visualDetail ? (
              <div className="space-y-1">
                <p className="font-cinzel text-xs uppercase tracking-[0.2em] text-arcana-gold">
                  Detalhe visual sugerido
                </p>
                <p className="font-crimson italic text-arcana-text">
                  ✦ {selectedBg.visualDetail}
                </p>
              </div>
            ) : null}

            {/* Personalidade selects */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <PersonalitySelect
                label="Traço de personalidade"
                value={personality.trait}
                options={selectedBg.personalityTraits}
                onChange={(v) => updatePersonality("trait", v)}
              />
              <PersonalitySelect
                label="Ideal"
                value={personality.ideal}
                options={selectedBg.ideals}
                onChange={(v) => updatePersonality("ideal", v)}
              />
              <PersonalitySelect
                label="Vínculo"
                value={personality.bond}
                options={selectedBg.bonds}
                onChange={(v) => updatePersonality("bond", v)}
              />
              <PersonalitySelect
                label="Defeito"
                value={personality.flaw}
                options={selectedBg.flaws}
                onChange={(v) => updatePersonality("flaw", v)}
              />
            </div>

            {/* Botão atualizar visual */}
            <div className="space-y-1 pt-2">
              <button
                type="button"
                onClick={() => onGenerateImage(5)}
                className="rounded-md border border-arcana-gold bg-arcana-gold/10 px-4 py-2 font-cinzel text-xs uppercase tracking-[0.2em] text-arcana-gold-bright hover:bg-arcana-gold/20"
              >
                ✨ Atualizar visual do personagem
              </button>
              <p className="font-crimson text-xs text-arcana-text-dim">
                (opcional — atualiza a imagem com o detalhe do antecedente)
              </p>
            </div>
          </div>
        ) : null}
      </div>

      <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t border-arcana-border bg-arcana-bg/95 pt-4 backdrop-blur">
        <button
          type="button"
          onClick={onBack}
          className="font-cinzel uppercase tracking-[0.3em] px-6 py-3 rounded-md border border-arcana-border text-arcana-text-dim hover:text-arcana-text hover:border-arcana-gold/40"
        >
          ← Voltar
        </button>
        <button
          type="button"
          disabled={!isValid}
          onClick={onNext}
          className={`font-cinzel uppercase tracking-[0.3em] px-8 py-3 rounded-md transition ${
            isValid
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

type SelectProps = {
  label: string;
  value: string | undefined;
  options: string[];
  onChange: (value: string) => void;
};

function PersonalitySelect({ label, value, options, onChange }: SelectProps) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-cinzel text-xs uppercase tracking-[0.2em] text-arcana-gold">
        {label}
      </span>
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-arcana-border bg-arcana-surface/80 px-4 py-3 font-crimson text-arcana-text focus:border-arcana-gold focus:outline-none"
      >
        <option value="">— escolher —</option>
        {options.map((opt, i) => (
          <option key={`${opt}-${i}`} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </label>
  );
}
