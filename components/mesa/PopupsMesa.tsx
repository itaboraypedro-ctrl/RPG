"use client";

import { useEffect, useState } from "react";
import { visualDoEfeito, type Efeito } from "@/lib/rulesets/sacramento/efeitos";
import type { SessionEvent } from "@/lib/types";
import { somClique, somTiro, vibrar } from "./itens/som";

/* eslint-disable @next/next/no-img-element */

const DURACAO = 2300;

/**
 * Popups do que o Juiz faz com este personagem (dinheiro, cura, dano, XP).
 * Só reage a eventos que chegam depois de abrir a tela, um de cada vez.
 */
export function PopupsMesa({ events, characterId }: { events: SessionEvent[]; characterId: string }) {
  const [vistos, setVistos] = useState<Set<string>>(() => new Set(events.map((e) => e.id)));
  const [fila, setFila] = useState<{ k: string; e: Efeito }[]>([]);

  // Eventos novos entram na fila durante a renderização (padrão de "ajustar ao mudar a prop").
  const novos = events.filter((e) => !vistos.has(e.id));
  if (novos.length > 0) {
    setVistos(new Set([...vistos, ...novos.map((e) => e.id)]));
    const chegando: { k: string; e: Efeito }[] = [];
    for (const ev of [...novos].reverse()) {
      const p = ev.payload as { personagemId?: string; efeitos?: Efeito[] };
      if (p?.personagemId !== characterId || !Array.isArray(p.efeitos)) continue;
      p.efeitos.forEach((e, i) => chegando.push({ k: `${ev.id}-${i}`, e }));
    }
    if (chegando.length) setFila((f) => [...f, ...chegando]);
  }

  const atual = fila[0];
  useEffect(() => {
    if (!atual) return;
    const e = atual.e;
    if (e.tipo === "dano" || e.tipo === "morte") {
      vibrar(e.tipo === "morte" ? [120, 60, 220] : [50, 40, 110]);
      if (e.tipo === "dano" && e.causa === "tiro") somTiro();
    } else if (e.tipo === "dinheiro") {
      [0, 90, 180].forEach((t, i) => setTimeout(() => somClique(1.8 + i * 0.3), t));
    } else vibrar(20);
    const t = setTimeout(() => setFila((f) => f.slice(1)), DURACAO);
    return () => clearTimeout(t);
  }, [atual]);

  if (!atual) return null;
  return <Popup key={atual.k} efeito={atual.e} onClose={() => setFila((f) => f.slice(1))} />;
}

function Popup({ efeito, onClose }: { efeito: Efeito; onClose: () => void }) {
  const v = visualDoEfeito(efeito);
  const [semArte, setSemArte] = useState(!v.imagem);
  const tremer = efeito.tipo === "dano" || efeito.tipo === "morte";
  return (
    <button
      type="button"
      onClick={onClose}
      aria-label={`${v.titulo}: ${v.valor}`}
      className={`fixed inset-0 z-[210] flex flex-col items-center justify-center bg-black/45 ${tremer ? "animate-[sacraShake_0.4s_ease-out]" : ""}`}
    >
      <div className="relative h-64 w-64 sm:h-80 sm:w-80">
        {/* Estouro neutro tingido pela cor do efeito */}
        <span
          aria-hidden
          className="absolute inset-0 animate-[sacraEstouro_2.3s_ease-out_forwards]"
          style={{
            background: v.cor,
            WebkitMaskImage: "url(/story/uso/popups/estouro.webp)",
            maskImage: "url(/story/uso/popups/estouro.webp)",
            WebkitMaskSize: "contain",
            maskSize: "contain",
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            WebkitMaskPosition: "center",
            maskPosition: "center",
          }}
        />
        <div className={`absolute inset-[12%] flex items-center justify-center ${v.sai ? "animate-[sacraSai_2.3s_ease-in_forwards]" : "animate-[sacraSalta_0.55s_cubic-bezier(0.2,1.6,0.4,1)_forwards]"}`}>
          {semArte || !v.imagem ? (
            <span className="text-[7rem] leading-none drop-shadow-[0_6px_20px_rgba(0,0,0,0.8)]">{v.emoji}</span>
          ) : (
            <img src={v.imagem} alt="" draggable={false} onError={() => setSemArte(true)} className="h-full w-full object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.75)]" />
          )}
        </div>
      </div>
      <p className="mt-2 animate-[sacraPop_0.4s_ease-out] font-cinzel text-5xl font-bold tabular-nums text-white" style={{ textShadow: `0 0 24px ${v.cor}, 0 3px 10px rgba(0,0,0,0.9)` }}>
        {v.valor}
      </p>
      <p className="mt-1 font-cinzel text-sm uppercase tracking-[0.3em] text-white" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.9)" }}>
        {v.titulo}
      </p>
    </button>
  );
}
