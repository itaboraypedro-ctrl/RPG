"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { WizardLayout } from "@/components/character-creation/WizardLayout";
import { StepIndicator } from "@/components/character-creation/StepIndicator";
import { EscritorioPreview } from "@/components/character-creation/sacramento/EscritorioPreview";
import Step1Tracos from "@/components/character-creation/sacramento/Step1Tracos";
import Step2Elementos from "@/components/character-creation/sacramento/Step2Elementos";
import Step4Atributos from "@/components/character-creation/sacramento/Step4Atributos";
import Step5Habilidades from "@/components/character-creation/sacramento/Step5Habilidades";
import StepCompras from "@/components/character-creation/sacramento/StepCompras";
import StepMontaria from "@/components/character-creation/sacramento/StepMontaria";
import StepRevisao from "@/components/character-creation/sacramento/StepRevisao";
import StepSelfie from "@/components/character-creation/sacramento/StepSelfie";
import ForjaPersonagem from "@/components/character-creation/sacramento/ForjaPersonagem";
import {
  APRESENTACOES,
  BASE_PADRAO,
  FAIXAS_ETARIAS,
  TIPOS_FISICOS,
  TONS_DE_PELE,
  baseId,
  baseImagePath,
} from "@/lib/character-creation/sacramento/bases";
import { characterImagePath, kitAvailableForBase, kitById } from "@/lib/character-creation/sacramento/kits";
import { montariasCompradas } from "@/lib/character-creation/sacramento/catalogo";
import {
  ANTECEDENTES,
  ATRIBUTOS,
  calcularDerivados,
  validarFicha,
} from "@/lib/character-creation/sacramento/rules";
import { contarParrudeza, habilidadeById } from "@/lib/character-creation/sacramento/habilidades";
import type {
  BaseVisual,
  HistoriaEstruturada,
  HistoriaSecao,
  ImagensGeradas,
  SacramentoCreationData,
} from "@/lib/character-creation/sacramento/types";
import {
  FICHA_INICIAL,
  LIMITE_GERACOES_HISTORIA,
  LIMITE_REVISOES_SECAO,
} from "@/lib/character-creation/sacramento/types";

type StepId =
  | "tracos"
  | "elementos"
  | "atributos"
  | "habilidades"
  | "compras"
  | "montaria"
  | "revisao"
  | "selfie";

const STEP_LABELS: Record<StepId, string> = {
  tracos: "Traços",
  elementos: "Elementos",
  atributos: "Atributos",
  habilidades: "Habilidades",
  compras: "Compras",
  montaria: "Montaria",
  revisao: "Revisão",
  selfie: "Retrato",
};

const DRAFT_KEY = "sacramento-character-draft-v2";

type TipoImagem = "close" | "estados" | "banner";
type StatusForja = "idle" | "gerando" | "ok" | "erro";

/** Índice fixo da etapa de selfie — o rascunho restaurado nunca pula além dela (a selfie não persiste). */
const SELFIE_IDX = 4;

