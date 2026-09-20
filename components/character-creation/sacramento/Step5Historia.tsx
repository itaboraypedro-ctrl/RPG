"use client";

import { useState } from "react";
import { trilhaById } from "@/lib/character-creation/sacramento/story-data";
import {
  ELEMENTOS_VAZIOS,
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
  error: string | null;
};

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
    vinculos:
      e.vinculos.filter((v) => v.nome.trim()).map((v) => ({ ...v, detalhe: v.detalhe ?? "" })) ??
      [],
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

const CARD_STYLE = {
  background: "rgba(27,27,42,0.72)",
  border: "1px solid rgba(255,255,255,0.08)",
} as const;

export default function Step5Historia({
  data,
  onUpdate,
  onGenerateStory,
  isGenerating,
  secaoGerando,
  error,
}: Props) {
  const [feedbackGeral, setFeedbackGeral] = useState("");
  const historia = data.historia;
  const modoManual = data.historiaModo === "manual";
  const aprovada = data.historiaAprovada === true;

  const escolherIa = async () => {
    onUpdate({ historiaModo: "ia", historiaAprovada: false });
    await onGenerateStory("gerar");
  };

  const escolherManual = () => {
    onUpdate({
      historiaModo: "manual",
      historia: esbocoManual(data.name ?? "", data.elementos ?? ELEMENTOS_VAZIOS),
      historiaAprovada: false,
    });
  };

  // Escolha de caminho
  if (!historia && !isGenerating) {
    return (
      <div className="space-y-8 max-w-2xl">
        <p className="font-crimson text-sm italic text-arcana-text-dim">
          Seus elementos estão prontos. Como quer construir a história?
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={escolherIa}
            className="text-left rounded-2xl p-6 space-y-3 transition-all hover:-translate-y-px arcana-item-selected-glow"
            style={CARD_STYLE}
          >
            <span className="block font-cinzel text-sm uppercase tracking-[0.2em] text-arcana-gold-bright">
              Gerar com IA
            </span>
            <span className="block font-crimson text-base text-arcana-text-dim leading-relaxed">
              A IA escreve a história a partir do que você preencheu — visual e
              elementos. Depois você revisa, ajusta ponto a ponto e aprova.
            </span>
          </button>
          <button
            type="button"
            onClick={escolherManual}
            className="text-left rounded-2xl p-6 space-y-3 transition-all hover:-translate-y-px"
            style={CARD_STYLE}
          >
            <span className="block font-cinzel text-sm uppercase tracking-[0.2em] text-arcana-text">
              Escrever eu mesmo
            </span>
            <span className="block font-crimson text-base text-arcana-text-dim leading-relaxed">
              Você preenche cada parte da história com suas palavras, na mesma
              estrutura: resumo, jornada, vínculos e redenção.
            </span>
          </button>
        </div>
        {error && (
          <p className="font-crimson text-sm italic text-arcana-danger" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }

  // Gerando pela primeira vez
  if (!historia) {
    return (
      <div className="max-w-2xl py-16 text-center space-y-4">
        <p className="font-cinzel text-sm uppercase tracking-[0.25em] text-arcana-gold-bright animate-pulse">
          Escrevendo sua lenda…
        </p>
        <p className="font-crimson text-base italic text-arcana-text-dim">
          A IA está tecendo origem, vínculos e a trilha de redenção a partir dos
          seus elementos.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="font-crimson text-sm italic text-arcana-text-dim">
          {modoManual
            ? "Preencha e ajuste cada seção — depois conclua para seguir."
            : "Revise a história: edite pontos específicos, peça outra versão ou aprove."}
        </p>
        {!modoManual && (
          <button
            type="button"
            onClick={async () => {
              onUpdate({ historiaModo: "manual" });
            }}
            className="font-crimson text-sm italic text-arcana-text-dim underline underline-offset-4 hover:text-arcana-text transition-colors"
          >
            Assumir a escrita manualmente
          </button>
        )}
      </div>

      {error && (
        <p className="font-crimson text-sm italic text-arcana-danger" role="alert">
          {error}
        </p>
      )}

      <StoryReview
        historia={historia}
        modoManual={modoManual}
        isGenerating={isGenerating}
        secaoGerando={secaoGerando}
        onChange={(h) => onUpdate({ historia: h, historiaAprovada: false })}
        onRegenSection={
          modoManual
            ? undefined
            : (secao, feedback) => {
                void onGenerateStory("revisar-secao", { secao, feedback });
              }
        }
      />

      {!modoManual && (
        <div className="rounded-2xl p-5 space-y-3" style={CARD_STYLE}>
          <span className="font-cinzel text-[10px] uppercase tracking-[0.3em] text-arcana-text-dim">
            Refazer a história inteira
          </span>
          <div className="flex gap-2">
            <input
              type="text"
              value={feedbackGeral}
              onChange={(e) => setFeedbackGeral(e.target.value)}
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
              className={isGenerating ? "arcana-btn-disabled arcana-btn-sm" : "arcana-btn-ghost arcana-btn-sm"}
            >
              Refazer tudo
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-2">
        {aprovada ? (
          <p className="font-cinzel text-xs uppercase tracking-[0.2em] text-arcana-gold-bright">
            História aprovada ✓
          </p>
        ) : (
          <button
            type="button"
            onClick={() => onUpdate({ historiaAprovada: true })}
            disabled={isGenerating}
            className={isGenerating ? "arcana-btn-disabled" : "arcana-btn-primary"}
          >
            {modoManual ? "Concluir história" : "Aprovar história"}
          </button>
        )}
      </div>
    </div>
  );
}
