"use client";

import { useMemo, useState } from "react";
import type { CharacterCreationData } from "@/lib/character-creation/types";
import { CLASSES } from "@/lib/character-creation/class-data";
import { getOutfitSuggestions } from "@/lib/character-creation/outfit-suggestions";

type Props = {
  data: Partial<CharacterCreationData>;
  onUpdate: (partial: Partial<CharacterCreationData>) => void;
  onNext: () => void;
  onBack: () => void;
  onGenerateImage: (step: 6) => void;
  isGenerating: boolean;
};

type SectionKey = "kit" | "outfit" | "weapon";

const MAX_OUTFIT_LEN = 300;

const WEAPON_HINT_KEYWORDS = [
  "arma",
  "machado",
  "espada",
  "rapieira",
  "besta",
  "arco",
  "cajado",
  "maça",
  "martelo",
  "adaga",
  "lança",
  "azagaia",
  "cimitarra",
];

export default function Step6Equipment({
  data,
  onUpdate,
  onNext,
  onBack,
  onGenerateImage,
  isGenerating,
}: Props) {
  const [openSection, setOpenSection] = useState<SectionKey | null>("kit");

  const klass = useMemo(
    () => CLASSES.find((c) => c.id === data.classId),
    [data.classId]
  );

  const equipmentChoices = data.equipmentChoices ?? {};

  const inventory = useMemo(() => {
    if (!klass) return [] as string[];
    const items: string[] = [];
    for (const choice of klass.startingEquipmentChoices) {
      const optionId = equipmentChoices[choice.id];
      if (!optionId) continue;
      const option = choice.options.find((o) => o.id === optionId);
      if (option) items.push(...option.items);
    }
    return items;
  }, [klass, equipmentChoices]);

  const setEquipmentChoice = (choiceId: string, optionId: string) => {
    onUpdate({
      equipmentChoices: {
        ...equipmentChoices,
        [choiceId]: optionId,
      },
    });
  };

  // --- Outfit suggestions ---
  const outfitSuggestions = useMemo(() => {
    if (!data.classId || !data.backgroundId) return [];
    return getOutfitSuggestions(data.classId, data.backgroundId);
  }, [data.classId, data.backgroundId]);

  const outfitDescription = data.outfitDescription ?? "";
  const weaponDescription = data.weaponDescription ?? "";
  const focusDescription = data.focusDescription ?? "";

  // Weapon placeholder: from first equipmentChoice that looks like a weapon
  const weaponPlaceholder = useMemo(() => {
    if (!klass) return "ex: machado de batalha enferrujado com runas";
    for (const choice of klass.startingEquipmentChoices) {
      const promptLc = choice.prompt.toLowerCase();
      const isWeapon = WEAPON_HINT_KEYWORDS.some((kw) =>
        promptLc.includes(kw)
      );
      if (!isWeapon) continue;
      const optionId = equipmentChoices[choice.id];
      if (!optionId) continue;
      const option = choice.options.find((o) => o.id === optionId);
      if (option && option.items.length > 0) {
        return `ex: ${option.items[0].toLowerCase()} com detalhes únicos`;
      }
    }
    return "ex: machado de batalha enferrujado com runas dwarven";
  }, [klass, equipmentChoices]);

  const imageGenerated = !!data.currentImageUrl;
  const canGenerate =
    outfitDescription.trim().length > 0 &&
    weaponDescription.trim().length > 0 &&
    !isGenerating;

  const isValid = imageGenerated;

  const toggleSection = (key: SectionKey) => {
    setOpenSection((cur) => (cur === key ? null : key));
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto px-1 pb-4">
        <header className="space-y-1">
          <h2 className="font-cinzel text-2xl uppercase tracking-[0.25em] text-arcana-gold-bright">
            Equipamento e Visual
          </h2>
          <p className="font-crimson text-arcana-text-dim">
            Defina seu kit inicial, visual e arma para gerar a imagem final.
          </p>
        </header>

        {/* 6.1 Kit */}
        <AccordionSection
          title="Kit de Equipamento Inicial"
          isOpen={openSection === "kit"}
          onToggle={() => toggleSection("kit")}
        >
          {!klass ? (
            <p className="font-crimson text-arcana-text-dim">
              Nenhuma classe selecionada.
            </p>
          ) : (
            <div className="space-y-4">
              {klass.startingEquipmentChoices.map((choice) => {
                const selectedOption = equipmentChoices[choice.id];
                return (
                  <div key={choice.id} className="space-y-2">
                    <p className="font-cinzel text-xs uppercase tracking-[0.2em] text-arcana-gold">
                      {choice.prompt}
                    </p>
                    <div className="flex flex-col gap-2">
                      {choice.options.map((opt) => {
                        const checked = selectedOption === opt.id;
                        return (
                          <label
                            key={opt.id}
                            className={`flex cursor-pointer items-center gap-3 rounded-md border px-4 py-3 transition ${
                              checked
                                ? "border-arcana-gold bg-arcana-gold/10"
                                : "border-arcana-border bg-arcana-surface/80 hover:border-arcana-gold/40"
                            }`}
                          >
                            <input
                              type="radio"
                              name={choice.id}
                              value={opt.id}
                              checked={checked}
                              onChange={() =>
                                setEquipmentChoice(choice.id, opt.id)
                              }
                              className="accent-arcana-gold"
                            />
                            <span className="font-crimson text-arcana-text">
                              {opt.label}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {inventory.length > 0 ? (
                <div className="rounded-md border border-arcana-border bg-arcana-surface/60 p-4">
                  <p className="font-cinzel text-xs uppercase tracking-[0.2em] text-arcana-gold">
                    Resumo do inventário
                  </p>
                  <ul className="mt-2 font-crimson text-arcana-text">
                    {inventory.map((item, i) => (
                      <li key={`${item}-${i}`}>· {item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          )}
        </AccordionSection>

        {/* 6.2 Outfit */}
        <AccordionSection
          title="Como seu personagem se veste?"
          isOpen={openSection === "outfit"}
          onToggle={() => toggleSection("outfit")}
        >
          <div className="space-y-3">
            <textarea
              rows={3}
              value={outfitDescription}
              maxLength={MAX_OUTFIT_LEN}
              onChange={(e) =>
                onUpdate({ outfitDescription: e.target.value })
              }
              placeholder="ex: armadura de placas com manto vermelho..."
              className="w-full rounded-md border border-arcana-border bg-arcana-surface/80 px-4 py-3 font-crimson text-arcana-text placeholder:text-arcana-text-dim/60 focus:border-arcana-gold focus:outline-none"
            />
            <div className="flex justify-end">
              <span className="font-cinzel text-xs text-arcana-text-dim">
                {outfitDescription.length} / {MAX_OUTFIT_LEN}
              </span>
            </div>
            {outfitSuggestions.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {outfitSuggestions.map((suggestion, i) => (
                  <button
                    key={`${suggestion}-${i}`}
                    type="button"
                    onClick={() =>
                      onUpdate({ outfitDescription: suggestion })
                    }
                    className="rounded-full border border-arcana-border bg-arcana-surface/80 px-3 py-1 font-crimson text-xs text-arcana-text-dim hover:border-arcana-gold/30 hover:text-arcana-text"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </AccordionSection>

        {/* 6.3 Weapon & Focus */}
        <AccordionSection
          title="Arma e Foco"
          isOpen={openSection === "weapon"}
          onToggle={() => toggleSection("weapon")}
        >
          <div className="space-y-3">
            <label className="flex flex-col gap-1">
              <span className="font-cinzel text-xs uppercase tracking-[0.2em] text-arcana-gold">
                Descreva sua arma principal
              </span>
              <input
                type="text"
                value={weaponDescription}
                onChange={(e) =>
                  onUpdate({ weaponDescription: e.target.value })
                }
                placeholder={weaponPlaceholder}
                className="w-full rounded-md border border-arcana-border bg-arcana-surface/80 px-4 py-3 font-crimson text-arcana-text placeholder:text-arcana-text-dim/60 focus:border-arcana-gold focus:outline-none"
              />
            </label>

            {klass?.isSpellcaster ? (
              <label className="flex flex-col gap-1">
                <span className="font-cinzel text-xs uppercase tracking-[0.2em] text-arcana-gold">
                  Descreva seu foco mágico
                </span>
                <input
                  type="text"
                  value={focusDescription}
                  onChange={(e) =>
                    onUpdate({ focusDescription: e.target.value })
                  }
                  placeholder="ex: cajado de carvalho com cristal azul no topo"
                  className="w-full rounded-md border border-arcana-border bg-arcana-surface/80 px-4 py-3 font-crimson text-arcana-text placeholder:text-arcana-text-dim/60 focus:border-arcana-gold focus:outline-none"
                />
              </label>
            ) : null}
          </div>
        </AccordionSection>

        {/* Botão Gerar */}
        <div className="space-y-2 pt-2">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onGenerateImage(6)}
              disabled={!canGenerate}
              className={`flex-1 min-w-[16rem] rounded-md font-cinzel uppercase tracking-[0.3em] px-6 py-4 transition ${
                canGenerate
                  ? "bg-arcana-gold text-arcana-bg hover:bg-arcana-gold-bright"
                  : "bg-arcana-gold text-arcana-bg opacity-50 cursor-not-allowed"
              }`}
            >
              {isGenerating
                ? "Gerando..."
                : imageGenerated
                  ? "⚔️ Gerar novamente"
                  : "⚔️ Gerar personagem completo"}
            </button>
            {imageGenerated && !isGenerating ? (
              <button
                type="button"
                onClick={() => onGenerateImage(6)}
                className="rounded-md border border-arcana-border px-4 py-2 font-cinzel text-xs uppercase tracking-[0.2em] text-arcana-text-dim hover:border-arcana-gold/40 hover:text-arcana-text"
              >
                🔄 Regenerar
              </button>
            ) : null}
          </div>
          {!canGenerate && !isGenerating ? (
            <p className="font-crimson text-xs text-arcana-text-dim">
              Preencha visual e arma para gerar.
            </p>
          ) : null}
        </div>
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

type AccordionProps = {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
};

function AccordionSection({
  title,
  isOpen,
  onToggle,
  children,
}: AccordionProps) {
  return (
    <div className="rounded-md border border-arcana-border bg-arcana-surface/40">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <span className="font-cinzel text-sm uppercase tracking-[0.2em] text-arcana-gold">
          {title}
        </span>
        <span className="font-cinzel text-arcana-text-dim">
          {isOpen ? "−" : "+"}
        </span>
      </button>
      {isOpen ? (
        <div className="border-t border-arcana-border px-4 py-4">
          {children}
        </div>
      ) : null}
    </div>
  );
}
