"use client";

// O Oeste Selvagem — recriação vetorial do mapa oficial de Sacramento,
// interativa estilo Google Maps: arrastar, zoom no cursor, pinça, busca com
// voo até o lugar, camadas ligáveis e pinos do Juiz (lugares da campanha).
// Toda a geografia é gerada proceduralmente de listas de pontos + seed
// (costas, florestas, estradas, ferrovias com travessas, hachuras e ondas),
// na identidade Arcana: o mapa é pergaminho, o chrome é vidro.

import { useCallback, useEffect, useRef, useState } from "react";
import { SACRAMENTO_PLACES } from "@/lib/rulesets/sacramento/places";

const W = 1000;
const H = 736;
const MIN_W = 220; // zoom máximo ~4,5×

type Pt = readonly [number, number];

/* ─── Geometria procedural ─── */

/** Polilinha suavizada (quadráticas pelos pontos médios), aberta. */
function smoothOpen(pts: Pt[]): string {
  if (pts.length < 2) return "";
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i][0] + pts[i + 1][0]) / 2;
    const my = (pts[i][1] + pts[i + 1][1]) / 2;
    d += ` Q${pts[i][0]},${pts[i][1]} ${mx.toFixed(1)},${my.toFixed(1)}`;
  }
  const last = pts[pts.length - 1];
  d += ` L${last[0]},${last[1]}`;
  return d;
}

/** Normais unitárias por ponto (média dos segmentos vizinhos), rotação +90°. */
function normalsOf(pts: Pt[]): Pt[] {
  return pts.map((_, i) => {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(pts.length - 1, i + 1)];
    const tx = b[0] - a[0];
    const ty = b[1] - a[1];
    const len = Math.hypot(tx, ty) || 1;
    return [-ty / len, tx / len] as const;
  });
}

/** Desloca a polilinha ao longo das normais (sign escolhe o lado). */
function offsetPolyline(pts: Pt[], dist: number, sign: 1 | -1): Pt[] {
  const ns = normalsOf(pts);
  return pts.map((p, i) => [p[0] + ns[i][0] * dist * sign, p[1] + ns[i][1] * dist * sign] as const);
}

/** Hachuras de costa: traço curto por ponto, apontando para a água. */
function hachures(pts: Pt[], sign: 1 | -1, len = 7): string {
  const ns = normalsOf(pts);
  return pts
    .map((p, i) => {
      if (i % 1 !== 0) return "";
      const n = ns[i];
      return `M${p[0].toFixed(1)},${p[1].toFixed(1)} l${(n[0] * len * sign).toFixed(1)},${(n[1] * len * sign).toFixed(1)}`;
    })
    .join(" ");
}

/** Travessas de ferrovia: tique perpendicular a cada `gap` de comprimento. */
function railTicks(pts: Pt[], gap = 13, half = 3.6): string {
  let d = "";
  let acc = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[i + 1];
    const seg = Math.hypot(x2 - x1, y2 - y1);
    if (seg === 0) continue;
    const tx = (x2 - x1) / seg;
    const ty = (y2 - y1) / seg;
    let t = gap - acc;
    while (t < seg) {
      const px = x1 + tx * t;
      const py = y1 + ty * t;
      d += `M${(px - ty * half).toFixed(1)},${(py + tx * half).toFixed(1)} L${(px + ty * half).toFixed(1)},${(py - tx * half).toFixed(1)} `;
      t += gap;
    }
    acc = (acc + seg) % gap;
  }
  return d;
}

/** Ondulação orgânica: subdivide e desloca perpendicularmente por seno. */
function wavy(pts: Pt[], amp: number, seed: number): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[i + 1];
    const seg = Math.hypot(x2 - x1, y2 - y1);
    const steps = Math.max(1, Math.round(seg / 26));
    for (let s = 0; s < steps; s++) {
      const t = s / steps;
      const px = x1 + (x2 - x1) * t;
      const py = y1 + (y2 - y1) * t;
      const n = Math.sin((i * 3 + s) * 1.9 + seed) * amp;
      const tx = (x2 - x1) / seg;
      const ty = (y2 - y1) / seg;
      out.push([px - ty * n, py + tx * n]);
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
}

