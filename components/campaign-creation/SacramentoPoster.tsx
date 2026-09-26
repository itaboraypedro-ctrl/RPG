"use client";

import { useCallback, useRef, useState } from "react";
import { SACRAMENTO_META } from "@/lib/rulesets/sacramento/meta";

const TAGS = ["Época 1880", "Testes em 1d6", "Cartas e Sina", "Trilhas de redenção", "Duelos de pôquer", "Bando e Base"];

// Brasas determinísticas (sem Math.random → sem mismatch de hidratação).
const EMBERS = Array.from({ length: 14 }, (_, i) => ({
  left: `${(i * 7.3 + 4) % 100}%`,
  delay: `${(i * 0.9) % 7}s`,
  duration: `${6 + (i % 5)}s`,
  size: 1 + (i % 3),
}));

/**
 * Capa oficial do Sacramento na escolha do modelo.
 * Camadas com profundidade: capa (paralaxe + zoom lento) → sol pulsando → brasas
 * → véus de contraste → logo (paralaxe oposta + brilho que atravessa as letras).
 * Clique = seleção com "punch" de zoom, clarão dourado e selo carimbado.
 */
export function SacramentoPoster({
  selected,
  onSelect,
}: {
  selected: boolean;
  onSelect: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const frame = useRef<number | null>(null);
  // Muda a cada clique para reiniciar as animações de impacto.
  const [impacto, setImpacto] = useState(0);

  const mover = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const mx = ((e.clientX - r.left) / r.width) * 2 - 1;
    const my = ((e.clientY - r.top) / r.height) * 2 - 1;
    if (frame.current) cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      el.style.setProperty("--mx", mx.toFixed(3));
      el.style.setProperty("--my", my.toFixed(3));
    });
  }, []);

  const sair = useCallback(() => {
    ref.current?.style.setProperty("--mx", "0");
    ref.current?.style.setProperty("--my", "0");
  }, []);

  return (
    <button
      ref={ref}
      type="button"
      onClick={() => {
        setImpacto((n) => n + 1);
        onSelect();
      }}
      onPointerMove={mover}
      onPointerLeave={sair}
      aria-pressed={selected}
      aria-label={`${SACRAMENTO_META.nome} — ${selected ? "selecionado" : "selecionar modelo"}`}
      data-selected={selected}
      className="sacra-poster group block w-full overflow-hidden rounded-2xl text-left"
    >
      {/* ── Palco da capa ── */}
      <div className="relative aspect-square overflow-hidden sm:aspect-[16/9]">
        <div key={`capa-${impacto}`} className={`sacra-layer-cover absolute -inset-[4%] ${impacto > 0 ? "sacra-punch" : ""}`}>
          <picture>
            <source media="(min-width: 640px)" srcSet="/story/sacramento/capa-larga.webp" />
            <img
              src="/story/sacramento/capa-quadrada.webp"
              alt="Cavaleiro diante de uma igreja em ruínas ao pôr do sol — capa oficial do Sacramento RPG"
              className="h-full w-full object-cover"
              draggable={false}
            />
          </picture>
        </div>

        {/* Sol respirando atrás da igreja */}
        <div aria-hidden className="sacra-sun pointer-events-none absolute" />

        {/* Brasas subindo do chão */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          {EMBERS.map((e, i) => (
            <span
              key={i}
              className="arcana-ember"
              style={{ left: e.left, width: e.size + 1, height: e.size + 1, animationDelay: e.delay, animationDuration: e.duration }}
            />
          ))}
        </div>

        {/* Véus: topo para a logo, base para o texto */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(7,7,13,0.55) 0%, rgba(7,7,13,0) 38%, rgba(7,7,13,0) 55%, rgba(7,7,13,0.92) 100%), radial-gradient(ellipse 120% 90% at 50% 45%, transparent 55%, rgba(7,7,13,0.65) 100%)",
          }}
        />

        {/* Logo com paralaxe oposta e brilho atravessando as letras */}
        <div className="sacra-layer-logo pointer-events-none absolute left-1/2 top-[7%] w-[78%] sm:top-[6%] sm:w-[46%]">
          <div key={`logo-${impacto}`} className={`relative ${impacto > 0 ? "sacra-logo-punch" : "sacra-logo-in"}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/story/sacramento/logo.webp" alt="Sacramento RPG" className="sacra-logo-img w-full" draggable={false} />
            <div aria-hidden className="sacra-logo-shine absolute inset-0" />
          </div>
        </div>

        {/* Clarão dourado do clique */}
        {impacto > 0 && <div key={`flash-${impacto}`} aria-hidden className="sacra-flash pointer-events-none absolute inset-0" />}

        {/* Rodapé da capa */}
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 sm:p-6">
          <div className="min-w-0">
            <p className="font-cinzel text-[10px] uppercase tracking-[0.4em] text-arcana-gold-bright" style={{ textShadow: "0 1px 6px rgba(0,0,0,0.9)" }}>
              {SACRAMENTO_META.subtitulo}
            </p>
            <p className="mt-1 hidden font-crimson text-base italic text-white sm:block" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.95)" }}>
              Faroeste à mineira · sobrevivência e redenção
            </p>
          </div>
          {selected ? (
            <span key={`selo-${impacto}`} className="sacra-seal shrink-0 rounded-full border-2 border-arcana-gold-bright bg-[rgba(7,7,13,0.85)] px-4 py-1.5 font-cinzel text-[11px] font-bold uppercase tracking-[0.3em] text-arcana-gold-bright">
              ✓ Selecionado
            </span>
          ) : (
            <span className="shrink-0 rounded-full border border-white/70 bg-[rgba(7,7,13,0.75)] px-4 py-1.5 font-cinzel text-[10px] uppercase tracking-[0.3em] text-white transition-colors group-hover:border-arcana-gold-bright group-hover:text-arcana-gold-bright">
              Escolher
            </span>
          )}
        </div>
      </div>

      {/* ── Ficha do modelo ── */}
      <div className="space-y-3 border-t border-arcana-gold/25 bg-[rgba(12,10,16,0.96)] p-5 sm:p-6">
        <p className="font-crimson text-base leading-relaxed text-arcana-text">{SACRAMENTO_META.resumo}</p>
        <div className="flex flex-wrap gap-2">
          {TAGS.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-arcana-gold/40 bg-arcana-gold/[0.07] px-3 py-1 font-cinzel text-[10px] uppercase tracking-[0.18em] text-arcana-text"
            >
              {tag}
            </span>
          ))}
        </div>
        <p className="font-crimson text-xs italic text-arcana-text-dim">Fonte: {SACRAMENTO_META.fonte}</p>
      </div>
    </button>
  );
}
