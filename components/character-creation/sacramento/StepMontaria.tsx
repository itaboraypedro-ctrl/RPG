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
  const nomeAnimal = animal === "cavalo" ? "cavalo" : "mula";

  // Divisor de partilha: ouro (potência) à esquerda, cobre (resistência) à direita.
  const pot = montaria.potencia; // 0..3
  const pct = (pot / 3) * 100;

  return (
    <div className="space-y-8 max-w-2xl">
      <HowItWorks guide={PLAYER_GUIDES.montaria} />

      {/* Card do estábulo — o animal que está sendo configurado */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          border: "1px solid rgba(209,171,85,0.35)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 0 20px rgba(209,171,85,0.08)",
        }}
      >
        <div
          className="relative flex items-center justify-center py-6"
          style={{
            background:
              "radial-gradient(60% 80% at 50% 60%, rgba(209,171,85,0.1), transparent 75%), #0b0b14",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={itemImagem(animal)}
            alt={nomeAnimal}
            width={220}
            height={220}
            className="h-52 w-52 object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.7)]"
          />
          {/* Plaqueta do nome */}
          <div
            className="absolute bottom-3 left-1/2 -translate-x-1/2 px-5 py-1.5 rounded-full text-center"
            style={{
              background: "rgba(15,15,26,0.85)",
              border: "1px solid rgba(209,171,85,0.5)",
              backdropFilter: "blur(8px)",
              boxShadow: "0 2px 10px rgba(0,0,0,0.6)",
            }}
          >
            <span className="font-cinzel text-sm uppercase tracking-[0.2em] text-arcana-gold-bright whitespace-nowrap">
              {montaria.nome.trim() || (animal === "cavalo" ? "Seu cavalo" : "Sua mula")}
            </span>
          </div>
        </div>
        <div
          className="px-5 py-3"
          style={{ background: "rgba(27,27,42,0.8)", borderTop: "1px solid rgba(209,171,85,0.2)" }}
        >
          <p className="font-crimson text-sm italic text-arcana-text-dim">
            {animal === "cavalo"
              ? "Dona Firmina entrega as rédeas: — Trate pelo nome que ele retribui."
              : "Dona Firmina dá um tapinha na anca: — Teimosa, mas nunca te deixa na estrada."}
          </p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="mont-nome" className={LABEL}>
            Nome d{animal === "cavalo" ? "o cavalo" : "a mula"}
          </label>
          <input
            id="mont-nome"
            type="text"
            value={montaria.nome}
            onChange={(e) => setMontaria({ ...montaria, nome: e.target.value })}
            placeholder="Ex.: Trovoada, Ferrugem, Dona Flor"
            maxLength={60}
            className="arcana-input w-full font-crimson text-lg"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="mont-desc" className={LABEL}>
            Aparência
          </label>
          <input
            id="mont-desc"
            type="text"
            value={montaria.descricao}
            onChange={(e) => setMontaria({ ...montaria, descricao: e.target.value })}
            placeholder={
              animal === "cavalo"
                ? "Ex.: baio de crina escura, cicatriz no flanco"
                : "Ex.: pelagem cinza, orelha rasgada, olhar desconfiado"
            }
            maxLength={160}
            className="arcana-input w-full font-crimson text-lg"
          />
        </div>
      </div>

      {/* A rédea: puxe para o lado que importa */}
      <section className="space-y-3">
        <div>
          <span className={LABEL}>O temperamento — reparta os 3 pontos</span>
          <p className="font-crimson text-xs italic text-arcana-text-dim">
            Arraste o divisor: quanto mais ouro, mais corrida; quanto mais cobre, mais casco.
          </p>
        </div>

        <div
          className="rounded-2xl px-5 pt-4 pb-5"
          style={{ background: "rgba(27,27,42,0.72)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div className="flex items-end justify-between mb-3">
            <div className="text-center">
              <p className="font-cinzel text-3xl leading-none text-arcana-gold-bright">
                {montaria.potencia}
              </p>
              <p className="font-cinzel text-[10px] uppercase tracking-[0.2em] text-arcana-text mt-1.5">
                Potência
              </p>
              <p className="font-crimson text-xs italic text-arcana-text-dim">corrida e tração</p>
            </div>
            <span aria-hidden className="mb-4 font-cinzel text-sm text-arcana-text-dim">
              ×
            </span>
            <div className="text-center">
              <p className="font-cinzel text-3xl leading-none" style={{ color: "#c98d5a" }}>
                {montaria.resistencia}
              </p>
              <p className="font-cinzel text-[10px] uppercase tracking-[0.2em] text-arcana-text mt-1.5">
                Resistência
              </p>
              <p className="font-crimson text-xs italic text-arcana-text-dim">vida e estrada</p>
            </div>
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

          <p
            className="font-crimson text-base italic text-arcana-text text-center mt-3 leading-snug"
            aria-live="polite"
          >
            {TEMPERAMENTOS[montaria.potencia]}
          </p>
        </div>
      </section>

      <section
        className="rounded-2xl p-4"
        style={{ background: "rgba(27,27,42,0.72)", border: "1px solid rgba(209,171,85,0.25)" }}
      >
        <p className={LABEL}>Ficha da montaria</p>
        <div className="mt-3 grid grid-cols-4 gap-2 text-center">
          {[
            { label: "Vida", value: String(derivados.vidaMaxima) },
            { label: "Dor", value: String(derivados.capacidadeDor) },
            { label: "Fidelidade", value: String(derivados.fidelidade) },
            { label: "Por mov.", value: `${derivados.deslocamentoPorMovimento}m` },
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
          Corrida: 1d6 + Potência ({montaria.potencia}) + seu antecedente Montaria (
          {ficha.antecedentes.montaria}), dificuldade padrão 6. A Fidelidade cresce com o
          cuidado, sessão a sessão.
        </p>
      </section>

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
          /* ouro (potência) até o puxador; cobre (resistência) depois */
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
          width: 28px;
          height: 28px;
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
          width: 28px;
          height: 28px;
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
