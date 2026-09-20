"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type StatChip = { label: string; value: string };

type Props = {
  imageUrl: string | null;
  characterName?: string;
  subtitle?: string;
  /** Plaqueta opcional de valores derivados (etapas de ficha). */
  stats?: StatChip[];
};

type Layer = { url: string; key: number };

export function SacramentoPreview({ imageUrl, characterName, subtitle, stats }: Props) {
  // Pilha de duas camadas: a nova entra por cima com crossfade + varredura de
  // luz; a anterior fica por baixo até a transição terminar (sem flash).
  const [layers, setLayers] = useState<Layer[]>(imageUrl ? [{ url: imageUrl, key: 0 }] : []);
  const keyRef = useRef(1);

  useEffect(() => {
    if (!imageUrl) return;
    setLayers((prev) => {
      if (prev.length > 0 && prev[prev.length - 1].url === imageUrl) return prev;
      return [...prev.slice(-1), { url: imageUrl, key: keyRef.current++ }];
    });
  }, [imageUrl]);

  const settle = (key: number) => {
    setLayers((prev) => {
      const top = prev[prev.length - 1];
      return top && top.key === key ? [top] : prev;
    });
  };

  return (
    <div className="w-full max-w-[300px] mx-auto space-y-5">
      <div className="relative">
        <div
          className="absolute -inset-2 rounded-2xl pointer-events-none"
          style={{ border: "1px solid rgba(209, 171, 85, 0.12)" }}
        />
        <div
          className="absolute -inset-1 rounded-xl pointer-events-none"
          style={{ border: "1px solid rgba(209, 171, 85, 0.2)" }}
        />

        <div
          className="relative aspect-[1/1] w-full overflow-hidden rounded-xl"
          style={{
            background: "var(--color-arcana-surface)",
            border: "1px solid var(--color-arcana-border)",
            boxShadow: "0 8px 48px rgba(0,0,0,0.7), inset 0 0 0 1px rgba(255,255,255,0.03)",
          }}
        >
          {layers.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
              <svg viewBox="0 0 60 90" className="w-16 opacity-20" aria-hidden>
                <circle cx="30" cy="18" r="10" fill="var(--color-arcana-gold)" />
                <path d="M16 34 Q30 28 44 34 L46 62 Q30 68 14 62 Z" fill="var(--color-arcana-gold)" />
                <rect x="22" y="64" width="6" height="22" rx="3" fill="var(--color-arcana-gold)" />
                <rect x="32" y="64" width="6" height="22" rx="3" fill="var(--color-arcana-gold)" />
              </svg>
              <p className="font-crimson text-sm italic text-arcana-text-dim">
                Escolha os traços para ver o retrato
              </p>
            </div>
          ) : (
            layers.map((layer, i) => {
              const isTop = i === layers.length - 1;
              const entering = isTop && layers.length > 1;
              return (
                <div
                  key={layer.key}
                  className={entering ? "portrait-enter absolute inset-0" : "absolute inset-0"}
                  onAnimationEnd={() => settle(layer.key)}
                >
                  <Image
                    src={layer.url}
                    alt={
                      isTop
                        ? characterName
                          ? `Retrato de ${characterName}`
                          : "Retrato do personagem"
                        : ""
                    }
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 300px"
                    priority={isTop}
                  />
                  {entering && <div className="light-sweep absolute inset-0 pointer-events-none" />}
                </div>
              );
            })
          )}

          <div
            className="absolute inset-x-0 bottom-0 h-1/5 pointer-events-none"
            style={{ background: "linear-gradient(180deg, transparent, rgba(7,7,13,0.7))" }}
          />
        </div>
      </div>

      {(characterName || subtitle) && (
        <div className="text-center space-y-1">
          {characterName && (
            <h3 className="font-cinzel uppercase tracking-[0.2em] text-arcana-text text-lg">
              {characterName}
            </h3>
          )}
          {subtitle && (
            <p className="font-cinzel text-[10px] uppercase tracking-[0.3em] text-arcana-gold">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {stats && stats.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-xl px-2 py-2 text-center"
              style={{
                background: "rgba(27,27,42,0.72)",
                border: "1px solid rgba(209,171,85,0.22)",
              }}
            >
              <p className="font-cinzel text-lg leading-none text-arcana-gold-bright">{s.value}</p>
              <p className="font-cinzel text-[10px] uppercase tracking-[0.12em] text-arcana-text-dim mt-1">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .portrait-enter {
          animation: portraitFade 240ms cubic-bezier(0.22, 1, 0.36, 1) both;
          will-change: opacity, transform;
        }
        @keyframes portraitFade {
          from {
            opacity: 0;
            transform: scale(1.015);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .light-sweep {
          background: linear-gradient(
            105deg,
            transparent 38%,
            rgba(245, 212, 120, 0.1) 48%,
            rgba(255, 240, 200, 0.16) 50%,
            rgba(245, 212, 120, 0.1) 52%,
            transparent 62%
          );
          animation: lightSweep 460ms cubic-bezier(0.4, 0, 0.2, 1) both;
          will-change: transform;
        }
        @keyframes lightSweep {
          from {
            transform: translateX(-70%);
          }
          to {
            transform: translateX(70%);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .portrait-enter,
          .light-sweep {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
