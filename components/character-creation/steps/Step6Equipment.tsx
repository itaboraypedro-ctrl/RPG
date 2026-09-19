"use client";

import { useMemo, useState } from "react";
import type { CharacterCreationData } from "@/lib/character-creation/types";
import { CLASSES } from "@/lib/character-creation/class-data";
import { getOutfitSuggestions } from "@/lib/character-creation/outfit-suggestions";

type Props = {
  data: Partial<CharacterCreationData>;
  onUpdate: (partial: Partial<CharacterCreationData>) => void;
  onGenerateImage: (step: 6) => void;
  isGenerating: boolean;
};

const MAX_OUTFIT_LEN = 300;

const WEAPON_HINT_KEYWORDS = [
  "arma", "machado", "espada", "rapieira", "besta", "arco",
  "cajado", "maça", "martelo", "adaga", "lança", "azagaia", "cimitarra",
];

export default function Step6Equipment({
  data,
  onUpdate,
  onGenerateImage,
  isGenerating,
}: Props) {
  const [kitOpen, setKitOpen] = useState(false);

  const klass = useMemo(() => CLASSES.find((c) => c.id === data.classId), [data.classId]);
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
    onUpdate({ equipmentChoices: { ...equipmentChoices, [choiceId]: optionId } });
  };

  const outfitSuggestions = useMemo(() => {
    if (!data.classId || !data.backgroundId) return [];
    return getOutfitSuggestions(data.classId, data.backgroundId);
  }, [data.classId, data.backgroundId]);

  const outfitDescription = data.outfitDescription ?? "";
  const weaponDescription = data.weaponDescription ?? "";
  const focusDescription = data.focusDescription ?? "";

  const weaponPlaceholder = useMemo(() => {
    if (!klass) return "ex: machado de batalha enferrujado com runas";
    for (const choice of klass.startingEquipmentChoices) {
      const promptLc = choice.prompt.toLowerCase();
      const isWeapon = WEAPON_HINT_KEYWORDS.some((kw) => promptLc.includes(kw));
      if (!isWeapon) continue;
      const optionId = equipmentChoices[choice.id];
      if (!optionId) continue;
      const option = choice.options.find((o) => o.id === optionId);
      if (option?.items.length) {
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

  return (
    <div className="space-y-6">

      {/* Primary inputs */}
      <div className="space-y-5">
        {/* Outfit */}
        <div className="space-y-3">
          <div>
            <label className="font-cinzel text-[9px] uppercase tracking-[0.35em] text-arcana-text-dim block mb-1">
              Como seu personagem se veste?
            </label>
            <p className="font-crimson text-xs text-arcana-text-dim/60">
              Descreva as roupas, armadura ou aparência que definem seu visual
            </p>
          </div>
          <textarea
            rows={3}
            value={outfitDescription}
            maxLength={MAX_OUTFIT_LEN}
            onChange={(e) => onUpdate({ outfitDescription: e.target.value })}
            placeholder="ex: armadura de couro surrada com um manto carmesim e botas reforçadas..."
            className="arcana-input w-full rounded-xl px-4 py-3 font-crimson text-arcana-text placeholder:text-arcana-text-dim/40 resize-none"
          />
          <div className="flex items-center justify-between">
            {outfitSuggestions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {outfitSuggestions.slice(0, 3).map((s, i) => (
                  <button
                    key={`${s}-${i}`}
                    type="button"
                    onClick={() => onUpdate({ outfitDescription: s })}
                    className="rounded-xl border border-arcana-border/40 bg-arcana-surface/30 px-3 py-1 font-crimson text-xs text-arcana-text-dim hover:border-arcana-gold/30 hover:text-arcana-text transition-colors"
                  >
                    {s.length > 40 ? s.slice(0, 40) + "..." : s}
                  </button>
                ))}
              </div>
            )}
            <span className="ml-auto font-cinzel text-[10px] text-arcana-text-dim/40 shrink-0">
              {outfitDescription.length}/{MAX_OUTFIT_LEN}
            </span>
          </div>
        </div>

        {/* Weapon */}
        <div className="space-y-2">
          <label className="font-cinzel text-[9px] uppercase tracking-[0.35em] text-arcana-text-dim block">
            Arma principal
          </label>
          <input
            type="text"
            value={weaponDescription}
            onChange={(e) => onUpdate({ weaponDescription: e.target.value })}
            placeholder={weaponPlaceholder}
            className="arcana-input w-full rounded-xl px-4 py-3 font-crimson text-arcana-text placeholder:text-arcana-text-dim/40"
          />
        </div>

        {/* Focus — spellcasters only */}
        {klass?.isSpellcaster && (
          <div className="space-y-2">
            <label className="font-cinzel text-[9px] uppercase tracking-[0.35em] text-arcana-text-dim block">
              Foco mágico
            </label>
            <input
              type="text"
              value={focusDescription}
              onChange={(e) => onUpdate({ focusDescription: e.target.value })}
              placeholder="ex: cajado de carvalho com cristal azul no topo"
              className="arcana-input w-full rounded-xl px-4 py-3 font-crimson text-arcana-text placeholder:text-arcana-text-dim/40"
            />
          </div>
        )}
      </div>

      {/* Generate CTA */}
      <div className="rounded-xl border border-arcana-gold/25 p-5 space-y-3" style={{background: "linear-gradient(135deg, rgba(201,168,76,0.08) 0%, rgba(201,168,76,0.03) 100%)", boxShadow: "0 0 0 1px rgba(201,168,76,0.1) inset"}}>
        <div className="space-y-1">
          <p className="font-cinzel text-xs uppercase tracking-[0.3em] text-arcana-gold/70">
            {imageGenerated ? "Retrato gerado" : "Gerar retrato final"}
          </p>
          <p className="font-crimson text-sm text-arcana-text-dim">
            {imageGenerated
              ? "O visual do seu personagem foi criado. Você pode gerar novamente com variações."
              : "Com outfit e arma preenchidos, gere o retrato definitivo do seu personagem."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onGenerateImage(6)}
          disabled={!canGenerate}
          className={[
            "w-full py-4 rounded-xl font-cinzel uppercase tracking-[0.3em] text-sm transition-all duration-200",
            canGenerate
              ? "bg-arcana-gold text-arcana-bg hover:bg-arcana-gold-bright"
              : "bg-arcana-gold/20 text-arcana-bg/40 cursor-not-allowed",
          ].join(" ")}
        >
          {isGenerating
            ? "Gerando retrato..."
            : imageGenerated
              ? "Gerar novamente"
              : "Gerar personagem"}
        </button>
        {!canGenerate && !isGenerating && (
          <p className="font-crimson text-xs text-arcana-text-dim/50">
            Preencha o visual e a arma para desbloquear a geração.
          </p>
        )}
        {!imageGenerated && canGenerate && (
          <p className="font-crimson text-xs text-arcana-text-dim/50">
            Gere o retrato para continuar.
          </p>
        )}
      </div>

      {/* Equipment kit — collapsible */}
      <div className="rounded-xl border border-arcana-border/30 overflow-hidden">
        <button
          type="button"
          onClick={() => setKitOpen((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-arcana-surface/20 transition-colors"
        >
          <div>
            <span className="font-cinzel text-xs uppercase tracking-[0.2em] text-arcana-text-dim">
              Kit de equipamento inicial
            </span>
            {inventory.length > 0 && (
              <span className="ml-3 font-crimson text-xs text-arcana-text-dim/50">
                {inventory.length} {inventory.length === 1 ? "item" : "itens"}
              </span>
            )}
          </div>
          <span className="font-cinzel text-arcana-text-dim/60 text-sm">
            {kitOpen ? "−" : "+"}
          </span>
        </button>

        {kitOpen && (
          <div className="border-t border-arcana-border/30 px-4 py-4 space-y-5">
            {!klass ? (
              <p className="font-crimson text-sm text-arcana-text-dim">
                Nenhuma classe selecionada.
              </p>
            ) : (
              <>
                {klass.startingEquipmentChoices.map((choice) => {
                  const selectedOption = equipmentChoices[choice.id];
                  return (
                    <div key={choice.id} className="space-y-2">
                      <p className="font-cinzel text-[9px] uppercase tracking-[0.25em] text-arcana-text-dim">
                        {choice.prompt}
                      </p>
                      <div className="grid grid-cols-1 gap-1.5">
                        {choice.options.map((opt) => {
                          const checked = selectedOption === opt.id;
                          return (
                            <label
                              key={opt.id}
                              className={[
                                "flex items-center gap-3 px-3 py-2.5 rounded-xl border cursor-pointer transition-all",
                                checked
                                  ? "border-arcana-gold/60 bg-arcana-gold/8 text-arcana-text"
                                  : "border-arcana-border/30 hover:border-arcana-gold/30 text-arcana-text-dim",
                              ].join(" ")}
                            >
                              <input
                                type="radio"
                                name={choice.id}
                                value={opt.id}
                                checked={checked}
                                onChange={() => setEquipmentChoice(choice.id, opt.id)}
                                className="accent-arcana-gold"
                              />
                              <span className="font-crimson text-sm">{opt.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {inventory.length > 0 && (
                  <div className="rounded-xl border border-arcana-border/30 bg-arcana-surface/20 p-3 space-y-1">
                    <p className="font-cinzel text-[9px] uppercase tracking-[0.25em] text-arcana-text-dim mb-2">
                      Inventário completo
                    </p>
                    {inventory.map((item, i) => (
                      <p key={`${item}-${i}`} className="flex items-start gap-2 font-crimson text-sm text-arcana-text">
                        <span className="mt-1.5 block h-px w-3 shrink-0 bg-arcana-gold/30" />
                        {item}
                      </p>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
