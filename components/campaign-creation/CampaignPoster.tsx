"use client";

import type { CampaignWizardData } from "@/app/campaigns/new/CampaignWizard";
import { SACRAMENTO_META } from "@/lib/rulesets/sacramento/meta";
import { SACRAMENTO_THEMES, SACRAMENTO_TONES } from "@/lib/rulesets/sacramento/themes";

// "Cartaz de procurado" da campanha — evolui conforme as escolhas do wizard.
export function CampaignPoster({ data }: { data: CampaignWizardData }) {
  const hasPreset = data.ruleset === "sacramento";
  const toneName = SACRAMENTO_TONES.find((t) => t.id === data.tone)?.nome;
  const themeNames = data.themes
    .map((id) => SACRAMENTO_THEMES.find((t) => t.id === id)?.nome ?? id)
    .slice(0, 6);

  return (
    <div className="w-full max-w-sm select-none">
      <div
        className="relative rounded-sm border border-arcana-border/70 px-8 py-10 text-center"
        style={{
          background:
            "linear-gradient(175deg, rgba(30,30,48,0.9) 0%, rgba(15,15,28,0.95) 55%, rgba(7,7,13,1) 100%)",
          boxShadow: hasPreset
            ? "0 0 60px rgba(201,168,76,0.12), inset 0 0 40px rgba(0,0,0,0.5)"
            : "inset 0 0 40px rgba(0,0,0,0.5)",
        }}
      >
        {/* Cantos ornamentais */}
        {[
          { top: 6, left: 6 },
          { top: 6, right: 6 },
          { bottom: 6, left: 6 },
          { bottom: 6, right: 6 },
        ].map((pos, i) => (
          <div
            key={i}
            aria-hidden
            className="absolute h-4 w-4 border-arcana-gold/50"
            style={{
              ...pos,
              borderTopWidth: "top" in pos ? 1 : 0,
              borderBottomWidth: "bottom" in pos ? 1 : 0,
              borderLeftWidth: "left" in pos ? 1 : 0,
              borderRightWidth: "right" in pos ? 1 : 0,
              borderStyle: "solid",
            }}
          />
        ))}

        <p className="font-cinzel text-[9px] uppercase tracking-[0.5em] text-arcana-gold/60">
          {hasPreset ? SACRAMENTO_META.subtitulo : "Campanha"}
        </p>

        <div className="mx-auto my-4 h-px w-16 bg-arcana-gold/40" />

        <h2
          className="font-cinzel uppercase leading-tight text-arcana-gold-bright"
          style={{
            fontSize: "clamp(1.3rem, 2vw, 1.8rem)",
            letterSpacing: "0.12em",
            textShadow: "0 0 30px rgba(240,204,106,0.25)",
          }}
        >
          {data.title.trim() || "Sua campanha"}
        </h2>

        {hasPreset && (
          <p className="mt-2 font-cinzel text-[10px] uppercase tracking-[0.35em] text-arcana-text-dim">
            {SACRAMENTO_META.nome} · {data.epoch}
          </p>
        )}

        {data.description.trim() && (
          <p className="mt-4 font-crimson text-sm italic leading-relaxed text-arcana-text-dim line-clamp-4">
            {data.description.trim()}
          </p>
        )}

        <div className="mx-auto my-5 h-px w-24 bg-arcana-border/60" />

        <div className="space-y-2 text-left">
          <PosterRow label="Bando" value={`Até ${data.maxPlayers} jogador${data.maxPlayers > 1 ? "es" : ""}`} />
          {toneName && <PosterRow label="Tom" value={toneName} />}
          {themeNames.length > 0 && <PosterRow label="Temas" value={themeNames.join(", ")} />}
          {(data.lines.length > 0 || data.veils.length > 0 || data.xCard) && (
            <PosterRow
              label="Sessão zero"
              value={[
                data.lines.length > 0 ? `${data.lines.length} linha${data.lines.length > 1 ? "s" : ""}` : null,
                data.veils.length > 0 ? `${data.veils.length} véu${data.veils.length > 1 ? "s" : ""}` : null,
                data.xCard ? "Cartão X" : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            />
          )}
        </div>

        {!hasPreset && (
          <p className="mt-6 font-crimson text-xs italic text-arcana-text-dim/50">
            Escolha um modelo para começar.
          </p>
        )}
      </div>
    </div>
  );
}

function PosterRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="w-20 shrink-0 font-cinzel text-[8px] uppercase tracking-[0.3em] text-arcana-gold/60">
        {label}
      </span>
      <span className="font-crimson text-sm text-arcana-text">{value}</span>
    </div>
  );
}