export function CharacterWizard() {
  const router = useRouter();
  const [stepIdx, setStepIdx] = useState(0);
  const [data, setData] = useState<Partial<SacramentoCreationData>>({
    base: BASE_PADRAO,
    kitId: "base",
    ficha: FICHA_INICIAL,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [secaoGerando, setSecaoGerando] = useState<HistoriaSecao | null>(null);
  const [pontoGerando, setPontoGerando] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [draftRestored, setDraftRestored] = useState(false);
  const [lojaAmbient, setLojaAmbient] = useState<string | null>(null);
  // Selfie fica fora do rascunho: pesada demais para o localStorage e não deve persistir.
  const [selfie, setSelfie] = useState<string | null>(null);
  const [forjando, setForjando] = useState(false);
  // Fronteira entre os atos: confirmar o selo (Habilidades → Selfie) ou o retorno.
  const [modalAto, setModalAto] = useState<"selar" | "voltar" | null>(null);
  // Forja de retratos: dispara ao confirmar a selfie e roda durante as compras.
  const [forjaStatus, setForjaStatus] = useState<Record<TipoImagem, StatusForja>>({
    close: "idle",
    estados: "idle",
    banner: "idle",
  });
  const [forjaErros, setForjaErros] = useState<Partial<Record<TipoImagem, string>>>({});
  const forjaImagensRef = useRef<ImagensGeradas>({});
  const forjaHashRef = useRef<string | null>(null);
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
      "selfie",
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
        setData({
          kitId: "base",
          ...draft.data,
          ficha: { ...FICHA_INICIAL, ...draft.data.ficha },
        });
        // A selfie não persiste — quem recarregou depois dela volta para a etapa da foto.
        setStepIdx(
          typeof draft.stepIdx === "number" && draft.stepIdx >= 0
            ? Math.min(draft.stepIdx, SELFIE_IDX)
            : 0,
        );
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
    setData((prev) => {
      // Kit sem asset para a nova base volta ao básico (nunca mostrar imagem quebrada/errada).
      const kitId = prev.kitId && kitAvailableForBase(prev.kitId, base) ? prev.kitId : "base";
      return { ...prev, base, kitId };
    });
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

  // Resumo em markdown da ficha mecânica — só cor narrativa para a IA.
  const fichaResumo = () => {
    const parr = contarParrudeza(ficha.habilidades);
    const habilidades = ficha.habilidades
      .filter((id) => id !== "parrudeza")
      .map((id) => habilidadeById(id)?.nome ?? id);
    if (parr > 0) habilidades.push(`Parrudeza ×${parr}`);
    return [
      `- Atributos: ${ATRIBUTOS.map((a) => `${a.nome} ${ficha.atributos[a.id]}`).join(", ")}`,
      `- Antecedentes: ${
        ANTECEDENTES.filter((a) => ficha.antecedentes[a.id] > 0)
          .map((a) => `${a.nome} ${ficha.antecedentes[a.id]}`)
          .join(", ") || "nenhum"
      }`,
      `- Habilidades: ${habilidades.join(", ") || "nenhuma"}`,
    ].join("\n");
  };

  // ---- Guardrail de custo por rascunho ----
  const geracoesUsadas = data.historiaGeracoes ?? 0;
  const revisoesUsadas = data.historiaRevisoesSecao ?? 0;
  const reescritasRestantes = Math.max(0, LIMITE_GERACOES_HISTORIA - geracoesUsadas);
  const iaTravada = geracoesUsadas >= LIMITE_GERACOES_HISTORIA;

  const generateStory = async (
    action: "gerar" | "revisar-secao" | "revisar-tudo" | "alterar-ponto",
    opts?: { secao?: HistoriaSecao; feedback?: string; pontoId?: string; novoValor?: string },
  ): Promise<boolean> => {
    const reescritaCompleta = action !== "revisar-secao";
    if (reescritaCompleta && iaTravada) {
      setAiError(
        `Limite de ${LIMITE_GERACOES_HISTORIA} reescritas da lenda atingido — daqui em diante, edite manualmente.`,
      );
      return false;
    }
    if (!reescritaCompleta && revisoesUsadas >= LIMITE_REVISOES_SECAO) {
      setAiError(
        `Limite de ${LIMITE_REVISOES_SECAO} revisões de seção atingido — edite a seção manualmente.`,
      );
      return false;
    }
    setIsGenerating(true);
    setSecaoGerando(action === "revisar-secao" ? (opts?.secao ?? null) : null);
    setPontoGerando(action === "alterar-ponto" ? (opts?.pontoId ?? null) : null);
    setAiError(null);
    try {
      const res = await fetch("/api/ai/generate-character-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          nome: data.name ?? "",
          visualResumo: visualResumo(),
          fichaResumo: fichaResumo(),
          elementos: data.elementos,
          historiaAtual: action === "gerar" ? undefined : data.historia,
          secao: opts?.secao,
          feedback: opts?.feedback,
          pontoId: opts?.pontoId,
          novoValor: opts?.novoValor,
        }),
      });
      const json = (await res.json()) as { historia?: HistoriaEstruturada; error?: string };
      if (!res.ok || !json.historia) {
        setAiError(json.error ?? "A geração da história falhou. Tente de novo.");
        return false;
      }
      updateData({
        historia: json.historia,
        ...(action === "gerar" ? { historiaBaseHash: storyFingerprint() } : {}),
        ...(reescritaCompleta
          ? { historiaGeracoes: geracoesUsadas + 1 }
          : { historiaRevisoesSecao: revisoesUsadas + 1 }),
      });
      return true;
    } catch {
      setAiError("A geração da história falhou. Verifique a conexão e tente de novo.");
      return false;
    } finally {
      setIsGenerating(false);
      setSecaoGerando(null);
      setPontoGerando(null);
    }
  };

  // Insumos que mudam a história — se nada mudou, não regera em background.
  const storyFingerprint = () =>
    JSON.stringify([data.name, visualResumo(), data.elementos, ficha.habilidades]);

  // ---- Forja de retratos (gpt-image-1) ----
  const gerarImagem = async (tipo: TipoImagem, foto?: string) => {
    const selfieAtual = foto ?? selfie;
    if (!selfieAtual) return;
    setForjaStatus((s) => ({ ...s, [tipo]: "gerando" }));
    setForjaErros((e) => ({ ...e, [tipo]: undefined }));
    try {
      const res = await fetch("/api/ai/generate-character-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo,
          selfie: selfieAtual,
          base: data.base,
          kitId: data.kitId ?? "base",
          nome: data.name ?? "",
        }),
      });
      const json = (await res.json()) as { url?: string; placeholder?: boolean; error?: string };
      if (!res.ok || !json.url) throw new Error(json.error ?? "Falha na geração");
      // Placeholder (dev sem chave) não vira imagem oficial — o kit estático já cobre.
      if (!json.placeholder) forjaImagensRef.current[tipo] = json.url;
      setForjaStatus((s) => ({ ...s, [tipo]: "ok" }));
    } catch (err) {
      setForjaErros((e) => ({
        ...e,
        [tipo]: err instanceof Error ? err.message : "Falha na geração",
      }));
      setForjaStatus((s) => ({ ...s, [tipo]: "erro" }));
    }
  };

  const forjaFingerprint = () =>
    selfie && data.base
      ? `${selfie.length}:${selfie.slice(-48)}|${baseId(data.base)}|${data.kitId}|${data.name}`
      : null;

  /** Idempotente: só (re)forja se a selfie ou o visual mudaram desde a última forja. */
  const iniciarForja = () => {
    const hash = forjaFingerprint();
    if (!hash || forjaHashRef.current === hash) return;
    forjaHashRef.current = hash;
    forjaImagensRef.current = {};
    (["close", "estados", "banner"] as TipoImagem[]).forEach((t) => void gerarImagem(t));
  };

  /** A travessia para o Ato II dispararia uma (re)escrita da lenda? */
  const precisaGerarHistoria = () =>
    data.historiaModo !== "manual" &&
    !!data.elementos?.conceito &&
    !!data.elementos.redencaoTrilhaId &&
    (!data.historia || data.historiaBaseHash !== storyFingerprint());

  /**
   * Disparada ao selar o Ato I: a lenda é escrita em segundo plano
   * enquanto o jogador faz as compras, e chega pronta na Revisão.
   */
  const maybeGenerateStoryInBackground = () => {
    if (isGenerating || iaTravada || !precisaGerarHistoria()) return;
    updateData({ historiaModo: "ia" });
    void generateStory("gerar");
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
    revisao: !!data.historia && !isGenerating && !forjando,
    selfie: !!selfie,
  };
  const canProceed = canProceedMap[step];

  const handleFooterNext = () => {
    if (step === "habilidades") {
      // Fronteira do Ato I: se a travessia dispara a escrita da lenda, o selo pede confirmação.
      if (precisaGerarHistoria() && !iaTravada && !isGenerating) {
        setModalAto("selar");
      } else {
        goNext();
      }
    } else if (step === "selfie") {
      // A forja começa aqui e roda em segundo plano durante as compras.
      iniciarForja();
      goNext();
    } else if (step === "revisao") {
      updateData({ historiaAprovada: true });
      if (!selfie) {
        // Rascunho restaurado sem selfie — volta para a foto antes de criar.
        setStepIdx(SELFIE_IDX);
        return;
      }
      iniciarForja();
      setForjando(true);
    } else {
      goNext();
    }
  };

  const handleBack = () => {
    // Voltar da Selfie para o Ato I mexe nos insumos da lenda — pede confirmação.
    if (step === "selfie" && (data.historia || isGenerating)) {
      setModalAto("voltar");
      return;
    }
    goBack();
  };

  // Dois atos: quem você é (até a Selfie) e a vida no Oeste (das Compras em diante).
  const atoII = ["compras", "montaria", "revisao"].includes(step);
  const header = (
    <StepIndicator
      currentStep={idx + 1}
      stepLabels={stepIds.map((id) => STEP_LABELS[id])}
      title={atoII ? "Ato II · A vida no Oeste" : "Ato I · Quem você é"}
    />
  );

  const footerLabel =
    step === "revisao"
      ? forjando
        ? "Forjando…"
        : "Criar personagem"
      : "Continuar";

  const footer = (
    <div className="flex items-center justify-between gap-3">
      {idx > 0 ? (
        <button type="button" onClick={handleBack} disabled={forjando} className="arcana-btn-ghost">
          Voltar
        </button>
      ) : draftRestored ? (
        <button type="button" onClick={resetAll} className="arcana-btn-ghost arcana-btn-sm">
          Recomeçar do zero
        </button>
      ) : (
        <div />
      )}
      {/* A lenda sendo escrita em segundo plano durante as compras */}
      {isGenerating && step !== "revisao" && (
        <span className="hidden sm:inline font-crimson text-sm italic text-arcana-gold animate-pulse">
          ✒ Sua lenda está sendo escrita…
        </span>
      )}
      <button
        type="button"
        onClick={handleFooterNext}
        disabled={!canProceed}
        className={canProceed ? "arcana-btn-primary" : "arcana-btn-primary-disabled"}
      >
        {footerLabel}
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

  // Na revisão, quem posa na moldura é a foto do jogador — busto fechado, não o corpo inteiro.
  const previewImageUrl =
    step === "revisao" && selfie
      ? selfie
      : data.base
        ? characterImagePath(data.base, data.kitId)
        : null;
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

  // Nas lojas (e no estábulo da montaria), a cena do vendedor ambienta o retrato;
  // na selfie, o estúdio do retratista.
  const ambientImage =
    step === "compras" && lojaAmbient
      ? lojaAmbient
      : step === "montaria"
        ? "/story/vendedores/estabulo.webp"
        : step === "selfie"
          ? "/story/fotografo/estudio.webp"
          : undefined;

  const previewContent = (
    <EscritorioPreview
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
          pontoGerando={pontoGerando}
          aiError={aiError}
          reescritasRestantes={reescritasRestantes}
          podeReescrever={!iaTravada}
          podeRevisarSecao={revisoesUsadas < LIMITE_REVISOES_SECAO}
          historiaDesatualizada={
            iaTravada && !!data.historia && data.historiaBaseHash !== storyFingerprint()
          }
        />
      )}
      {step === "selfie" && <StepSelfie selfie={selfie} onSelfie={setSelfie} />}
      {modalAto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button
            aria-label="Fechar aviso"
            onClick={() => setModalAto(null)}
            className="absolute inset-0 cursor-default"
            style={{ background: "rgba(5,5,10,0.65)", backdropFilter: "blur(3px)" }}
          />
          <div
            role="dialog"
            aria-modal="true"
            className="arcana-rise-in relative w-full max-w-md rounded-2xl p-6 space-y-4"
            style={{
              background: "rgba(15,15,26,0.97)",
              backdropFilter: "blur(24px) saturate(1.4)",
              border: "1px solid rgba(209,171,85,0.35)",
              boxShadow: "0 12px 48px rgba(0,0,0,0.6)",
            }}
          >
            {modalAto === "selar" ? (
              <>
                <p className="font-cinzel text-[10px] uppercase tracking-[0.35em] text-arcana-gold">
                  Fim do Ato I
                </p>
                <h3 className="font-cinzel text-lg uppercase tracking-[0.15em] text-arcana-gold-bright">
                  Selar quem você é?
                </h3>
                <p className="font-crimson text-base text-arcana-text leading-relaxed">
                  Traços, elementos, atributos e habilidades formam a sua identidade. Ao seguir, o
                  narrador começa a escrever sua lenda com essas escolhas — enquanto você tira o
                  retrato e faz as compras, tudo vai sendo preparado.
                </p>
                <p className="font-crimson text-sm italic text-arcana-text-dim">
                  Dá para voltar depois, mas mudar essas escolhas reescreve a lenda — este
                  personagem tem {reescritasRestantes} de {LIMITE_GERACOES_HISTORIA} escritas
                  disponíveis.
                </p>
                <div className="flex items-center justify-end gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setModalAto(null)}
                    className="arcana-btn-ghost"
                  >
                    Revisar escolhas
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setModalAto(null);
                      maybeGenerateStoryInBackground();
                      goNext();
                    }}
                    className="arcana-btn-primary"
                  >
                    Selar e seguir
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="font-cinzel text-[10px] uppercase tracking-[0.35em] text-arcana-gold">
                  De volta ao Ato I
                </p>
                <h3 className="font-cinzel text-lg uppercase tracking-[0.15em] text-arcana-gold-bright">
                  Mexer no passado?
                </h3>
                <p className="font-crimson text-base text-arcana-text leading-relaxed">
                  Sua lenda {isGenerating ? "está sendo escrita" : "já foi escrita"} com as escolhas
                  seladas. Se você mudar traços, elementos, atributos ou habilidades, ela será
                  reescrita do zero quando avançar de novo.
                </p>
                <p className="font-crimson text-sm italic text-arcana-text-dim">
                  {reescritasRestantes > 0
                    ? `Restam ${reescritasRestantes} de ${LIMITE_GERACOES_HISTORIA} escritas da lenda. Voltar sem mudar nada não gasta nenhuma.`
                    : "As escritas da lenda deste personagem acabaram — mudanças não geram história nova; você edita manualmente."}
                </p>
                <div className="flex items-center justify-end gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setModalAto(null);
                      goBack();
                    }}
                    className="arcana-btn-ghost"
                  >
                    Voltar assim mesmo
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalAto(null)}
                    className="arcana-btn-primary"
                  >
                    Ficar aqui
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {forjando && (
        <ForjaPersonagem
          data={data}
          status={forjaStatus}
          erros={forjaErros}
          imagens={forjaImagensRef.current}
          onRetry={(tipo) => void gerarImagem(tipo)}
          onSaved={clearDraft}
          onExit={() => router.push("/hub")}
          onCancel={() => setForjando(false)}
        />
      )}
    </WizardLayout>
  );
}
