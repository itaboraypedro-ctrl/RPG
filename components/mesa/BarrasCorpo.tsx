"use client";

// Barras de Vida e Dor da ficha: moldura pintada (public/story/uso/barras) que se
// desgasta por faixa, com o canal preenchido por código na proporção exata.
// Medidas tiradas das artes (recorte comum por família, sem salto entre estados).

/* eslint-disable @next/next/no-img-element */

type Geo = { aspect: string; canal: { left: number; top: number; width: number; height: number }; encaixe: { x: number; y: number; d: number } };

const GEO: Record<"vida" | "dor", Geo> = {
  vida: { aspect: "1536 / 380", canal: { left: 24.74, top: 41.58, width: 66.93, height: 23.68 }, encaixe: { x: 14.84, y: 52.89, d: 11.2 } },
  dor: { aspect: "1536 / 340", canal: { left: 22.53, top: 36.47, width: 57.49, height: 27.06 }, encaixe: { x: 12.37, y: 49.71, d: 10.42 } },
};

const B = (n: string) => `/story/uso/barras/${n}.webp`;

function Barra({
  familia,
  estado,
  pct,
  segmentos,
  icone,
  rotulo,
}: {
  familia: "vida" | "dor";
  estado: number;
  pct: number;
  segmentos?: number;
  icone: string;
  rotulo: string;
}) {
  const g = GEO[familia];
  const p = `${Math.max(0, Math.min(1, pct)) * 100}%`;
  return (
    <div className="relative w-full" style={{ aspectRatio: g.aspect }} role="meter" aria-label={rotulo} aria-valuenow={Math.round(pct * 100)} aria-valuemin={0} aria-valuemax={100}>
      {/* Canal: fundo escuro, rastro claro do que se perdeu, preenchimento */}
      <div className="absolute overflow-hidden bg-[#0b0b14]" style={{ left: `${g.canal.left}%`, top: `${g.canal.top}%`, width: `${g.canal.width}%`, height: `${g.canal.height}%` }}>
        {/* O rastro encolhe devagar e depois do preenchimento: a perda aparece como um trecho claro */}
        <div className="absolute inset-y-0 left-0 bg-[#f3e2c0]/80 transition-[width] delay-300 duration-700 ease-in motion-reduce:transition-none" style={{ width: p }} />
        <div
          className="absolute inset-y-0 left-0 transition-[width] duration-300 ease-out motion-reduce:transition-none"
          style={{
            width: p,
            backgroundImage: `url(${B(`preenche-${familia}`)})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            boxShadow: familia === "vida" ? "inset 0 -6px 10px rgba(0,0,0,0.35), 0 0 12px rgba(200,40,40,0.5)" : "inset 0 -6px 10px rgba(0,0,0,0.35), 0 0 12px rgba(230,120,30,0.5)",
          }}
        />
        {segmentos &&
          Array.from({ length: segmentos - 1 }, (_, i) => (
            <span key={i} aria-hidden className="absolute inset-y-0 w-[3px] -translate-x-1/2 bg-[#0b0b14]/85" style={{ left: `${((i + 1) / segmentos) * 100}%` }} />
          ))}
      </div>
      <img src={B(`${familia}-${estado}`)} alt="" draggable={false} className="pointer-events-none absolute inset-0 h-full w-full" />
      <img
        src={icone}
        alt=""
        draggable={false}
        className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
        style={{ left: `${g.encaixe.x}%`, top: `${g.encaixe.y}%`, width: `${g.encaixe.d * 0.92}%` }}
      />
    </div>
  );
}

/** Faixas de desgaste do livro de artes: >75%, >50%, >25%, >0, zerada. */
export function BarraVidaFicha({ vida, vidaMax }: { vida: number; vidaMax: number }) {
  const p = vidaMax > 0 ? Math.max(0, Math.min(1, vida / vidaMax)) : 0;
  const estado = p > 0.75 ? 0 : p > 0.5 ? 1 : p > 0.25 ? 2 : p > 0 ? 3 : 4;
  return <Barra familia="vida" estado={estado} pct={p} icone={`/story/uso/ficha/${vida > 0 ? "vida-cheia" : "vida-perdida"}.webp`} rotulo={`Vida ${vida} de ${vidaMax}`} />;
}

/** Seis casas (os círculos do livro); o 6º fecha o ciclo e usa a moldura mais gasta. */
export function BarraDorFicha({ dor }: { dor: number }) {
  const d = Math.max(0, Math.min(6, dor));
  const estado = d <= 1 ? 0 : d <= 3 ? 1 : 2;
  return <Barra familia="dor" estado={estado} pct={d / 6} segmentos={6} icone={`/story/uso/ficha/${d > 0 ? "dor-riscada" : "dor-vazia"}.webp`} rotulo={`Dor ${d} de 6`} />;
}
