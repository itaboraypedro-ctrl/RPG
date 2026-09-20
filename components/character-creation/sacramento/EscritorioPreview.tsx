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
  /** Cena vista pela janela (padrão: deserto; lojas e estúdio trocam pela sua). */
  ambientImage?: string;
  /** Compatibilidade com o SacramentoPreview — o nível já vem nos stats. */
  nivel?: number;
};

type Layer = { url: string; key: number };

/*
 * O escritório do velho oeste: um único PNG (cena.webp) com duas aberturas
 * transparentes medidas no pixel — o retrato entra ATRÁS da moldura grande
 * e o cenário animado passa ATRÁS do vidro sujo da janela. Sobre a cena,
 * a lamparina ganha chama viva e o papel pregado recebe nome e conceito.
 * Coordenadas em % da cena de 1024×1536 (medidas por varredura de alpha).
 */
const MOLDURA = { left: "28.9%", top: "22.7%", width: "44.4%", height: "44.7%" } as const;
const JANELA = { left: "61.4%", top: "3.7%", width: "36.8%", height: "26.8%" } as const;
const LAMPARINA = { left: "71%", width: "27%", bottom: "17.5%" } as const;
const PAPEL = { left: "72.5%", top: "31.5%", width: "26.5%" } as const;

export function EscritorioPreview({
  imageUrl,
  characterName,
  subtitle,
  stats,
  ambientImage = "/story/places/deserto-de-mucuri.webp",
}: Props) {
  // Pilha de duas camadas: a nova entra por cima com crossfade; a anterior
  // fica por baixo até a transição terminar (sem flash) — padrão do preview antigo.
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
    // container-type: size → a cena mede a coluna inteira (largura E altura)
    // e cresce até o limite que couber, em qualquer dispositivo.
    <div className="flex h-full w-full items-center justify-center" style={{ containerType: "size" }}>
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl"
        style={{
          width: "min(100cqw, 66.67cqh, 720px)",
          boxShadow: "0 12px 56px rgba(0,0,0,0.75)",
          // A cena também é container: os textos internos escalam com ela (cqw).
          containerType: "size",
        }}>

        {/* ── Camada 1: o mundo lá fora, atrás do vidro sujo ── */}
        <div className="absolute overflow-hidden" style={JANELA}>
          <div
            key={ambientImage}
            className="janela-cena absolute inset-y-0"
            style={{
              width: "170%",
              backgroundImage: `url(${ambientImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center 35%",
              filter: "brightness(0.9) saturate(0.95)",
            }}
          />
        </div>

        {/* ── Camada 2: o personagem dentro da moldura ── */}
        <div className="absolute overflow-hidden" style={{ ...MOLDURA, background: "#151019" }}>
          {layers.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-4 text-center">
              <svg viewBox="0 0 60 90" className="w-14 opacity-25" aria-hidden>
                <circle cx="30" cy="18" r="10" fill="#d1ab55" />
                <path d="M16 34 Q30 28 44 34 L46 62 Q30 68 14 62 Z" fill="#d1ab55" />
                <rect x="22" y="64" width="6" height="22" rx="3" fill="#d1ab55" />
                <rect x="32" y="64" width="6" height="22" rx="3" fill="#d1ab55" />
              </svg>
              <p className="font-crimson text-xs italic text-arcana-text-dim">
                Escolha os traços para revelar o retrato
              </p>
            </div>
          ) : (
            layers.map((layer, i) => {
              const isTop = i === layers.length - 1;
              const entering = isTop && layers.length > 1;
              return (
                <div
                  key={layer.key}
                  className={entering ? "retrato-enter absolute inset-0" : "absolute inset-0"}
                  onAnimationEnd={() => settle(layer.key)}
                >
                  <Image
                    src={layer.url}
                    alt={isTop ? (characterName ? `Retrato de ${characterName}` : "Retrato do personagem") : ""}
                    fill
                    className="object-cover object-top"
                    sizes="(max-width: 1024px) 50vw, 220px"
                    priority={isTop}
                    unoptimized={layer.url.startsWith("data:")}
                  />
                  {entering && <div className="retrato-sweep absolute inset-0 pointer-events-none" />}
                </div>
              );
            })
          )}
          {/* Vinheta suave para o retrato assentar na moldura */}
          <div aria-hidden className="pointer-events-none absolute inset-0"
            style={{ boxShadow: "inset 0 0 34px rgba(7,7,13,0.55)" }} />
        </div>

        {/* ── Camada 3: o escritório (recorta moldura e janela) ── */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/story/escritorio/cena.webp" alt="" aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full select-none" />

        {/* ── Camada 4: lamparina com chama viva ── */}
        <div className="pointer-events-none absolute" style={{ ...LAMPARINA, aspectRatio: "1 / 1" }}>
          {/* Chama dentro da cúpula */}
          <div className="chama absolute" style={{ left: "44%", top: "33%", width: "12%", height: "17%" }} />
          <div className="chama-nucleo absolute" style={{ left: "46.5%", top: "38%", width: "7%", height: "10%" }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/story/escritorio/lamparina.webp" alt="" aria-hidden
            className="absolute inset-0 h-full w-full select-none" />
        </div>
        {/* Luz quente da lamparina banhando a cena */}
        <div aria-hidden className="luz-lamparina pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(42% 30% at 84% 68%, rgba(255,184,90,0.28), rgba(255,160,64,0.1) 45%, transparent 72%)",
            mixBlendMode: "screen",
          }} />

        {/* ── Camada 5: papel pregado com nome e conceito ── */}
        <div className="pointer-events-none absolute" style={{ ...PAPEL, aspectRatio: "4 / 5" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/story/escritorio/papel.webp" alt="" aria-hidden
            className="absolute inset-0 h-full w-full select-none" />
          {(characterName || subtitle) && (
            <div className="absolute flex flex-col items-center justify-center text-center"
              style={{ left: "16%", right: "14%", top: "22%", bottom: "20%", transform: "rotate(-3.5deg)" }}>
              {characterName && (
                <p className="font-cinzel uppercase leading-tight"
                  style={{
                    fontSize: "clamp(9px, 2.6cqw, 17px)",
                    letterSpacing: "0.12em",
                    color: "#4a3320",
                    textShadow: "0 1px 0 rgba(255,240,210,0.35)",
                  }}>
                  {characterName}
                </p>
              )}
              {characterName && subtitle && (
                <div className="my-1.5 h-px w-2/3" style={{ background: "rgba(74,51,32,0.4)" }} />
              )}
              {subtitle && (
                <p className="font-crimson italic leading-snug"
                  style={{
                    fontSize: "clamp(9px, 2.4cqw, 15px)",
                    color: "#5c4229",
                    display: "-webkit-box",
                    WebkitLineClamp: 4,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}>
                  {subtitle}
                </p>
              )}
            </div>
          )}
        </div>

        {/* ── Camada 6: placas de latão com a ficha ── */}
        {stats && stats.length > 0 && (
          <div className="absolute flex items-stretch justify-center gap-[1.5%] px-[6%]"
            style={{ left: 0, right: 0, bottom: "3.2%", height: "6.8%" }}>
            {stats.map((s) => (
              <div key={s.label}
                className="flex min-w-0 flex-1 flex-col items-center justify-center rounded-[3px]"
                style={{
                  background: "linear-gradient(180deg, #b98f4a 0%, #96702f 45%, #7a5a26 100%)",
                  border: "1px solid rgba(58,40,12,0.9)",
                  boxShadow:
                    "inset 0 1px 0 rgba(255,226,160,0.55), inset 0 -1px 2px rgba(40,24,6,0.6), 0 2px 6px rgba(0,0,0,0.55)",
                }}>
                <span className="font-cinzel font-bold leading-none"
                  style={{ fontSize: "clamp(10px, 3cqw, 19px)", color: "#241505", textShadow: "0 1px 0 rgba(255,235,180,0.4)" }}>
                  {s.value}
                </span>
                <span className="font-cinzel uppercase leading-none"
                  style={{ fontSize: "clamp(6px, 1.5cqw, 10px)", letterSpacing: "0.08em", color: "#3a2810", marginTop: "2px" }}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .janela-cena {
          animation: janelaPan 46s ease-in-out infinite alternate;
          will-change: transform;
        }
        @keyframes janelaPan {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-41%);
          }
        }
        .retrato-enter {
          animation: retratoFade 240ms cubic-bezier(0.22, 1, 0.36, 1) both;
          will-change: opacity, transform;
        }
        @keyframes retratoFade {
          from {
            opacity: 0;
            transform: scale(1.02);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .retrato-sweep {
          background: linear-gradient(
            105deg,
            transparent 38%,
            rgba(245, 212, 120, 0.12) 48%,
            rgba(255, 240, 200, 0.18) 50%,
            rgba(245, 212, 120, 0.12) 52%,
            transparent 62%
          );
          animation: retratoSweep 460ms cubic-bezier(0.4, 0, 0.2, 1) both;
          will-change: transform;
        }
        @keyframes retratoSweep {
          from {
            transform: translateX(-70%);
          }
          to {
            transform: translateX(70%);
          }
        }
        .chama {
          background: radial-gradient(
            50% 62% at 50% 78%,
            #fff6d8 0%,
            #ffd873 34%,
            #ff9f3d 62%,
            rgba(255, 120, 40, 0.25) 82%,
            transparent 100%
          );
          border-radius: 50% 50% 46% 54% / 62% 62% 38% 38%;
          filter: blur(1px);
          transform-origin: 50% 90%;
          animation: chamaDanca 2.8s ease-in-out infinite;
          will-change: transform, opacity;
        }
        .chama-nucleo {
          background: radial-gradient(50% 60% at 50% 70%, #fffdf4 0%, #ffe9a8 55%, transparent 100%);
          border-radius: 50% 50% 44% 56% / 64% 64% 36% 36%;
          filter: blur(0.5px);
          transform-origin: 50% 90%;
          animation: chamaDanca 2.1s ease-in-out infinite reverse;
        }
        @keyframes chamaDanca {
          0%,
          100% {
            transform: scaleY(1) scaleX(1) rotate(0deg);
            opacity: 0.95;
          }
          22% {
            transform: scaleY(1.12) scaleX(0.94) rotate(-2deg);
            opacity: 1;
          }
          48% {
            transform: scaleY(0.92) scaleX(1.05) rotate(1.5deg);
            opacity: 0.85;
          }
          74% {
            transform: scaleY(1.08) scaleX(0.96) rotate(-1deg);
            opacity: 1;
          }
        }
        .luz-lamparina {
          animation: luzRespira 5.5s ease-in-out infinite;
        }
        @keyframes luzRespira {
          0%,
          100% {
            opacity: 0.85;
          }
          40% {
            opacity: 1;
          }
          65% {
            opacity: 0.78;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .janela-cena,
          .retrato-enter,
          .retrato-sweep,
          .chama,
          .chama-nucleo,
          .luz-lamparina {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
