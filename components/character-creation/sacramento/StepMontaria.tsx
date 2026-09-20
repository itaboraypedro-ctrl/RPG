"use client";

import { useEffect } from "react";
import { HowItWorks } from "@/components/campaign-creation/Explainer";
import { PLAYER_GUIDES } from "@/lib/character-creation/sacramento/guidance";
import { itemImagem, montariaComprada } from "@/lib/character-creation/sacramento/catalogo";
import { derivadosMontaria } from "@/lib/character-creation/sacramento/rules";
import {
  FICHA_INICIAL,
  type MontariaCriacao,
  type SacramentoCreationData,
} from "@/lib/character-creation/sacramento/types";

type Props = {
  data: Partial<SacramentoCreationData>;
  onUpdate: (partial: Partial<SacramentoCreationData>) => void;
};

const LABEL = "font-cinzel text-[10px] uppercase tracking-[0.3em] text-arcana-text-dim";

const MONTARIA_NOVA: MontariaCriacao = {
  nome: "",
  descricao: "",
  potencia: 2,
  resistencia: 1,
  origem: "comprar",
};

/** O temperamento que cada divisão de pontos compra — na voz da tratadora. */
const TEMPERAMENTOS: Record<number, string> = {
  3: "“Disparada pura: vence qualquer corrida — mas é só um susto entre o cavaleiro e o chão.”",
  2: "“Corredora de casco firme: rápida na fuga e aguenta a lida de todo dia.”",
  1: "“Estradeira de confiança: não ganha aposta, mas atravessa o sertão sem reclamar.”",
  0: "“Uma fortaleza de quatro patas: ninguém apressa, nada derruba.”",
};

