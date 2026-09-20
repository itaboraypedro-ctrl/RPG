"use client";

import { HowItWorks } from "@/components/campaign-creation/Explainer";
import { PLAYER_GUIDES } from "@/lib/character-creation/sacramento/guidance";
import {
  APRESENTACOES,
  BASE_PADRAO,
  FAIXAS_ETARIAS,
  TIPOS_FISICOS,
  TONS_DE_PELE,
} from "@/lib/character-creation/sacramento/bases";
import { KITS } from "@/lib/character-creation/sacramento/kits";
import type {
  BaseVisual,
  SacramentoCreationData,
  TipoFisico,
} from "@/lib/character-creation/sacramento/types";

type Props = {
  data: Partial<SacramentoCreationData>;
  onUpdate: (partial: Partial<SacramentoCreationData>) => void;
  onChangeBase: (base: BaseVisual) => void;
};

const LABEL = "font-cinzel text-[10px] uppercase tracking-[0.3em] text-arcana-text-dim";

/** Silhuetas dos tipos físicos — largura do torso varia por compleição. */
function BodyGlyph({ tipo }: { tipo: TipoFisico }) {
  const torso: Record<TipoFisico, string> = {
    magro: "M19 22 Q24 19 29 22 L30 44 Q24 47 18 44 Z",
    mediano: "M17 22 Q24 18 31 22 L33 44 Q24 48 15 44 Z",
    musculoso: "M14 22 Q24 16 34 22 L35 44 Q24 49 13 44 Z",
    corpulento: "M14 24 Q24 19 34 24 Q38 36 35 46 Q24 51 13 46 Q10 36 14 24 Z",
  };
  return (
    <svg viewBox="0 0 48 64" className="w-8 h-11" aria-hidden fill="currentColor">
      <circle cx="24" cy="11" r="7" />
      <path d={torso[tipo]} />
      <rect x="17" y="46" width="5.5" height="16" rx="2.5" />
      <rect x="25.5" y="46" width="5.5" height="16" rx="2.5" />
    </svg>
  );
}

