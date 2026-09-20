"use client";

import { useEffect, useRef, useState } from "react";
import { WizardLayout } from "@/components/character-creation/WizardLayout";
import { StepIndicator } from "@/components/character-creation/StepIndicator";
import { SacramentoPreview } from "@/components/character-creation/sacramento/SacramentoPreview";
import Step1Tracos from "@/components/character-creation/sacramento/Step1Tracos";
import Step2Elementos from "@/components/character-creation/sacramento/Step2Elementos";
import Step3Historia from "@/components/character-creation/sacramento/Step5Historia";
import Step4Atributos from "@/components/character-creation/sacramento/Step4Atributos";
import Step5Habilidades from "@/components/character-creation/sacramento/Step5Habilidades";
import Step6Montaria from "@/components/character-creation/sacramento/Step6Montaria";
import Step7Revisao from "@/components/character-creation/sacramento/Step7Revisao";
import {
  APRESENTACOES,
  BASE_PADRAO,
  FAIXAS_ETARIAS,
  TIPOS_FISICOS,
  TONS_DE_PELE,
  baseImagePath,
} from "@/lib/character-creation/sacramento/bases";
import { characterImagePath, kitById } from "@/lib/character-creation/sacramento/kits";
import { calcularDerivados, validarFicha } from "@/lib/character-creation/sacramento/rules";
import { contarParrudeza } from "@/lib/character-creation/sacramento/habilidades";
import type {
  BaseVisual,
  HistoriaEstruturada,
  HistoriaSecao,
  SacramentoCreationData,
  WizardStep,
} from "@/lib/character-creation/sacramento/types";
import { FICHA_INICIAL } from "@/lib/character-creation/sacramento/types";

const STEP_LABELS = [
  "Traços",
  "Elementos",
  "História",
  "Atributos",
  "Habilidades",
  "Montaria",
  "Revisão",
];
const DRAFT_KEY = "sacramento-character-draft-v2";

