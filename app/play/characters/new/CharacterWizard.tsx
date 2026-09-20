"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { WizardLayout } from "@/components/character-creation/WizardLayout";
import { StepIndicator } from "@/components/character-creation/StepIndicator";
import { SacramentoPreview } from "@/components/character-creation/sacramento/SacramentoPreview";
import Step1Tracos from "@/components/character-creation/sacramento/Step1Tracos";
import Step2Elementos from "@/components/character-creation/sacramento/Step2Elementos";
import Step4Atributos from "@/components/character-creation/sacramento/Step4Atributos";
import Step5Habilidades from "@/components/character-creation/sacramento/Step5Habilidades";
import StepCompras from "@/components/character-creation/sacramento/StepCompras";
import StepMontaria from "@/components/character-creation/sacramento/StepMontaria";
import StepRevisao from "@/components/character-creation/sacramento/StepRevisao";
import {
  APRESENTACOES,
  BASE_PADRAO,
  FAIXAS_ETARIAS,
  TIPOS_FISICOS,
  TONS_DE_PELE,
  baseImagePath,
} from "@/lib/character-creation/sacramento/bases";
import { characterImagePath, kitById } from "@/lib/character-creation/sacramento/kits";
import { montariasCompradas } from "@/lib/character-creation/sacramento/catalogo";
import { calcularDerivados, validarFicha } from "@/lib/character-creation/sacramento/rules";
import { contarParrudeza } from "@/lib/character-creation/sacramento/habilidades";
import type {
  BaseVisual,
  HistoriaEstruturada,
  HistoriaSecao,
  SacramentoCreationData,
} from "@/lib/character-creation/sacramento/types";
import { FICHA_INICIAL } from "@/lib/character-creation/sacramento/types";

type StepId =
  | "tracos"
  | "elementos"
  | "atributos"
  | "habilidades"
  | "compras"
  | "montaria"
  | "revisao";

const STEP_LABELS: Record<StepId, string> = {
  tracos: "Traços",
  elementos: "Elementos",
  atributos: "Atributos",
  habilidades: "Habilidades",
  compras: "Compras",
  montaria: "Montaria",
  revisao: "Revisão",
};

const DRAFT_KEY = "sacramento-character-draft-v2";

