"use client";

// O Oeste Selvagem — recriação vetorial do mapa oficial de Sacramento,
// interativa estilo Google Maps (arrastar, roda/pinça para zoom, marcadores
// clicáveis) na identidade Arcana: o mapa é pergaminho (ponto de luz), o
// chrome é vidro. Posições são leitura do mapa impresso (PRODUTO).

import { useCallback, useEffect, useRef, useState } from "react";
import { SACRAMENTO_PLACES } from "@/lib/rulesets/sacramento/places";

const W = 1000;
const H = 736;
const MIN_W = 220; // zoom máximo ~4,5×

// Cidades (marcador + rótulo). anchor: lado do rótulo em relação ao ponto.
const CITIES: {
  id: string;
  nome: string;
  x: number;
  y: number;
  anchor: "left" | "right";
}[] = [
  { id: "santo-ozorio", nome: "Santo Ozório", x: 39, y: 257, anchor: "right" },
  { id: "celestes", nome: "Varginha", x: 354, y: 81, anchor: "right" },
  { id: "maria-da-fe", nome: "Maria da Fé", x: 657, y: 72, anchor: "right" },
  { id: "serra-da-saudade-povoado", nome: "Serra da Saudade", x: 638, y: 154, anchor: "right" },
  { id: "araguari", nome: "Araguari", x: 807, y: 189, anchor: "right" },
  { id: "bom-fim", nome: "Bom Fim", x: 391, y: 221, anchor: "left" },
  { id: "sacramento-cidade", nome: "Sacramento", x: 303, y: 332, anchor: "left" },
  { id: "tupaciguara", nome: "Tupaciguara", x: 658, y: 349, anchor: "right" },
  { id: "vila-de-desemboque", nome: "Vila do Desemboque", x: 527, y: 414, anchor: "right" },
  { id: "belo-horizonte", nome: "Belo Horizonte", x: 794, y: 489, anchor: "right" },
  { id: "aracuai", nome: "Araçuaí", x: 115, y: 603, anchor: "right" },
];

// Lugares canônicos que no mapa são regiões (rótulo clicável, sem marcador).
const REGION_PLACES: { id: string; nome: string; x: number; y: number; rotate?: number }[] = [
  { id: "floresta-do-cipo", nome: "Floresta\ndo Cipó", x: 141, y: 391 },
  { id: "sertao-de-fungos", nome: "Sertão\nde Fungos", x: 557, y: 501 },
  { id: "deserto-de-mucuri", nome: "Ravina\nVermelha", x: 141, y: 645 },
  { id: "serra-da-saudade-cordilheira", nome: "Serra da Saudade", x: 466, y: 146, rotate: -27 },
];

// Rótulos decorativos (geografia sem verbete próprio no sistema).
const DECOR_LABELS: { nome: string; x: number; y: number; rotate?: number }[] = [
  { nome: "Costa do\nSepulcro", x: 72, y: 40 },
  { nome: "Ilha do\nSepulcro", x: 44, y: 130 },
  { nome: "Floresta\ndo Céu", x: 200, y: 62 },
  { nome: "Chapada\ndo Morto", x: 262, y: 132 },
  { nome: "Montanha\nde Gelo", x: 592, y: 40 },
  { nome: "Alto da\nFriaca", x: 856, y: 48 },
  { nome: "Zói de\nDeus", x: 202, y: 236 },
  { nome: "Águas de\nPólvora", x: 512, y: 228 },
  { nome: "Mata de\nTupaciguara", x: 580, y: 312 },
  { nome: "Vale do\nSacramento", x: 284, y: 428 },
  { nome: "Baixada de\nSão José", x: 723, y: 424 },
  { nome: "Rio Sucuri", x: 924, y: 300, rotate: 65 },
  { nome: "Baía\nde BH", x: 872, y: 540 },
  { nome: "Reta dos\nVentos", x: 300, y: 668 },
  { nome: "Para o\nLeste →", x: 940, y: 162 },
];

