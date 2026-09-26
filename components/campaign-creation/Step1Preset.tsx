"use client";

import type { CampaignWizardData } from "@/app/campaigns/new/CampaignWizard";
import { WIZARD_GUIDES } from "@/lib/rulesets/sacramento/guidance";
import { HowItWorks } from "./Explainer";
import { SacramentoPoster } from "./SacramentoPoster";

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
    <div className="space-y-6 max-w-3xl">
      <HowItWorks guide={WIZARD_GUIDES.modelo} />
      <p className="font-crimson text-base italic text-arcana-text-dim">
        O modelo define as regras, o cenário e as ferramentas que a plataforma
        oferece ao Juiz e aos jogadores durante a campanha.
      </p>

      {/* Sacramento — disponível: capa oficial */}
      <SacramentoPoster selected={selected} onSelect={() => onUpdate({ ruleset: "sacramento" })} />

      {/* Em breve */}
      <div className="grid gap-3 sm:grid-cols-2">
        {COMING_SOON.map((preset) => (
          <div
            key={preset.id}
            aria-disabled
            className="rounded-xl border border-arcana-border-dim bg-arcana-surface/40 p-5 opacity-50 select-none"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-cinzel text-[10px] uppercase tracking-[0.35em] text-arcana-text-dim">
                  {preset.subtitulo}
                </p>
                <h4 className="mt-1 font-cinzel text-base uppercase tracking-[0.12em] text-arcana-text-dim">
                  {preset.nome}
                </h4>
              </div>
              <span className="shrink-0 border border-arcana-border-dim px-2 py-0.5 font-cinzel text-[10px] uppercase tracking-[0.25em] text-arcana-text-dim">
                Em breve
              </span>
            </div>
            <p className="mt-2 font-crimson text-sm text-arcana-text-dim">
              {preset.resumo}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
