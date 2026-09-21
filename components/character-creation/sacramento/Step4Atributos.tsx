"use client";

import { HowItWorks } from "@/components/campaign-creation/Explainer";
import { PLAYER_GUIDES } from "@/lib/character-creation/sacramento/guidance";
import {
  ANTECEDENTES,
  ATRIBUTOS,
  LIMITES_PADRAO,
  type LimitesCriacao,
  XP_POR_NIVEL,
  calcularDerivados,
  orcamentoAntecedentes,
  orcamentoAtributos,
} from "@/lib/character-creation/sacramento/rules";
import { contarParrudeza } from "@/lib/character-creation/sacramento/habilidades";
import {
  FICHA_INICIAL,
  type AntecedenteId,
  type AtributoId,
  type FichaMecanica,
  type Nivel,
  type SacramentoCreationData,
} from "@/lib/character-creation/sacramento/types";

type Props = {
  data: Partial<SacramentoCreationData>;
  onUpdate: (partial: Partial<SacramentoCreationData>) => void;
  /** Mobile: mostra só a seção da micro-etapa (undefined = tudo, desktop). */
  foco?: string;
  /** Regras da mesa (nível máximo/travado). */
  limites?: LimitesCriacao;
};

const LABEL = "font-cinzel text-[10px] uppercase tracking-[0.3em] text-arcana-text-dim";
const HELPER = "font-crimson text-xs italic text-arcana-text-dim";

function Stepper({
  value,
  min,
  max,
  onChange,
  label,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  label: string;
}) {
  const btn =
    "w-8 h-8 rounded-full flex items-center justify-center font-cinzel text-sm transition-all disabled:opacity-25 disabled:cursor-not-allowed";
  return (
    <div className="flex items-center gap-2 shrink-0">
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label={`Diminuir ${label}`}
        className={`${btn} text-arcana-text-dim hover:text-arcana-gold-bright`}
        style={{ border: "1px solid var(--color-arcana-border)", background: "rgba(8,8,15,0.5)" }}
      >
        −
      </button>
      <span
        className="w-9 h-9 rounded-xl flex items-center justify-center font-cinzel text-lg text-arcana-gold-bright"
        style={{
          background: "linear-gradient(180deg, rgba(209,171,85,0.16), rgba(209,171,85,0.05))",
          border: "1px solid rgba(209,171,85,0.45)",
        }}
        aria-live="polite"
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label={`Aumentar ${label}`}
        className={`${btn} text-arcana-text-dim hover:text-arcana-gold-bright`}
        style={{ border: "1px solid var(--color-arcana-border)", background: "rgba(8,8,15,0.5)" }}
      >
        +
      </button>
    </div>
  );
}

function BudgetBadge({ gasto, total }: { gasto: number; total: number }) {
  const excedeu = gasto > total;
  const completo = gasto === total;
  return (
    <span
      className={[
        "font-cinzel text-[11px] uppercase tracking-[0.15em] rounded-full px-3 py-1",
        excedeu ? "text-arcana-danger" : completo ? "text-arcana-gold-bright" : "text-arcana-text",
      ].join(" ")}
      style={{
        border: excedeu
          ? "1px solid var(--color-arcana-danger)"
          : "1px solid rgba(209,171,85,0.4)",
        background: completo && !excedeu ? "rgba(209,171,85,0.12)" : "rgba(8,8,15,0.5)",
      }}
    >
      {gasto} / {total} pontos
    </span>
  );
}