// Cordilheiras: fileiras de "carets" (⋀) ao longo de um segmento.
const RIDGES: { x1: number; y1: number; x2: number; y2: number; n: number }[] = [
  { x1: 380, y1: 168, x2: 540, y2: 92, n: 7 },
  { x1: 402, y1: 190, x2: 556, y2: 116, n: 7 },
  { x1: 552, y1: 70, x2: 640, y2: 58, n: 4 },
  { x1: 812, y1: 62, x2: 896, y2: 48, n: 4 },
  { x1: 748, y1: 160, x2: 852, y2: 132, n: 5 },
  { x1: 620, y1: 120, x2: 700, y2: 96, n: 4 },
];

// Florestas: manchas orgânicas (borda recortada gerada por lóbulos).
const FOREST_BLOBS: { cx: number; cy: number; rx: number; ry: number; seed: number }[] = [
  { cx: 200, cy: 68, rx: 92, ry: 46, seed: 3 }, // Floresta do Céu
  { cx: 258, cy: 194, rx: 74, ry: 44, seed: 7 }, // mata a oeste de Bom Fim
  { cx: 575, cy: 272, rx: 84, ry: 36, seed: 11 }, // Mata de Tupaciguara
  { cx: 134, cy: 332, rx: 78, ry: 46, seed: 5 }, // Floresta do Cipó
  { cx: 408, cy: 364, rx: 58, ry: 30, seed: 9 }, // bosque ao sul de Desemboque
  { cx: 666, cy: 138, rx: 62, ry: 28, seed: 13 }, // mata a NE de Araguari
];

