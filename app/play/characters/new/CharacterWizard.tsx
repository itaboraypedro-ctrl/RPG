"use client";

import { useEffect, useRef, useState } from "react";
import { WizardLayout } from "@/components/character-creation/WizardLayout";
import { StepIndicator } from "@/components/character-creation/StepIndicator";
import { SacramentoPreview } from "@/components/character-creation/sacramento/SacramentoPreview";
import Step1Tracos from "@/components/character-creation/sacramento/Step1Tracos";
import Step2Estilo from "@/components/character-creation/sacramento/Step2Estilo";
import Step3Rosto from "@/components/character-creation/sacramento/Step3Rosto";
import Step4Elementos from "@/components/character-creation/sacramento/Step4Elementos";
import Step5Historia from "@/components/character-creation/sacramento/Step5Historia";
import Step6Revisao from "@/components/character-creation/sacramento/Step6Revisao";
import {
  APRESENTACOES,
  BASE_PADRAO,
  FAIXAS_ETARIAS,
  TIPOS_FISICOS,
  TONS_DE_PELE,
  baseId,
  baseImagePath,
} from "@/lib/character-creation/sacramento/bases";
import type {
  BaseVisual,
  HistoriaEstruturada,
  HistoriaSecao,
  SacramentoCreationData,
  WizardStep,
} from "@/lib/character-creation/sacramento/types";

const STEP_LABELS = ["Traços", "Estilo", "Rosto", "Elementos", "História", "Revisão"];
const DRAFT_KEY = "sacramento-character-draft-v1";

