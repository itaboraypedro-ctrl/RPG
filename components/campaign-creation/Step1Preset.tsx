"use client";

import type { CampaignWizardData } from "@/app/campaigns/new/CampaignWizard";
import { SACRAMENTO_META } from "@/lib/rulesets/sacramento/meta";

type Props = {
  data: CampaignWizardData;
  onUpdate: (partial: Partial<CampaignWizardData>) => void;
};

const COMING_SOON = [
  {
    id: "dnd5e",
    nome: "Dungeons & Dragons 5e",
    subtitulo: "Alta fantasia",
    resumo: "Classes, raças, magias e masmorras — o clássico d20.",
  },
  {
    id: "custom",
    nome: "Personalizado",
    subtitulo: "Suas regras",
    resumo: "Campanha livre, sem preset de sistema.",
  },
];

export function Step1Preset({ data, onUpdate }: Props) {
  const selected = data.ruleset === "sacramento";

  return (
    <div className="space-y-6 max-w-2xl">
      <p className="font-crimson text-base italic text-arcana-text-dim">
        O modelo define as regras, o cenário e as ferramentas que a plataforma
        oferece ao Juiz e aos jogadores durante a campanha.
      </p>

      {/* Sacramento — disponível */}
      <button
        type="button"
        onClick={() => onUpdate({ ruleset: "sacramento" })}
        aria-pressed={selected}
        className={[
          "w-full text-left rounded-sm border p-6 transition-all duration-200",
          selected
            ? "border-arcana-gold bg-arcana-surface-2 shadow-[0_0_28px_rgba(201,168,76,0.18)]"
            : "border-arcana-border bg-arcana-surface hover:border-arcana-gold/50",
        ].join(" ")}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-cinzel text-[9px] uppercase tracking-[0.4em] text-arcana-gold/70">
              {SACRAMENTO_META.subtitulo}
            </p>
            <h3 className="mt-1 font-cinzel text-2xl uppercase tracking-[0.15em] text-arcana-gold-bright">
              {SACRAMENTO_META.nome}
            </h3>
          </div>
          <span
            className={[
              "shrink-0 border px-2.5 py-1 font-cinzel text-[9px] uppercase tracking-[0.25em]",
              selected
                ? "border-arcana-gold text-arcana-gold"
                : "border-arcana-border text-arcana-text-dim",
            ].join(" ")}
          >
            {selected ? "Selecionado" : "Disponível"}
          </span>
        </div>
        <p className="mt-3 font-crimson text-base text-arcana-text-dim leading-relaxed">
          {SACRAMENTO_META.resumo}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {["Época 1880", "Testes em 1d6", "Cartas e Sina", "Trilhas de redenção", "Duelos de pôquer", "Bando e Base"].map(
            (tag) => (
              <span
                key={tag}
                className="border border-arcana-border/60 px-2 py-0.5 font-cinzel text-[8px] uppercase tracking-[0.2em] text-arcana-text-dim/70"
              >
                {tag}
              </span>
            ),
          )}
        </div>
        <p className="mt-3 font-crimson text-xs italic text-arcana-text-dim/50">
          Fonte: {SACRAMENTO_META.fonte}
        </p>
      </button>

      {/* Em breve */}
      <div className="grid gap-3 sm:grid-cols-2">
        {COMING_SOON.map((preset) => (
          <div
            key={preset.id}
            aria-disabled
            className="rounded-sm border border-arcana-border-dim bg-arcana-surface/40 p-5 opacity-50 select-none"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-cinzel text-[8px] uppercase tracking-[0.35em] text-arcana-text-dim/60">
                  {preset.subtitulo}
                </p>
                <h4 className="mt-1 font-cinzel text-base uppercase tracking-[0.12em] text-arcana-text-dim">
                  {preset.nome}
                </h4>
              </div>
              <span className="shrink-0 border border-arcana-border-dim px-2 py-0.5 font-cinzel text-[8px] uppercase tracking-[0.25em] text-arcana-text-dim/60">
                Em breve
              </span>
            </div>
            <p className="mt-2 font-crimson text-sm text-arcana-text-dim/60">
              {preset.resumo}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