/** Entalhe dourado de seleção (mesmo padrão do Hub de História). */
function CornerCheck({ active }: { active: boolean }) {
  return (
    <span
      aria-hidden
      className={[
        "absolute -right-px -top-px h-7 w-7 rounded-tr-xl transition-opacity duration-150",
        active ? "opacity-100" : "opacity-0",
      ].join(" ")}
      style={{ background: "linear-gradient(225deg, #d1ab55 50%, transparent 50%)" }}
    >
      <svg
        viewBox="0 0 24 24"
        className="absolute right-[3px] top-[3px] h-3 w-3"
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

export default function Step1Tracos({ data, onUpdate, onChangeBase }: Props) {
  const base = data.base ?? BASE_PADRAO;
  const kitId = data.kitId ?? "base";

  const setBase = (partial: Partial<BaseVisual>) => onChangeBase({ ...base, ...partial });

  const tomIdx = Math.max(0, TONS_DE_PELE.findIndex((t) => t.id === base.tomDePele));
  const idadeIdx = Math.max(0, FAIXAS_ETARIAS.findIndex((f) => f.id === base.faixaEtaria));
  const tomAtual = TONS_DE_PELE[tomIdx];

  return (
    <div className="space-y-9 max-w-2xl">
      <HowItWorks guide={PLAYER_GUIDES.tracos} />

      <div className="space-y-2">
        <label htmlFor="char-name" className={LABEL}>
          Nome do personagem
        </label>
        <input
          id="char-name"
          type="text"
          value={data.name ?? ""}
          onChange={(e) => onUpdate({ name: e.target.value })}
          placeholder="Como te chamam no Oeste?"
          maxLength={80}
          className="arcana-input w-full font-crimson text-lg"
        />
      </div>

      {/* Apresentação — segmentado integrado */}
      <div className="space-y-3">
        <span className={LABEL}>Apresentação</span>
        <div
          className="relative grid grid-cols-2 rounded-xl p-1"
          style={{ background: "rgba(8,8,15,0.55)", border: "1px solid var(--color-arcana-border)" }}
        >
          <span
            aria-hidden
            className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-[10px] transition-transform duration-200 ease-out"
            style={{
              left: 4,
              transform: base.apresentacao === "masculino" ? "translateX(100%)" : "translateX(0)",
              background: "linear-gradient(180deg, rgba(209,171,85,0.28), rgba(209,171,85,0.12))",
              border: "1px solid rgba(209,171,85,0.55)",
              boxShadow: "0 0 14px rgba(209,171,85,0.18)",
            }}
          />
          {APRESENTACOES.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => setBase({ apresentacao: a.id })}
              aria-pressed={base.apresentacao === a.id}
              className={[
                "relative z-10 py-2.5 font-cinzel text-xs uppercase tracking-[0.25em] transition-colors",
                base.apresentacao === a.id
                  ? "text-arcana-gold-bright"
                  : "text-arcana-text-dim hover:text-arcana-text",
              ].join(" ")}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tom de pele — barra deslizante */}
      <div className="space-y-3">
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
          className="tone-slider w-full"
          style={{ ["--thumb" as string]: tomAtual.swatch }}
        />
      </div>

      {/* Idade aparente — barra deslizante */}
      <div className="space-y-3">
        <div className="flex items-baseline justify-between">
          <span className={LABEL}>Idade aparente</span>
          <span className="font-crimson text-sm italic text-arcana-text">
            {FAIXAS_ETARIAS[idadeIdx].label}
            <span className="text-arcana-text-dim"> · {FAIXAS_ETARIAS[idadeIdx].hint}</span>
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={FAIXAS_ETARIAS.length - 1}
          step={1}
          value={idadeIdx}
          onChange={(e) => setBase({ faixaEtaria: FAIXAS_ETARIAS[Number(e.target.value)].id })}
          aria-label="Idade aparente"
          aria-valuetext={FAIXAS_ETARIAS[idadeIdx].label}
          className="age-slider w-full"
        />
        <div className="flex justify-between px-1">
          {FAIXAS_ETARIAS.map((f, i) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setBase({ faixaEtaria: f.id })}
              className={[
                "font-cinzel text-[10px] uppercase tracking-[0.15em] transition-colors",
                i === idadeIdx ? "text-arcana-gold-bright" : "text-arcana-text-dim hover:text-arcana-text",
              ].join(" ")}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tipo físico — silhuetas */}
      <div className="space-y-3">
        <span className={LABEL}>Tipo físico</span>
        <div className="grid grid-cols-4 gap-2">
          {TIPOS_FISICOS.map((t) => {
            const active = base.tipoFisico === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setBase({ tipoFisico: t.id })}
                aria-pressed={active}
                className={[
                  "relative flex flex-col items-center gap-1.5 rounded-xl border py-3 transition-all duration-150",
                  active
                    ? "border-arcana-gold/70 bg-arcana-gold/[0.08] text-arcana-gold-bright"
                    : "border-arcana-border bg-arcana-surface/60 text-arcana-text-dim hover:border-arcana-gold/40 hover:text-arcana-text",
                ].join(" ")}
                style={
                  active
                    ? { boxShadow: "0 0 18px rgba(209,171,85,0.16), inset 0 1px 0 rgba(255,255,255,0.05)" }
                    : { boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)" }
                }
              >
                <CornerCheck active={active} />
                <BodyGlyph tipo={t.id} />
                <span className="font-cinzel text-[10px] uppercase tracking-[0.14em]">{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Kits visuais */}
      <div className="space-y-3">
        <div className="flex items-baseline justify-between">
          <span className={LABEL}>Kit visual</span>
          <span className="font-crimson text-xs italic text-arcana-text-dim">
            Só aparência — não muda a ficha
          </span>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {KITS.map((k) => {
            const active = kitId === k.id;
            const locked = !k.disponivel;
            return (
              <button
                key={k.id}
                type="button"
                disabled={locked}
                onClick={() => onUpdate({ kitId: k.id })}
                aria-pressed={active}
                className={[
                  "relative rounded-xl border p-3 text-left transition-all duration-150",
                  locked
                    ? "border-arcana-border-dim bg-arcana-surface/30 cursor-not-allowed"
                    : active
                      ? "border-arcana-gold/70 bg-arcana-gold/[0.08]"
                      : "border-arcana-border bg-arcana-surface/60 hover:border-arcana-gold/40 hover:bg-arcana-surface",
                ].join(" ")}
                style={
                  active
                    ? { boxShadow: "0 0 18px rgba(209,171,85,0.16), inset 0 1px 0 rgba(255,255,255,0.05)" }
                    : { boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)" }
                }
              >
                <CornerCheck active={active} />
                <span className="flex items-center gap-2">
                  <span
                    className={[
                      "font-cinzel text-[11px] uppercase tracking-[0.16em]",
                      locked
                        ? "text-arcana-text-muted"
                        : active
                          ? "font-bold text-arcana-gold-bright"
                          : "text-arcana-text",
                    ].join(" ")}
                  >
                    {k.nome}
                  </span>
                  {locked && (
                    <span
                      className="font-cinzel text-[10px] uppercase tracking-[0.14em] rounded-full px-2 py-0.5 text-arcana-text-dim"
                      style={{ border: "1px solid var(--color-arcana-border-dim)" }}
                    >
                      Em breve
                    </span>
                  )}
                </span>
                <span
                  className={[
                    "mt-0.5 block font-crimson text-[13px] leading-snug",
                    locked ? "text-arcana-text-muted" : "text-arcana-text-dim",
                  ].join(" ")}
                >
                  {k.descricao}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .tone-slider,
        .age-slider {
          -webkit-appearance: none;
          appearance: none;
          height: 14px;
          border-radius: 999px;
          outline: none;
          cursor: pointer;
          border: 1px solid rgba(255, 255, 255, 0.14);
          box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.5);
        }
        .tone-slider {
          background: linear-gradient(90deg, #f3d9c2, #e3b592 25%, #b97f57 50%, #7c4a2d 75%, #4a2c1a);
        }
        .age-slider {
          background: linear-gradient(90deg, rgba(245, 212, 120, 0.75), rgba(209, 171, 85, 0.55), rgba(138, 106, 42, 0.6));
        }
        .tone-slider::-webkit-slider-thumb,
        .age-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          border: 2px solid #f5d478;
          box-shadow: 0 0 12px rgba(209, 171, 85, 0.5), 0 2px 4px rgba(0, 0, 0, 0.6);
          cursor: grab;
          transition: transform 120ms ease;
        }
        .tone-slider::-webkit-slider-thumb {
          background: var(--thumb);
        }
        .age-slider::-webkit-slider-thumb {
          background: linear-gradient(180deg, #f0cc6a, #bd9540);
        }
        .tone-slider::-webkit-slider-thumb:active,
        .age-slider::-webkit-slider-thumb:active {
          cursor: grabbing;
          transform: scale(1.12);
        }
        .tone-slider::-moz-range-thumb,
        .age-slider::-moz-range-thumb {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          border: 2px solid #f5d478;
          box-shadow: 0 0 12px rgba(209, 171, 85, 0.5), 0 2px 4px rgba(0, 0, 0, 0.6);
          cursor: grab;
        }
        .tone-slider::-moz-range-thumb {
          background: var(--thumb);
        }
        .age-slider::-moz-range-thumb {
          background: linear-gradient(180deg, #f0cc6a, #bd9540);
        }
        .tone-slider:focus-visible,
        .age-slider:focus-visible {
          outline: 2px solid rgba(209, 171, 85, 0.75);
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}
