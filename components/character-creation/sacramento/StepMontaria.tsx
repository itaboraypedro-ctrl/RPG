"use client";

import { useEffect } from "react";
import { HowItWorks } from "@/components/campaign-creation/Explainer";
import { PLAYER_GUIDES } from "@/lib/character-creation/sacramento/guidance";
import { montariaComprada } from "@/lib/character-creation/sacramento/catalogo";
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
const HELPER = "font-crimson text-xs italic text-arcana-text-dim";

const MONTARIA_NOVA: MontariaCriacao = {
  nome: "",
  descricao: "",
  potencia: 2,
  resistencia: 1,
  origem: "comprar",
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

  return (
    <div className="space-y-8 max-w-2xl">
      <HowItWorks guide={PLAYER_GUIDES.montaria} />

      <p className="font-crimson text-sm italic text-arcana-text-dim">
        {animal === "cavalo"
          ? "Dona Firmina entrega as rédeas do seu cavalo: — Trate pelo nome que ele retribui."
          : "Dona Firmina dá um tapinha na sua mula: — Teimosa, mas nunca te deixa na estrada."}
      </p>

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

      {/* 3 pontos entre Potência e Resistência — controle acoplado */}
      <section className="space-y-3">
        <div>
          <span className={LABEL}>Potência × Resistência</span>
          <p className={HELPER}>
            3 pontos no total. Potência corre e puxa; Resistência aguenta ferimento e estrada.
          </p>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[0, 1, 2, 3].map((pot) => {
            const res = 3 - pot;
            const active = montaria.potencia === pot;
            return (
              <button
                key={pot}
                type="button"
                onClick={() => setMontaria({ ...montaria, potencia: pot, resistencia: res })}
                aria-pressed={active}
                className={[
                  "rounded-xl border py-3 flex flex-col items-center gap-1 transition-all duration-150",
                  active
                    ? "border-arcana-gold/70 bg-arcana-gold/[0.1]"
                    : "border-arcana-border bg-arcana-surface/60 hover:border-arcana-gold/40",
                ].join(" ")}
                style={active ? { boxShadow: "0 0 14px rgba(209,171,85,0.2)" } : undefined}
              >
                <span
                  className={[
                    "font-cinzel text-base leading-none",
                    active ? "text-arcana-gold-bright" : "text-arcana-text",
                  ].join(" ")}
                >
                  {pot} · {res}
                </span>
                <span className="font-cinzel text-[10px] uppercase tracking-[0.1em] text-arcana-text-dim">
                  Pot · Res
                </span>
              </button>
            );
          })}
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
    </div>
  );
}
