"use client";

import { useRef, useState, useTransition } from "react";
import { atirar, girarTambor, recarregar, tirarCapsula } from "@/app/play/[session_id]/itens-actions";
import { itemById, itemImagem } from "@/lib/character-creation/sacramento/catalogo";
import type { UsoItem } from "@/lib/rulesets/sacramento/itens-uso";
import { NOME_CALIBRE, cargaDe, modulo, nomeDoItem, reservaDe, tamborDe, type ItemInventario } from "@/lib/rulesets/sacramento/inventario";
import type { Rolagem } from "@/lib/rulesets/sacramento/mesa";
import type { Character } from "@/lib/types";
import { Canos, Pente, Tubo, USO } from "./Mecanismos";
import { somClique, somTiro, vibrar } from "./som";

/* eslint-disable @next/next/no-img-element */

type ArmaUso = Extract<UsoItem, { tipo: "arma-fogo" }>;

// Geometria do tambor medida na arte: centro (50%, 48,6%), câmaras a 29,5% do centro.
const CX = 50;
const CY = 48.6;
const RAIO = 29.5;

const DEFESAS = [
  { v: 3, rotulo: "Surpreso 3" },
  { v: 5, rotulo: "Normal 5" },
  { v: 6, rotulo: "Coberto 6" },
  { v: 7, rotulo: "Total 7" },
];