/** Mancha orgânica: raio com jitter determinístico, suavizada por quadráticas. */
function blobPath(cx: number, cy: number, rx: number, ry: number, seed: number): string {
  const n = 14;
  const pts = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const j = 0.78 + 0.22 * Math.sin(i * 2.7 + seed) + 0.08 * Math.sin(i * 5.1 + seed * 1.7);
    return [cx + Math.cos(a) * rx * j, cy + Math.sin(a) * ry * j] as const;
  });
  const mid = (i: number) => {
    const p = pts[i % n];
    const q = pts[(i + 1) % n];
    return [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2] as const;
  };
  let d = `M${mid(n - 1)[0].toFixed(1)},${mid(n - 1)[1].toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const p = pts[i];
    const m = mid(i);
    d += ` Q${p[0].toFixed(1)},${p[1].toFixed(1)} ${m[0].toFixed(1)},${m[1].toFixed(1)}`;
  }
  return d + " Z";
}

const FORESTS: string[] = FOREST_BLOBS.map((b) => blobPath(b.cx, b.cy, b.rx, b.ry, b.seed));

type Props = {
  addedIds: Set<string>;
  busyId: string | null;
  onAdd: (canonId: string) => void;
};

export function WorldMap({ addedIds, busyId, onAdd }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState({ x: 0, y: 0, w: W });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const dragState = useRef({ moved: false, lastDist: 0 });

  const z = W / view.w; // fator de zoom
  const vh = view.w * (H / W);

  const clampView = useCallback((x: number, y: number, w: number) => {
    const cw = Math.min(W, Math.max(MIN_W, w));
    const ch = cw * (H / W);
    return {
      x: Math.min(W - cw, Math.max(0, x)),
      y: Math.min(H - ch, Math.max(0, y)),
      w: cw,
    };
  }, []);

  const zoomAt = useCallback(
    (clientX: number, clientY: number, factor: number) => {
      setView((v) => {
        const rect = containerRef.current!.getBoundingClientRect();
        const px = (clientX - rect.left) / rect.width;
        const py = (clientY - rect.top) / rect.height;
        const nw = Math.min(W, Math.max(MIN_W, v.w * factor));
        const mx = v.x + px * v.w;
        const my = v.y + py * v.w * (H / W);
        return clampView(mx - px * nw, my - py * nw * (H / W), nw);
      });
    },
    [clampView],
  );

  // Roda do mouse: zoom no cursor (listener não-passivo para preventDefault).
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      zoomAt(e.clientX, e.clientY, e.deltaY > 0 ? 1.18 : 1 / 1.18);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomAt]);

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    dragState.current.moved = false;
    dragState.current.lastDist = 0;
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = [...pointers.current.values()];

    if (pts.length === 2) {
      // Pinça: zoom pela variação da distância entre os dedos
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      if (dragState.current.lastDist > 0) {
        const cx = (pts[0].x + pts[1].x) / 2;
        const cy = (pts[0].y + pts[1].y) / 2;
        zoomAt(cx, cy, dragState.current.lastDist / dist);
      }
      dragState.current.lastDist = dist;
      dragState.current.moved = true;
      return;
    }

    const dx = e.clientX - prev.x;
    const dy = e.clientY - prev.y;
    if (Math.abs(dx) + Math.abs(dy) > 2) dragState.current.moved = true;
    const rect = containerRef.current!.getBoundingClientRect();
    setView((v) =>
      clampView(v.x - (dx / rect.width) * v.w, v.y - (dy / rect.height) * v.w * (H / W), v.w),
    );
  };

  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    dragState.current.lastDist = 0;
  };

  const select = (id: string) => {
    if (dragState.current.moved) return; // era arrasto, não clique
    setSelectedId((cur) => (cur === id ? null : id));
  };

  const selected = selectedId
    ? SACRAMENTO_PLACES.find((p) => p.id === selectedId)
    : null;

  const citySize = 13 / z;
  const regionSize = 12 / z;

  return (
    <div
      ref={containerRef}
      className="relative h-[420px] overflow-hidden rounded-2xl border border-arcana-gold/25 select-none md:h-[520px]"
      style={{ touchAction: "none", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 8px 30px rgba(0,0,0,0.45)" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onDoubleClick={(e) => zoomAt(e.clientX, e.clientY, 1 / 1.6)}
    >
      <svg
        viewBox={`${view.x} ${view.y} ${view.w} ${vh}`}
        className="h-full w-full cursor-grab active:cursor-grabbing"
        role="img"
        aria-label="Mapa do Oeste Selvagem"
      >
        <defs>
          <radialGradient id="wm-parch" cx="50%" cy="35%" r="90%">
            <stop offset="0%" stopColor="#eeddbc" />
            <stop offset="70%" stopColor="#e2cfa6" />
            <stop offset="100%" stopColor="#d3bd90" />
          </radialGradient>
          <pattern id="wm-trees" width="26" height="22" patternUnits="userSpaceOnUse">
            <g fill="none" stroke="#5f6349" strokeWidth="1.1" strokeLinecap="round">
              <path d="M6,16 C3,14 3,10 6,8 C4,6 6,3 8,4 C10,3 12,6 10,8 C13,10 13,14 10,16 M8,16v3" />
              <path d="M19,11 C16,9 17,6 19,5 C21,6 22,9 19,11 M19,11v2.5" />
            </g>
          </pattern>
        </defs>

        {/* Pergaminho */}
        <rect x="0" y="0" width={W} height={H} fill="url(#wm-parch)" />

        {/* Curvas de nível (textura topográfica sutil) */}
        <g fill="none" stroke="#8a7350" strokeOpacity="0.22" strokeWidth="0.8">
          <path d="M120,190 C170,168 240,176 262,204 C282,230 240,258 190,252 C140,246 96,214 120,190 Z" />
          <path d="M560,392 C610,372 690,378 712,406 C730,432 686,462 630,456 C574,450 534,416 560,392 Z" />
          <path d="M320,520 C370,498 450,504 476,534 C498,560 452,592 392,586 C334,580 292,544 320,520 Z" />
          <path d="M690,240 C730,224 790,230 806,254 C820,276 786,298 742,294 C700,290 668,260 690,240 Z" />
          <path d="M170,470 C210,454 268,458 284,482 C298,504 264,524 222,520 C182,516 150,488 170,470 Z" />
        </g>

        {/* Água — oceano a oeste, baía a leste, ilha e lago */}
        <g fill="#9fb2ba">
          <path d={`M0,108 C42,142 28,192 52,232 C74,268 38,302 58,346 C80,392 34,432 54,482 C70,522 28,562 68,622 C94,668 58,700 78,736 L0,736 Z`} />
          <path d="M20,152 C44,134 76,148 72,174 C68,198 32,202 18,182 C12,172 14,158 20,152 Z" fillOpacity="0.9" />
          <path d="M1000,252 C932,272 900,322 922,362 C872,382 820,432 836,478 C852,518 932,548 1000,562 Z" />
        </g>
        {/* Lago Águas de Pólvora */}
        <path
          d="M455,214 C470,194 546,190 566,210 C586,230 560,254 520,258 C480,262 444,236 455,214 Z"
          fill="#9fb2ba"
        />
        {/* Rios */}
        <g fill="none" stroke="#9fb2ba" strokeWidth="3" strokeLinecap="round" vectorEffect="non-scaling-stroke">
          <path d="M520,0 C512,40 530,80 512,120 C500,150 476,180 466,208" strokeWidth="2.5" />
          <path d="M1000,196 C962,224 948,262 938,300 C930,330 926,352 930,372" />
          <path d="M700,0 C706,40 726,70 748,96 C766,118 786,146 800,180" strokeWidth="2.2" />
        </g>

        {/* Florestas */}
        <g>
          {FORESTS.map((d, i) => (
            <g key={i}>
              <path d={d} fill="#b3ab86" fillOpacity="0.35" />
              <path d={d} fill="url(#wm-trees)" />
              <path d={d} fill="none" stroke="#6d6a4e" strokeOpacity="0.22" strokeWidth="1" />
            </g>
          ))}
        </g>

        {/* Cordilheiras (carets) */}
        <g fill="none" stroke="#4a3a26" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          {RIDGES.map((r, ri) =>
            Array.from({ length: r.n }, (_, i) => {
              const t = i / (r.n - 1);
              const cx = r.x1 + (r.x2 - r.x1) * t;
              const cy = r.y1 + (r.y2 - r.y1) * t + (i % 2 ? 4 : -4);
              return (
                <path
                  key={`${ri}-${i}`}
                  d={`M${cx - 9},${cy + 6} L${cx},${cy - 7} L${cx + 9},${cy + 6} M${cx},${cy - 7} L${cx + 3},${cy - 1}`}
                />
              );
            }),
          )}
        </g>

        {/* Estradas */}
        <g fill="none" stroke="#3a2c1a" strokeOpacity="0.75" strokeWidth="1.4" vectorEffect="non-scaling-stroke" strokeLinecap="round">
          <path d="M39,257 C120,282 220,306 303,332" />
          <path d="M303,332 C380,362 460,392 527,414" />
          <path d="M527,414 C575,392 620,368 658,349" />
          <path d="M658,349 C706,388 758,440 794,489" />
          <path d="M658,349 C700,296 760,238 807,189" />
          <path d="M391,221 C356,256 328,296 303,332" />
          <path d="M391,221 C372,172 360,126 354,81" />
          <path d="M391,221 C452,196 560,168 638,154" />
          <path d="M638,154 C648,124 652,96 657,72" />
          <path d="M638,154 C696,166 754,178 807,189" />
          <path d="M115,603 C150,556 220,478 303,332" strokeDasharray="1 6" />
          <path d="M794,489 C846,428 872,346 828,262 C820,240 812,212 807,189" strokeDasharray="1 6" />
        </g>
        {/* Ferrovias (traço e travessas) */}
        <g fill="none" stroke="#2b1e12" strokeWidth="1.6" vectorEffect="non-scaling-stroke">
          <path d="M794,489 C748,452 700,398 658,349" strokeDasharray="7 4" />
          <path d="M807,189 C748,172 690,162 638,154 C596,148 560,120 540,96" strokeDasharray="7 4" />
        </g>

        {/* Rótulos decorativos */}
        <g aria-hidden fontFamily="var(--font-crimson), serif" fontStyle="italic" fill="#5c4a33" textAnchor="middle" stroke="#e8d6ae" strokeWidth={regionSize / 5} paintOrder="stroke">
          {DECOR_LABELS.map((l) => (
            <text
              key={l.nome}
              x={l.x}
              y={l.y}
              fontSize={regionSize}
              transform={l.rotate ? `rotate(${l.rotate} ${l.x} ${l.y})` : undefined}
            >
              {l.nome.split("\n").map((line, i) => (
                <tspan key={i} x={l.x} dy={i === 0 ? 0 : regionSize * 1.05}>
                  {line}
                </tspan>
              ))}
            </text>
          ))}
        </g>

        {/* Regiões clicáveis (lugares canônicos sem marcador) */}
        <g fontFamily="var(--font-crimson), serif" fontStyle="italic" textAnchor="middle">
          {REGION_PLACES.map((r) => {
            const isSel = selectedId === r.id;
            return (
              <text
                key={r.id}
                x={r.x}
                y={r.y}
                fontSize={regionSize * 1.08}
                fontWeight={isSel ? 700 : 500}
                fill={isSel ? "#8a5a12" : "#4a3a26"}
                stroke="#e8d6ae"
                strokeWidth={regionSize / 5}
                paintOrder="stroke"
                transform={r.rotate ? `rotate(${r.rotate} ${r.x} ${r.y})` : undefined}
                className="cursor-pointer"
                onClick={() => select(r.id)}
              >
                {r.nome.split("\n").map((line, i) => (
                  <tspan key={i} x={r.x} dy={i === 0 ? 0 : regionSize * 1.1}>
                    {line}
                  </tspan>
                ))}
              </text>
            );
          })}
        </g>

        {/* Cidades */}
        <g fontFamily="var(--font-cinzel), serif">
          {CITIES.map((c) => {
            const isSel = selectedId === c.id;
            const added = addedIds.has(c.id);
            const r = 5.5 / Math.pow(z, 0.75);
            const lx = c.anchor === "right" ? c.x + r + 4 / z : c.x - r - 4 / z;
            return (
              <g key={c.id} className="cursor-pointer" onClick={() => select(c.id)}>
                {isSel && (
                  <circle cx={c.x} cy={c.y} r={r * 2.4} fill="#d1ab55" fillOpacity="0.35" />
                )}
                <circle
                  cx={c.x}
                  cy={c.y}
                  r={r}
                  fill={isSel ? "#c9a23f" : added ? "#8a5a12" : "#f2e6cf"}
                  stroke="#2b1e12"
                  strokeWidth={1.6}
                  vectorEffect="non-scaling-stroke"
                />
                <text
                  x={lx}
                  y={c.y + citySize * 0.35}
                  fontSize={citySize}
                  fontWeight={700}
                  textAnchor={c.anchor === "right" ? "start" : "end"}
                  fill={isSel ? "#8a5a12" : "#2b1e12"}
                  stroke="#ead9b8"
                  strokeWidth={citySize / 5}
                  paintOrder="stroke"
                  style={{ letterSpacing: "0.04em" }}
                >
                  {c.nome}
                </text>
              </g>
            );
          })}
        </g>

        {/* Rosa dos ventos */}
        <g transform="translate(697 553)" aria-hidden>
          <g fill="#2b1e12">
            <path d="M0,-58 L9,-9 L0,-16 L-9,-9 Z" />
            <path d="M0,58 L9,9 L0,16 L-9,9 Z" fillOpacity="0.85" />
            <path d="M-58,0 L-9,-9 L-16,0 L-9,9 Z" fillOpacity="0.85" />
            <path d="M58,0 L9,-9 L16,0 L9,9 Z" fillOpacity="0.85" />
            <path d="M-30,-30 L-6,-10 L-11,-4 Z M30,-30 L11,-4 L6,-10 Z M30,30 L6,10 L11,4 Z M-30,30 L-11,4 L-6,10 Z" fillOpacity="0.6" />
          </g>
          <circle r="7" fill="#ead9b8" stroke="#2b1e12" strokeWidth="2" />
          <text y="-64" textAnchor="middle" fontFamily="var(--font-cinzel), serif" fontWeight={900} fontSize="14" fill="#2b1e12">N</text>
        </g>

        {/* Cartucho do título */}
        <g transform="translate(838 606) rotate(-2)" aria-hidden>
          <path
            d="M-118,-34 C-80,-44 -20,-40 30,-42 C80,-44 112,-36 118,-24 C124,-10 114,8 118,22 C110,36 60,40 10,42 C-46,44 -100,40 -114,30 C-124,18 -112,2 -120,-12 Z"
            fill="#f4ead2"
            stroke="#b39b6e"
            strokeWidth="1.5"
          />
          <text textAnchor="middle" fontFamily="var(--font-cinzel), serif" fontWeight={900} fill="#241a10">
            <tspan x="0" y="-6" fontSize="26" style={{ letterSpacing: "0.06em" }}>O OESTE</tspan>
            <tspan x="0" y="24" fontSize="26" style={{ letterSpacing: "0.06em" }}>SELVAGEM</tspan>
          </text>
        </g>

      </svg>

      {/* Vinheta sobre o papel (borda queimada suave) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ boxShadow: "inset 0 0 60px rgba(90,64,30,0.35)" }}
      />

      {/* Controles de zoom (vidro) */}
      <div className="absolute right-3 top-3 flex flex-col gap-1.5">
        {[
          { label: "+", title: "Aproximar", fn: () => zoomAt(centerX(), centerY(), 1 / 1.35) },
          { label: "−", title: "Afastar", fn: () => zoomAt(centerX(), centerY(), 1.35) },
          { label: "⌂", title: "Ver o mapa inteiro", fn: () => setView({ x: 0, y: 0, w: W }) },
        ].map((b) => (
          <button
            key={b.label}
            type="button"
            title={b.title}
            onClick={b.fn}
            className="arcana-glass flex h-9 w-9 items-center justify-center rounded-xl font-cinzel text-sm text-arcana-text transition-colors hover:text-arcana-gold"
          >
            {b.label}
          </button>
        ))}
      </div>

      {/* Carta do lugar selecionado */}
      {selected && (
        <div className="arcana-glass absolute bottom-3 left-3 w-[min(21rem,calc(100%-1.5rem))] rounded-2xl p-3.5">
          <div className="flex items-start gap-3">
            {selected.imagem && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={selected.imagem}
                alt={selected.nome}
                className="h-16 w-24 shrink-0 rounded-xl border border-arcana-border object-cover"
              />
            )}
            <div className="min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate font-cinzel text-sm font-bold uppercase tracking-[0.12em] text-arcana-gold-bright">
                  {selected.nome}
                </p>
                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  aria-label="Fechar"
                  className="shrink-0 font-cinzel text-xs text-arcana-text-dim hover:text-arcana-gold"
                >
                  ✕
                </button>
              </div>
              <p className="mt-0.5 line-clamp-2 font-crimson text-[13px] leading-snug text-arcana-text-dim">
                {selected.caracteristicas}
              </p>
            </div>
          </div>
          <div className="mt-2.5 flex items-center justify-between gap-2">
            <span className="font-crimson text-[11px] italic text-arcana-text-dim">
              pp. {selected.paginas[0]}–{selected.paginas[1]}
            </span>
            {addedIds.has(selected.id) ? (
              <span className="font-cinzel text-[10px] uppercase tracking-[0.2em] text-arcana-gold">
                ✓ Na campanha
              </span>
            ) : (
              <button
                type="button"
                onClick={() => onAdd(selected.id)}
                disabled={busyId === selected.id}
                className="arcana-btn-primary arcana-btn-sm"
              >
                {busyId === selected.id ? "Adicionando..." : "Adicionar"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );

  function centerX() {
    const r = containerRef.current!.getBoundingClientRect();
    return r.left + r.width / 2;
  }
  function centerY() {
    const r = containerRef.current!.getBoundingClientRect();
    return r.top + r.height / 2;
  }
}
