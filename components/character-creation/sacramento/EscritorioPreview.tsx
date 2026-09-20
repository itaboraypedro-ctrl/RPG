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
  /** Recado do retratista dentro da moldura (retrato forjado ainda não chegou). */
  retratoAviso?: string;
};

type Layer = { url: string; key: number };

/*
 * O escritório do velho oeste: um único PNG (cena.webp) com duas aberturas
 * transparentes medidas no pixel — o retrato entra ATRÁS da moldura grande
 * e o cenário animado passa ATRÁS do vidro sujo da janela. Sobre a cena,
 * a lamparina ganha chama viva e o papel pregado recebe nome e conceito.
 * Coordenadas em % da cena de 1024×1536 (medidas por varredura de alpha).
 */
const MOLDURA = { left: "34.4%", top: "28.8%", width: "34.2%", height: "40.8%" } as const;
const JANELA = { left: "67.6%", top: "0%", width: "32.4%", height: "32.6%" } as const;
const PAPEL = { left: "2.5%", top: "42.5%", width: "22.5%" } as const;
/** Placa de ferro com o nome, pendurada sob a moldura (aspecto real 4.104:1). */
const PLACA = { left: "34.5%", top: "71.6%", width: "34%" } as const;

export function EscritorioPreview({
  imageUrl,
  characterName,
  subtitle,
  stats,
  ambientImage = "/story/places/deserto-de-mucuri.webp",
  retratoAviso,
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
          {retratoAviso ? (
            // O retrato forjado ainda não chegou: bilhete do retratista pregado na moldura vazia.
            <div className="absolute inset-0 flex items-center justify-center p-[8%]">
              <div className="aviso-revelacao relative w-[82%]" style={{ aspectRatio: "4 / 5" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/story/escritorio/papel.webp" alt="" aria-hidden
                  className="absolute inset-0 h-full w-full select-none" />
                <div className="absolute flex flex-col items-center justify-center gap-[6%] text-center"
                  style={{ left: "16%", right: "14%", top: "20%", bottom: "18%", transform: "rotate(-3.5deg)" }}>
                  <p className="font-crimson italic leading-snug"
                    style={{ fontSize: "clamp(9px, 2.2cqw, 14px)", color: "#5c4229" }}>
                    {retratoAviso}
                  </p>
                  <p className="font-cinzel uppercase leading-none"
                    style={{ fontSize: "clamp(6px, 1.3cqw, 10px)", letterSpacing: "0.2em", color: "#4a3320" }}>
                    — O retratista
                  </p>
                </div>
              </div>
            </div>
          ) : layers.length === 0 ? (
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

        {/* ── Camada 4: placa de ferro com o nome, sob a moldura ── */}
        {characterName && (
          <div className="pointer-events-none absolute" style={{ ...PLACA, aspectRatio: "4.104 / 1" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/story/escritorio/placa.webp" alt="" aria-hidden
              className="absolute inset-0 h-full w-full select-none" />
            <div className="absolute flex items-center justify-center text-center"
              style={{ left: "12%", right: "12%", top: "14%", bottom: "14%" }}>
              <p className="font-rye truncate leading-none"
                style={{
                  fontSize: "clamp(10px, 3.1cqw, 21px)",
                  letterSpacing: "0.06em",
                  color: "#2c1a09",
                  textShadow: "0 1px 0 rgba(255,224,150,0.4), 0 -1px 1px rgba(30,16,4,0.55)",
                }}>
                {characterName}
              </p>
            </div>
          </div>
        )}

        {/* ── Camada 5: papel pregado com o conceito ── */}
        {subtitle && (
          <div className="pointer-events-none absolute" style={{ ...PAPEL, aspectRatio: "4 / 5" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/story/escritorio/papel.webp" alt="" aria-hidden
              className="absolute inset-0 h-full w-full select-none" />
            <div className="absolute flex flex-col items-center justify-center text-center"
              style={{ left: "16%", right: "14%", top: "22%", bottom: "20%", transform: "rotate(-3.5deg)" }}>
              <p className="font-crimson italic leading-snug"
                style={{
                  fontSize: "clamp(9px, 2.4cqw, 15px)",
                  color: "#5c4229",
                  display: "-webkit-box",
                  WebkitLineClamp: 5,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}>
                {subtitle}
              </p>
            </div>
          </div>
        )}

        {/* ── Camada 6: régua de ferro com roletas de cadeado (a ficha) ──
            Sobre o tampo da mesa, acima da plaqueta "SACRAMENTO · 1880"
            (que fica livre no rodapé). Cada valor vive numa janelinha de
            roleta: número gravado, vizinhos meio visíveis, e gira ao mudar. */}
        {stats && stats.length > 0 && (
          <div className="absolute" style={{ left: "17%", width: "66%", top: "82.2%", height: "8.8%" }}>
            {/* A régua de ferro real (12.05:1) atravessa atrás das janelinhas */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/story/escritorio/regua.webp" alt="" aria-hidden
              className="absolute left-0 w-full select-none"
              style={{ top: "14%", aspectRatio: "12.049 / 1", filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.6))" }} />
            {/* Seis janelinhas de roleta parafusadas sobre a régua */}
            <div className="absolute flex items-start justify-between"
              style={{ left: "5.5%", right: "5.5%", top: 0, height: "70%" }}>
              {stats.map((s) => {
                const n = parseInt(s.value, 10);
                const temVizinhos = !Number.isNaN(n);
                return (
                  <div key={s.label} className="relative h-full" style={{ aspectRatio: "0.598 / 1" }}>
                    {/* Cilindro escuro atrás da abertura vazada (24.6/22.3 · 49.8×55) */}
                    <div className="absolute overflow-hidden"
                      style={{
                        left: "23%", top: "21%", width: "53%", height: "58%",
                        background:
                          "linear-gradient(180deg, #0d0803 0%, #201507 30%, #2c1f0e 50%, #201507 70%, #0d0803 100%)",
                      }}>
                      <div key={s.value} className="dial-roll absolute inset-0">
                        {temVizinhos && (
                          <span aria-hidden className="absolute inset-x-0 flex justify-center font-rye leading-none"
                            style={{ top: "-26%", fontSize: "clamp(8px, 1.7cqw, 13px)", color: "rgba(232,207,154,0.3)" }}>
                            {n - 1}
                          </span>
                        )}
                        <span className="absolute inset-0 flex items-center justify-center font-rye leading-none"
                          style={{
                            fontSize: "clamp(11px, 2.4cqw, 19px)",
                            color: "#e8cf9a",
                            textShadow: "0 1px 1px rgba(0,0,0,0.9), 0 0 6px rgba(232,207,154,0.25)",
                          }}>
                          {s.value}
                        </span>
                        {temVizinhos && (
                          <span aria-hidden className="absolute inset-x-0 flex justify-center font-rye leading-none"
                            style={{ bottom: "-26%", fontSize: "clamp(8px, 1.7cqw, 13px)", color: "rgba(232,207,154,0.3)" }}>
                            {n + 1}
                          </span>
                        )}
                      </div>
                    </div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/story/escritorio/janelinha.webp" alt="" aria-hidden
                      className="absolute inset-0 h-full w-full select-none" />
                    {/* Rótulo gravado abaixo da régua */}
                    <span className="absolute inset-x-[-40%] flex justify-center font-cinzel uppercase leading-none"
                      style={{
                        top: "108%",
                        fontSize: "clamp(5px, 1.1cqw, 9px)",
                        letterSpacing: "0.12em",
                        color: "#c9ad7a",
                        textShadow: "0 1px 2px rgba(0,0,0,0.85)",
                      }}>
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
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
        .aviso-revelacao {
          animation: avisoPulsa 3.4s ease-in-out infinite;
        }
        @keyframes avisoPulsa {
          0%,
          100% {
            opacity: 0.92;
          }
          50% {
            opacity: 1;
          }
        }
        .dial-roll {
          animation: dialRoll 420ms cubic-bezier(0.22, 1.4, 0.36, 1) both;
          will-change: transform;
        }
        @keyframes dialRoll {
          from {
            transform: translateY(-34%);
          }
          to {
            transform: translateY(0);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .janela-cena,
          .retrato-enter,
          .retrato-sweep,
          .dial-roll,
          .aviso-revelacao {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