export function CharacterWizard() {
  const [step, setStep] = useState<WizardStep>(1);
  const [data, setData] = useState<Partial<SacramentoCreationData>>({
    base: BASE_PADRAO,
    kitId: "base",
    ficha: FICHA_INICIAL,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [secaoGerando, setSecaoGerando] = useState<HistoriaSecao | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);
  const step7TriggerRef = useRef<(() => void) | null>(null);
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
        setData({ ficha: FICHA_INICIAL, kitId: "base", ...draft.data });
        setStep(draft.step && draft.step >= 1 && draft.step <= 7 ? draft.step : 1);
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

  // ---- Pré-carrega as 120 bases: troca de traço vira transição instantânea ----
  useEffect(() => {
    const idle =
      typeof window.requestIdleCallback === "function"
        ? window.requestIdleCallback
        : (cb: () => void) => window.setTimeout(cb, 300);
    idle(() => {
      for (const a of APRESENTACOES)
        for (const t of TONS_DE_PELE)
          for (const f of FAIXAS_ETARIAS)
            for (const tp of TIPOS_FISICOS) {
              const img = new window.Image();
              img.src = baseImagePath({
                apresentacao: a.id,
                tomDePele: t.id,
                faixaEtaria: f.id,
                tipoFisico: tp.id,
              });
            }
    });
  }, []);

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
    setData({ base: BASE_PADRAO, kitId: "base", ficha: FICHA_INICIAL });
    setStep(1);
    setAiError(null);
    setDraftRestored(false);
  };

  const updateData = (partial: Partial<SacramentoCreationData>) => {
    setData((prev) => ({ ...prev, ...partial }));
  };

  const goNext = () => setStep((s) => Math.min(7, s + 1) as WizardStep);
  const goBack = () => setStep((s) => Math.max(1, s - 1) as WizardStep);

  const handleChangeBase = (base: BaseVisual) => {
    setData((prev) => ({ ...prev, base }));
  };

  // ---- IA: história ----
  const visualResumo = () => {
    const b = data.base;
    if (!b) return "";
    const kit = kitById(data.kitId ?? "base");
    const partes = [
      APRESENTACOES.find((a) => a.id === b.apresentacao)?.label,
      `pele ${TONS_DE_PELE.find((t) => t.id === b.tomDePele)?.label?.toLowerCase()}`,
      FAIXAS_ETARIAS.find((f) => f.id === b.faixaEtaria)?.hint,
      TIPOS_FISICOS.find((t) => t.id === b.tipoFisico)?.label?.toLowerCase(),
      kit && kit.id !== "base" ? `veste como ${kit.nome.toLowerCase()} (${kit.descricao.toLowerCase()})` : null,
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

  // ---- Navegação/validação ----
  const ficha = data.ficha ?? FICHA_INICIAL;
  const validacao = validarFicha(ficha);
  const atributosOk =
    validacao.atributosGastos === validacao.atributosOrcamento &&
    validacao.antecedentesGastos === validacao.antecedentesOrcamento &&
    !validacao.erros.some((e) => e.includes("antecedente comporta") || e.includes("passar de 3") || e.includes("progressão"));

  const canProceedMap: Record<WizardStep, boolean> = {
    1: !!data.name && data.name.trim().length >= 2 && !!data.base,
    2:
      !!data.elementos &&
      data.elementos.conceito.trim().length > 0 &&
      data.elementos.redencaoTrilhaId.length > 0,
    3: !!data.historia && data.historiaAprovada === true && !isGenerating,
    4: atributosOk,
    5: validacao.habilidadesEscolhidas === validacao.habilidadesTotal,
    6: !ficha.montaria || ficha.montaria.origem !== "",
    7: !saving,
  };
  const canProceed = canProceedMap[step];

  const handleFooterNext = () => {
    if (step === 7) step7TriggerRef.current?.();
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
        {step === 7 ? (saving ? "Cravando o nome…" : "Criar personagem") : "Continuar"}
      </button>
    </div>
  );

  const derivados = calcularDerivados(ficha, contarParrudeza(ficha.habilidades));
  const previewStats =
    step >= 4
      ? [
          { label: "Vida", value: String(derivados.vidaMaxima) },
          { label: "Dor", value: String(derivados.capacidadeDor) },
          { label: "Defesa", value: String(derivados.defesa) },
          { label: "Movim.", value: String(derivados.movimentos) },
          { label: "Ações", value: String(derivados.acoesCombate) },
          { label: "Nível", value: String(ficha.nivel) },
        ]
      : undefined;

  const previewImageUrl = data.base ? characterImagePath(data.base, data.kitId) : null;
  const previewSubtitle =
    step >= 2
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
      characterName={data.name}
      subtitle={previewSubtitle}
      stats={previewStats}
    />
  );

  return (
    <WizardLayout header={header} footer={footer} previewContent={previewContent}>
      {step === 1 && (
        <Step1Tracos data={data} onUpdate={updateData} onChangeBase={handleChangeBase} />
      )}
      {step === 2 && <Step2Elementos data={data} onUpdate={updateData} />}
      {step === 3 && (
        <Step3Historia
          data={data}
          onUpdate={updateData}
          onGenerateStory={generateStory}
          isGenerating={isGenerating}
          secaoGerando={secaoGerando}
          error={aiError}
        />
      )}
      {step === 4 && <Step4Atributos data={data} onUpdate={updateData} />}
      {step === 5 && <Step5Habilidades data={data} onUpdate={updateData} />}
      {step === 6 && <Step6Montaria data={data} onUpdate={updateData} />}
      {step === 7 && (
        <Step7Revisao
          data={data}
          triggerRef={step7TriggerRef}
          onSavingChange={setSaving}
          onSaved={clearDraft}
        />
      )}
    </WizardLayout>
  );
}
