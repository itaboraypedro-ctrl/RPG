"use client";

import { useEffect, useRef, useState } from "react";
import {
  createSacramentoCharacter,
  type CreateSacramentoPayload,
} from "@/app/play/characters/new/actions";
import { HowItWorks } from "@/components/campaign-creation/Explainer";
import { PLAYER_GUIDES } from "@/lib/character-creation/sacramento/guidance";
import {
  APRESENTACOES,
  FAIXAS_ETARIAS,
  TIPOS_FISICOS,
  TONS_DE_PELE,
} from "@/lib/character-creation/sacramento/bases";
import { kitById } from "@/lib/character-creation/sacramento/kits";
import { habilidadeById, contarParrudeza } from "@/lib/character-creation/sacramento/habilidades";
import {
  ANTECEDENTES,
  ATRIBUTOS,
  calcularDerivados,
  validarFicha,
} from "@/lib/character-creation/sacramento/rules";
import { resumoCompras } from "@/lib/character-creation/sacramento/catalogo";
import { faccaoById, trilhaById } from "@/lib/character-creation/sacramento/story-data";
import {
  ELEMENTOS_VAZIOS,
  FICHA_INICIAL,
  type ElementosHistoria,
  type HistoriaEstruturada,
  type HistoriaSecao,
  type SacramentoCreationData,
} from "@/lib/character-creation/sacramento/types";
import { StoryReview } from "./StoryReview";

type Props = {
  data: Partial<SacramentoCreationData>;
  onUpdate: (partial: Partial<SacramentoCreationData>) => void;
  onGenerateStory: (
    action: "gerar" | "revisar-secao" | "revisar-tudo",
    opts?: { secao?: HistoriaSecao; feedback?: string },
  ) => Promise<boolean>;
  isGenerating: boolean;
  secaoGerando: HistoriaSecao | null;
  aiError: string | null;
  triggerRef: React.MutableRefObject<(() => void) | null>;
  onSavingChange: (saving: boolean) => void;
  onSaved: () => void;
};

const LABEL = "font-cinzel text-[10px] uppercase tracking-[0.3em] text-arcana-text-dim";
const CARD_STYLE = {
  background: "rgba(27,27,42,0.72)",
  border: "1px solid rgba(255,255,255,0.08)",
} as const;

/** Esqueleto para quem prefere escrever a própria história. */
function esbocoManual(nome: string, e: ElementosHistoria): HistoriaEstruturada {
  const trilha = trilhaById(e.redencaoTrilhaId);
  return {
    resumo: e.conceito
      ? `${nome || "Seu personagem"} — ${e.conceito}.`
      : `${nome || "Seu personagem"} cruza o Oeste em 1880.`,
    capitulos: [
      { titulo: "Raízes", texto: e.origem ? `Tudo começou em ${e.origem}. ` : "" },
      { titulo: "A virada", texto: e.passadoDetalhe || "" },
      { titulo: "O Oeste hoje", texto: e.ocupacao ? `Hoje vive como ${e.ocupacao}.` : "" },
    ],
    familia: e.familiaDetalhe || (e.familia === "nao" ? "Não há família viva ou presente." : ""),
    vinculos: e.vinculos
      .filter((v) => v.nome.trim())
      .map((v) => ({ ...v, detalhe: v.detalhe ?? "" })),
    redencao: {
      trilhaId: trilha?.id ?? "propria",
      trilhaNome: trilha?.nome ?? "Trilha própria",
      premissa: e.redencaoPremissa || trilha?.premissa || "",
      passos:
        trilha && trilha.passos.length === 6
          ? [...trilha.passos]
          : ["", "", "", "", "", "Encerrar a jornada"],
    },
    ganchos: [""],
  };
}