export function CharacterWizard() {
  const [stepIdx, setStepIdx] = useState(0);
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
  const [lojaAmbient, setLojaAmbient] = useState<string | null>(null);
  const revisaoTriggerRef = useRef<(() => void) | null>(null);
  const savedRef = useRef(false);

  const ficha = data.ficha ?? FICHA_INICIAL;
  const animaisComprados = montariasCompradas(ficha.compras ?? []);
  const temMontaria = animaisComprados.length > 0;

  // A etapa de montaria só existe se um cavalo/mula saiu da loja.
  const stepIds: StepId[] = useMemo(
    () => [
      "tracos",
      "elementos",
      "atributos",
      "habilidades",
      "compras",
      ...(temMontaria ? (["montaria"] as StepId[]) : []),
      "revisao",
    ],
     
    [temMontaria],
  );
  const idx = Math.min(stepIdx, stepIds.length - 1);
  const step = stepIds[idx];

  // Devolveu os animais na loja → as fichas de montaria vão junto.
  useEffect(() => {
    if (!temMontaria && (ficha.montarias?.length ?? 0) > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setData((prev) => ({
        ...prev,
        ficha: { ...(prev.ficha ?? FICHA_INICIAL), montarias: [] },
      }));
    }
  }, [temMontaria, ficha.montarias]);

  // ---- Rascunho: restaura no mount, salva a cada mudança ----
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw) as { stepIdx?: number; data?: Partial<SacramentoCreationData> };
      if (draft?.data?.base) {
        // Restaurar no effect evita mismatch de hidratação (localStorage não existe no SSR).
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setData({
          kitId: "base",
          ...draft.data,
          ficha: { ...FICHA_INICIAL, ...draft.data.ficha },
        });
        setStepIdx(typeof draft.stepIdx === "number" && draft.stepIdx >= 0 ? draft.stepIdx : 0);
        setDraftRestored(true);
      }
    } catch {
      // rascunho corrompido — ignora
    }
  }, []);

  useEffect(() => {
    if (savedRef.current) return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ stepIdx, data }));
    } catch {
      // storage cheio/bloqueado — segue sem rascunho
    }
  }, [stepIdx, data]);

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
    setStepIdx(0);
    setAiError(null);
    setDraftRestored(false);
  };

  const updateData = (partial: Partial<SacramentoCreationData>) => {
    setData((prev) => ({ ...prev, ...partial }));
  };

  const goNext = () => setStepIdx((i) => Math.min(stepIds.length - 1, i + 1));
  const goBack = () => setStepIdx((i) => Math.max(0, i - 1));

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
      kit && kit.id !== "base"
        ? `veste como ${kit.nome.toLowerCase()} (${kit.descricao.toLowerCase()})`
        : null,
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
      updateData({ historia: json.historia });
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
  const validacao = validarFicha(ficha);
  const atributosOk =
    validacao.atributosGastos === validacao.atributosOrcamento &&
    validacao.antecedentesGastos === validacao.antecedentesOrcamento &&
    !validacao.erros.some(
      (e) =>
        e.includes("antecedente comporta") || e.includes("passar de 3") || e.includes("progressão"),
    );

  const canProceedMap: Record<StepId, boolean> = {
    tracos: !!data.name && data.name.trim().length >= 2 && !!data.base,
    elementos:
      !!data.elementos &&
      data.elementos.conceito.trim().length > 0 &&
      data.elementos.redencaoTrilhaId.length > 0,
    atributos: atributosOk,
    habilidades: validacao.habilidadesEscolhidas === validacao.habilidadesTotal,
    compras: !validacao.erros.some((e) => e.includes("orçamento") || e.includes("espaço")),
    montaria: true,
    revisao: !!data.historia && !saving && !isGenerating,
  };
  const canProceed = canProceedMap[step];

  const handleFooterNext = () => {
    if (step === "revisao") revisaoTriggerRef.current?.();
    else goNext();
  };

  const header = (
    <StepIndicator
      currentStep={idx + 1}
      stepLabels={stepIds.map((id) => STEP_LABELS[id])}
      title="Novo personagem"
    />
  );

  const footer = (
    <div className="flex items-center justify-between gap-3">
      {idx > 0 ? (
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
        {step === "revisao" ? (saving ? "Cravando o nome…" : "Criar personagem") : "Continuar"}
      </button>
    </div>
  );

  const derivados = calcularDerivados(ficha, contarParrudeza(ficha.habilidades));
  const mostrarStats = ["atributos", "habilidades", "compras", "montaria", "revisao"].includes(step);
  const previewStats = mostrarStats
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
    step !== "tracos"
      ? data.elementos?.conceito || data.elementos?.ocupacao || "Sacramento · 1880"
      : data.base
        ? [
            FAIXAS_ETARIAS.find((f) => f.id === data.base?.faixaEtaria)?.label,
            TIPOS_FISICOS.find((t) => t.id === data.base?.tipoFisico)?.label,
          ]
            .filter(Boolean)
            .join(" · ")
        : undefined;

  // Nas lojas (e no estábulo da montaria), a cena do vendedor ambienta o retrato.
  const ambientImage =
    step === "compras" && lojaAmbient
      ? lojaAmbient
      : step === "montaria"
        ? "/story/vendedores/estabulo.webp"
        : undefined;

  const previewContent = (
    <SacramentoPreview
      imageUrl={previewImageUrl}
      characterName={data.name}
      subtitle={previewSubtitle}
      stats={previewStats}
      ambientImage={ambientImage}
      nivel={mostrarStats ? ficha.nivel : undefined}
    />
  );

  return (
    <WizardLayout header={header} footer={footer} previewContent={previewContent} scrollKey={step}>
      {step === "tracos" && (
        <Step1Tracos data={data} onUpdate={updateData} onChangeBase={handleChangeBase} />
      )}
      {step === "elementos" && <Step2Elementos data={data} onUpdate={updateData} />}
      {step === "atributos" && <Step4Atributos data={data} onUpdate={updateData} />}
      {step === "habilidades" && <Step5Habilidades data={data} onUpdate={updateData} />}
      {step === "compras" && (
        <StepCompras data={data} onUpdate={updateData} onAmbient={setLojaAmbient} />
      )}
      {step === "montaria" && <StepMontaria data={data} onUpdate={updateData} />}
      {step === "revisao" && (
        <StepRevisao
          data={data}
          onUpdate={updateData}
          onGenerateStory={generateStory}
          isGenerating={isGenerating}
          secaoGerando={secaoGerando}
          aiError={aiError}
          triggerRef={revisaoTriggerRef}
          onSavingChange={setSaving}
          onSaved={clearDraft}
        />
      )}
    </WizardLayout>
  );
}
