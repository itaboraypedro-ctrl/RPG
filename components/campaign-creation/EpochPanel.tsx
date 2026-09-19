"use client";

// Painel único de época — funde o campo Época, a data ficcional e a
// cronologia do mundo (pp. 131–132) numa linha do tempo interativa.
// As âncoras são equidistantes (não proporcionais aos anos): o que importa
// é navegar os marcos, não a escala de séculos.

import { useEffect, useMemo, useRef, useState } from "react";
import { SACRAMENTO_META } from "@/lib/rulesets/sacramento/meta";
import { SACRAMENTO_TIMELINE } from "@/lib/rulesets/sacramento/timeline";

type Props = {
  epoch: number;
  onEpochChange: (epoch: number) => void;
  /** Presentes apenas no Hub — o wizard ainda não tem data ficcional. */
  fictionalDate?: string;
  onFictionalDateChange?: (value: string) => void;
};

/** Primeiro ano de uma âncora ("1856–1857" → 1856). */
function anchorYear(ano: string): number {
  return Number.parseInt(ano, 10);
}

export function EpochPanel({
  epoch,
  onEpochChange,
  fictionalDate,
  onFictionalDateChange,
}: Props) {
  const railRef = useRef<HTMLDivElement>(null);
  const anchorRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Âncora "onde a campanha está": a mais recente que não passa da época.
  const epochAnchorIndex = useMemo(() => {
    let best = 0;
    SACRAMENTO_TIMELINE.forEach((anchor, i) => {
      if (anchorYear(anchor.ano) <= epoch) best = i;
    });
    return best;
  }, [epoch]);

  const [selectedIndex, setSelectedIndex] = useState(epochAnchorIndex);
  const selected = SACRAMENTO_TIMELINE[selectedIndex];
  const selectedYear = anchorYear(selected.ano);

  // Centraliza a âncora da época ao montar (sem animação — é posição inicial).
  useEffect(() => {
    const rail = railRef.current;
    const item = anchorRefs.current[epochAnchorIndex];
    if (rail && item) {
      rail.scrollLeft = item.offsetLeft - rail.clientWidth / 2 + item.clientWidth / 2;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isTableVersion = epoch !== SACRAMENTO_META.defaults.epoca;

  return (
    <div className="rounded-sm border border-arcana-border-dim bg-arcana-surface/50">
      {/* Cabeçalho */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-arcana-border-dim px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="font-cinzel text-[10px] uppercase tracking-[0.3em] text-arcana-gold">
            Época &amp; cronologia
          </span>
          {isTableVersion && (
            <span className="border border-arcana-gold/40 px-2 py-0.5 font-cinzel text-[9px] uppercase tracking-[0.25em] text-arcana-gold">
              Versão da mesa
            </span>
          )}
        </div>
        <span className="font-crimson text-[11px] italic text-arcana-text-muted">
          pp. 131–132
        </span>
      </div>

      {/* Campos */}
      <div
        className={[
          "grid gap-4 px-4 py-4",
          onFictionalDateChange ? "sm:grid-cols-[9rem_1fr]" : "sm:grid-cols-[9rem]",
        ].join(" ")}
      >
        <label className="space-y-1.5">
          <span className="block font-cinzel text-[10px] uppercase tracking-[0.28em] text-arcana-gold/90">
            Época
          </span>
          <input
            type="number"
            value={epoch}
            onChange={(e) => onEpochChange(Number(e.target.value))}
            className="arcana-input w-full font-crimson text-sm"
          />
        </label>
        {onFictionalDateChange && (
          <label className="space-y-1.5">
            <span className="block font-cinzel text-[10px] uppercase tracking-[0.28em] text-arcana-gold/90">
              Data ficcional atual
            </span>
            <input
              type="text"
              value={fictionalDate ?? ""}
              onChange={(e) => onFictionalDateChange(e.target.value)}
              maxLength={80}
              placeholder={`Ex.: Março de ${epoch}`}
              className="arcana-input w-full font-crimson text-sm"
            />
          </label>
        )}
      </div>

      {/* Linha do tempo */}
      <div
        ref={railRef}
        className="overflow-x-auto"
        style={{ scrollbarWidth: "thin" }}
      >
        <div className="relative flex min-w-max px-4">
          {/* Trilho contínuo por trás dos marcos */}
          <div
            aria-hidden
            className="absolute left-0 right-0 top-[19px] h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, var(--color-arcana-border) 4%, var(--color-arcana-border) 96%, transparent)",
            }}
          />
          {SACRAMENTO_TIMELINE.map((anchor, i) => {
            const isSelected = i === selectedIndex;
            const isEpochAnchor = i === epochAnchorIndex;
            return (
              <button
                key={`${anchor.ano}-${anchor.marco}`}
                ref={(el) => {
                  anchorRefs.current[i] = el;
                }}
                type="button"
                onClick={() => setSelectedIndex(i)}
                title={anchor.marco}
                className="group relative flex w-[86px] shrink-0 flex-col items-center gap-1.5 pb-2.5 pt-3"
              >
                {/* Marco (losango) */}
                <span
                  className={[
                    "z-10 h-3 w-3 rotate-45 border transition-all duration-150",
                    isSelected
                      ? "border-arcana-gold-bright bg-arcana-gold"
                      : isEpochAnchor
                        ? "border-arcana-gold bg-arcana-gold/30"
                        : "border-arcana-border bg-arcana-surface-2 group-hover:border-arcana-gold/60",
                  ].join(" ")}
                  style={
                    isSelected
                      ? { boxShadow: "0 0 12px rgba(209,171,85,0.6)" }
                      : undefined
                  }
                />
                <span
                  className={[
                    "font-cinzel text-[10px] tracking-[0.12em] transition-colors",
                    isSelected
                      ? "font-bold text-arcana-gold-bright"
                      : isEpochAnchor
                        ? "text-arcana-gold"
                        : "text-arcana-text-dim group-hover:text-arcana-text",
                  ].join(" ")}
                >
                  {anchor.ano}
                </span>
                {isEpochAnchor && (
                  <span className="font-cinzel text-[9px] uppercase tracking-[0.2em] text-arcana-gold">
                    ◆ época
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Marco selecionado */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-arcana-border-dim px-4 py-3">
        <p className="font-crimson text-sm text-arcana-text">
          <span className="font-cinzel text-[10px] tracking-[0.15em] text-arcana-gold">
            {selected.ano}
          </span>
          <span className="mx-2 text-arcana-text-muted">—</span>
          {selected.marco}
        </p>
        {selectedYear !== epoch && (
          <button
            type="button"
            onClick={() => onEpochChange(selectedYear)}
            className="arcana-btn-ghost arcana-btn-sm shrink-0"
          >
            Usar {selectedYear} como época
          </button>
        )}
      </div>

      <p className="border-t border-arcana-border-dim px-4 py-2.5 font-crimson text-[13px] italic text-arcana-text-dim">
        Presente editorial: {SACRAMENTO_META.defaults.epoca}. Outra época vale como
        versão da mesa
        {onFictionalDateChange
          ? "; a data ficcional marca onde a campanha está no calendário do jogo — não confundir com a data real."
          : "."}
      </p>
    </div>
  );
}