export default function Step4Atributos({ data, onUpdate, foco, limites }: Props) {
  const mostra = (secao: string) => !foco || foco === secao;
  const lim = limites ?? LIMITES_PADRAO;
  const ficha = data.ficha ?? FICHA_INICIAL;
  const set = (partial: Partial<FichaMecanica>) => onUpdate({ ficha: { ...ficha, ...partial } });

  const gastoAtr = Object.values(ficha.atributos).reduce((a, b) => a + b, 0);
  const orcAtr = orcamentoAtributos(ficha.nivel);
  const gastoAnt = Object.values(ficha.antecedentes).reduce((a, b) => a + b, 0);
  const orcAnt = orcamentoAntecedentes(ficha.nivel, ficha.atributos.intelecto);
  const derivados = calcularDerivados(ficha, contarParrudeza(ficha.habilidades));

  const setAtributo = (id: AtributoId, v: number) =>
    set({ atributos: { ...ficha.atributos, [id]: v } });
  const setAntecedente = (id: AntecedenteId, v: number) =>
    set({ antecedentes: { ...ficha.antecedentes, [id]: v } });

  // Nível 1: teto 2 por antecedente. Nível 2+: um único antecedente pode ir a 3
  // (o ponto de progressão do nível 2) — docs/01 §4/§10.
  const antMax = (id: AntecedenteId) => {
    if (ficha.nivel === 1) return 2;
    const outroAcimaDe2 = ANTECEDENTES.some(
      (a) => a.id !== id && ficha.antecedentes[a.id] > 2,
    );
    return outroAcimaDe2 ? 2 : 3;
  };

  return (
    <div className="space-y-9 max-w-2xl">
      <div className={mostra("atributos") ? "hidden lg:block" : "hidden"}>
        <HowItWorks guide={PLAYER_GUIDES.atributos} />
      </div>

      {/* Nível — barra deslizante */}
      <section className={mostra("atributos") ? "space-y-2.5" : "hidden"}>
        <div className="flex items-baseline justify-between">
          <span className={LABEL}>Nível inicial</span>
          <span className="font-crimson text-sm italic text-arcana-text">
            Nível {ficha.nivel}
            <span className="text-arcana-text-dim"> · {XP_POR_NIVEL[ficha.nivel]} XP</span>
          </span>
        </div>
        <input
          type="range"
          min={1}
          max={lim.nivelMaximo}
          step={1}
          value={ficha.nivel}
          onChange={(e) => set({ nivel: Number(e.target.value) as Nivel })}
          aria-label="Nível inicial"
          disabled={lim.nivelTravado}
          aria-valuetext={`Nível ${ficha.nivel}, ${XP_POR_NIVEL[ficha.nivel]} XP`}
          className="nivel-slider w-full"
        />
        <div className="flex justify-between px-1.5">
          {([1, 2, 3, 4, 5, 6] as Nivel[]).map((n) => {
            const bloqueado = n > lim.nivelMaximo;
            return (
              <button
                key={n}
                type="button"
                disabled={bloqueado || lim.nivelTravado}
                onClick={() => set({ nivel: n })}
                className={[
                  "font-cinzel text-[11px] tracking-[0.1em] transition-colors",
                  bloqueado
                    ? "text-arcana-text-muted cursor-not-allowed"
                    : n === ficha.nivel
                      ? "text-arcana-gold-bright"
                      : "text-arcana-text-dim hover:text-arcana-text",
                ].join(" ")}
              >
                {n}
              </button>
            );
          })}
        </div>
        <p className={HELPER}>
          {lim.nivelTravado
            ? `O Juiz desta mesa fixou o nível inicial em ${lim.nivelInicial}.`
            : "O padrão do livro é o nível 1. O Juiz da campanha pode fixar o nível inicial da mesa."}
        </p>
        <style jsx>{`
          .nivel-slider {
            -webkit-appearance: none;
            appearance: none;
            height: 12px;
            border-radius: 999px;
            outline: none;
            cursor: pointer;
            border: 1px solid rgba(255, 255, 255, 0.14);
            box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.5);
            background:
              repeating-linear-gradient(
                90deg,
                transparent 0px,
                transparent calc(20% - 1px),
                rgba(11, 11, 20, 0.5) calc(20% - 1px),
                rgba(11, 11, 20, 0.5) 20%
              ),
              linear-gradient(90deg, rgba(209, 171, 85, 0.3), rgba(240, 204, 106, 0.85));
          }
          .nivel-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 2px solid #f5d478;
            background: linear-gradient(180deg, #f0cc6a, #b87333);
            box-shadow: 0 0 12px rgba(209, 171, 85, 0.5), 0 2px 4px rgba(0, 0, 0, 0.6);
            cursor: grab;
            transition: transform 120ms ease;
          }
          .nivel-slider::-webkit-slider-thumb:active {
            cursor: grabbing;
            transform: scale(1.12);
          }
          .nivel-slider::-moz-range-thumb {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 2px solid #f5d478;
            background: linear-gradient(180deg, #f0cc6a, #b87333);
            box-shadow: 0 0 12px rgba(209, 171, 85, 0.5), 0 2px 4px rgba(0, 0, 0, 0.6);
            cursor: grab;
          }
          .nivel-slider:focus-visible {
            outline: 2px solid rgba(209, 171, 85, 0.75);
            outline-offset: 2px;
          }
        `}</style>
      </section>

      {/* Atributos */}
      <section className={mostra("atributos") ? "space-y-3" : "hidden"}>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <span className={LABEL}>Atributos</span>
            <p className={HELPER}>Podem ficar em 0 — distribua todos os pontos.</p>
          </div>
          <BudgetBadge gasto={gastoAtr} total={orcAtr} />
        </div>
        <div className="space-y-2">
          {ATRIBUTOS.map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-arcana-border bg-arcana-surface/60 px-4 py-3"
              style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)" }}
            >
              <div className="min-w-0">
                <p className="font-cinzel text-xs uppercase tracking-[0.2em] text-arcana-text">
                  {a.nome}
                </p>
                <p className="font-crimson text-[13px] text-arcana-text-dim leading-snug mt-0.5">
                  {a.efeito} · {a.resistencias}
                </p>
              </div>
              <Stepper
                value={ficha.atributos[a.id]}
                min={0}
                max={ficha.atributos[a.id] + Math.max(0, orcAtr - gastoAtr)}
                onChange={(v) => setAtributo(a.id, v)}
                label={a.nome}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Antecedentes */}
      <section className={mostra("antecedentes") ? "space-y-3" : "hidden"}>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <span className={LABEL}>Antecedentes</span>
            <p className={HELPER}>
              4 pontos + Intelecto ({ficha.atributos.intelecto})
              {ficha.nivel >= 2 ? " + 1 do nível 2" : ""} · máximo 2 por antecedente no nível 1
            </p>
          </div>
          <BudgetBadge gasto={gastoAnt} total={orcAnt} />
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {ANTECEDENTES.map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-arcana-border bg-arcana-surface/60 px-4 py-3"
              style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)" }}
            >
              <div className="min-w-0">
                <p className="font-cinzel text-xs uppercase tracking-[0.18em] text-arcana-text">
                  {a.nome}
                </p>
                <p className="font-crimson text-[13px] text-arcana-text-dim leading-snug mt-0.5">
                  {a.abrangencia}
                </p>
              </div>
              <Stepper
                value={ficha.antecedentes[a.id]}
                min={0}
                max={Math.min(
                  antMax(a.id),
                  ficha.antecedentes[a.id] + Math.max(0, orcAnt - gastoAnt),
                )}
                onChange={(v) => setAntecedente(a.id, v)}
                label={a.nome}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Derivados (resumo inline — o painel do retrato também mostra) */}
      <section
        className={mostra("antecedentes") ? "rounded-2xl p-4" : "hidden"}
        style={{ background: "rgba(27,27,42,0.72)", border: "1px solid rgba(209,171,85,0.25)" }}
      >
        <p className={LABEL}>Valores calculados</p>
        <div className="mt-3 grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
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
        <p className="font-crimson text-xs italic text-arcana-text-dim mt-3">
          Iniciativa é sacada em cartas na partida — não é um número fixo. Vida inclui bônus de
          Parrudeza e de nível, quando houver.
        </p>
      </section>
    </div>
  );
}