export function CharacterWizard() {
  const [step, setStep] = useState<WizardStep>(1);
  const [data, setData] = useState<Partial<SacramentoCreationData>>({ base: BASE_PADRAO });
  const [isGenerating, setIsGenerating] = useState(false);
  const [secaoGerando, setSecaoGerando] = useState<HistoriaSecao | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const step6TriggerRef = useRef<(() => void) | null>(null);
  const savedRef = useRef(false);

  // ---- Rascunho: restaura no mount, salva a cada mudança ----
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw) as { step?: WizardStep; data?: Partial<SacramentoCreationData> };
      if (draft?.data?.base) {
        // Restaurar no effect evita mismatch de hidratação (localStorage não existe no SSR).
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setData(draft.data);
        setStep(draft.step && draft.step >= 1 && draft.step <= 6 ? draft.step : 1);
        setHistoryIndex(Math.max(0, (draft.data.imageHistory?.length ?? 1) - 1));
        setDraftRestored(true);
      }
    } catch {
      // rascunho corrompido — ignora
    }
  }, []);

  useEffect(() => {
    if (savedRef.current) return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ step, data }));
    } catch {
      // storage cheio/bloqueado — segue sem rascunho
    }
  }, [step, data]);

  const clearDraft = () => {
    savedRef.current = true;
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {
      // sem acesso ao storage — nada a limpar
    }
  };

  const resetAll = () => {
    clearDraft();
    savedRef.current = false;
    setData({ base: BASE_PADRAO });
    setStep(1);
    setHistoryIndex(0);
    setAiError(null);
    setDraftRestored(false);
  };

  const updateData = (partial: Partial<SacramentoCreationData>) => {
    setData((prev) => ({ ...prev, ...partial }));
  };

  const goNext = () => setStep((s) => Math.min(6, s + 1) as WizardStep);
  const goBack = () => setStep((s) => Math.max(1, s - 1) as WizardStep);

  // Trocar a base descarta o retrato personalizado (foi pintado sobre a base antiga).
  const handleChangeBase = (base: BaseVisual) => {
    setData((prev) => ({
      ...prev,
      base,
      customizacoes: [],
      currentImageUrl: undefined,
      imageHistory: [],
      rosto: undefined,
    }));
    setHistoryIndex(0);
  };

  // ---- IA: personalização visual (roupas/rosto) ----
  const customize = async (
    mode: "estilo" | "rosto-foto" | "rosto-descricao",
    payload: string,
  ): Promise<boolean> => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setIsGenerating(true);
    setAiError(null);
    try {
      const current = data.currentImageUrl;
      const body: Record<string, unknown> = { mode };
      if (current && current.startsWith("http")) {
        body.currentImageUrl = current;
      } else if (data.base) {
        body.baseId = baseId(data.base);
      }
      if (mode === "rosto-foto") body.facePhotoDataUrl = payload;
      else body.instruction = payload;

      const res = await fetch("/api/ai/customize-character", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: abortRef.current.signal,
      });
      const json = (await res.json()) as { imageUrl?: string; error?: string };
      if (!res.ok || !json.imageUrl) {
        setAiError(json.error ?? "A geração falhou. Tente de novo em instantes.");
        return false;
      }

      setData((prev) => {
        const imageHistory = [...(prev.imageHistory ?? []), json.imageUrl as string];
        const next: Partial<SacramentoCreationData> = {
          ...prev,
          currentImageUrl: json.imageUrl,
          imageHistory,
        };
        if (mode === "estilo") {
          next.customizacoes = [...(prev.customizacoes ?? []), payload];
        } else {
          next.rosto = {
            modo: mode === "rosto-foto" ? "foto" : "descricao",
            descricao: mode === "rosto-descricao" ? payload : undefined,
            aplicado: true,
          };
        }
        setHistoryIndex(imageHistory.length - 1);
        return next;
      });
      return true;
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setAiError("A geração falhou. Verifique a conexão e tente de novo.");
      }
      return false;
    } finally {
      setIsGenerating(false);
    }
  };

  // ---- IA: história ----
  const visualResumo = () => {
    const b = data.base;
    if (!b) return "";
    const partes = [
      APRESENTACOES.find((a) => a.id === b.apresentacao)?.label,
      `pele ${TONS_DE_PELE.find((t) => t.id === b.tomDePele)?.label?.toLowerCase()}`,
      FAIXAS_ETARIAS.find((f) => f.id === b.faixaEtaria)?.hint,
      TIPOS_FISICOS.find((t) => t.id === b.tipoFisico)?.label?.toLowerCase(),
      ...(data.customizacoes ?? []),
    ];
    return partes.filter(Boolean).join(", ");
  };

  const generateStory = async (
    action: "gerar" | "revisar-secao" | "revisar-tudo",
    opts?: { secao?: HistoriaSecao; feedback?: string },
  ): Promise<boolean> => {
    setIsGenerating(true);
    setSecaoGerando(action === "revisar-secao" ? (opts?.secao ?? null) : null);
    setAiError(null);
    try {
      const res = await fetch("/api/ai/generate-character-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          nome: data.name ?? "",
          visualResumo: visualResumo(),
          elementos: data.elementos,
          historiaAtual: action === "gerar" ? undefined : data.historia,
          secao: opts?.secao,
          feedback: opts?.feedback,
        }),
      });
      const json = (await res.json()) as { historia?: HistoriaEstruturada; error?: string };
      if (!res.ok || !json.historia) {
        setAiError(json.error ?? "A geração da história falhou. Tente de novo.");
        return false;
      }
      updateData({ historia: json.historia, historiaAprovada: false });
      return true;
    } catch {
      setAiError("A geração da história falhou. Verifique a conexão e tente de novo.");
      return false;
    } finally {
      setIsGenerating(false);
      setSecaoGerando(null);
    }
  };

  const navigateHistory = (dir: "prev" | "next") => {
    const imageHistory = data.imageHistory ?? [];
    if (imageHistory.length === 0) return;
    const newIdx =
      dir === "prev"
        ? Math.max(0, historyIndex - 1)
        : Math.min(imageHistory.length - 1, historyIndex + 1);
    setHistoryIndex(newIdx);
    const url = imageHistory[newIdx];
    if (typeof url === "string") updateData({ currentImageUrl: url });
  };

  // ---- Navegação/validação ----
  const canProceedMap: Record<WizardStep, boolean> = {
    1: !!data.name && data.name.trim().length >= 2 && !!data.base,
    2: !isGenerating,
    3: (data.rosto?.aplicado === true || data.rosto?.modo === "manter") && !isGenerating,
    4:
      !!data.elementos &&
      data.elementos.conceito.trim().length > 0 &&
      data.elementos.redencaoTrilhaId.length > 0,
    5: !!data.historia && data.historiaAprovada === true && !isGenerating,
    6: !saving,
  };
  const canProceed = canProceedMap[step];

  const handleFooterNext = () => {
    if (step === 6) step6TriggerRef.current?.();
    else goNext();
  };

  const header = (
    <StepIndicator currentStep={step} stepLabels={STEP_LABELS} title="Novo personagem" />
  );

  const footer = (
    <div className="flex items-center justify-between gap-3">
      {step > 1 ? (
        <button type="button" onClick={goBack} disabled={saving} className="arcana-btn-ghost">
          Voltar
        </button>
      ) : draftRestored ? (
        <button type="button" onClick={resetAll} className="arcana-btn-ghost arcana-btn-sm">
          Recomeçar do zero
        </button>
      ) : (
        <div />
      )}
      <button
        type="button"
        onClick={handleFooterNext}
        disabled={!canProceed}
        className={canProceed ? "arcana-btn-primary" : "arcana-btn-primary-disabled"}
      >
        {step === 6 ? (saving ? "Cravando o nome…" : "Criar personagem") : "Continuar"}
      </button>
    </div>
  );

  const previewImageUrl =
    data.currentImageUrl ?? (data.base ? baseImagePath(data.base) : null);
  const previewSubtitle =
    step >= 4
      ? data.elementos?.conceito || data.elementos?.ocupacao || "Sacramento · 1880"
      : data.base
        ? [
            FAIXAS_ETARIAS.find((f) => f.id === data.base?.faixaEtaria)?.label,
            TIPOS_FISICOS.find((t) => t.id === data.base?.tipoFisico)?.label,
          ]
            .filter(Boolean)
            .join(" · ")
        : undefined;

  const previewContent = (
    <SacramentoPreview
      imageUrl={previewImageUrl}
      isGenerating={isGenerating && step <= 3}
      history={data.imageHistory ?? []}
      currentHistoryIndex={historyIndex}
      onNavigateHistory={navigateHistory}
      characterName={data.name}
      subtitle={previewSubtitle}
    />
  );

  return (
    <WizardLayout header={header} footer={footer} previewContent={previewContent}>
      {step === 1 && (
        <Step1Tracos data={data} onUpdate={updateData} onChangeBase={handleChangeBase} />
      )}
      {step === 2 && (
        <Step2Estilo
          data={data}
          onCustomize={(instruction) => customize("estilo", instruction)}
          isGenerating={isGenerating}
          error={aiError}
        />
      )}
      {step === 3 && (
        <Step3Rosto
          data={data}
          onUpdate={updateData}
          onApplyFace={(mode, payload) => customize(mode, payload)}
          isGenerating={isGenerating}
          error={aiError}
        />
      )}
      {step === 4 && <Step4Elementos data={data} onUpdate={updateData} />}
      {step === 5 && (
        <Step5Historia
          data={data}
          onUpdate={updateData}
          onGenerateStory={generateStory}
          isGenerating={isGenerating}
          secaoGerando={secaoGerando}
          error={aiError}
        />
      )}
      {step === 6 && (
        <Step6Revisao
          data={data}
          triggerRef={step6TriggerRef}
          onSavingChange={setSaving}
          onSaved={clearDraft}
        />
      )}
    </WizardLayout>
  );
}