/** Mancha orgânica fechada (florestas, ilha, lago). */
function blobPath(cx: number, cy: number, rx: number, ry: number, seed: number): string {
  const n = 14;
  const pts = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const j = 0.78 + 0.22 * Math.sin(i * 2.7 + seed) + 0.08 * Math.sin(i * 5.1 + seed * 1.7);
    return [cx + Math.cos(a) * rx * j, cy + Math.sin(a) * ry * j] as const;
  });
  const mid = (i: number) =>
    [(pts[i % n][0] + pts[(i + 1) % n][0]) / 2, (pts[i % n][1] + pts[(i + 1) % n][1]) / 2] as const;
  let d = `M${mid(n - 1)[0].toFixed(1)},${mid(n - 1)[1].toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    d += ` Q${pts[i][0].toFixed(1)},${pts[i][1].toFixed(1)} ${mid(i)[0].toFixed(1)},${mid(i)[1].toFixed(1)}`;
  }
  return d + " Z";
}

/* ─── Geografia (leitura do mapa impresso) ─── */

const WEST_COAST: Pt[] = [
  [0, 110], [42, 142], [28, 192], [52, 232], [74, 268], [38, 302], [58, 346],
  [80, 392], [34, 432], [54, 482], [70, 522], [28, 562], [68, 622], [94, 668],
  [58, 700], [78, 736],
];
const EAST_COAST: Pt[] = [
  [1000, 252], [932, 272], [900, 322], [922, 362], [872, 382], [820, 432],
  [836, 478], [852, 518], [932, 548], [1000, 562],
];
const WEST_WATER = `${smoothOpen(WEST_COAST)} L0,736 Z`;
const EAST_WATER = `${smoothOpen(EAST_COAST)} L1000,562 L1000,252 Z`;
const ISLAND = blobPath(45, 172, 30, 22, 4);
const LAKE = blobPath(510, 232, 58, 26, 8);

const RIVERS: Pt[][] = [
  [[520, 0], [512, 44], [530, 84], [510, 124], [492, 158], [472, 190], [466, 210]],
  [[1000, 196], [962, 224], [948, 262], [938, 300], [928, 340], [930, 372]],
  [[700, 0], [706, 42], [726, 72], [748, 98], [768, 124], [788, 152], [800, 180]],
];

const FOREST_BLOBS = [
  { cx: 200, cy: 68, rx: 92, ry: 46, seed: 3 },
  { cx: 258, cy: 194, rx: 74, ry: 44, seed: 7 },
  { cx: 575, cy: 272, rx: 84, ry: 36, seed: 11 },
  { cx: 134, cy: 332, rx: 78, ry: 46, seed: 5 },
  { cx: 408, cy: 364, rx: 58, ry: 30, seed: 9 },
  { cx: 666, cy: 138, rx: 62, ry: 28, seed: 13 },
];
const FORESTS = FOREST_BLOBS.map((b) => blobPath(b.cx, b.cy, b.rx, b.ry, b.seed));

const RIDGES = [
  { x1: 380, y1: 168, x2: 540, y2: 92, n: 7 },
  { x1: 402, y1: 190, x2: 556, y2: 116, n: 7 },
  { x1: 552, y1: 70, x2: 640, y2: 58, n: 4 },
  { x1: 812, y1: 62, x2: 896, y2: 48, n: 4 },
  { x1: 748, y1: 160, x2: 852, y2: 132, n: 5 },
  { x1: 620, y1: 120, x2: 700, y2: 96, n: 4 },
];

// Estradas: pontos-guia; o traçado final ganha ondulação orgânica.
const ROADS: { pts: Pt[]; seed: number; trail?: boolean }[] = [
  { pts: [[39, 257], [120, 282], [210, 306], [303, 332]], seed: 1 },
  { pts: [[303, 332], [380, 362], [455, 392], [527, 414]], seed: 2 },
  { pts: [[527, 414], [575, 392], [620, 368], [658, 349]], seed: 3 },
  { pts: [[658, 349], [706, 388], [755, 440], [794, 489]], seed: 4 },
  { pts: [[658, 349], [700, 296], [758, 238], [807, 189]], seed: 5 },
  { pts: [[391, 221], [356, 256], [328, 296], [303, 332]], seed: 6 },
  { pts: [[391, 221], [372, 172], [360, 126], [354, 81]], seed: 7 },
  { pts: [[391, 221], [452, 198], [548, 172], [638, 154]], seed: 8 },
  { pts: [[638, 154], [648, 124], [652, 96], [657, 72]], seed: 9 },
  { pts: [[638, 154], [696, 166], [754, 178], [807, 189]], seed: 10 },
  { pts: [[115, 603], [150, 556], [220, 478], [268, 404], [303, 332]], seed: 11, trail: true },
  { pts: [[794, 489], [846, 428], [868, 350], [836, 272], [807, 189]], seed: 12, trail: true },
];

// Ferrovias: polilinhas (o traçado reto+curvas leves é próprio de trilho).
const RAILS: Pt[][] = [
  [[794, 489], [758, 452], [706, 398], [658, 349]],
  [[807, 189], [748, 172], [690, 162], [638, 154], [596, 142], [562, 118], [540, 96]],
];

const CITIES: { id: string; nome: string; x: number; y: number; anchor: "left" | "right" }[] = [
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

const REGION_PLACES: { id: string; nome: string; x: number; y: number; rotate?: number }[] = [
  { id: "floresta-do-cipo", nome: "Floresta\ndo Cipó", x: 141, y: 391 },
  { id: "sertao-de-fungos", nome: "Sertão\nde Fungos", x: 557, y: 501 },
  { id: "deserto-de-mucuri", nome: "Ravina\nVermelha", x: 141, y: 645 },
  { id: "serra-da-saudade-cordilheira", nome: "Serra da Saudade", x: 466, y: 146, rotate: -27 },
];

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

// Busca: tudo que é lugar canônico navegável no mapa.
const SEARCHABLE: { id: string; nome: string; x: number; y: number; tipo: string }[] = [
  ...CITIES.map((c) => ({ id: c.id, nome: c.nome, x: c.x, y: c.y, tipo: "Cidade" })),
  ...REGION_PLACES.map((r) => ({
    id: r.id,
    nome: r.nome.replace("\n", " "),
    x: r.x,
    y: r.y,
    tipo: "Região",
  })),
];

function norm(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/* ─── Componente ─── */

export type MapPin = { id: string; nome: string; x: number; y: number; descricao?: string };

type Props = {
  addedIds: Set<string>;
  busyId: string | null;
  onAdd: (canonId: string) => void;
  /** Pinos do Juiz (lugares da campanha posicionados no mapa). */
  pins?: MapPin[];
  /** Nome do lugar aguardando posicionamento (modo "clique para fixar"). */
  placingLabel?: string | null;
  onPlacePin?: (x: number, y: number) => void;
  onCancelPlacing?: () => void;
  onRemovePin?: (pinId: string) => void;
};

export function WorldMap({
  addedIds,
  busyId,
  onAdd,
  pins = [],
  placingLabel = null,
  onPlacePin,
  onCancelPlacing,
  onRemovePin,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState({ x: 0, y: 0, w: W });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [layers, setLayers] = useState({ labels: true, roads: true, terrain: true });
  const [layersOpen, setLayersOpen] = useState(false);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const dragState = useRef({ moved: false, lastDist: 0 });
  const animRef = useRef<number | null>(null);

  const z = W / view.w;
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

  const stopAnim = useCallback(() => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    animRef.current = null;
  }, []);

  const resetView = useCallback(() => {
    stopAnim();
    setView({ x: 0, y: 0, w: W });
  }, [stopAnim]);

  /** Voo suave até centrar (cx,cy) com largura de vista targetW. */
  const flyTo = useCallback(
    (cx: number, cy: number, targetW: number) => {
      stopAnim();
      const from = { ...view };
      const to = clampView(cx - targetW / 2, cy - (targetW * (H / W)) / 2, targetW);
      const t0 = performance.now();
      const dur = 480;
      const ease = (t: number) => 1 - Math.pow(1 - t, 3);
      const step = (now: number) => {
        const t = Math.min(1, (now - t0) / dur);
        const k = ease(t);
        setView({
          x: from.x + (to.x - from.x) * k,
          y: from.y + (to.y - from.y) * k,
          w: from.w + (to.w - from.w) * k,
        });
        if (t < 1) animRef.current = requestAnimationFrame(step);
      };
      animRef.current = requestAnimationFrame(step);
    },
    [view, clampView, stopAnim],
  );

  const zoomAt = useCallback(
    (clientX: number, clientY: number, factor: number) => {
      stopAnim();
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
    [clampView, stopAnim],
  );

  const zoomCenter = useCallback(
    (factor: number) => {
      const r = containerRef.current!.getBoundingClientRect();
      zoomAt(r.left + r.width / 2, r.top + r.height / 2, factor);
    },
    [zoomAt],
  );

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
    stopAnim();
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
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      if (dragState.current.lastDist > 0) {
        zoomAt((pts[0].x + pts[1].x) / 2, (pts[0].y + pts[1].y) / 2, dragState.current.lastDist / dist);
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

  const toMapCoords = (clientX: number, clientY: number) => {
    const rect = containerRef.current!.getBoundingClientRect();
    return {
      mx: view.x + ((clientX - rect.left) / rect.width) * view.w,
      my: view.y + ((clientY - rect.top) / rect.height) * vh,
    };
  };

  const handleMapClick = (e: React.MouseEvent) => {
    if (dragState.current.moved) return;
    if (placingLabel && onPlacePin) {
      const { mx, my } = toMapCoords(e.clientX, e.clientY);
      onPlacePin(Math.round(mx), Math.round(my));
    }
  };

  const select = (id: string) => {
    if (dragState.current.moved || placingLabel) return;
    setSelectedPinId(null);
    setSelectedId((cur) => (cur === id ? null : id));
  };

  const selectPin = (id: string) => {
    if (dragState.current.moved || placingLabel) return;
    setSelectedId(null);
    setSelectedPinId((cur) => (cur === id ? null : id));
  };

  const selected = selectedId ? SACRAMENTO_PLACES.find((p) => p.id === selectedId) : null;
  const selectedPin = selectedPinId ? pins.find((p) => p.id === selectedPinId) : null;

  const results = query.trim()
    ? SEARCHABLE.filter((s) => norm(s.nome).includes(norm(query))).slice(0, 6)
    : [];

  const citySize = 13 / z;
  const regionSize = 12 / z;
  const pinScale = 1 / Math.pow(z, 0.8);

  return (
    <div
      ref={containerRef}
      className="relative h-[440px] overflow-hidden rounded-2xl border border-arcana-gold/25 select-none md:h-[540px]"
      style={{
        touchAction: "none",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 8px 30px rgba(0,0,0,0.45)",
        cursor: placingLabel ? "crosshair" : undefined,
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onDoubleClick={(e) => zoomAt(e.clientX, e.clientY, 1 / 1.6)}
    >
      <svg
        viewBox={`${view.x} ${view.y} ${view.w} ${vh}`}
        className={placingLabel ? "h-full w-full" : "h-full w-full cursor-grab active:cursor-grabbing"}
        role="img"
        aria-label="Mapa do Oeste Selvagem"
        onClick={handleMapClick}
      >
        <defs>
          <radialGradient id="wm-parch" cx="50%" cy="35%" r="90%">
            <stop offset="0%" stopColor="#efdfbf" />
            <stop offset="70%" stopColor="#e3d0a7" />
            <stop offset="100%" stopColor="#d2bc8e" />
          </radialGradient>
          <radialGradient id="wm-snow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#e9eef0" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#e9eef0" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="wm-red" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#c26a3f" stopOpacity="0.30" />
            <stop offset="100%" stopColor="#c26a3f" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="wm-green" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#8f9663" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#8f9663" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="wm-shade" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#3c2c18" stopOpacity="0.20" />
            <stop offset="100%" stopColor="#3c2c18" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="wm-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff6df" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#fff6df" stopOpacity="0" />
          </radialGradient>
          <pattern id="wm-trees" width="26" height="22" patternUnits="userSpaceOnUse">
            <g fill="none" stroke="#5f6349" strokeWidth="1.1" strokeLinecap="round">
              <path d="M6,16 C3,14 3,10 6,8 C4,6 6,3 8,4 C10,3 12,6 10,8 C13,10 13,14 10,16 M8,16v3" />
              <path d="M19,11 C16,9 17,6 19,5 C21,6 22,9 19,11 M19,11v2.5" />
            </g>
          </pattern>
          <pattern id="wm-waterlines" width="34" height="12" patternUnits="userSpaceOnUse">
            <path d="M0,6 q4,-2.5 8,0 t8,0 t8,0 t8,0" fill="none" stroke="#7f97a2" strokeWidth="0.8" strokeOpacity="0.5" />
          </pattern>
        </defs>

        {/* Pergaminho */}
        <rect x="0" y="0" width={W} height={H} fill="url(#wm-parch)" />

        {/* Tintas climáticas: neve ao norte, ravina vermelha ao sul, verde nas matas */}
        {layers.terrain && (
          <g>
            <ellipse cx="620" cy="48" rx="300" ry="120" fill="url(#wm-snow)" />
            <ellipse cx="150" cy="640" rx="240" ry="150" fill="url(#wm-red)" />
            <ellipse cx="250" cy="220" rx="320" ry="220" fill="url(#wm-green)" />
            <ellipse cx="560" cy="300" rx="260" ry="160" fill="url(#wm-green)" />
          </g>
        )}

        {/* Água */}
        <g>
          <path d={WEST_WATER} fill="#9fb2ba" />
          <path d={EAST_WATER} fill="#9fb2ba" />
          <path d={ISLAND} fill="#9fb2ba" opacity="0" />
          <path d={WEST_WATER} fill="url(#wm-waterlines)" />
          <path d={EAST_WATER} fill="url(#wm-waterlines)" />
          <path d={LAKE} fill="#9fb2ba" />
          <path d={LAKE} fill="url(#wm-waterlines)" />
        </g>

        {/* Ilha (terra sobre a água) */}
        <path d={ISLAND} fill="url(#wm-parch)" stroke="#4a3a26" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />

        {/* Linhas de costa + hachuras + ondas de margem */}
        <g fill="none" vectorEffect="non-scaling-stroke">
          <path d={smoothOpen(WEST_COAST)} stroke="#4a3a26" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
          <path d={smoothOpen(EAST_COAST)} stroke="#4a3a26" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
          <path d={hachures(WEST_COAST.slice(1, -1), -1)} stroke="#4a3a26" strokeOpacity="0.4" strokeWidth="0.9" vectorEffect="non-scaling-stroke" />
          <path d={hachures(EAST_COAST.slice(1, -1), -1)} stroke="#4a3a26" strokeOpacity="0.4" strokeWidth="0.9" vectorEffect="non-scaling-stroke" />
          <path d={smoothOpen(offsetPolyline(WEST_COAST, 9, -1))} stroke="#7f97a2" strokeOpacity="0.55" strokeWidth="0.9" strokeDasharray="10 6" vectorEffect="non-scaling-stroke" />
          <path d={smoothOpen(offsetPolyline(WEST_COAST, 18, -1))} stroke="#7f97a2" strokeOpacity="0.3" strokeWidth="0.9" strokeDasharray="8 8" vectorEffect="non-scaling-stroke" />
          <path d={smoothOpen(offsetPolyline(EAST_COAST, 9, -1))} stroke="#7f97a2" strokeOpacity="0.55" strokeWidth="0.9" strokeDasharray="10 6" vectorEffect="non-scaling-stroke" />
          <path d={smoothOpen(offsetPolyline(EAST_COAST, 18, -1))} stroke="#7f97a2" strokeOpacity="0.3" strokeWidth="0.9" strokeDasharray="8 8" vectorEffect="non-scaling-stroke" />
        </g>

        {/* Rios */}
        <g fill="none" stroke="#8aa2ad" strokeLinecap="round">
          {RIVERS.map((r, i) => (
            <path key={i} d={smoothOpen(wavy(r, 3, i * 2 + 1))} strokeWidth={2.4} vectorEffect="non-scaling-stroke" />
          ))}
        </g>

        {layers.terrain && (
          <g>
            {/* Curvas de nível */}
            <g fill="none" stroke="#8a7350" strokeOpacity="0.2" strokeWidth="0.8">
              <path d={blobPath(196, 222, 78, 42, 21)} />
              <path d={blobPath(636, 424, 84, 44, 23)} />
              <path d={blobPath(398, 552, 86, 40, 25)} />
              <path d={blobPath(748, 266, 62, 34, 27)} />
              <path d={blobPath(226, 492, 60, 32, 29)} />
            </g>

            {/* Relevo sombreado: sombra a SE, luz a NO de cada serra */}
            {RIDGES.map((r, i) => {
              const cx = (r.x1 + r.x2) / 2;
              const cy = (r.y1 + r.y2) / 2;
              const len = Math.hypot(r.x2 - r.x1, r.y2 - r.y1);
              const ang = (Math.atan2(r.y2 - r.y1, r.x2 - r.x1) * 180) / Math.PI;
              return (
                <g key={`sh-${i}`}>
                  <ellipse
                    cx={cx + 7} cy={cy + 8} rx={len / 2 + 18} ry={20}
                    fill="url(#wm-shade)"
                    transform={`rotate(${ang} ${cx + 7} ${cy + 8})`}
                  />
                  <ellipse
                    cx={cx - 6} cy={cy - 8} rx={len / 2 + 10} ry={14}
                    fill="url(#wm-glow)"
                    transform={`rotate(${ang} ${cx - 6} ${cy - 8})`}
                  />
                </g>
              );
            })}

            {/* Florestas */}
            {FORESTS.map((d, i) => (
              <g key={i}>
                <path d={d} fill="#b3ab86" fillOpacity="0.35" />
                <path d={d} fill="url(#wm-trees)" />
                <path d={d} fill="none" stroke="#6d6a4e" strokeOpacity="0.22" strokeWidth="1" />
              </g>
            ))}

            {/* Cordilheiras */}
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
          </g>
        )}

        {/* Estradas e ferrovias — dupla linha gravada + travessas */}
        {layers.roads && (
          <g fill="none" strokeLinecap="round">
            {ROADS.map((r, i) => {
              const d = smoothOpen(wavy(r.pts, r.trail ? 3 : 4.5, r.seed));
              return r.trail ? (
                <path key={i} d={d} stroke="#3a2c1a" strokeOpacity="0.65" strokeWidth="1.3" strokeDasharray="1 6" vectorEffect="non-scaling-stroke" />
              ) : (
                <g key={i}>
                  <path d={d} stroke="#3a2c1a" strokeOpacity="0.75" strokeWidth="2.6" vectorEffect="non-scaling-stroke" />
                  <path d={d} stroke="#d8c496" strokeWidth="1.1" vectorEffect="non-scaling-stroke" />
                </g>
              );
            })}
            {RAILS.map((r, i) => (
              <g key={`rail-${i}`} stroke="#2b1e12">
                <path d={smoothOpen(r)} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
                <path d={railTicks(r)} strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
              </g>
            ))}
          </g>
        )}

        {/* Rótulos decorativos */}
        {layers.labels && (
          <g
            aria-hidden
            fontFamily="var(--font-crimson), serif"
            fontStyle="italic"
            fill="#5c4a33"
            textAnchor="middle"
            stroke="#e8d6ae"
            strokeWidth={regionSize / 5}
            paintOrder="stroke"
          >
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
        )}

        {/* Regiões clicáveis */}
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
                {isSel && <circle cx={c.x} cy={c.y} r={r * 2.4} fill="#d1ab55" fillOpacity="0.35" />}
                <circle
                  cx={c.x} cy={c.y} r={r}
                  fill={isSel ? "#c9a23f" : added ? "#8a5a12" : "#f2e6cf"}
                  stroke="#2b1e12" strokeWidth={1.6} vectorEffect="non-scaling-stroke"
                />
                <text
                  x={lx} y={c.y + citySize * 0.35}
                  fontSize={citySize} fontWeight={700}
                  textAnchor={c.anchor === "right" ? "start" : "end"}
                  fill={isSel ? "#8a5a12" : "#2b1e12"}
                  stroke="#ead9b8" strokeWidth={citySize / 5} paintOrder="stroke"
                  style={{ letterSpacing: "0.04em" }}
                >
                  {c.nome}
                </text>
              </g>
            );
          })}
        </g>

        {/* Pinos do Juiz */}
        <g fontFamily="var(--font-cinzel), serif">
          {pins.map((p) => {
            const isSel = selectedPinId === p.id;
            const s = pinScale;
            return (
              <g
                key={p.id}
                className="cursor-pointer"
                onClick={() => selectPin(p.id)}
                transform={`translate(${p.x} ${p.y}) scale(${s})`}
              >
                {isSel && <circle cy={-11} r={16} fill="#d1ab55" fillOpacity="0.3" />}
                <path
                  d="M0,0 C-7,-9 -9,-13 -9,-17 A9,9 0 1 1 9,-17 C9,-13 7,-9 0,0 Z"
                  fill={isSel ? "#c9a23f" : "#8a5a12"}
                  stroke="#2b1e12"
                  strokeWidth="1.4"
                />
                <circle cy={-16.5} r={3.4} fill="#f2e6cf" stroke="#2b1e12" strokeWidth="1" />
              </g>
            );
          })}
          {pins.map((p) => (
            <text
              key={`lbl-${p.id}`}
              x={p.x}
              y={p.y + citySize * 1.1}
              fontSize={citySize * 0.92}
              fontWeight={700}
              textAnchor="middle"
              fill="#6e4a10"
              stroke="#ead9b8"
              strokeWidth={citySize / 5}
              paintOrder="stroke"
              className="cursor-pointer"
              onClick={() => selectPin(p.id)}
            >
              {p.nome}
            </text>
          ))}
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
            fill="#f4ead2" stroke="#b39b6e" strokeWidth="1.5"
          />
          <text textAnchor="middle" fontFamily="var(--font-cinzel), serif" fontWeight={900} fill="#241a10">
            <tspan x="0" y="-6" fontSize="26" style={{ letterSpacing: "0.06em" }}>O OESTE</tspan>
            <tspan x="0" y="24" fontSize="26" style={{ letterSpacing: "0.06em" }}>SELVAGEM</tspan>
          </text>
        </g>

        {/* Moldura cartográfica dupla */}
        <g fill="none" stroke="#4a3a26" pointerEvents="none">
          <rect x="4" y="4" width={W - 8} height={H - 8} strokeWidth="2.2" strokeOpacity="0.7" />
          <rect x="11" y="11" width={W - 22} height={H - 22} strokeWidth="0.8" strokeOpacity="0.5" />
        </g>
      </svg>

      {/* Grão de papel (estático, barato) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-multiply"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 180 180\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
          backgroundSize: "180px 180px",
        }}
      />
      {/* Vinheta de borda queimada */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ boxShadow: "inset 0 0 60px rgba(90,64,30,0.35)" }}
      />

      {/* Busca */}
      <div className="absolute left-3 top-3 w-[min(15rem,60%)]">
        <div className="arcana-glass rounded-xl">
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
            placeholder="Buscar lugar..."
            className="w-full bg-transparent px-3 py-2 font-crimson text-sm text-arcana-text outline-none placeholder:text-arcana-text-dim"
          />
        </div>
        {searchOpen && results.length > 0 && (
          <div className="arcana-glass mt-1.5 overflow-hidden rounded-xl">
            {results.map((r) => (
              <button
                key={r.id}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  flyTo(r.x, r.y, 380);
                  setSelectedPinId(null);
                  setSelectedId(r.id);
                  setQuery("");
                  setSearchOpen(false);
                }}
                className="flex w-full items-baseline justify-between gap-2 px-3 py-2 text-left transition-colors hover:bg-arcana-gold/10"
              >
                <span className="truncate font-crimson text-sm text-arcana-text">{r.nome}</span>
                <span className="shrink-0 font-cinzel text-[9px] uppercase tracking-[0.2em] text-arcana-text-dim">
                  {r.tipo}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Zoom + camadas */}
      <div className="absolute right-3 top-3 flex flex-col items-end gap-1.5">
        <button
          type="button"
          title="Aproximar"
          onClick={() => zoomCenter(1 / 1.35)}
          className="arcana-glass flex h-9 w-9 items-center justify-center rounded-xl font-cinzel text-sm text-arcana-text transition-colors hover:text-arcana-gold"
        >
          +
        </button>
        <button
          type="button"
          title="Afastar"
          onClick={() => zoomCenter(1.35)}
          className="arcana-glass flex h-9 w-9 items-center justify-center rounded-xl font-cinzel text-sm text-arcana-text transition-colors hover:text-arcana-gold"
        >
          −
        </button>
        <button
          type="button"
          title="Ver o mapa inteiro"
          onClick={resetView}
          className="arcana-glass flex h-9 w-9 items-center justify-center rounded-xl font-cinzel text-sm text-arcana-text transition-colors hover:text-arcana-gold"
        >
          ⌂
        </button>
        <button
          type="button"
          onClick={() => setLayersOpen((v) => !v)}
          aria-expanded={layersOpen}
          title="Camadas"
          className={[
            "arcana-glass flex h-9 w-9 items-center justify-center rounded-xl transition-colors",
            layersOpen ? "text-arcana-gold" : "text-arcana-text hover:text-arcana-gold",
          ].join(" ")}
        >
          <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
            <path d="M12 3 3 8l9 5 9-5-9-5z" />
            <path d="M3 12.5 12 17.5l9-5" />
          </svg>
        </button>
        {layersOpen && (
          <div className="arcana-glass w-44 rounded-xl p-2">
            {(
              [
                ["labels", "Rótulos do mundo"],
                ["roads", "Estradas & ferrovias"],
                ["terrain", "Terreno & relevo"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setLayers((l) => ({ ...l, [key]: !l[key] }))}
                className="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-arcana-gold/10"
              >
                <span className="font-crimson text-[13px] text-arcana-text">{label}</span>
                <span
                  className={[
                    "h-3 w-3 rotate-45 rounded-[2px] border transition-colors",
                    layers[key] ? "border-arcana-gold-bright bg-arcana-gold" : "border-arcana-border",
                  ].join(" ")}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Modo posicionar pino */}
      {placingLabel && (
        <div className="arcana-glass absolute left-1/2 top-3 flex max-w-[85%] -translate-x-1/2 items-center gap-3 rounded-full px-4 py-2">
          <span className="truncate font-crimson text-sm text-arcana-text">
            Clique no mapa para posicionar <strong className="text-arcana-gold-bright">{placingLabel}</strong>
          </span>
          {onCancelPlacing && (
            <button
              type="button"
              onClick={onCancelPlacing}
              className="shrink-0 font-cinzel text-[10px] uppercase tracking-[0.2em] text-arcana-text-dim hover:text-arcana-gold"
            >
              Cancelar
            </button>
          )}
        </div>
      )}

      {/* Carta do lugar canônico */}
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

      {/* Carta do pino do Juiz */}
      {selectedPin && (
        <div className="arcana-glass absolute bottom-3 left-3 w-[min(21rem,calc(100%-1.5rem))] rounded-2xl p-3.5">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate font-cinzel text-sm font-bold uppercase tracking-[0.12em] text-arcana-gold-bright">
              📍 {selectedPin.nome}
            </p>
            <button
              type="button"
              onClick={() => setSelectedPinId(null)}
              aria-label="Fechar"
              className="shrink-0 font-cinzel text-xs text-arcana-text-dim hover:text-arcana-gold"
            >
              ✕
            </button>
          </div>
          {selectedPin.descricao && (
            <p className="mt-1 line-clamp-2 font-crimson text-[13px] leading-snug text-arcana-text-dim">
              {selectedPin.descricao}
            </p>
          )}
          <div className="mt-2.5 flex items-center justify-between gap-2">
            <span className="font-cinzel text-[9px] uppercase tracking-[0.2em] text-arcana-text-dim">
              Lugar da campanha
            </span>
            {onRemovePin && (
              <button
                type="button"
                onClick={() => {
                  onRemovePin(selectedPin.id);
                  setSelectedPinId(null);
                }}
                className="arcana-btn-danger arcana-btn-sm"
              >
                Remover pino
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
