"use client";

import { useState } from "react";
import type {
  HistoriaEstruturada,
  HistoriaSecao,
  PontoChave,
} from "@/lib/character-creation/sacramento/types";

type Props = {
  historia: HistoriaEstruturada;
  /** Modo manual: tudo editável inline, sem botões de IA. */
  modoManual: boolean;
  isGenerating: boolean;
  secaoGerando: HistoriaSecao | null;
  /** id do ponto-chave em reescrita, ou null. */
  pontoGerando?: string | null;
  onChange: (historia: HistoriaEstruturada) => void;
  onRegenSection?: (secao: HistoriaSecao, feedback: string) => void;
  /** Reescreve a história inteira com o novo valor do ponto-chave. */
  onAlterarPonto?: (pontoId: string, novoValor: string) => void;
};

const CARD_STYLE = {
  background: "rgba(27,27,42,0.72)",
  border: "1px solid rgba(255,255,255,0.08)",
} as const;

function SectionShell({
  titulo,
  secao,
  modoManual,
  editing,
  isGenerating,
  secaoGerando,
  onToggleEdit,
  onRegen,
  children,
}: {
  titulo: string;
  secao: HistoriaSecao;
  modoManual: boolean;
  editing: boolean;
  isGenerating: boolean;
  secaoGerando: HistoriaSecao | null;
  onToggleEdit: () => void;
  onRegen?: (feedback: string) => void;
  children: React.ReactNode;
}) {
  const [pedindoAjuste, setPedindoAjuste] = useState(false);
  const [feedback, setFeedback] = useState("");
  const gerandoEsta = secaoGerando === secao;

  return (
    <section className="rounded-2xl p-5 space-y-4" style={CARD_STYLE}>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h4 className="font-cinzel text-xs uppercase tracking-[0.25em] text-arcana-gold-bright">
          {titulo}
        </h4>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleEdit}
            disabled={isGenerating}
            className="arcana-btn-ghost arcana-btn-sm"
          >
            {editing ? "Concluir edição" : "Editar"}
          </button>
          {!modoManual && onRegen && (
            <button
              type="button"
              onClick={() => setPedindoAjuste((v) => !v)}
              disabled={isGenerating}
              className="arcana-btn-ghost arcana-btn-sm"
            >
              Refazer com IA
            </button>
          )}
        </div>
      </div>

      {pedindoAjuste && !modoManual && onRegen && (
        <div className="flex gap-2">
          <input
            type="text"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="O que mudar nesta seção? (opcional)"
            maxLength={300}
            className="arcana-input flex-1 font-crimson text-base"
          />
          <button
            type="button"
            onClick={() => {
              onRegen(feedback.trim() || "Reescreva esta seção com outra abordagem.");
              setFeedback("");
              setPedindoAjuste(false);
            }}
            disabled={isGenerating}
            className={isGenerating ? "arcana-btn-disabled arcana-btn-sm" : "arcana-btn-primary arcana-btn-sm"}
          >
            Refazer
          </button>
        </div>
      )}

      {gerandoEsta ? (
        <p className="font-crimson text-sm italic text-arcana-text-dim animate-pulse">
          Reescrevendo esta parte da história…
        </p>
      ) : (
        children
      )}
    </section>
  );
}

/**
 * Um ponto-chave da lenda como pílula editável: rótulo em caps douradas,
 * valor em prosa. Tocar abre a edição; confirmar reescreve a história.
 */
