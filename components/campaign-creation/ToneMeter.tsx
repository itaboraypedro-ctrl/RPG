"use client";

// Medidor de tom — barra horizontal arrastável, estilo "nível de intensidade"
// de menus AAA (BG3/RDR2). Os quatro tons de Sacramento formam um espectro
// natural de intensidade: Leve → Aventuresco → Dramático → Sombrio.

import { useCallback, useRef, useState } from "react";
import { SACRAMENTO_TONES } from "@/lib/rulesets/sacramento/themes";

// Ordem de intensidade do espectro (ids de SACRAMENTO_TONES).
const TONE_SPECTRUM = ["leve", "aventuresco", "dramatico", "sombrio"] as const;

const TONES = TONE_SPECTRUM.map(
  (id) => SACRAMENTO_TONES.find((t) => t.id === id)!,
).filter(Boolean);

// Luz de salão → ouro vivo → poeira de estrada → sangue seco.
const TRACK_GRADIENT =
  "linear-gradient(90deg, #e6d5a8 0%, #d1ab55 34%, #a05a30 67%, #6b2a20 100%)";

const STOP_COLORS = ["#e6d5a8", "#d1ab55", "#b06838", "#8a3a2c"];

type Props = {
  value: string | null;
  onChange: (tone: string | null) => void;
};

export function ToneMeter({ value, onChange }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const n = TONES.length;
  const index = TONES.findIndex((t) => t.id === value);
  const selected = index >= 0 ? TONES[index] : null;

  // Centro da coluna i (grid de n colunas iguais): (i + 0.5) / n.
  const centerPct = (i: number) => ((i + 0.5) / n) * 100;

  const indexFromPointer = useCallback(
    (clientX: number) => {
      const el = trackRef.current;
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      const ratio = (clientX - rect.left) / rect.width;
      return Math.min(n - 1, Math.max(0, Math.round(ratio * n - 0.5)));
    },
    [n],
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    const i = indexFromPointer(e.clientX);
    if (i !== null) onChange(TONES[i].id);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    const i = indexFromPointer(e.clientX);
    if (i !== null && TONES[i].id !== value) onChange(TONES[i].id);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const move = (next: number) =>
      onChange(TONES[Math.min(n - 1, Math.max(0, next))].id);
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      move(index < 0 ? 0 : index + 1);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      move(index < 0 ? 0 : index - 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      move(0);
    } else if (e.key === "End") {
      e.preventDefault();
      move(n - 1);
    }
  };

  return (
    <div className="select-none">
      {/* Trilho interativo */}
      <div
        ref={trackRef}
        role="slider"
        tabIndex={0}
        aria-label="Tom da história"
        aria-valuemin={0}
        aria-valuemax={n - 1}
        aria-valuenow={index >= 0 ? index : undefined}
        aria-valuetext={selected ? selected.nome : "Nenhum tom definido"}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
        onKeyDown={handleKeyDown}
        className="relative h-12 cursor-pointer touch-none outline-none"
      >
        {/* Trilho */}
        <div
          className="absolute top-1/2 h-2.5 -translate-y-1/2 rounded-full border border-arcana-border-dim"
          style={{
            left: `${centerPct(0)}%`,
            right: `${100 - centerPct(n - 1)}%`,
            background: "rgba(8,8,15,0.65)",
            boxShadow: "inset 0 1px 3px rgba(0,0,0,0.6)",
          }}
        >
          {/* Espectro apagado (prévia do caminho inteiro) */}
          <div
            className="absolute inset-0 rounded-full"
            style={{ background: TRACK_GRADIENT, opacity: 0.22 }}
          />
          {/* Espectro aceso até o tom escolhido — clip mantém as cores alinhadas */}
          {selected && (
            <div
              className="absolute inset-0 rounded-full transition-[clip-path] duration-200"
              style={{
                background: TRACK_GRADIENT,
                clipPath: `inset(0 ${100 - (index / (n - 1)) * 100}% 0 0 round 9999px)`,
                boxShadow: "0 0 10px rgba(209,171,85,0.35)",
              }}
            />
          )}
        </div>

        {/* Marcas de parada (losangos) */}
        {TONES.map((tone, i) => (
          <span
            key={tone.id}
            aria-hidden
            className="absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 border transition-colors"
            style={{
              left: `${centerPct(i)}%`,
              borderColor:
                index >= i ? "rgba(245,212,120,0.9)" : "var(--color-arcana-border)",
              background: index >= i ? STOP_COLORS[i] : "var(--color-arcana-surface-2)",
            }}
          />
        ))}

        {/* Cursor (losango dourado) */}
        {selected && (
          <span
            aria-hidden
            className="absolute top-1/2 h-[18px] w-[18px] -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[2px] transition-[left] duration-200"
            style={{
              left: `${centerPct(index)}%`,
              background: "linear-gradient(180deg, #f5d478, #bd9540)",
              border: "1px solid rgba(255,235,180,0.7)",
              boxShadow:
                "0 0 14px rgba(209,171,85,0.55), 0 2px 6px rgba(0,0,0,0.55)",
            }}
          />
        )}
      </div>

      {/* Rótulos clicáveis, alinhados às paradas */}
      <div className="grid" style={{ gridTemplateColumns: `repeat(${n}, 1fr)` }}>
        {TONES.map((tone, i) => (
          <button
            key={tone.id}
            type="button"
            onClick={() => onChange(tone.id)}
            className={[
              "px-1 py-1 text-center font-cinzel text-[10px] uppercase tracking-[0.18em] transition-colors",
              i === index
                ? "font-bold text-arcana-gold-bright"
                : "text-arcana-text-dim hover:text-arcana-text",
            ].join(" ")}
          >
            {tone.nome}
          </button>
        ))}
      </div>

      {/* Leitura do tom escolhido */}
      <div className="mt-2 flex min-h-[2.25rem] items-start justify-between gap-3">
        <p className="font-crimson text-sm italic text-arcana-text-dim">
          {selected
            ? selected.descricao
            : "Arraste o cursor ou toque numa parada para definir a intensidade da campanha."}
        </p>
        {selected && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="shrink-0 font-cinzel text-[10px] uppercase tracking-[0.2em] text-arcana-text-dim transition-colors hover:text-arcana-gold"
          >
            Limpar
          </button>
        )}
      </div>
    </div>
  );
}
