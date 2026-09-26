"use client";

// Peças visuais da munição. As artes vêm vazias (public/story/uso); as balas
// são desenhadas por cima nas posições medidas em cada imagem.

import type { Calibre } from "@/lib/rulesets/sacramento/itens-uso";

export const USO = (p: string) => `/story/uso/${p}.webp`;

const LATERAL: Record<Calibre, string> = {
  revolver: USO("municao/bala-revolver"),
  espingarda: USO("municao/cartucho-espingarda"),
  fuzil: USO("municao/cartucho-fuzil"),
};

/* eslint-disable @next/next/no-img-element */

function Culote({ gasto, className = "", style }: { gasto?: boolean; className?: string; style?: React.CSSProperties }) {
  return <img src={USO(gasto ? "municao/culote-deflagrado" : "municao/culote")} alt="" draggable={false} className={`absolute ${className}`} style={style} />;
}

/**
 * Tambor de 6 câmaras (centro 50%/48,6%, câmaras a 29,5% do centro, 1ª às 12h).
 * Câmara 0 é a que dispara; carregadas vêm em sentido horário a partir dela e as
 * cápsulas disparadas ficam no fim — girar −60° leva a próxima bala ao topo.
 */
export function Tambor({ carga, vazias, girando, total = 6 }: { carga: number; vazias: number; girando: boolean; total?: number }) {
  return (
    <div
      className="relative aspect-square w-full"
      style={{ transform: girando ? "rotate(-60deg)" : "rotate(0deg)", transition: girando ? "transform 0.18s cubic-bezier(0.3,0.7,0.4,1)" : "none" }}
    >
      <img src={USO("armas/tambor")} alt="Tambor" draggable={false} className="absolute inset-0 h-full w-full" />
      {Array.from({ length: total }, (_, k) => {
        const ang = ((k * 60 - 90) * Math.PI) / 180;
        const x = 50 + 29.5 * Math.cos(ang);
        const y = 48.6 + 29.5 * Math.sin(ang);
        const cheia = k < carga;
        const gasta = !cheia && k >= total - vazias;
        if (!cheia && !gasta) return null;
        return <Culote key={k} gasto={gasta} style={{ left: `${x}%`, top: `${y}%`, width: "23%", transform: "translate(-50%,-50%)" }} />;
      })}
    </div>
  );
}

/** Culatra de dois canos (centros 27,7%/29,8% e 71,6%/29,7%). Garrucha usa só um. */
export function Canos({ carga, total }: { carga: number; total: number }) {
  const canos = [
    { x: 27.7, y: 29.8 },
    { x: 71.6, y: 29.7 },
  ];
  return (
    <div className="relative aspect-square w-full">
      <img src={USO("armas/culatra-aberta")} alt="Culatra aberta" draggable={false} className="absolute inset-0 h-full w-full" />
      {canos.map((c, i) =>
        i >= total ? (
          <span key={i} className="absolute rounded-full bg-black/70" style={{ left: `${c.x}%`, top: `${c.y}%`, width: "36%", aspectRatio: "1", transform: "translate(-50%,-50%)" }} />
        ) : i < carga ? (
          <Culote key={i} style={{ left: `${c.x}%`, top: `${c.y}%`, width: "31%", transform: "translate(-50%,-50%)" }} />
        ) : null,
      )}
    </div>
  );
}

/** Carregador de pistola: bases empilhadas na janela lateral (x 52–62%, y 13–79%). */
export function Pente({ carga, total }: { carga: number; total: number }) {
  const passo = 66 / total;
  return (
    <div className="relative mx-auto aspect-[2/3] h-full max-h-72">
      <img src={USO("armas/carregador")} alt="Carregador" draggable={false} className="absolute inset-0 h-full w-full" />
      {Array.from({ length: carga }, (_, i) => (
        <Culote key={i} style={{ left: "57%", top: `${13 + passo * (i + 0.5)}%`, width: `${Math.min(9.5, passo * 1.45)}%`, transform: "translate(-50%,-50%)" }} />
      ))}
    </div>
  );
}

/** Fuzil e carabina: fila de cartuchos (cheios e vazios). */
export function Tubo({ carga, total, calibre }: { carga: number; total: number; calibre: Calibre }) {
  return (
    <div className="flex h-full items-end justify-center gap-1.5">
      {Array.from({ length: total }, (_, i) => (
        <img
          key={i}
          src={LATERAL[calibre]}
          alt=""
          draggable={false}
          className={`h-28 w-auto transition-opacity ${i < carga ? "opacity-100" : "opacity-20 grayscale"}`}
        />
      ))}
    </div>
  );
}

/** Caixa aberta vista de cima; mostra a caixa em uso (fundo interno x 17–87%, y 42–82%). */
export function Caixa({ balas, porCaixa }: { balas: number; porCaixa: number }) {
  const naAberta = balas === 0 ? 0 : balas % porCaixa || porCaixa;
  const [lin, col] = porCaixa === 12 ? [3, 4] : [2, 3];
  return (
    <div className="relative aspect-square w-full">
      <img src={USO("guarda/caixa-aberta")} alt="Caixa de munição" draggable={false} className="absolute inset-0 h-full w-full" />
      {Array.from({ length: naAberta }, (_, i) => {
        const r = Math.floor(i / col);
        const c = i % col;
        const x = 17 + (70 / col) * (c + 0.5);
        const y = 42 + (40 / lin) * (r + 0.5);
        return <Culote key={i} style={{ left: `${x}%`, top: `${y}%`, width: `${Math.min(70 / col, (40 / lin) * 1) * 0.86}%`, transform: "translate(-50%,-50%)" }} />;
      })}
    </div>
  );
}

/** Cinturão/bandoleira: uma alça por bala, com a bala saindo da alça quando cheia. */
export function Alcas({ balas, max, calibre }: { balas: number; max: number; calibre: Calibre | null }) {
  return (
    <div className="flex flex-wrap justify-center gap-x-0.5 gap-y-5 rounded-xl bg-[#261318]/70 px-2 pb-2 pt-6">
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className="relative h-10 w-6">
          {i < balas && calibre && (
            <img src={LATERAL[calibre]} alt="" draggable={false} className="absolute left-1/2 top-[-55%] h-[95%] w-auto -translate-x-1/2" />
          )}
          <img src={USO("guarda/alca-couro")} alt="" draggable={false} className="absolute inset-0 h-full w-full" />
        </span>
      ))}
    </div>
  );
}
