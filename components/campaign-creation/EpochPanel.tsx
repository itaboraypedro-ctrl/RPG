"use client";

// Painel único de época — roda vertical estilo cadeado para escolher o ano,
// ao lado da cronologia do mundo (pp. 131–132) numa linha do tempo interativa.
// As âncoras são equidistantes (não proporcionais aos anos): o que importa
// é navegar os marcos, não a escala de séculos.

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { SACRAMENTO_META } from "@/lib/rulesets/sacramento/meta";
import { SACRAMENTO_TIMELINE } from "@/lib/rulesets/sacramento/timeline";

type Props = {
  epoch: number;
  onEpochChange: (epoch: number) => void;
  /** Nota extra no rodapé (ex.: onde editar a data ficcional, no Hub). */
  footnote?: string;
};

/** Primeiro ano de uma âncora ("1856–1857" → 1856). */
function anchorYear(ano: string): number {
  return Number.parseInt(ano, 10);
}

// ─── Roda de época (dial de cadeado) ───

const ROW_H = 36;
const VISIBLE_ROWS = 5;
const WHEEL_H = ROW_H * VISIBLE_ROWS;
const WHEEL_PAD = (WHEEL_H - ROW_H) / 2;

function EpochWheel({
  value,
  onChange,
}: {
  value: number;
  onChange: (year: number) => void;
}) {
  // Faixa padrão cobre a era jogável; cresce se uma época externa sair dela.
  const [range, setRange] = useState(() => ({
    min: Math.min(1500, value),
    max: Math.max(1899, value),
  }));
  if (value < range.min || value > range.max) {
    // Ajuste durante o render (padrão React para estado derivado de props).
    setRange({ min: Math.min(range.min, value), max: Math.max(range.max, value) });
  }

  const years = useMemo(
    () =>
      Array.from({ length: range.max - range.min + 1 }, (_, i) => range.min + i),
    [range],
  );

  const wheelRef = useRef<HTMLDivElement>(null);
  const commitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const settledValue = useRef(value);
  const [highlight, setHighlight] = useState(value);

  const scrollToYear = (year: number, smooth: boolean) => {
    const el = wheelRef.current;
    if (!el) return;
    el.scrollTo({
      top: (year - range.min) * ROW_H,
      behavior: smooth ? "smooth" : "auto",
    });
  };

  // Posição inicial, sem animação.
  useLayoutEffect(() => {
    scrollToYear(settledValue.current, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mudança externa (ex.: "usar ano como época" na cronologia) gira a roda;
  // o próprio scroll atualiza o destaque via onScroll.
  useEffect(() => {
    if (value !== settledValue.current) {
      settledValue.current = value;
      scrollToYear(value, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleScroll = () => {
    const el = wheelRef.current;
    if (!el) return;
    const idx = Math.min(
      years.length - 1,
      Math.max(0, Math.round(el.scrollTop / ROW_H)),
    );
    const year = years[idx];
    if (year !== highlight) setHighlight(year);
    if (commitTimer.current) clearTimeout(commitTimer.current);
    commitTimer.current = setTimeout(() => {
      if (year !== settledValue.current) {
        settledValue.current = year;
        onChange(year);
      }
    }, 160);
  };

  const step = (delta: number) => {
    const next = Math.min(range.max, Math.max(range.min, highlight + delta));
    scrollToYear(next, true);
  };

  return (
    <div
      className="relative w-28 select-none"
      role="spinbutton"
      tabIndex={0}
      aria-label="Época da campanha"
      aria-valuemin={range.min}
      aria-valuemax={range.max}
      aria-valuenow={highlight}
      onKeyDown={(e) => {
        if (e.key === "ArrowUp") {
          e.preventDefault();
          step(-1);
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          step(1);
        } else if (e.key === "PageUp") {
          e.preventDefault();
          step(-10);
        } else if (e.key === "PageDown") {
          e.preventDefault();
          step(10);
        }
      }}
    >
      {/* Tambor rolável */}
      <div
        ref={wheelRef}
        onScroll={handleScroll}
        className="snap-y snap-mandatory overflow-y-auto rounded-xl border border-arcana-border-dim outline-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{
          height: WHEEL_H,
          paddingTop: WHEEL_PAD,
          paddingBottom: WHEEL_PAD,
          background:
            "linear-gradient(180deg, rgba(8,8,15,0.9), rgba(20,20,31,0.35) 30%, rgba(20,20,31,0.35) 70%, rgba(8,8,15,0.9))",
          boxShadow: "inset 0 2px 10px rgba(0,0,0,0.55)",
        }}
      >
        {years.map((year) => {
          const distance = Math.abs(year - highlight);
          return (
            <button
              key={year}
              type="button"
              tabIndex={-1}
              onClick={() => scrollToYear(year, true)}
              className={[
                "flex w-full snap-center items-center justify-center font-cinzel transition-colors duration-100",
                distance === 0
                  ? "text-base font-bold tracking-[0.2em] text-arcana-gold-bright"
                  : distance === 1
                    ? "text-sm tracking-[0.15em] text-arcana-text-dim"
                    : "text-[13px] tracking-[0.12em] text-arcana-text-muted",
              ].join(" ")}
              style={{ height: ROW_H }}
            >
              {year}
            </button>
          );
        })}
      </div>

      {/* Moldura do dial: janela central + esfumado nas bordas */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-x-0 top-0"
          style={{
            height: WHEEL_PAD,
            background:
              "linear-gradient(180deg, rgba(11,11,20,0.92), transparent)",
          }}
        />
        <div
          className="absolute inset-x-0 bottom-0"
          style={{
            height: WHEEL_PAD,
            background:
              "linear-gradient(0deg, rgba(11,11,20,0.92), transparent)",
          }}
        />
        <div
          className="absolute inset-x-0"
          style={{
            top: WHEEL_PAD,
            height: ROW_H,
            borderTop: "1px solid rgba(209,171,85,0.5)",
            borderBottom: "1px solid rgba(209,171,85,0.5)",
            background: "rgba(209,171,85,0.05)",
            boxShadow: "0 0 14px rgba(209,171,85,0.12)",
          }}
        />
        {/* Marcadores laterais da janela */}
        <span
          className="absolute h-1.5 w-1.5 rotate-45 bg-arcana-gold"
          style={{ left: -3, top: WHEEL_PAD + ROW_H / 2 - 3 }}
        />
        <span
          className="absolute h-1.5 w-1.5 rotate-45 bg-arcana-gold"
          style={{ right: -3, top: WHEEL_PAD + ROW_H / 2 - 3 }}
        />
      </div>
    </div>
  );
}

// ─── Painel ───

export function EpochPanel({ epoch, onEpochChange, footnote }: Props) {
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
    <div className="rounded-xl border border-arcana-border-dim bg-arcana-surface/50">
      {/* Cabeçalho */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-arcana-border-dim px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="font-cinzel text-[10px] uppercase tracking-[0.3em] text-arcana-gold">
            Época &amp; cronologia
          </span>
          {isTableVersion && (
            <span className="rounded-full border border-arcana-gold/40 px-2 py-0.5 font-cinzel text-[9px] uppercase tracking-[0.25em] text-arcana-gold">
              Versão da mesa
            </span>
          )}
        </div>
        <span className="font-crimson text-[11px] italic text-arcana-text-muted">
          pp. 131–132
        </span>
      </div>

      {/* Roda de época + linha do tempo */}
      <div className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center">
        <div className="shrink-0 space-y-1.5">
          <span className="block font-cinzel text-[10px] uppercase tracking-[0.28em] text-arcana-gold/90">
            Época
          </span>
          <EpochWheel value={epoch} onChange={onEpochChange} />
        </div>

        <div
          ref={railRef}
          className="min-w-0 flex-1 overflow-x-auto sm:border-l sm:border-arcana-border-dim"
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
        versão da mesa.{footnote ? ` ${footnote}` : ""}
      </p>
    </div>
  );
}
