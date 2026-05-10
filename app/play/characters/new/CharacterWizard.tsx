"use client";

import { useRef, useState } from "react";
import { WizardLayout } from "@/components/character-creation/WizardLayout";
import { StepIndicator } from "@/components/character-creation/StepIndicator";
import { CharacterPreview } from "@/components/character-creation/CharacterPreview";
import Step1Identity from "@/components/character-creation/steps/Step1Identity";
import Step2Race from "@/components/character-creation/steps/Step2Race";
import Step3Class from "@/components/character-creation/steps/Step3Class";
import Step4Stats from "@/components/character-creation/steps/Step4Stats";
import Step5Background from "@/components/character-creation/steps/Step5Background";
import Step6Equipment from "@/components/character-creation/steps/Step6Equipment";
import Step7Spells from "@/components/character-creation/steps/Step7Spells";
import Step8Review from "@/components/character-creation/steps/Step8Review";
import {
  buildCharacterPrompt,
  type PromptStep,
} from "@/lib/character-creation/prompt-builder";
import { RACES } from "@/lib/character-creation/race-data";
import { CLASSES } from "@/lib/character-creation/class-data";
import { BACKGROUNDS } from "@/lib/character-creation/background-data";
import type {
  CharacterCreationData,
  WizardStep,
} from "@/lib/character-creation/types";

export function CharacterWizard() {
  const [step, setStep] = useState<WizardStep>(1);
  const [data, setData] = useState<Partial<CharacterCreationData>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [historyIndex, setHistoryIndex] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  const currentImageUrl = data.currentImageUrl ?? null;
  const imageHistory = data.imageHistory ?? [];

  const updateData = (partial: Partial<CharacterCreationData>) => {
    setData((prev) => ({ ...prev, ...partial }));
  };

  const goNext = () =>
    setStep((s) => Math.min(8, s + 1) as WizardStep);
  const goBack = () =>
    setStep((s) => Math.max(1, s - 1) as WizardStep);

  const generateImage = async (promptStep: PromptStep) => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setIsGenerating(true);

    try {
      const race = RACES.find((r) => r.id === data.raceId);
      const subrace = race?.subraces.find((s) => s.id === data.subraceId);
      const classData = CLASSES.find((c) => c.id === data.classId);
      const background = BACKGROUNDS.find((b) => b.id === data.backgroundId);

      const visualParts = [race?.visualDescription, subrace?.visualDescription]
        .filter((v): v is string => Boolean(v))
        .join(", ");

      const prompt = buildCharacterPrompt({
        sex: data.sex,
        ageCategory: data.ageCategory,
        raceName: race?.name,
        subraceName: subrace?.name,
        raceVisualDescription: visualParts,
        className: classData?.name,
        classBasicAttire: classData?.basicAttire,
        backgroundVisualDetail: background?.visualDetail,
        outfitDescription: data.outfitDescription,
        weaponDescription: data.weaponDescription,
        focusDescription: data.focusDescription,
        isSpellcaster: classData?.isSpellcaster,
        step: promptStep,
        hasReferenceImage: Boolean(data.referencePhotoBase64),
      });

      const res = await fetch("/api/ai/generate-character-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, step: promptStep }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) throw new Error(`Geração falhou: ${res.status}`);

      const { imageUrl } = (await res.json()) as { imageUrl: string };

      setData((prev) => {
        const newHistory = [...(prev.imageHistory ?? []), imageUrl];
        return { ...prev, currentImageUrl: imageUrl, imageHistory: newHistory };
      });
      setHistoryIndex(imageHistory.length);
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        console.error("Falha ao gerar imagem:", err);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const navigateHistory = (dir: "prev" | "next") => {
    if (imageHistory.length === 0) return;
    const newIdx =
      dir === "prev"
        ? Math.max(0, historyIndex - 1)
        : Math.min(imageHistory.length - 1, historyIndex + 1);
    setHistoryIndex(newIdx);
    const url = imageHistory[newIdx];
    if (typeof url === "string") {
      updateData({ currentImageUrl: url });
    }
  };

  const race = RACES.find((r) => r.id === data.raceId);
  const classData = CLASSES.find((c) => c.id === data.classId);

  const regenerateStep: PromptStep =
    step >= 6 ? 6 : step === 5 ? 5 : step === 3 ? 3 : 2;

  const formContent = (
    <div className="flex flex-col gap-8">
      <StepIndicator currentStep={step} />
      {step === 1 && (
        <Step1Identity data={data} onUpdate={updateData} onNext={goNext} />
      )}
      {step === 2 && (
        <Step2Race
          data={data}
          onUpdate={updateData}
          onNext={goNext}
          onBack={goBack}
          onGenerateImage={() => generateImage(2)}
        />
      )}
      {step === 3 && (
        <Step3Class
          data={data}
          onUpdate={updateData}
          onNext={goNext}
          onBack={goBack}
          onGenerateImage={() => generateImage(3)}
        />
      )}
      {step === 4 && (
        <Step4Stats
          data={data}
          onUpdate={updateData}
          onNext={goNext}
          onBack={goBack}
        />
      )}
      {step === 5 && (
        <Step5Background
          data={data}
          onUpdate={updateData}
          onNext={goNext}
          onBack={goBack}
          onGenerateImage={() => generateImage(5)}
        />
      )}
      {step === 6 && (
        <Step6Equipment
          data={data}
          onUpdate={updateData}
          onNext={goNext}
          onBack={goBack}
          onGenerateImage={() => generateImage(6)}
          isGenerating={isGenerating}
        />
      )}
      {step === 7 && (
        <Step7Spells
          data={data}
          onUpdate={updateData}
          onNext={goNext}
          onBack={goBack}
        />
      )}
      {step === 8 && (
        <Step8Review data={data as CharacterCreationData} onBack={goBack} />
      )}
    </div>
  );

  const previewContent = (
    <CharacterPreview
      imageUrl={currentImageUrl}
      isGenerating={isGenerating}
      history={imageHistory}
      currentHistoryIndex={historyIndex}
      onRegenerate={
        step >= 3 ? () => generateImage(regenerateStep) : undefined
      }
      onNavigateHistory={navigateHistory}
      characterName={data.name}
      characterRace={race?.name}
      characterClass={classData?.name}
      showRegenerate={step >= 3 && Boolean(currentImageUrl)}
    />
  );

  return (
    <WizardLayout formContent={formContent} previewContent={previewContent} />
  );
}
