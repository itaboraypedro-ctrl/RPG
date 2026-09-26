"use client";

import { useState } from "react";
import { WizardLayout } from "@/components/character-creation/WizardLayout";
import { StepIndicator } from "@/components/character-creation/StepIndicator";
import { Step1Preset } from "@/components/campaign-creation/Step1Preset";
import { Step2Identity } from "@/components/campaign-creation/Step2Identity";
import { Step3Table } from "@/components/campaign-creation/Step3Table";
import { CampaignPoster } from "@/components/campaign-creation/CampaignPoster";
import { SACRAMENTO_META } from "@/lib/rulesets/sacramento/meta";
import { createCampaign } from "./actions";

export type CampaignWizardData = {
  ruleset: "sacramento" | null;
  title: string;
  description: string;
  maxPlayers: number;
  allowNewChars: boolean;
  aiAssistant: boolean;
  tone: string | null;
  themes: string[];
  epoch: number;
  lines: string[];
  veils: string[];
  xCard: boolean;
  /** E-mails do bando — só eles poderão criar personagem nesta campanha. */
  inviteEmails: string[];
};

type WizardStep = 1 | 2 | 3;

const STEP_LABELS = ["Modelo", "Identidade", "Mesa"];

const INITIAL_DATA: CampaignWizardData = {
  ruleset: null,
  title: "",
  description: "",
  maxPlayers: SACRAMENTO_META.defaults.jogadores,
  allowNewChars: true,
  aiAssistant: true,
  tone: null,
  themes: [],
  epoch: SACRAMENTO_META.defaults.epoca,
  lines: [],
  veils: [],
  xCard: true,
  inviteEmails: [],
};

export function CampaignWizard() {
  const [step, setStep] = useState<WizardStep>(1);
  const [data, setData] = useState<CampaignWizardData>(INITIAL_DATA);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateData = (partial: Partial<CampaignWizardData>) =>
    setData((prev) => ({ ...prev, ...partial }));

  const goNext = () => setStep((s) => Math.min(3, s + 1) as WizardStep);
  const goBack = () => setStep((s) => Math.max(1, s - 1) as WizardStep);

  const canProceedMap: Record<WizardStep, boolean> = {
    1: data.ruleset !== null,
    2: data.title.trim().length >= 2,
    3: !isSaving,
  };

  async function handleCreate() {
    if (!data.ruleset || isSaving) return;
    setIsSaving(true);
    setError(null);
    try {
      const result = await createCampaign({
        ruleset: data.ruleset,
        title: data.title,
        description: data.description,
        maxPlayers: data.maxPlayers,
        allowNewChars: data.allowNewChars,
        aiAssistant: data.aiAssistant,
        tone: data.tone ?? undefined,
        themes: data.themes,
        epoch: data.epoch,
        sessionZero: { lines: data.lines, veils: data.veils, xCard: data.xCard },
        inviteEmails: data.inviteEmails,
      });
      if (result && result.ok === false) {
        setError(result.error);
        setIsSaving(false);
      }
    } catch (err) {
      if (
        err &&
        typeof err === "object" &&
        "digest" in err &&
        String((err as { digest: string }).digest).startsWith("NEXT_REDIRECT")
      ) {
        throw err;
      }
      setError("Erro inesperado ao criar a campanha. Tente novamente.");
      setIsSaving(false);
    }
  }

  const handleFooterNext = () => {
    if (step === 3) void handleCreate();
    else goNext();
  };

  const header = (
    <StepIndicator
      currentStep={step}
      stepLabels={STEP_LABELS}
      title="Nova campanha"
      backHref="/hub"
    />
  );

  const footer = (
    <div className="space-y-3">
      {error && (
        <p className="font-crimson text-sm italic text-red-400">{error}</p>
      )}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={goBack}
          disabled={step === 1 || isSaving}
          className="arcana-btn-ghost"
        >
          Voltar
        </button>
        <button
          type="button"
          onClick={handleFooterNext}
          disabled={!canProceedMap[step]}
          className={canProceedMap[step] ? "arcana-btn-primary" : "arcana-btn-disabled"}
        >
          {step === 3
            ? isSaving
              ? "Fundando a campanha..."
              : "Criar campanha"
            : "Continuar"}
        </button>
      </div>
    </div>
  );

  return (
    <WizardLayout
      header={header}
      footer={footer}
      previewContent={<CampaignPoster data={data} />}
    >
      {step === 1 && <Step1Preset data={data} onUpdate={updateData} />}
      {step === 2 && <Step2Identity data={data} onUpdate={updateData} />}
      {step === 3 && <Step3Table data={data} onUpdate={updateData} />}
    </WizardLayout>
  );
}