function PontoChavePill({
  ponto,
  modoManual,
  isGenerating,
  gerandoEste,
  onEditar,
  onAlterar,
}: {
  ponto: PontoChave;
  modoManual: boolean;
  isGenerating: boolean;
  gerandoEste: boolean;
  /** Modo manual: edita o valor direto, sem IA. */
  onEditar: (novoValor: string) => void;
  onAlterar?: (novoValor: string) => void;
}) {
  const [aberto, setAberto] = useState(false);
  const [valor, setValor] = useState(ponto.valor);

  // Sem IA disponível (modo manual ou limite esgotado), a edição é direta no texto do ponto.
  const usaIA = !modoManual && !!onAlterar;

  const confirmar = () => {
    const v = valor.trim();
    if (!v || v === ponto.valor) {
      setAberto(false);
      setValor(ponto.valor);
      return;
    }
    if (usaIA) onAlterar?.(v);
    else onEditar(v);
    setAberto(false);
  };

  return (
    <div
      className="rounded-xl px-4 py-3 transition-all"
      style={{
        background: gerandoEste ? "rgba(209,171,85,0.12)" : "rgba(11,11,20,0.45)",
        border: gerandoEste
          ? "1px solid rgba(209,171,85,0.6)"
          : "1px solid rgba(209,171,85,0.2)",
        boxShadow: gerandoEste ? "0 0 18px rgba(209,171,85,0.18)" : undefined,
      }}
    >
      <p className="font-cinzel text-[10px] uppercase tracking-[0.2em] text-arcana-gold">
        {ponto.rotulo}
      </p>
      {gerandoEste ? (
        <p className="font-crimson text-base italic text-arcana-text-dim animate-pulse mt-1">
          Reescrevendo a lenda com este destino…
        </p>
      ) : aberto ? (
        <div className="mt-2 space-y-2">
          <input
            type="text"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") confirmar();
              if (e.key === "Escape") {
                setAberto(false);
                setValor(ponto.valor);
              }
            }}
            maxLength={120}
            autoFocus
            className="arcana-input w-full font-crimson text-base"
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={confirmar}
              disabled={isGenerating}
              className={
                isGenerating ? "arcana-btn-disabled arcana-btn-sm" : "arcana-btn-primary arcana-btn-sm"
              }
            >
              {usaIA ? "Reescrever a lenda" : "Salvar"}
            </button>
            <button
              type="button"
              onClick={() => {
                setAberto(false);
                setValor(ponto.valor);
              }}
              className="arcana-btn-ghost arcana-btn-sm"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => {
            setValor(ponto.valor);
            setAberto(true);
          }}
          disabled={isGenerating}
          className="group mt-1 flex w-full items-start justify-between gap-2 text-left"
        >
          <span className="font-crimson text-base text-arcana-text leading-snug">
            {ponto.valor}
          </span>
          <span
            aria-hidden
            className="shrink-0 font-cinzel text-[10px] uppercase tracking-[0.15em] text-arcana-gold opacity-80 group-hover:opacity-100 transition-opacity mt-0.5"
          >
            Alterar ✎
          </span>
        </button>
      )}
    </div>
  );
}

