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
  /** Cena de fundo atrás do retrato (padrão: deserto; lojas trocam pela sua). */
  ambientImage?: string;
  /** Nível do personagem — aparece num medalhão na moldura. */
  nivel?: number;
};

type Layer = { url: string; key: number };

export function SacramentoPreview({
  imageUrl,
  characterName,
  subtitle,
  stats,
  ambientImage = "/story/places/deserto-de-mucuri.webp",
  nivel,
}: Props) {
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
    <div className="relative w-full max-w-[380px] mx-auto space-y-5">
      {/* Cenário ambiente atrás do retrato */}
      <div aria-hidden className="ambient absolute -inset-x-20 -top-16 -bottom-10 pointer-events-none">
        <div
          key={ambientImage}
          className="ambient-scene absolute inset-0"
          style={{
            backgroundImage: `url(${ambientImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center 30%",
            opacity: 0.3,
            filter: "blur(2px) saturate(0.9)",
            maskImage: "radial-gradient(78% 68% at 50% 44%, black 38%, transparent 82%)",
            WebkitMaskImage: "radial-gradient(78% 68% at 50% 44%, black 38%, transparent 82%)",
          }}
        />
        <div className="aura absolute inset-x-6 top-6 bottom-16" />
        {[
          { l: "12%", t: "18%", s: 3, d: "0s", dur: "9s" },
          { l: "84%", t: "26%", s: 2, d: "1.4s", dur: "11s" },
          { l: "22%", t: "64%", s: 2.5, d: "2.8s", dur: "10s" },
          { l: "70%", t: "74%", s: 2, d: "0.8s", dur: "12s" },
          { l: "8%", t: "44%", s: 2, d: "3.6s", dur: "13s" },
          { l: "92%", t: "52%", s: 2.5, d: "2s", dur: "9.5s" },
          { l: "48%", t: "10%", s: 2, d: "4.2s", dur: "11.5s" },
          { l: "60%", t: "88%", s: 3, d: "1s", dur: "10.5s" },
        ].map((p, i) => (
          <span
            key={i}
            className="particle absolute rounded-full"
            style={{
              left: p.l,
              top: p.t,
              width: p.s,
              height: p.s,
              animationDelay: p.d,
              animationDuration: p.dur,
            }}
          />
        ))}
      </div>

      <div className="relative">
        <div
          className="absolute -inset-2 rounded-2xl pointer-events-none"
          style={{ border: "1px solid rgba(209, 171, 85, 0.12)" }}
        />
        <div
          className="absolute -inset-1 rounded-xl pointer-events-none"
          style={{ border: "1px solid rgba(209, 171, 85, 0.2)" }}
        />
        {/* Cantos da moldura — ouro sobre cobre, identidade velho oeste */}
        {(
          [
            ["-top-2 -left-2", "borderTop", "borderLeft", "rounded-tl-2xl"],
            ["-top-2 -right-2", "borderTop", "borderRight", "rounded-tr-2xl"],
            ["-bottom-2 -left-2", "borderBottom", "borderLeft", "rounded-bl-2xl"],
            ["-bottom-2 -right-2", "borderBottom", "borderRight", "rounded-br-2xl"],
          ] as const
        ).map(([pos, b1, b2, round]) => (
          <span key={pos} aria-hidden className={`absolute ${pos} w-7 h-7 pointer-events-none z-10`}>
            <span
              className={`absolute inset-0 ${round}`}
              style={{ [b1]: "2px solid #d1ab55", [b2]: "2px solid #d1ab55" }}
            />
            <span
              className={`absolute inset-[3px] ${round}`}
              style={{
                [b1]: "1.5px solid rgba(184,115,51,0.85)",
                [b2]: "1.5px solid rgba(184,115,51,0.85)",
              }}
            />
          </span>
        ))}
        {/* Medalhão de nível */}
        {typeof nivel === "number" && (
          <div className="absolute left-1/2 -bottom-4 -translate-x-1/2 z-20 pointer-events-none">
            <div
              className="w-9 h-9 rotate-45 rounded-[7px] flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #f0cc6a 0%, #d1ab55 45%, #b87333 100%)",
                border: "1.5px solid rgba(255, 235, 180, 0.75)",
                boxShadow:
                  "0 3px 10px rgba(0,0,0,0.65), 0 0 16px rgba(209,171,85,0.4), inset 0 1px 0 rgba(255,245,215,0.5)",
              }}
            >
              <span
                className="-rotate-45 font-cinzel text-base font-bold leading-none"
                style={{ color: "#1c1206", textShadow: "0 1px 0 rgba(255,240,200,0.4)" }}
              >
                {nivel}
              </span>
            </div>
          </div>
        )}

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
                    sizes="(max-width: 1024px) 100vw, 380px"
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
        .ambient-scene {
          animation: ambientIn 700ms ease-out both;
        }
        @keyframes ambientIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 0.3;
          }
        }
        .aura {
          background: radial-gradient(
            60% 55% at 50% 45%,
            rgba(209, 171, 85, 0.18),
            rgba(92, 36, 29, 0.09) 55%,
            transparent 78%
          );
          animation: auraPulse 6s ease-in-out infinite;
          will-change: opacity, transform;
        }
        @keyframes auraPulse {
          0%,
          100% {
            opacity: 0.55;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
        }
        .particle {
          background: #f0cc6a;
          box-shadow: 0 0 6px 1px rgba(245, 212, 120, 0.55);
          opacity: 0;
          animation-name: particleFloat;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
          will-change: opacity, transform;
        }
        @keyframes particleFloat {
          0%,
          100% {
            opacity: 0;
            transform: translateY(8px);
          }
          25% {
            opacity: 0.7;
          }
          50% {
            opacity: 0.35;
            transform: translateY(-14px);
          }
          75% {
            opacity: 0.65;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .aura,
          .particle {
            animation: none;
          }
          .particle {
            opacity: 0.3;
          }
        }
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