export default function StepRevisao({
  data,
  onUpdate,
  onGenerateStory,
  isGenerating,
  secaoGerando,
  aiError,
  triggerRef,
  onSavingChange,
  onSaved,
}: Props) {
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [feedbackGeral, setFeedbackGeral] = useState("");

  const historia = data.historia;
  const modoManual = data.historiaModo === "manual";

  const handleCreate = async () => {
    if (saving) return;
    const { name, base } = data;
    if (!name || !base || !data.historia) {
      setError("Complete o retrato e a história antes de criar.");
      return;
    }
    setSaving(true);
    setError(null);
    onSavingChange(true);
    try {
      const payload: CreateSacramentoPayload = {
        name,
        base,
        kitId: data.kitId ?? "base",
        elementos: data.elementos ?? ELEMENTOS_VAZIOS,
        historia: data.historia,
        historiaModo: data.historiaModo ?? "manual",
        ficha: data.ficha ?? FICHA_INICIAL,
      };
      const result = await createSacramentoCharacter(payload);
      if (result && !result.ok) {
        setError(result.error);
      } else {
        onSaved();
      }
    } catch (err) {
      if ((err as { digest?: string })?.digest?.startsWith("NEXT_REDIRECT")) {
        onSaved();
        throw err;
      }
      setError("Não foi possível salvar o personagem. Tente novamente.");
    } finally {
      setSaving(false);
      onSavingChange(false);
    }
  };

  // Mantém o handler fresco e expõe ao footer compartilhado (padrão triggerRef).
  const handleCreateRef = useRef(handleCreate);
  useEffect(() => {
    handleCreateRef.current = handleCreate;
  });
  useEffect(() => {
    triggerRef.current = () => {
      void handleCreateRef.current();
    };
    return () => {
      triggerRef.current = null;
    };
  }, [triggerRef]);

  const base = data.base;
  const elementos = data.elementos ?? ELEMENTOS_VAZIOS;
  const ficha = data.ficha ?? FICHA_INICIAL;
  const faccao = faccaoById(elementos.faccaoId);
  const kit = kitById(data.kitId ?? "base");
  const derivados = calcularDerivados(ficha, contarParrudeza(ficha.habilidades));
  const validacao = validarFicha(ficha);
  const compras = resumoCompras(ficha.compras ?? []);

  // Aparência em prosa — nada de chips soltos ("pele" e "aparência" pedem feminino).
  const PELE: Record<string, string> = {
    "muito-claro": "muito clara",
    claro: "clara",
    medio: "média",
    escuro: "escura",
    "muito-escuro": "muito escura",
  };
  const aparencia = base
    ? [
        `apresentação ${APRESENTACOES.find((a) => a.id === base.apresentacao)?.label.toLowerCase()}`,
        `pele ${PELE[base.tomDePele]}`,
        `por volta de ${FAIXAS_ETARIAS.find((f) => f.id === base.faixaEtaria)?.hint.replace("~", "")}`,
        `porte ${TIPOS_FISICOS.find((t) => t.id === base.tipoFisico)?.label.toLowerCase()}`,
        kit && kit.id !== "base" ? `kit ${kit.nome}` : null,
      ]
        .filter(Boolean)
        .join(" · ")
    : "";

  const habilidadesNomes = (() => {
    const parr = contarParrudeza(ficha.habilidades);
    const outras = ficha.habilidades
      .filter((id) => id !== "parrudeza")
      .map((id) => habilidadeById(id)?.nome ?? id);
    return parr > 0 ? [...outras, `Parrudeza ×${parr}`] : outras;
  })();

  return (
    <div className="space-y-6 max-w-2xl">
      <HowItWorks guide={PLAYER_GUIDES.revisao} />

      {/* Identidade */}
      <div className="rounded-2xl p-5 space-y-4" style={CARD_STYLE}>
        <div>
          <span className={LABEL}>Nome</span>
          <p className="font-cinzel text-xl uppercase tracking-[0.15em] text-arcana-gold-bright mt-1">
            {data.name || "—"}
          </p>
          {elementos.conceito && (
            <p className="font-crimson text-base italic text-arcana-text-dim mt-1">
              {elementos.conceito}
            </p>
          )}
        </div>
        <div>
          <span className={LABEL}>Aparência</span>
          <p className="font-crimson text-base text-arcana-text-dim mt-1">{aparencia}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {elementos.origem && (
            <div>
              <span className={LABEL}>Origem</span>
              <p className="font-crimson text-base text-arcana-text-dim mt-1">{elementos.origem}</p>
            </div>
          )}
          {faccao && (
            <div>
              <span className={LABEL}>Facção</span>
              <p className="font-crimson text-base text-arcana-text-dim mt-1">
                {faccao.nome}
                {elementos.faccaoRelacao ? ` · ${elementos.faccaoRelacao}` : ""}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* História — nasce e é lapidada aqui */}
      {!historia && !isGenerating && (
        <div className="rounded-2xl p-5 space-y-4" style={CARD_STYLE}>
          <div>
            <span className={LABEL}>História</span>
            <p className="font-crimson text-sm italic text-arcana-text-dim mt-1">
              Falta dar vida aos elementos. Como quer construir a biografia?
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => {
                onUpdate({ historiaModo: "ia" });
                void onGenerateStory("gerar");
              }}
              className="text-left rounded-xl p-4 space-y-2 transition-all hover:-translate-y-px"
              style={{
                background: "rgba(209,171,85,0.08)",
                border: "1px solid rgba(209,171,85,0.5)",
                boxShadow: "0 0 16px rgba(209,171,85,0.12)",
              }}
            >
              <span className="block font-cinzel text-xs uppercase tracking-[0.2em] text-arcana-gold-bright">
                Gerar com IA
              </span>
              <span className="block font-crimson text-sm text-arcana-text-dim leading-snug">
                A IA escreve a partir do que você preencheu; depois você ajusta ponto a ponto.
              </span>
            </button>
            <button
              type="button"
              onClick={() =>
                onUpdate({
                  historiaModo: "manual",
                  historia: esbocoManual(data.name ?? "", elementos),
                })
              }
              className="text-left rounded-xl p-4 space-y-2 transition-all hover:-translate-y-px"
              style={{
                background: "rgba(27,27,42,0.6)",
                border: "1px solid var(--color-arcana-border)",
              }}
            >
              <span className="block font-cinzel text-xs uppercase tracking-[0.2em] text-arcana-text">
                Escrever eu mesmo
              </span>
              <span className="block font-crimson text-sm text-arcana-text-dim leading-snug">
                Você preenche cada parte na mesma estrutura: resumo, jornada, vínculos e redenção.
              </span>
            </button>
          </div>
          {aiError && (
            <p className="font-crimson text-sm italic text-arcana-danger" role="alert">
              {aiError}
            </p>
          )}
        </div>
      )}

      {!historia && isGenerating && (
        <div className="rounded-2xl p-8 text-center space-y-3" style={CARD_STYLE}>
          <p className="font-cinzel text-sm uppercase tracking-[0.25em] text-arcana-gold-bright animate-pulse">
            Escrevendo sua lenda…
          </p>
          <p className="font-crimson text-base italic text-arcana-text-dim">
            A IA está tecendo origem, vínculos e a trilha de redenção.
          </p>
        </div>
      )}

      {historia && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <span className={LABEL}>História</span>
            {!modoManual ? (
              <button
                type="button"
                onClick={() => onUpdate({ historiaModo: "manual" })}
                className="font-crimson text-sm italic text-arcana-text-dim underline underline-offset-4 hover:text-arcana-text transition-colors"
              >
                Assumir a escrita manualmente
              </button>
            ) : (
              <span className="font-crimson text-sm italic text-arcana-text-dim">
                Edite cada seção com suas palavras
              </span>
            )}
          </div>
          {aiError && (
            <p className="font-crimson text-sm italic text-arcana-danger" role="alert">
              {aiError}
            </p>
          )}
          <StoryReview
            historia={historia}
            modoManual={modoManual}
            isGenerating={isGenerating}
            secaoGerando={secaoGerando}
            onChange={(h) => onUpdate({ historia: h })}
            onRegenSection={
              modoManual
                ? undefined
                : (secao, feedback) => {
                    void onGenerateStory("revisar-secao", { secao, feedback });
                  }
            }
          />
          {!modoManual && (
            <div className="rounded-2xl p-4 space-y-3" style={CARD_STYLE}>
              <span className={LABEL}>Refazer a história inteira</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={feedbackGeral}
                  onChange={(ev) => setFeedbackGeral(ev.target.value)}
                  placeholder="O que mudar no todo? Ex.: tom mais sombrio, menos nomes novos"
                  maxLength={400}
                  className="arcana-input flex-1 font-crimson text-base"
                />
                <button
                  type="button"
                  onClick={() => {
                    void onGenerateStory("revisar-tudo", {
                      feedback: feedbackGeral.trim() || "Reescreva com outra abordagem.",
                    });
                    setFeedbackGeral("");
                  }}
                  disabled={isGenerating}
                  className={
                    isGenerating ? "arcana-btn-disabled arcana-btn-sm" : "arcana-btn-ghost arcana-btn-sm"
                  }
                >
                  Refazer tudo
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Ficha */}
      <div className="rounded-2xl p-5 space-y-4" style={CARD_STYLE}>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <span className={LABEL}>Ficha · Nível {ficha.nivel}</span>
          <span className="font-cinzel text-[10px] uppercase tracking-[0.2em] text-arcana-text-dim">
            {derivados.xp} XP · saldo ${compras.saldo}
          </span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
          {[
            { label: "Vida", value: String(derivados.vidaMaxima) },
            { label: "Dor", value: String(derivados.capacidadeDor) },
            { label: "Defesa", value: String(derivados.defesa) },
            { label: "Movim.", value: String(derivados.movimentos) },
            { label: "Ações", value: String(derivados.acoesCombate) },
            { label: "Iniciativa", value: `${derivados.cartasIniciativa}♠` },
          ].map((s) => (
            <div key={s.label}>
              <p className="font-cinzel text-xl text-arcana-gold-bright leading-none">{s.value}</p>
              <p className="font-cinzel text-[10px] uppercase tracking-[0.12em] text-arcana-text-dim mt-1">
                {s.label}
              </p>
            </div>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <span className={LABEL}>Atributos</span>
            <p className="font-crimson text-base text-arcana-text-dim mt-1">
              {ATRIBUTOS.map((a) => `${a.nome} ${ficha.atributos[a.id]}`).join(" · ")}
            </p>
          </div>
          <div>
            <span className={LABEL}>Antecedentes</span>
            <p className="font-crimson text-base text-arcana-text-dim mt-1">
              {ANTECEDENTES.filter((a) => ficha.antecedentes[a.id] > 0)
                .map((a) => `${a.nome} ${ficha.antecedentes[a.id]}`)
                .join(" · ") || "—"}
            </p>
          </div>
          <div>
            <span className={LABEL}>Habilidades</span>
            <p className="font-crimson text-base text-arcana-text-dim mt-1">
              {habilidadesNomes.join(" · ") || "—"}
            </p>
          </div>
          <div>
            <span className={LABEL}>Montaria</span>
            <p className="font-crimson text-base text-arcana-text-dim mt-1">
              {ficha.montaria
                ? `${ficha.montaria.nome || "Sem nome"} · Pot ${ficha.montaria.potencia} · Res ${ficha.montaria.resistencia} · Vida ${6 + ficha.montaria.resistencia}`
                : "A resolver na mesa"}
            </p>
          </div>
          <div>
            <span className={LABEL}>Compras</span>
            <p className="font-crimson text-base text-arcana-text-dim mt-1">
              {compras.custoTotal > 0
                ? `${(ficha.compras ?? []).reduce((n, c) => n + c.quantidade, 0)} itens · $${compras.custoTotal} gastos · sobra $${compras.saldo}`
                : "Nada comprado — $200 intactos"}
            </p>
          </div>
          <div>
            <span className={LABEL}>Recompensa pela cabeça</span>
            <p className="font-crimson text-base text-arcana-text-dim mt-1">
              $0 — exceções da trilha só com o Juiz
            </p>
          </div>
        </div>
        {validacao.erros.length > 0 && (
          <div className="space-y-1">
            {validacao.erros.map((err) => (
              <p key={err} className="font-crimson text-sm italic text-arcana-danger">
                {err}
              </p>
            ))}
          </div>
        )}
      </div>

      {error && (
        <p className="font-crimson text-sm italic text-arcana-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