export function StoryReview({
  historia,
  modoManual,
  isGenerating,
  secaoGerando,
  pontoGerando,
  onChange,
  onRegenSection,
  onAlterarPonto,
}: Props) {
  const [editing, setEditing] = useState<HistoriaSecao | null>(null);
  const pontosChave = historia.pontosChave ?? [];

  const toggle = (secao: HistoriaSecao) =>
    setEditing((cur) => (cur === secao ? null : secao));

  const shellProps = (titulo: string, secao: HistoriaSecao) => ({
    titulo,
    secao,
    modoManual,
    editing: editing === secao,
    isGenerating,
    secaoGerando,
    onToggleEdit: () => toggle(secao),
    onRegen: onRegenSection ? (fb: string) => onRegenSection(secao, fb) : undefined,
  });

  return (
    <div className="space-y-5">
      {/* Pontos-chave — os destinos alteráveis da lenda */}
      {pontosChave.length > 0 && (
        <section className="rounded-2xl p-5 space-y-4" style={CARD_STYLE}>
          <div>
            <h4 className="font-cinzel text-xs uppercase tracking-[0.25em] text-arcana-gold-bright">
              Pontos-chave da sua lenda
            </h4>
            <p className="font-crimson text-sm italic text-arcana-text-dim mt-1">
              {modoManual || !onAlterarPonto
                ? "Os fatos que sustentam a história. Toque para ajustar com suas palavras."
                : "Os fatos que sustentam a história. Altere um e a lenda inteira se reescreve em torno dele."}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {pontosChave.map((p) => (
              <PontoChavePill
                key={p.id}
                ponto={p}
                modoManual={modoManual}
                isGenerating={isGenerating}
                gerandoEste={pontoGerando === p.id}
                onEditar={(novoValor) =>
                  onChange({
                    ...historia,
                    pontosChave: pontosChave.map((x) =>
                      x.id === p.id ? { ...x, valor: novoValor } : x,
                    ),
                  })
                }
                onAlterar={onAlterarPonto ? (novoValor) => onAlterarPonto(p.id, novoValor) : undefined}
              />
            ))}
          </div>
        </section>
      )}

      {/* Resumo */}
      <SectionShell {...shellProps("Resumo", "resumo")}>
        {editing === "resumo" ? (
          <textarea
            value={historia.resumo}
            onChange={(e) => onChange({ ...historia, resumo: e.target.value })}
            rows={3}
            maxLength={600}
            className="arcana-input w-full font-crimson text-lg resize-none"
          />
        ) : (
          <p className="font-crimson text-lg text-arcana-text leading-relaxed">
            {historia.resumo}
          </p>
        )}
      </SectionShell>

      {/* Capítulos — linha do tempo */}
      <SectionShell {...shellProps("A jornada até aqui", "capitulos")}>
        <ol className="relative space-y-6 pl-6">
          <span
            aria-hidden
            className="absolute left-[7px] top-2 bottom-2 w-px"
            style={{ background: "linear-gradient(180deg, var(--color-arcana-gold), rgba(209,171,85,0.15))" }}
          />
          {historia.capitulos.map((cap, i) => (
            <li key={i} className="relative">
              <span
                aria-hidden
                className="absolute -left-6 top-1.5 w-[15px] h-[15px] rounded-full"
                style={{
                  background: "var(--color-arcana-surface-3)",
                  border: "2px solid var(--color-arcana-gold)",
                }}
              />
              {editing === "capitulos" ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={cap.titulo}
                    onChange={(e) =>
                      onChange({
                        ...historia,
                        capitulos: historia.capitulos.map((c, idx) =>
                          idx === i ? { ...c, titulo: e.target.value } : c,
                        ),
                      })
                    }
                    maxLength={80}
                    className="arcana-input w-full font-crimson text-base"
                  />
                  <textarea
                    value={cap.texto}
                    onChange={(e) =>
                      onChange({
                        ...historia,
                        capitulos: historia.capitulos.map((c, idx) =>
                          idx === i ? { ...c, texto: e.target.value } : c,
                        ),
                      })
                    }
                    rows={4}
                    maxLength={1200}
                    className="arcana-input w-full font-crimson text-base resize-none"
                  />
                </div>
              ) : (
                <>
                  <h5 className="font-cinzel text-sm uppercase tracking-[0.15em] text-arcana-text">
                    {cap.titulo}
                  </h5>
                  <p className="font-crimson text-base text-arcana-text-dim leading-relaxed mt-1">
                    {cap.texto}
                  </p>
                </>
              )}
            </li>
          ))}
        </ol>
      </SectionShell>

      {/* Família */}
      <SectionShell {...shellProps("Família", "familia")}>
        {editing === "familia" ? (
          <textarea
            value={historia.familia}
            onChange={(e) => onChange({ ...historia, familia: e.target.value })}
            rows={3}
            maxLength={800}
            className="arcana-input w-full font-crimson text-lg resize-none"
          />
        ) : (
          <p className="font-crimson text-base text-arcana-text-dim leading-relaxed">
            {historia.familia}
          </p>
        )}
      </SectionShell>

      {/* Vínculos */}
      <SectionShell {...shellProps("Vínculos", "vinculos")}>
        <div className="grid gap-3 sm:grid-cols-2">
          {historia.vinculos.map((v, i) => (
            <div
              key={i}
              className="rounded-xl px-4 py-3"
              style={{
                background: "rgba(11,11,20,0.45)",
                border: "1px solid rgba(209,171,85,0.2)",
              }}
            >
              {editing === "vinculos" ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={v.nome}
                    onChange={(e) =>
                      onChange({
                        ...historia,
                        vinculos: historia.vinculos.map((x, idx) =>
                          idx === i ? { ...x, nome: e.target.value } : x,
                        ),
                      })
                    }
                    placeholder="Nome"
                    maxLength={60}
                    className="arcana-input w-full font-crimson text-base"
                  />
                  <input
                    type="text"
                    value={v.relacao}
                    onChange={(e) =>
                      onChange({
                        ...historia,
                        vinculos: historia.vinculos.map((x, idx) =>
                          idx === i ? { ...x, relacao: e.target.value } : x,
                        ),
                      })
                    }
                    placeholder="Relação"
                    maxLength={60}
                    className="arcana-input w-full font-crimson text-base"
                  />
                  <textarea
                    value={v.detalhe ?? ""}
                    onChange={(e) =>
                      onChange({
                        ...historia,
                        vinculos: historia.vinculos.map((x, idx) =>
                          idx === i ? { ...x, detalhe: e.target.value } : x,
                        ),
                      })
                    }
                    placeholder="Detalhe"
                    rows={2}
                    maxLength={300}
                    className="arcana-input w-full font-crimson text-base resize-none"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      onChange({
                        ...historia,
                        vinculos: historia.vinculos.filter((_, idx) => idx !== i),
                      })
                    }
                    className="arcana-btn-ghost arcana-btn-sm"
                  >
                    Remover
                  </button>
                </div>
              ) : (
                <>
                  <p className="font-cinzel text-xs uppercase tracking-[0.15em] text-arcana-text">
                    {v.nome}
                  </p>
                  <p className="font-cinzel text-[10px] uppercase tracking-[0.2em] text-arcana-gold mt-0.5">
                    {v.relacao}
                  </p>
                  {v.detalhe && (
                    <p className="font-crimson text-sm text-arcana-text-dim mt-1.5 leading-relaxed">
                      {v.detalhe}
                    </p>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
        {editing === "vinculos" && historia.vinculos.length < 6 && (
          <button
            type="button"
            onClick={() =>
              onChange({
                ...historia,
                vinculos: [...historia.vinculos, { nome: "", relacao: "", detalhe: "" }],
              })
            }
            className="arcana-btn-ghost arcana-btn-sm"
          >
            + Adicionar vínculo
          </button>
        )}
      </SectionShell>

      {/* Redenção — trilha visual de 6 passos */}
      <SectionShell {...shellProps(`Redenção · ${historia.redencao.trilhaNome}`, "redencao")}>
        {editing === "redencao" ? (
          <div className="space-y-3">
            <textarea
              value={historia.redencao.premissa}
              onChange={(e) =>
                onChange({
                  ...historia,
                  redencao: { ...historia.redencao, premissa: e.target.value },
                })
              }
              rows={2}
              maxLength={400}
              className="arcana-input w-full font-crimson text-base resize-none"
            />
            {historia.redencao.passos.map((p, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="font-cinzel text-[10px] uppercase tracking-[0.15em] text-arcana-gold mt-3 w-20 shrink-0">
                  {i === 5 ? "Final" : `Passo ${i + 1}`}
                </span>
                <textarea
                  value={p}
                  onChange={(e) =>
                    onChange({
                      ...historia,
                      redencao: {
                        ...historia.redencao,
                        passos: historia.redencao.passos.map((x, idx) =>
                          idx === i ? e.target.value : x,
                        ),
                      },
                    })
                  }
                  rows={2}
                  maxLength={300}
                  className="arcana-input flex-1 font-crimson text-base resize-none"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <p className="font-crimson text-base italic text-arcana-text-dim leading-relaxed">
              {historia.redencao.premissa}
            </p>
            <ol className="relative space-y-4 pl-9">
              <span
                aria-hidden
                className="absolute left-[13px] top-3 bottom-3 w-px"
                style={{ background: "rgba(209,171,85,0.3)" }}
              />
              {historia.redencao.passos.map((p, i) => {
                const final = i === 5;
                return (
                  <li key={i} className="relative">
                    <span
                      aria-hidden
                      className="absolute -left-9 top-0 w-7 h-7 rounded-full flex items-center justify-center font-cinzel text-[10px]"
                      style={
                        final
                          ? {
                              background:
                                "linear-gradient(180deg, #f0cc6a 0%, #d1ab55 55%, #bd9540 100%)",
                              color: "#1c1206",
                              boxShadow: "0 0 14px rgba(209,171,85,0.4)",
                            }
                          : {
                              background: "var(--color-arcana-surface-3)",
                              border: "1px solid var(--color-arcana-gold-dim)",
                              color: "var(--color-arcana-gold-bright)",
                            }
                      }
                    >
                      {i + 1}
                    </span>
                    <p className="font-crimson text-base text-arcana-text leading-relaxed pt-0.5">
                      {p}
                    </p>
                    {final && (
                      <p className="font-cinzel text-[10px] uppercase tracking-[0.25em] text-arcana-gold mt-1">
                        Encerramento da jornada
                      </p>
                    )}
                  </li>
                );
              })}
            </ol>
            <p className="font-crimson text-xs italic text-arcana-text-dim">
              Os passos podem ser cumpridos fora de ordem — só o encerramento precisa ser o último.
            </p>
          </div>
        )}
      </SectionShell>

      {/* Ganchos */}
      <SectionShell {...shellProps("Pontas soltas para o Juiz", "ganchos")}>
        {editing === "ganchos" ? (
          <div className="space-y-2">
            {historia.ganchos.map((g, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  value={g}
                  onChange={(e) =>
                    onChange({
                      ...historia,
                      ganchos: historia.ganchos.map((x, idx) => (idx === i ? e.target.value : x)),
                    })
                  }
                  maxLength={200}
                  className="arcana-input flex-1 font-crimson text-base"
                />
                <button
                  type="button"
                  onClick={() =>
                    onChange({ ...historia, ganchos: historia.ganchos.filter((_, idx) => idx !== i) })
                  }
                  aria-label={`Remover gancho ${i + 1}`}
                  className="arcana-btn-ghost arcana-btn-sm shrink-0"
                >
                  ✕
                </button>
              </div>
            ))}
            {historia.ganchos.length < 5 && (
              <button
                type="button"
                onClick={() => onChange({ ...historia, ganchos: [...historia.ganchos, ""] })}
                className="arcana-btn-ghost arcana-btn-sm"
              >
                + Adicionar gancho
              </button>
            )}
          </div>
        ) : (
          <ul className="space-y-2.5">
            {historia.ganchos.map((g, i) => (
              <li key={i} className="flex items-start gap-3">
                <span aria-hidden className="text-arcana-gold mt-0.5">
                  ◆
                </span>
                <p className="font-crimson text-base text-arcana-text-dim leading-relaxed">{g}</p>
              </li>
            ))}
          </ul>
        )}
      </SectionShell>
    </div>
  );
}
