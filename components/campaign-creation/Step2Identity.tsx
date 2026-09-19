"use client";

import type { CampaignWizardData } from "@/app/campaigns/new/CampaignWizard";

type Props = {
  data: CampaignWizardData;
  onUpdate: (partial: Partial<CampaignWizardData>) => void;
};

const labelClass =
  "font-cinzel text-[10px] uppercase tracking-[0.3em] text-arcana-text-dim";

export function Step2Identity({ data, onUpdate }: Props) {
  return (
    <div className="space-y-8 max-w-2xl">
      <div className="space-y-2">
        <label htmlFor="campaign-title" className={labelClass}>
          Nome da campanha
        </label>
        <input
          id="campaign-title"
          type="text"
          value={data.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          maxLength={200}
          placeholder="Ex.: Poeira e Redenção"
          className="arcana-input w-full font-crimson text-lg"
          autoFocus
        />
        <p className="font-crimson text-xs italic text-arcana-text-dim/50">
          Mínimo de 2 caracteres. É o nome que o bando verá no convite.
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="campaign-description" className={labelClass}>
          Descrição / premissa
        </label>
        <textarea
          id="campaign-description"
          value={data.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          maxLength={2000}
          rows={6}
          placeholder="Do que trata esta campanha? Qual a situação inicial do Oeste que o bando vai encontrar? (Você poderá aprofundar a história na próxima fase.)"
          className="arcana-input w-full font-crimson text-base leading-relaxed resize-y"
        />
        <p className="font-crimson text-xs italic text-arcana-text-dim/50">
          Opcional aqui — a premissa completa, lugares, facções, NPCs, cenas e
          missões são configurados no hub de história, logo após a criação.
        </p>
      </div>
    </div>
  );
}