/** Tela cheia da arma, sem rolagem: mecanismo grande, defesa e dois botões. */
export function TelaArma({
  sessionId,
  character,
  indice,
  item,
  inv,
  uso,
  onClose,
  onRefresh,
}: {
  sessionId: string;
  character: Character;
  indice: number;
  item: ItemInventario;
  inv: ItemInventario[];
  uso: ArmaUso;
  onClose: () => void;
  onRefresh: () => void;
}) {
  const [pending, start] = useTransition();
  const [erro, setErro] = useState<string | null>(null);
  const [res, setRes] = useState<{ k: number; rolagem?: Rolagem; texto: string } | null>(null);
  const [defesa, setDefesa] = useState(5);
  const [disparo, setDisparo] = useState(0);
  const [tremor, setTremor] = useState(0);
  const ehTambor = uso.mecanismo === "tambor";

  // Tambor câmara a câmara (otimista; o servidor confirma).
  const inicial = tamborDe(item, uso.carga);
  const [camaras, setCamaras] = useState(inicial.camaras);
  const [rot, setRot] = useState(-inicial.posicao * 60);
  const [carga, setCarga] = useState(cargaDe(item));
  const [origem, setOrigem] = useState(item);
  if (origem !== item) {
    setOrigem(item);
    const t = tamborDe(item, uso.carga);
    setCamaras(t.camaras);
    if (modulo(-rot / 60, uso.carga) !== t.posicao) setRot(-t.posicao * 60);
    setCarga(cargaDe(item));
  }
  const posicao = modulo(-rot / 60, uso.carga);
  const reserva = reservaDe(inv, uso.calibre);
  const temCapsula = ehTambor && camaras.includes(2);
  const falta = ehTambor ? camaras.filter((c) => c !== 1).length : uso.carga - carga;
  const podeRecarregar = (falta > 0 && reserva.porte + reserva.caixa > 0) || temCapsula;
  const [caindo, setCaindo] = useState<{ id: number; x: number; y: number }[]>([]);

  const mostrar = (r: { rolagem?: Rolagem; texto: string }) => {
    const k = Date.now();
    setRes({ ...r, k });
    setTimeout(() => setRes((atual) => (atual?.k === k ? null : atual)), 4500);
  };

  function derrubar(ks: number[], rotAtual: number) {
    const agora = Date.now();
    setCaindo((c) => [
      ...c,
      ...ks.map((k, i) => {
        const a = ((k * 60 - 90 + rotAtual) * Math.PI) / 180;
        return { id: agora + i, x: CX + RAIO * Math.cos(a), y: CY + RAIO * Math.sin(a) };
      }),
    ]);
    ks.forEach((_, i) => setTimeout(() => somClique(2.4 - i * 0.15), 250 + i * 90));
    setTimeout(() => setCaindo((c) => c.filter((x) => x.id < agora || x.id >= agora + ks.length)), 1100);
  }

  function gatilho() {
    if (pending) return;
    setErro(null);
    const cheia = ehTambor ? camaras[posicao] === 1 : carga > 0;
    if (!cheia) {
      somClique(0.8);
      vibrar(15);
      if (ehTambor) {
        setRot((r) => r - 60);
        start(async () => {
          await atirar(sessionId, character.id, indice, defesa, posicao);
          onRefresh();
        });
      }
      return;
    }
    somTiro();
    vibrar([40, 30, 90]);
    setTremor(Date.now());
    setDisparo(Date.now());
    if (ehTambor) {
      setCamaras((c) => c.map((v, k) => (k === posicao ? 2 : v)));
      setRot((r) => r - 60);
    } else setCarga((c) => Math.max(0, c - 1));
    start(async () => {
      const r = await atirar(sessionId, character.id, indice, defesa, ehTambor ? posicao : undefined);
      if (!r.ok) setErro(r.error);
      else if (!r.seco) mostrar({ rolagem: r.rolagem, texto: r.rolagem.texto });
      onRefresh();
    });
  }

  function recarga() {
    setErro(null);
    const capsulas = camaras.map((c, k) => (c === 2 ? k : -1)).filter((k) => k >= 0);
    start(async () => {
      const r = await recarregar(sessionId, character.id, indice, ehTambor ? posicao : undefined);
      if (!r.ok) {
        setErro(r.error);
        return;
      }
      if (ehTambor && capsulas.length) derrubar(capsulas, rot);
      if (r.tambor) setCamaras(r.tambor.camaras);
      else setCarga(r.carga);
      [0, 110, 220].forEach((t, i) => setTimeout(() => somClique(1.2 + i * 0.2), 350 + t));
      vibrar(20);
      mostrar({ texto: r.texto });
      onRefresh();
    });
  }

  /* ── Girar o tambor com o dedo/mouse; toque curto numa cápsula tira ela ── */
  const caixa = useRef<HTMLDivElement | null>(null);
  const arrasto = useRef<{ ang: number; total: number; inicio: number; acum: number; passo: number } | null>(null);
  const [arrastando, setArrastando] = useState(false);

  const anguloDoPonteiro = (e: React.PointerEvent) => {
    const r = caixa.current!.getBoundingClientRect();
    return (Math.atan2(e.clientY - (r.top + (r.height * CY) / 100), e.clientX - (r.left + (r.width * CX) / 100)) * 180) / Math.PI;
  };

  function aoTocar(e: React.PointerEvent) {
    if (!ehTambor) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    arrasto.current = { ang: anguloDoPonteiro(e), total: 0, inicio: rot, acum: 0, passo: Math.round(rot / 60) };
    setArrastando(true);
  }

  function aoMover(e: React.PointerEvent) {
    const a = arrasto.current;
    if (!a) return;
    const ang = anguloDoPonteiro(e);
    let d = ang - a.ang;
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    a.ang = ang;
    a.total += Math.abs(d);
    a.acum += d;
    const nova = a.inicio + a.acum;
    setRot(nova);
    // Catraca: um clique por câmara que passa pelo topo.
    const passo = Math.round(nova / 60);
    if (passo !== a.passo) {
      a.passo = passo;
      somClique(1.6);
      vibrar(4);
    }
  }

  function aoSoltar(e: React.PointerEvent) {
    const a = arrasto.current;
    arrasto.current = null;
    setArrastando(false);
    if (!a) return;
    if (a.total < 5) {
      // Toque: qual câmara está sob o dedo?
      const r = caixa.current!.getBoundingClientRect();
      const px = ((e.clientX - r.left) / r.width) * 100;
      const py = ((e.clientY - r.top) / r.height) * 100;
      const k = camaras.findIndex((_, k) => {
        const ang = ((k * 60 - 90 + rot) * Math.PI) / 180;
        return Math.hypot(px - (CX + RAIO * Math.cos(ang)), py - (CY + RAIO * Math.sin(ang))) < 12;
      });
      setRot((x) => Math.round(x / 60) * 60);
      if (k >= 0 && camaras[k] === 2) {
        derrubar([k], Math.round(rot / 60) * 60);
        setCamaras((c) => c.map((v, i) => (i === k ? 0 : v)));
        start(async () => {
          const r2 = await tirarCapsula(sessionId, character.id, indice, k, modulo(-Math.round(rot / 60), uso.carga));
          if (!r2.ok) setErro(r2.error);
          onRefresh();
        });
      }
      return;
    }
    const final = Math.round(rot / 60) * 60;
    setRot(final);
    void girarTambor(sessionId, character.id, indice, modulo(-final / 60, uso.carga));
  }

  const nota = item.id ? itemById(item.id)?.nota : undefined;

  return (
    <div className="arcana-scene fixed inset-0 z-[160] flex flex-col text-arcana-text" role="dialog" aria-modal="true" aria-label={nomeDoItem(item)} style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      {/* Topo */}
      <header className="flex shrink-0 items-center gap-3 border-b border-arcana-gold/25 px-3 py-2">
        <button type="button" onClick={onClose} className="arcana-btn-ghost arcana-btn-sm">← Voltar</button>
        {item.id && <img src={itemImagem(item.id)} alt="" className="h-9 w-9 object-contain" />}
        <div className="min-w-0 flex-1">
          <p className="truncate font-cinzel text-base text-arcana-gold-bright">{nomeDoItem(item)}</p>
          {nota && <p className="truncate font-crimson text-xs text-arcana-text">{nota} · recarga {uso.recargaAC} AC</p>}
        </div>
      </header>

      {/* Contagem */}
      <div className="flex shrink-0 justify-center gap-4 px-3 pt-2 font-cinzel text-xs uppercase tracking-[0.15em]">
        <span className={carga === 0 ? "text-red-200" : "text-white"}>Na arma {carga}/{uso.carga}</span>
        <span className="text-arcana-text">{uso.calibre === "revolver" ? "Cinturão" : "Bandoleira"} {reserva.porte}</span>
        <span className="text-arcana-text">Caixa {reserva.caixa}</span>
      </div>

      {/* Mecanismo: ocupa o espaço que sobrar */}
      <main className="relative flex min-h-0 flex-1 items-center justify-center p-3" style={{ containerType: "size" }}>
        {/* Quadrado do maior tamanho que couber (largura ou altura) */}
        <div key={tremor} className={`relative ${tremor ? "animate-[sacraShake_0.35s_ease-out]" : ""}`} style={{ width: "min(100cqw, 100cqh)", aspectRatio: "1" }}>
          {ehTambor ? (
            <div
              ref={caixa}
              onPointerDown={aoTocar}
              onPointerMove={aoMover}
              onPointerUp={aoSoltar}
              onPointerCancel={aoSoltar}
              className={`absolute inset-0 touch-none select-none ${arrastando ? "cursor-grabbing" : "cursor-grab"}`}
            >
              <div
                className="absolute inset-0"
                style={{
                  transform: `rotate(${rot}deg)`,
                  transformOrigin: `${CX}% ${CY}%`,
                  transition: arrastando ? "none" : "transform 0.18s cubic-bezier(0.3,0.7,0.4,1)",
                }}
              >
                <img src={USO("armas/tambor")} alt="Tambor" draggable={false} className="absolute inset-0 h-full w-full" />
                {camaras.map((c, k) => {
                  if (c === 0) return null;
                  const a = ((k * 60 - 90) * Math.PI) / 180;
                  return (
                    <img
                      key={k}
                      src={USO(c === 2 ? "municao/culote-deflagrado" : "municao/culote")}
                      alt=""
                      draggable={false}
                      className="absolute"
                      style={{
                        left: `${CX + RAIO * Math.cos(a)}%`,
                        top: `${CY + RAIO * Math.sin(a)}%`,
                        width: "23%",
                        transform: "translate(-50%,-50%)",
                        // Cápsula disparada bem mais escura que a bala: dá para ler de relance.
                        filter: c === 2 ? "brightness(0.5) saturate(0.6)" : undefined,
                      }}
                    />
                  );
                })}
              </div>
              {/* Marca da posição de disparo */}
              <span aria-hidden className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1 text-2xl text-arcana-gold-bright drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">▼</span>
              {caindo.map((c) => (
                <img
                  key={c.id}
                  src={USO("municao/culote-deflagrado")}
                  alt=""
                  className="pointer-events-none absolute animate-[sacraCai_1s_ease-in_forwards]"
                  style={{ left: `${c.x}%`, top: `${c.y}%`, width: "23%", transform: "translate(-50%,-50%)", filter: "brightness(0.5) saturate(0.6)" }}
                />
              ))}
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              {uso.mecanismo === "canos" && <Canos carga={carga} total={uso.carga} />}
              {uso.mecanismo === "pente" && <Pente carga={carga} total={uso.carga} />}
              {uso.mecanismo === "tubo" && <Tubo carga={carga} total={uso.carga} calibre={uso.calibre} />}
            </div>
          )}
          {disparo > 0 && (
            // Clarão e fumaça saindo da câmara do topo, para cima.
            <div key={disparo} className="pointer-events-none absolute" style={{ left: "50%", top: `${ehTambor ? CY - RAIO : 30}%`, width: "70%", transform: "translate(0,-50%) rotate(-90deg)", transformOrigin: "0% 50%" }}>
              <img src={USO("efeitos/clarao-disparo")} alt="" className="w-full animate-[sacraMuzzle_0.28s_ease-out_forwards] mix-blend-screen" style={{ transformOrigin: "left center" }} />
              <img src={USO("efeitos/fumaca")} alt="" className="absolute left-[10%] top-[-20%] w-[80%] animate-[sacraSmoke_1.6s_ease-out_forwards] opacity-0 mix-blend-screen" />
            </div>
          )}
        </div>

        {/* Resultado por cima, some sozinho */}
        {(res || erro) && (
          <button
            type="button"
            onClick={() => {
              setRes(null);
              setErro(null);
            }}
            className={`absolute inset-x-4 bottom-3 mx-auto max-w-md animate-[sacraPop_0.3s_ease-out] rounded-2xl border-2 bg-[rgba(10,9,15,0.92)] p-3 text-center ${
              erro ? "border-red-400/70" : res?.rolagem?.sucesso === true ? "border-emerald-400/80" : res?.rolagem?.sucesso === false ? "border-red-400/80" : "border-arcana-gold/60"
            }`}
          >
            {res?.rolagem && <p className="font-cinzel text-3xl tabular-nums text-white">{res.rolagem.dados.join(" · ")}</p>}
            <p className="font-crimson text-base text-white">{erro ?? res?.texto}</p>
          </button>
        )}
      </main>

      {ehTambor && (
        <p className="shrink-0 text-center font-crimson text-xs text-arcana-text">
          Arraste para girar · dispara a câmara marcada ▼{temCapsula ? " · toque numa cápsula para tirar" : ""}
        </p>
      )}

      {/* Defesa */}
      <div className="flex shrink-0 justify-center gap-1.5 px-3 pt-2">
        {DEFESAS.map((d) => (
          <button
            key={d.v}
            type="button"
            onClick={() => setDefesa(d.v)}
            className={`rounded-full border px-2.5 py-1 font-cinzel text-[11px] ${defesa === d.v ? "border-arcana-gold bg-arcana-gold font-bold text-arcana-bg" : "border-arcana-border text-arcana-text"}`}
          >
            {d.rotulo}
          </button>
        ))}
      </div>

      {/* Botões */}
      <div className="flex shrink-0 gap-3 p-3">
        <button
          type="button"
          onClick={gatilho}
          disabled={pending}
          className="flex h-20 flex-[2] items-center justify-center rounded-2xl border-2 border-red-300/80 bg-[radial-gradient(circle_at_50%_35%,#8b2a1f,#3b0f0b)] font-cinzel text-xl font-bold uppercase tracking-[0.25em] text-white shadow-[0_0_24px_rgba(200,60,40,0.45)] active:scale-[0.97] disabled:opacity-70"
        >
          Atirar
        </button>
        <button type="button" onClick={recarga} disabled={pending || !podeRecarregar} className="arcana-btn-ghost flex h-20 flex-1 flex-col items-center justify-center">
          <span>Recarregar</span>
          <span className="font-crimson text-[11px] normal-case tracking-normal text-arcana-text">
            {!podeRecarregar && falta > 0 ? `sem ${NOME_CALIBRE[uso.calibre]}` : `${uso.recargaAC + (reserva.porte === 0 && reserva.caixa > 0 ? 2 : 0)} AC`}
          </span>
        </button>
      </div>
    </div>
  );
}
