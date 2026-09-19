"use client";

import type { CampaignWizardData } from "@/app/campaigns/new/CampaignWizard";
import { SACRAMENTO_META } from "@/lib/rulesets/sacramento/meta";
import { SACRAMENTO_THEMES, SACRAMENTO_TONES } from "@/lib/rulesets/sacramento/themes";

// Cartaz da campanha em PERGAMINHO — o ponto de luz da interface (SPEC §2.2).
// Estilo cartaz de procurado do Oeste: fundo claro, tinta escura, ouro velho.
export function CampaignPoster({ data }: { data: CampaignWizardData }) {
  const hasPreset = data.ruleset === "sacramento";
  const toneName = SACRAMENTO_TONES.find((t) => t.id === data.tone)?.nome;
  const themeNames = data.themes
    .map((id) => SACRAMENTO_THEMES.find((t) => t.id === id)?.nome ?? id)
    .slice(0, 6);

  return (
    <div className="w-full max-w-sm select-none" style={{ transform: "rotate(-0.6deg)" }}>
      <div className="arcana-parchment relative rounded-[2px] px-8 py-10 text-center">
        {/* Cantos ornamentais em tinta */}
        {[
          { top: 7, left: 7 },
          { top: 7, right: 7 },
          { bottom: 7, left: 7 },
          { bottom: 7, right: 7 },
        ].map((pos, i) => (
          <div
            key={i}
            aria-hidden
            className="absolute h-4 w-4"
            style={{
              ...pos,
              borderColor: "rgba(92, 74, 51, 0.55)",
              borderTopWidth: "top" in pos ? 2 : 0,
              borderBottomWidth: "bottom" in pos ? 2 : 0,
              borderLeftWidth: "left" in pos ? 2 : 0,
              borderRightWidth: "right" in pos ? 2 : 0,
              borderStyle: "solid",
            }}
          />
        ))}

        <p className="font-cinzel text-[10px] font-bold uppercase tracking-[0.5em] text-arcana-ink-dim">
          {hasPreset ? SACRAMENTO_META.subtitulo : "Campanha"}
        </p>

        <div className="mx-auto my-4 h-[2px] w-20" style={{ background: "rgba(92,74,51,0.5)" }} />

        <h2
          className="font-cinzel font-black uppercase leading-tight text-arcana-ink"
          style={{
            fontSize: "clamp(1.4rem, 2.2vw, 2rem)",
            letterSpacing: "0.1em",
            textShadow: "0 1px 0 rgba(255,250,235,0.6)",
          }}
        >
          {data.title.trim() || "Sua campanha"}
        </h2>

        {hasPreset && (
          <p className="mt-2 font-cinzel text-[11px] font-bold uppercase tracking-[0.35em] text-arcana-ink-dim">
            {SACRAMENTO_META.nome} · {data.epoch}
          </p>
        )}

        {data.description.trim() && (
          <p className="mt-4 font-crimson text-[15px] italic leading-relaxed text-arcana-ink/85 line-clamp-4">
            {data.description.trim()}
          </p>
        )}

        <div className="mx-auto my-5 h-px w-28" style={{ background: "rgba(92,74,51,0.45)" }} />

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
          <p className="mt-6 font-crimson text-sm italic text-arcana-ink-dim">
            Escolha um modelo para começar.
          </p>
        )}

        {/* Selo de cera */}
        <div
          aria-hidden
          className="absolute -bottom-4 -right-3 flex h-14 w-14 items-center justify-center rounded-full"
          style={{
            background: "radial-gradient(circle at 35% 30%, #8a3a2c, #5c241d 65%, #451a15)",
            boxShadow: "0 4px 14px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255,180,150,0.35)",
            transform: "rotate(8deg)",
          }}
        >
          <span className="font-cinzel text-lg font-black text-[#e8c9a0]/90">A</span>
        </div>
      </div>
    </div>
  );
}

function PosterRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="w-24 shrink-0 font-cinzel text-[10px] font-bold uppercase tracking-[0.25em] text-arcana-ink-dim">
        {label}
      </span>
      <span className="font-crimson text-[15px] text-arcana-ink">{value}</span>
    </div>
  );
}
