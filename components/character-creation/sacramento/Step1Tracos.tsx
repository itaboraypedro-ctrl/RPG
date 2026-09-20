"use client";

import { HowItWorks } from "@/components/campaign-creation/Explainer";
import { PLAYER_GUIDES } from "@/lib/character-creation/sacramento/guidance";
import {
  BASE_PADRAO,
  FAIXAS_ETARIAS,
  TIPOS_FISICOS,
  TONS_DE_PELE,
} from "@/lib/character-creation/sacramento/bases";
import { KITS, kitAvailableForBase } from "@/lib/character-creation/sacramento/kits";
import type {
  Apresentacao,
  BaseVisual,
  SacramentoCreationData,
} from "@/lib/character-creation/sacramento/types";

type Props = {
  data: Partial<SacramentoCreationData>;
  onUpdate: (partial: Partial<SacramentoCreationData>) => void;
  onChangeBase: (base: BaseVisual) => void;
  /** Mobile: mostra só a seção da micro-etapa (undefined = tudo, desktop). */
  foco?: string;
};

const LABEL = "font-cinzel text-[10px] uppercase tracking-[0.3em] text-arcana-text-dim";

function GenderIcon({ tipo }: { tipo: Apresentacao }) {
  return tipo === "feminino" ? (
    <svg viewBox="0 0 24 24" className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
      <circle cx="12" cy="9" r="5" />
      <path d="M12 14v7M9 18.5h6" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="10" cy="14" r="5" />
      <path d="M14 10l6-6M15 4h5v5" />
    </svg>
  );
}

function CornerCheck({ active }: { active: boolean }) {
  return (
    <span
      aria-hidden
      className={[
        "absolute -right-px -top-px h-6 w-6 rounded-tr-xl transition-opacity duration-150",
        active ? "opacity-100" : "opacity-0",
      ].join(" ")}
      style={{ background: "linear-gradient(225deg, #d1ab55 50%, transparent 50%)" }}
    >
      <svg
        viewBox="0 0 24 24"
        className="absolute right-[2px] top-[2px] h-2.5 w-2.5"
        fill="none"
        stroke="#1c1206"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 12.5l5 5L20 6.5" />
      </svg>
    </span>
  );
}

