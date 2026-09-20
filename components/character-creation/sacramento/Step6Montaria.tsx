"use client";

import { HowItWorks } from "@/components/campaign-creation/Explainer";
import { PLAYER_GUIDES } from "@/lib/character-creation/sacramento/guidance";
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
  origem: "",
};

export default function Step6Montaria({ data, onUpdate }: Props) {
  const ficha = data.ficha ?? FICHA_INICIAL;
  const montaria = ficha.montaria;
  const setMontaria = (m: MontariaCriacao | null) =>
    onUpdate({ ficha: { ...ficha, montaria: m } });

  const derivados = montaria ? derivadosMontaria(montaria.potencia, montaria.resistencia) : null;

  return (
    <div className="space-y-8 max-w-2xl">
      <HowItWorks guide={PLAYER_GUIDES.montaria} />

      {!montaria ? (
        <div className="space-y-4">
          <p className="font-crimson text-sm italic text-arcana-text-dim">
            A montaria é opcional na criação — o livro não dá cavalo de graça, então ela precisa
            ser comprada com os $200 iniciais ou combinada com o Juiz. Você também pode resolver
            isso direto na mesa.
          </p>
          <button
            type="button"
            onClick={() => setMontaria(MONTARIA_NOVA)}
            className="arcana-btn-primary"
          >
            Criar montaria
          </button>
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="mont-nome" className={LABEL}>
                Nome da montaria
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
                placeholder="Ex.: égua baia de crina escura, cicatriz no flanco"
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

          {derivados && (
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
          )}

          <section className="space-y-3">
            <div>
              <span className={LABEL}>Como ela foi obtida?</span>
              <p className={HELPER}>
                O livro vende cavalos por até $250 e o orçamento inicial é $200 — por isso a
                origem precisa ficar registrada para o Juiz.
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {(
                [
                  {
                    id: "comprar",
                    nome: "Vou comprar na mesa",
                    desc: "Sai dos $200 iniciais (mula e burrico são mais em conta)",
                  },
                  {
                    id: "juiz",
                    nome: "Combinar com o Juiz",
                    desc: "Vínculo inicial concedido pela campanha, registrado como decisão",
                  },
                ] as const
              ).map((o) => {
                const active = montaria.origem === o.id;
                return (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => setMontaria({ ...montaria, origem: o.id })}
                    aria-pressed={active}
                    className={[
                      "rounded-xl border p-3 text-left transition-all duration-150",
                      active
                        ? "border-arcana-gold/70 bg-arcana-gold/[0.08]"
                        : "border-arcana-border bg-arcana-surface/60 hover:border-arcana-gold/40",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "block font-cinzel text-[11px] uppercase tracking-[0.16em]",
                        active ? "font-bold text-arcana-gold-bright" : "text-arcana-text",
                      ].join(" ")}
                    >
                      {o.nome}
                    </span>
                    <span className="mt-0.5 block font-crimson text-[13px] leading-snug text-arcana-text-dim">
                      {o.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <button
            type="button"
            onClick={() => setMontaria(null)}
            className="font-crimson text-sm italic text-arcana-text-dim underline underline-offset-4 hover:text-arcana-text transition-colors"
          >
            Remover montaria — resolver depois, na mesa
          </button>
        </>
      )}
    </div>
  );
}
