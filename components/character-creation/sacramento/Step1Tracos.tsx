"use client";

import {
  APRESENTACOES,
  BASE_PADRAO,
  FAIXAS_ETARIAS,
  TIPOS_FISICOS,
  TONS_DE_PELE,
} from "@/lib/character-creation/sacramento/bases";
import type {
  BaseVisual,
  SacramentoCreationData,
} from "@/lib/character-creation/sacramento/types";

type Props = {
  data: Partial<SacramentoCreationData>;
  onUpdate: (partial: Partial<SacramentoCreationData>) => void;
  onChangeBase: (base: BaseVisual) => void;
};

const LABEL = "font-cinzel text-[10px] uppercase tracking-[0.3em] text-arcana-text-dim";

export default function Step1Tracos({ data, onUpdate, onChangeBase }: Props) {
  const base = data.base ?? BASE_PADRAO;

  const setBase = (partial: Partial<BaseVisual>) => {
    onChangeBase({ ...base, ...partial });
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <p className="font-crimson text-sm italic text-arcana-text-dim">
        Estes traços definem a base do retrato. São só aparência — nenhuma
        escolha aqui muda atributos ou regras.
      </p>

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

      <div className="space-y-3">
        <span className={LABEL}>Apresentação</span>
        <div className="flex flex-wrap gap-2">
          {APRESENTACOES.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => setBase({ apresentacao: a.id })}
              className={base.apresentacao === a.id ? "arcana-chip-active" : "arcana-chip"}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <span className={LABEL}>Tom de pele</span>
        <div className="flex flex-wrap gap-3">
          {TONS_DE_PELE.map((t) => {
            const active = base.tomDePele === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setBase({ tomDePele: t.id })}
                aria-label={t.label}
                title={t.label}
                className="flex flex-col items-center gap-1.5 group"
              >
                <span
                  className="w-10 h-10 rounded-full transition-all"
                  style={{
                    background: t.swatch,
                    border: active
                      ? "2px solid var(--color-arcana-gold)"
                      : "2px solid rgba(255,255,255,0.15)",
                    boxShadow: active ? "0 0 12px rgba(209,171,85,0.45)" : "none",
                  }}
                />
                <span
                  className={[
                    "font-cinzel text-[10px] uppercase tracking-[0.12em] transition-colors",
                    active ? "text-arcana-gold-bright" : "text-arcana-text-dim group-hover:text-arcana-text",
                  ].join(" ")}
                >
                  {t.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <span className={LABEL}>Idade aparente</span>
        <div className="flex flex-wrap gap-2">
          {FAIXAS_ETARIAS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setBase({ faixaEtaria: f.id })}
              className={base.faixaEtaria === f.id ? "arcana-chip-active" : "arcana-chip"}
            >
              {f.label}
              <span className="ml-1.5 normal-case tracking-normal opacity-80">{f.hint}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <span className={LABEL}>Tipo físico</span>
        <div className="flex flex-wrap gap-2">
          {TIPOS_FISICOS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setBase({ tipoFisico: t.id })}
              className={base.tipoFisico === t.id ? "arcana-chip-active" : "arcana-chip"}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {(data.customizacoes?.length ?? 0) > 0 && (
        <p className="font-crimson text-xs italic text-arcana-danger">
          Trocar a base descarta as personalizações já aplicadas ao retrato.
        </p>
      )}
    </div>
  );
}