/** Dial estilo rádio antigo: régua de ticks com ponteiro dourado deslizante. */
function AgeDial({
  value,
  onChange,
}: {
  value: number;
  onChange: (idx: number) => void;
}) {
  const n = FAIXAS_ETARIAS.length;
  const pos = (i: number) => ((i + 0.5) / n) * 100;
  return (
    <div className="space-y-1.5">
      <div
        className="relative h-14 rounded-xl overflow-hidden select-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(8,8,15,0.9), rgba(20,20,31,0.5) 40%, rgba(8,8,15,0.9))",
          border: "1px solid var(--color-arcana-border)",
          boxShadow: "inset 0 2px 10px rgba(0,0,0,0.55)",
        }}
      >
        {/* régua de ticks */}
        <div aria-hidden className="absolute inset-x-3 top-2 bottom-2 flex items-center">
          {Array.from({ length: 25 }).map((_, i) => {
            const major = i % 4 === 0;
            return (
              <span
                key={i}
                className="flex-1 flex justify-center"
              >
                <span
                  style={{
                    width: 1,
                    height: major ? 16 : 8,
                    background: major ? "rgba(209,171,85,0.5)" : "rgba(209,171,85,0.22)",
                  }}
                />
              </span>
            );
          })}
        </div>
        {/* janela central de brilho */}
        <div
          aria-hidden
          className="absolute inset-y-0 w-16 -translate-x-1/2 transition-[left] duration-300 ease-out pointer-events-none"
          style={{
            left: `${pos(value)}%`,
            background:
              "radial-gradient(60% 80% at 50% 50%, rgba(209,171,85,0.16), transparent 75%)",
          }}
        />
        {/* ponteiro */}
        <div
          aria-hidden
          className="absolute top-1 bottom-1 -translate-x-1/2 transition-[left] duration-300 ease-out pointer-events-none"
          style={{ left: `${pos(value)}%` }}
        >
          <div
            className="h-full w-[2px] mx-auto rounded-full"
            style={{
              background: "linear-gradient(180deg, #f5d478, #d1ab55 60%, #8a6a2a)",
              boxShadow: "0 0 10px rgba(245,212,120,0.6)",
            }}
          />
          <span
            className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45"
            style={{ background: "#f0cc6a", boxShadow: "0 0 8px rgba(245,212,120,0.7)" }}
          />
        </div>
        {/* range acessível por cima */}
        <input
          type="range"
          min={0}
          max={n - 1}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-label="Idade aparente"
          aria-valuetext={`${FAIXAS_ETARIAS[value].label}, ${FAIXAS_ETARIAS[value].hint}`}
          className="dial-input absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
      <div className="flex px-3">
        {FAIXAS_ETARIAS.map((f, i) => (
          <button
            key={f.id}
            type="button"
            onClick={() => onChange(i)}
            className={[
              "flex-1 text-center font-cinzel text-[10px] uppercase tracking-[0.18em] transition-colors",
              i === value ? "text-arcana-gold-bright" : "text-arcana-text-dim hover:text-arcana-text",
            ].join(" ")}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Step1Tracos({ data, onUpdate, onChangeBase, foco }: Props) {
  const base = data.base ?? BASE_PADRAO;
  const kitId = data.kitId ?? "base";
  const setBase = (partial: Partial<BaseVisual>) => onChangeBase({ ...base, ...partial });
  const mostra = (secao: string) => !foco || foco === secao;

  const tomIdx = Math.max(0, TONS_DE_PELE.findIndex((t) => t.id === base.tomDePele));
  const idadeIdx = Math.max(0, FAIXAS_ETARIAS.findIndex((f) => f.id === base.faixaEtaria));
  const fisicoIdx = Math.max(0, TIPOS_FISICOS.findIndex((t) => t.id === base.tipoFisico));
  const tomAtual = TONS_DE_PELE[tomIdx];

  return (
    <div className="space-y-7 max-w-2xl">
      <div className={mostra("nome") ? "hidden lg:block" : "hidden"}>
        <HowItWorks guide={PLAYER_GUIDES.tracos} />
      </div>

      {/* Nome + apresentação na mesma linha */}
      <div className={mostra("nome") ? "space-y-2" : "hidden"}>
        <label htmlFor="char-name" className={LABEL}>
          Nome do personagem
        </label>
        <div className="flex gap-2">
          <input
            id="char-name"
            type="text"
            value={data.name ?? ""}
            onChange={(e) => onUpdate({ name: e.target.value })}
            placeholder="Como te chamam no Oeste?"
            maxLength={80}
            className="arcana-input flex-1 font-crimson text-lg"
          />
          <div
            role="group"
            aria-label="Apresentação"
            className="flex rounded-xl p-1 gap-1"
            style={{ background: "rgba(8,8,15,0.55)", border: "1px solid var(--color-arcana-border)" }}
          >
            {(["feminino", "masculino"] as Apresentacao[]).map((a) => {
              const active = base.apresentacao === a;
              return (
                <button
                  key={a}
                  type="button"
                  onClick={() => setBase({ apresentacao: a })}
                  aria-pressed={active}
                  aria-label={a === "feminino" ? "Apresentação feminina" : "Apresentação masculina"}
                  title={a === "feminino" ? "Feminina" : "Masculina"}
                  className={[
                    "w-10 rounded-[10px] flex items-center justify-center transition-all duration-150",
                    active ? "text-arcana-gold-bright" : "text-arcana-text-dim hover:text-arcana-text",
                  ].join(" ")}
                  style={
                    active
                      ? {
                          background:
                            "linear-gradient(180deg, rgba(209,171,85,0.28), rgba(209,171,85,0.1))",
                          border: "1px solid rgba(209,171,85,0.55)",
                          boxShadow: "0 0 12px rgba(209,171,85,0.2)",
                        }
                      : { border: "1px solid transparent" }
                  }
                >
                  <GenderIcon tipo={a} />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tom de pele */}
      <div className={mostra("pele") ? "space-y-2.5" : "hidden"}>
        <div className="flex items-baseline justify-between">
          <span className={LABEL}>Tom de pele</span>
          <span className="font-crimson text-sm italic text-arcana-text">{tomAtual.label}</span>
        </div>
        <input
          type="range"
          min={0}
          max={TONS_DE_PELE.length - 1}
          step={1}
          value={tomIdx}
          onChange={(e) => setBase({ tomDePele: TONS_DE_PELE[Number(e.target.value)].id })}
          aria-label="Tom de pele"
          aria-valuetext={tomAtual.label}
          className="trait-slider tone w-full"
          style={{ ["--thumb" as string]: tomAtual.swatch }}
        />
      </div>

      {/* Porte físico */}
      <div className={mostra("corpo") ? "space-y-2.5" : "hidden"}>
        <div className="flex items-baseline justify-between">
          <span className={LABEL}>Porte físico</span>
          <span className="font-crimson text-sm italic text-arcana-text">
            {TIPOS_FISICOS[fisicoIdx].label}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={TIPOS_FISICOS.length - 1}
          step={1}
          value={fisicoIdx}
          onChange={(e) => setBase({ tipoFisico: TIPOS_FISICOS[Number(e.target.value)].id })}
          aria-label="Porte físico"
          aria-valuetext={TIPOS_FISICOS[fisicoIdx].label}
          className="trait-slider build w-full"
        />
        <div className="flex justify-between px-1">
          {TIPOS_FISICOS.map((t, i) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setBase({ tipoFisico: t.id })}
              className={[
                "font-cinzel text-[10px] uppercase tracking-[0.14em] transition-colors",
                i === fisicoIdx ? "text-arcana-gold-bright" : "text-arcana-text-dim hover:text-arcana-text",
              ].join(" ")}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Idade aparente — dial de rádio */}
      <div className={mostra("corpo") ? "space-y-2.5" : "hidden"}>
        <div className="flex items-baseline justify-between">
          <span className={LABEL}>Idade aparente</span>
          <span className="font-crimson text-sm italic text-arcana-text">
            {FAIXAS_ETARIAS[idadeIdx].hint}
          </span>
        </div>
        <AgeDial
          value={idadeIdx}
          onChange={(i) => setBase({ faixaEtaria: FAIXAS_ETARIAS[i].id })}
        />
      </div>

      {/* Kits visuais — compactos */}
      <div className={mostra("kit") ? "space-y-2.5" : "hidden"}>
        <div className="flex items-baseline justify-between">
          <span className={LABEL}>Kit visual</span>
          <span className="font-crimson text-xs italic text-arcana-text-dim">
            Só aparência — não muda a ficha
          </span>
        </div>
        <div
          className={
            foco === "kit"
              ? "grid grid-flow-col grid-rows-2 auto-cols-[46%] gap-1.5 overflow-x-auto snap-x pb-1"
              : "grid grid-cols-2 gap-1.5 sm:grid-cols-3"
          }
          style={{ scrollbarWidth: "none" }}
        >
          {KITS.map((k) => {
            const active = kitId === k.id;
            const forBase = kitAvailableForBase(k.id, base);
            const locked = !k.disponivel || !forBase;
            const lockedLabel = !k.disponivel ? "Em breve" : "Indisponível p/ esta aparência";
            return (
              <button
                key={k.id}
                type="button"
                disabled={locked}
                onClick={() => onUpdate({ kitId: k.id })}
                aria-pressed={active}
                title={k.descricao}
                className={[
                  "relative rounded-xl border px-3 py-2 text-left transition-all duration-150",
                  locked
                    ? "border-arcana-border-dim bg-arcana-surface/30 cursor-not-allowed"
                    : active
                      ? "border-arcana-gold/70 bg-arcana-gold/[0.08]"
                      : "border-arcana-border bg-arcana-surface/60 hover:border-arcana-gold/40",
                ].join(" ")}
                style={active ? { boxShadow: "0 0 14px rgba(209,171,85,0.15)" } : undefined}
              >
                <CornerCheck active={active} />
                <span
                  className={[
                    "block font-cinzel text-[10px] uppercase tracking-[0.13em] leading-tight",
                    locked
                      ? "text-arcana-text-muted"
                      : active
                        ? "font-bold text-arcana-gold-bright"
                        : "text-arcana-text",
                  ].join(" ")}
                >
                  {k.nome}
                </span>
                <span
                  className={[
                    "block font-crimson text-[11px] leading-snug truncate",
                    locked ? "text-arcana-text-muted" : "text-arcana-text-dim",
                  ].join(" ")}
                >
                  {locked ? lockedLabel : k.descricao}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .trait-slider {
          -webkit-appearance: none;
          appearance: none;
          height: 12px;
          border-radius: 999px;
          outline: none;
          cursor: pointer;
          border: 1px solid rgba(255, 255, 255, 0.14);
          box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.5);
        }
        .trait-slider.tone {
          background: linear-gradient(90deg, #f3d9c2, #e3b592 25%, #b97f57 50%, #7c4a2d 75%, #4a2c1a);
        }
        .trait-slider.build {
          background:
            repeating-linear-gradient(
              90deg,
              transparent 0px,
              transparent 8px,
              rgba(11, 11, 20, 0.35) 8px,
              rgba(11, 11, 20, 0.35) 9px
            ),
            linear-gradient(90deg, rgba(209, 171, 85, 0.25), rgba(209, 171, 85, 0.75));
        }
        .trait-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 2px solid #f5d478;
          box-shadow: 0 0 12px rgba(209, 171, 85, 0.5), 0 2px 4px rgba(0, 0, 0, 0.6);
          cursor: grab;
          transition: transform 120ms ease;
          background: linear-gradient(180deg, #f0cc6a, #bd9540);
        }
        .trait-slider.tone::-webkit-slider-thumb {
          background: var(--thumb);
        }
        .trait-slider::-webkit-slider-thumb:active {
          cursor: grabbing;
          transform: scale(1.12);
        }
        .trait-slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 2px solid #f5d478;
          box-shadow: 0 0 12px rgba(209, 171, 85, 0.5), 0 2px 4px rgba(0, 0, 0, 0.6);
          cursor: grab;
          background: linear-gradient(180deg, #f0cc6a, #bd9540);
        }
        .trait-slider.tone::-moz-range-thumb {
          background: var(--thumb);
        }
        .trait-slider:focus-visible {
          outline: 2px solid rgba(209, 171, 85, 0.75);
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}
