"use client";

import { HowItWorks } from "@/components/campaign-creation/Explainer";
import { PLAYER_GUIDES } from "@/lib/character-creation/sacramento/guidance";
import {
  HABILIDADES,
  contarParrudeza,
  type HabilidadeInfo,
} from "@/lib/character-creation/sacramento/habilidades";
import { totalHabilidades } from "@/lib/character-creation/sacramento/rules";
import { HabilidadeIcon } from "./HabilidadeIcon";
import {
  FICHA_INICIAL,
  type SacramentoCreationData,
} from "@/lib/character-creation/sacramento/types";

type Props = {
  data: Partial<SacramentoCreationData>;
  onUpdate: (partial: Partial<SacramentoCreationData>) => void;
};

const LABEL = "font-cinzel text-[10px] uppercase tracking-[0.3em] text-arcana-text-dim";

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

export default function Step5Habilidades({ data, onUpdate }: Props) {
  const ficha = data.ficha ?? FICHA_INICIAL;
  const escolhidas = ficha.habilidades;
  const total = totalHabilidades(ficha.nivel);
  const restantes = total - escolhidas.length;
  const violencia = ficha.antecedentes.violencia;

  const setHabilidades = (habilidades: string[]) =>
    onUpdate({ ficha: { ...ficha, habilidades } });

  const toggle = (h: HabilidadeInfo) => {
    if (h.repetivel) return; // Parrudeza usa os botões próprios
    if (escolhidas.includes(h.id)) {
      setHabilidades(escolhidas.filter((id) => id !== h.id));
    } else if (restantes > 0) {
      setHabilidades([...escolhidas, h.id]);
    }
  };

  const parrudeza = contarParrudeza(escolhidas);
  const addParrudeza = () => restantes > 0 && setHabilidades([...escolhidas, "parrudeza"]);
  const removeParrudeza = () => {
    const idx = escolhidas.indexOf("parrudeza");
    if (idx >= 0) setHabilidades(escolhidas.filter((_, i) => i !== idx));
  };

  const renderCard = (h: HabilidadeInfo) => {
    const count = h.repetivel ? parrudeza : escolhidas.includes(h.id) ? 1 : 0;
    const active = count > 0;
    const cheio = restantes <= 0;
    const inativa =
      active && h.requisito && !h.requisito.valida(ficha.atributos, violencia);
    return (
      <div
        key={h.id}
        className={[
          "relative rounded-xl border p-3 transition-all duration-150",
          active
            ? "border-arcana-gold/70 bg-arcana-gold/[0.08]"
            : cheio
              ? "border-arcana-border-dim bg-arcana-surface/30"
              : "border-arcana-border bg-arcana-surface/60 hover:border-arcana-gold/40",
        ].join(" ")}
        style={
          active
            ? { boxShadow: "0 0 18px rgba(209,171,85,0.14), inset 0 1px 0 rgba(255,255,255,0.05)" }
            : { boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)" }
        }
      >
        {!h.repetivel && (
          <button
            type="button"
            onClick={() => toggle(h)}
            disabled={!active && cheio}
            aria-pressed={active}
            className="absolute inset-0 rounded-xl disabled:cursor-not-allowed"
            aria-label={`${active ? "Remover" : "Escolher"} ${h.nome}`}
          />
        )}
        <CornerCheck active={active && !h.repetivel} />
        <div className="flex items-start justify-between gap-2">
          <span
            aria-hidden
            className={[
              "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors",
              active
                ? "border-arcana-gold/60 text-arcana-gold-bright"
                : cheio
                  ? "border-arcana-border-dim text-arcana-text-muted"
                  : "border-arcana-border-dim text-arcana-gold",
            ].join(" ")}
            style={
              active
                ? {
                    background:
                      "radial-gradient(circle at 50% 30%, rgba(209,171,85,0.22), rgba(209,171,85,0.04))",
                  }
                : { background: "rgba(8,8,15,0.4)" }
            }
          >
            <HabilidadeIcon id={h.id} className="h-6 w-6" />
          </span>
          <div className="min-w-0 flex-1">
            <p
              className={[
                "font-cinzel text-[11px] uppercase tracking-[0.14em]",
                active
                  ? "font-bold text-arcana-gold-bright"
                  : cheio
                    ? "text-arcana-text-dim"
                    : "text-arcana-text",
              ].join(" ")}
            >
              {h.nome}
              {h.repetivel && parrudeza > 0 && (
                <span className="ml-1.5 text-arcana-gold">×{parrudeza}</span>
              )}
            </p>
            <p className="font-crimson text-[13px] leading-snug text-arcana-text-dim mt-1">
              {h.resumo}
            </p>
            {h.requisito && (
              <p
                className={[
                  "font-crimson text-xs italic mt-1",
                  inativa ? "text-arcana-danger" : "text-arcana-text-dim",
                ].join(" ")}
              >
                {inativa
                  ? `Inativa: ${h.requisito.texto.toLowerCase()} (fica na ficha, sem funcionar)`
                  : h.requisito.texto}
              </p>
            )}
          </div>
          {h.repetivel && (
            <div className="relative z-10 flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={removeParrudeza}
                disabled={parrudeza === 0}
                aria-label="Remover uma Parrudeza"
                className="w-7 h-7 rounded-full font-cinzel text-sm text-arcana-text-dim hover:text-arcana-gold-bright disabled:opacity-25"
                style={{ border: "1px solid var(--color-arcana-border)", background: "rgba(8,8,15,0.5)" }}
              >
                −
              </button>
              <button
                type="button"
                onClick={addParrudeza}
                disabled={restantes <= 0}
                aria-label="Adicionar uma Parrudeza"
                className="w-7 h-7 rounded-full font-cinzel text-sm text-arcana-text-dim hover:text-arcana-gold-bright disabled:opacity-25"
                style={{ border: "1px solid var(--color-arcana-border)", background: "rgba(8,8,15,0.5)" }}
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <HowItWorks guide={PLAYER_GUIDES.habilidades} />

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="font-crimson text-sm italic text-arcana-text-dim">
          Qualquer combinação vale — duas de combate, duas de profissão ou uma de cada.
        </p>
        <span
          className={[
            "font-cinzel text-[11px] uppercase tracking-[0.15em] rounded-full px-3 py-1",
            restantes === 0 ? "text-arcana-gold-bright" : "text-arcana-text",
          ].join(" ")}
          style={{
            border: "1px solid rgba(209,171,85,0.4)",
            background: restantes === 0 ? "rgba(209,171,85,0.12)" : "rgba(8,8,15,0.5)",
          }}
        >
          {escolhidas.length} / {total} escolhidas
        </span>
      </div>

      <section className="space-y-3">
        <span className={LABEL}>Combate</span>
        <div className="grid gap-2 sm:grid-cols-2">
          {HABILIDADES.filter((h) => h.categoria === "combate").map(renderCard)}
        </div>
      </section>

      <section className="space-y-3">
        <span className={LABEL}>Profissão</span>
        <div className="grid gap-2 sm:grid-cols-2">
          {HABILIDADES.filter((h) => h.categoria === "profissao").map(renderCard)}
        </div>
      </section>
    </div>
  );
}