export default function StepMontaria({ data, onUpdate }: Props) {
  const ficha = data.ficha ?? FICHA_INICIAL;
  const animal = montariaComprada(ficha.compras ?? []);
  const montaria = ficha.montaria;

  // A etapa só existe quando um animal foi comprado — cria a ficha dele na entrada.
  useEffect(() => {
    if (animal && !montaria) {
      onUpdate({ ficha: { ...ficha, montaria: MONTARIA_NOVA } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animal, montaria]);

  if (!animal || !montaria) return null;

  const setMontaria = (m: MontariaCriacao) => onUpdate({ ficha: { ...ficha, montaria: m } });
  const derivados = derivadosMontaria(montaria.potencia, montaria.resistencia);

  // Divisor de partilha: ouro (potência) à esquerda, cobre (resistência) à direita.
  const pot = montaria.potencia; // 0..3
  const pct = (pot / 3) * 100;

  return (
    <div className="space-y-5 max-w-2xl">
      <HowItWorks guide={PLAYER_GUIDES.montaria} />

      <div
        className="rounded-2xl overflow-hidden"
        style={{
          border: "1px solid rgba(209,171,85,0.35)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 0 20px rgba(209,171,85,0.08)",
        }}
      >
        <div className="grid sm:grid-cols-[220px_1fr]">
          {/* O animal, com a plaquinha do nome */}
          <div
            className="relative flex items-center justify-center py-5 sm:py-0"
            style={{
              background:
                "radial-gradient(70% 70% at 50% 55%, rgba(209,171,85,0.12), transparent 78%), #0b0b14",
              borderRight: "1px solid rgba(209,171,85,0.2)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={itemImagem(animal)}
              alt={animal === "cavalo" ? "cavalo" : "mula"}
              width={180}
              height={180}
              className="h-40 w-40 object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.7)]"
            />
            <div
              className="absolute bottom-2.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full max-w-[90%]"
              style={{
                background: "rgba(15,15,26,0.85)",
                border: "1px solid rgba(209,171,85,0.5)",
                backdropFilter: "blur(8px)",
              }}
            >
              <span className="block font-cinzel text-xs uppercase tracking-[0.18em] text-arcana-gold-bright whitespace-nowrap overflow-hidden text-ellipsis">
                {montaria.nome.trim() || (animal === "cavalo" ? "Seu cavalo" : "Sua mula")}
              </span>
            </div>
          </div>

          {/* Nome, aparência e o divisor */}
          <div className="p-4 space-y-3" style={{ background: "rgba(27,27,42,0.72)" }}>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="mont-nome" className={LABEL}>
                  Nome
                </label>
                <input
                  id="mont-nome"
                  type="text"
                  value={montaria.nome}
                  onChange={(e) => setMontaria({ ...montaria, nome: e.target.value })}
                  placeholder="Trovoada, Ferrugem…"
                  maxLength={60}
                  className="arcana-input w-full font-crimson text-base"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="mont-desc" className={LABEL}>
                  Aparência
                </label>
                <input
                  id="mont-desc"
                  type="text"
                  value={montaria.descricao}
                  onChange={(e) => setMontaria({ ...montaria, descricao: e.target.value })}
                  placeholder={animal === "cavalo" ? "baio, crina escura…" : "cinza, orelha rasgada…"}
                  maxLength={160}
                  className="arcana-input w-full font-crimson text-base"
                />
              </div>
            </div>

            <div>
              <div className="flex items-baseline justify-between mb-1.5">
                <span className={LABEL}>Reparta os 3 pontos</span>
                <span className="font-cinzel text-sm">
                  <span className="text-arcana-gold-bright">{montaria.potencia} Potência</span>
                  <span className="text-arcana-text-dim mx-1.5">×</span>
                  <span style={{ color: "#c98d5a" }}>{montaria.resistencia} Resistência</span>
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={3}
                step={1}
                value={pot}
                onChange={(e) => {
                  const p = Number(e.target.value);
                  setMontaria({ ...montaria, potencia: p, resistencia: 3 - p });
                }}
                aria-label="Equilíbrio entre Potência e Resistência"
                aria-valuetext={`Potência ${montaria.potencia}, Resistência ${montaria.resistencia}`}
                className="redea-slider w-full"
                style={{ ["--pct" as string]: `${pct}%` }}
              />
              <div className="flex justify-between mt-1">
                <span className="font-crimson text-xs italic text-arcana-text-dim">
                  ouro = corrida e tração
                </span>
                <span className="font-crimson text-xs italic text-arcana-text-dim">
                  cobre = vida e estrada
                </span>
              </div>
              <p
                className="font-crimson text-[15px] italic text-arcana-text leading-snug mt-2"
                aria-live="polite"
              >
                {TEMPERAMENTOS[montaria.potencia]}
              </p>
            </div>
          </div>
        </div>

        {/* Régua da ficha */}
        <div
          className="px-4 py-2.5 flex items-center justify-between gap-3 flex-wrap"
          style={{ background: "rgba(15,15,26,0.85)", borderTop: "1px solid rgba(209,171,85,0.25)" }}
        >
          <div className="flex items-center gap-4">
            {[
              { label: "Vida", value: String(derivados.vidaMaxima) },
              { label: "Dor", value: String(derivados.capacidadeDor) },
              { label: "Fidelidade", value: String(derivados.fidelidade) },
              { label: "Por mov.", value: `${derivados.deslocamentoPorMovimento}m` },
            ].map((s) => (
              <span key={s.label} className="flex items-baseline gap-1.5">
                <span className="font-cinzel text-lg text-arcana-gold-bright leading-none">
                  {s.value}
                </span>
                <span className="font-cinzel text-[10px] uppercase tracking-[0.1em] text-arcana-text-dim">
                  {s.label}
                </span>
              </span>
            ))}
          </div>
          <span className="font-crimson text-xs italic text-arcana-text-dim">
            Corrida: 1d6 + Potência + Montaria ({ficha.antecedentes.montaria}), dificuldade 6
          </span>
        </div>
      </div>

      <style jsx>{`
        .redea-slider {
          -webkit-appearance: none;
          appearance: none;
          height: 14px;
          border-radius: 999px;
          outline: none;
          cursor: pointer;
          border: 1px solid rgba(255, 255, 255, 0.14);
          box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.55);
          /* ouro (potência) até o divisor; cobre (resistência) depois */
          background:
            repeating-linear-gradient(
              90deg,
              transparent 0px,
              transparent calc(33.33% - 1px),
              rgba(11, 11, 20, 0.55) calc(33.33% - 1px),
              rgba(11, 11, 20, 0.55) 33.33%
            ),
            linear-gradient(
              90deg,
              #f0cc6a 0%,
              #d1ab55 var(--pct),
              #8a5a34 var(--pct),
              #c98d5a 100%
            );
          transition: background 200ms ease;
        }
        .redea-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          border: 2px solid #f5d478;
          background:
            radial-gradient(circle at 50% 38%, rgba(255, 245, 215, 0.55), transparent 55%),
            linear-gradient(180deg, #b87333, #6e4320);
          box-shadow: 0 0 14px rgba(209, 171, 85, 0.55), 0 2px 5px rgba(0, 0, 0, 0.65);
          cursor: grab;
          transition: transform 120ms ease;
        }
        .redea-slider::-webkit-slider-thumb:active {
          cursor: grabbing;
          transform: scale(1.12);
        }
        .redea-slider::-moz-range-thumb {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          border: 2px solid #f5d478;
          background: linear-gradient(180deg, #b87333, #6e4320);
          box-shadow: 0 0 14px rgba(209, 171, 85, 0.55), 0 2px 5px rgba(0, 0, 0, 0.65);
          cursor: grab;
        }
        .redea-slider:focus-visible {
          outline: 2px solid rgba(209, 171, 85, 0.75);
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}
