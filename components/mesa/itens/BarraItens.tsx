"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { atirar, encherPorte, recarregar, usarItem } from "@/app/play/[session_id]/itens-actions";
import { itemById, itemImagem, resumoCompras } from "@/lib/character-creation/sacramento/catalogo";
import { usoDoItem, type Calibre, type UsoItem } from "@/lib/rulesets/sacramento/itens-uso";
import {
  NOME_CALIBRE,
  balasDaCaixa,
  balasDoPorte,
  calibreDoPorte,
  cargaDe,
  lerInventario,
  nomeDoItem,
  reservaDe,
  slotsDaBarra,
  usosRestantes,
  type ItemInventario,
} from "@/lib/rulesets/sacramento/inventario";
import type { Rolagem } from "@/lib/rulesets/sacramento/mesa";
import type { Carta } from "@/lib/rulesets/sacramento/types";
import type { Character } from "@/lib/types";
import { CartaMini } from "../pecas";
import { Alcas, Caixa, Canos, Pente, Tambor, Tubo, USO } from "./Mecanismos";
import { somClique, somRiscar, somTiro, vibrar } from "./som";

/* eslint-disable @next/next/no-img-element */

const LABEL = "font-cinzel text-[10px] uppercase tracking-[0.25em] text-arcana-gold";

/** Barra fixa no rodapé da ficha: um slot por item, rolagem horizontal. */
export function BarraItens({ sessionId, character, onRefresh }: { sessionId: string; character: Character; onRefresh: () => void }) {
  const inv = lerInventario(character.inventory);
  const slots = slotsDaBarra(inv);
  const [aberto, setAberto] = useState<number | null>(null);
  if (slots.length === 0) return null;
  const item = aberto != null ? inv[aberto] : null;

  return (
    <>
      <nav
        aria-label="Itens"
        className="fixed inset-x-0 bottom-0 z-[120] border-t border-arcana-gold/30 bg-[rgba(10,9,15,0.94)] backdrop-blur-md"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <ul className="flex snap-x gap-2 overflow-x-auto px-3 py-2" style={{ scrollbarWidth: "none" }}>
          {slots.map(({ indice, item: it, uso, selo }) => (
            <li key={`${it.id}-${indice}`} className="snap-start">
              <button
                type="button"
                onClick={() => setAberto(indice)}
                className={`relative flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border bg-[linear-gradient(160deg,rgba(38,19,24,0.9),rgba(12,10,16,0.95))] transition-transform active:scale-95 ${
                  uso ? "border-arcana-gold/60" : "border-arcana-border"
                } ${uso?.tipo === "arma-fogo" && cargaDe(it) === 0 ? "ring-1 ring-red-400/70" : ""}`}
                aria-label={`${nomeDoItem(it)}${selo ? ` (${selo})` : ""}`}
              >
                {it.id && <img src={itemImagem(it.id)} alt="" className="h-12 w-12 object-contain" loading="lazy" draggable={false} />}
                {it.acesa && <span aria-hidden className="absolute inset-0 rounded-xl shadow-[inset_0_0_18px_rgba(240,180,80,0.6)]" />}
                {selo && (
                  <span className="absolute -bottom-1 -right-1 rounded-full border border-arcana-gold/70 bg-[#0b0b14] px-1.5 font-cinzel text-[10px] tabular-nums text-arcana-gold-bright">
                    {selo}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {item && aberto != null && (
        <PainelItem
          key={aberto}
          sessionId={sessionId}
          character={character}
          indice={aberto}
          item={item}
          inv={inv}
          onClose={() => setAberto(null)}
          onRefresh={onRefresh}
        />
      )}
    </>
  );
}

/* ─────────────── Painel do item ─────────────── */

type Retorno = { texto?: string; rolagem?: Rolagem; carta?: Carta; dados?: number[] };

function PainelItem({
  sessionId,
  character,
  indice,
  item,
  inv,
  onClose,
  onRefresh,
}: {
  sessionId: string;
  character: Character;
  indice: number;
  item: ItemInventario;
  inv: ItemInventario[];
  onClose: () => void;
  onRefresh: () => void;
}) {
  const uso = usoDoItem(item.id);
  const cat = item.id ? itemById(item.id) : undefined;
  const [tremor, setTremor] = useState(0);

  return (
    <div className="fixed inset-0 z-[160] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label={nomeDoItem(item)}>
      <button aria-label="Fechar" onClick={onClose} className="absolute inset-0 bg-black/75" />
      <div
        key={tremor}
        className={`arcana-card relative max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-b-none p-4 sm:rounded-b-2xl ${tremor ? "animate-[sacraShake_0.35s_ease-out]" : ""}`}
        style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}
      >
        <header className="mb-3 flex items-start gap-3">
          {item.id && <img src={itemImagem(item.id)} alt="" className="h-14 w-14 shrink-0 object-contain" />}
          <div className="min-w-0 flex-1">
            <h2 className="font-cinzel text-lg text-arcana-gold-bright">{nomeDoItem(item)}</h2>
            {cat?.nota && <p className="font-crimson text-sm text-white">{cat.nota}</p>}
            {(item.quantidade ?? 1) > 1 && uso?.tipo !== "municao" && <p className="font-crimson text-sm text-arcana-text">{item.quantidade} unidades</p>}
          </div>
          <button type="button" onClick={onClose} className="arcana-btn-ghost arcana-btn-sm">Fechar</button>
        </header>

        <Corpo
          sessionId={sessionId}
          character={character}
          indice={indice}
          item={item}
          inv={inv}
          uso={uso}
          onRefresh={onRefresh}
          onTremor={() => setTremor(Date.now())}
        />

        {"decisao" in (uso ?? {}) && (uso as { decisao?: string }).decisao && (
          <p className="mt-3 rounded-xl border border-amber-400/40 px-3 py-2 font-crimson text-sm text-amber-200">
            Regra da mesa: {(uso as { decisao?: string }).decisao}
          </p>
        )}
        {cat?.descricao && <p className="mt-3 font-crimson text-sm italic text-arcana-text">“{cat.descricao}”</p>}
      </div>
    </div>
  );
}

type CorpoProps = {
  sessionId: string;
  character: Character;
  indice: number;
  item: ItemInventario;
  inv: ItemInventario[];
  uso: UsoItem | null;
  onRefresh: () => void;
  onTremor: () => void;
};

function Corpo(p: CorpoProps) {
  switch (p.uso?.tipo) {
    case "arma-fogo":
      return <PainelArma {...p} uso={p.uso} />;
    case "municao":
      return <PainelMunicao {...p} uso={p.uso} />;
    case "porte":
      return <PainelPorte {...p} uso={p.uso} />;
    case "luz":
      return <PainelLanterna {...p} />;
    case "gadget":
      return <PainelGadget {...p} uso={p.uso} />;
    case "recipiente":
      return <PainelMochila {...p} uso={p.uso} />;
    case "arremesso":
      return <PainelDinamite {...p} />;
    case "consumivel":
    case "remedio":
    case "fogo":
    case "contador":
      return <PainelUsar {...p} uso={p.uso} />;
    default:
      return <p className="font-crimson text-base text-arcana-text">Fica no alforje. Sem uso direto na mesa.</p>;
  }
}

/* ── Ação no servidor + resultado ── */

function useAcao(onRefresh: () => void) {
  const [pending, start] = useTransition();
  const [erro, setErro] = useState<string | null>(null);
  const [res, setRes] = useState<Retorno | null>(null);
  const rodar = (fn: () => Promise<({ ok: true } & Retorno) | { ok: false; error: string }>, depois?: (r: Retorno) => void) =>
    start(async () => {
      setErro(null);
      const r = await fn();
      if (!r.ok) {
        setErro(r.error);
        return;
      }
      setRes(r);
      depois?.(r);
      onRefresh();
    });
  return { pending, erro, res, setRes, rodar };
}

function Resultado({ erro, res }: { erro: string | null; res: Retorno | null }) {
  if (erro) return <p className="rounded-xl border border-red-400/60 bg-red-950/40 px-3 py-2 font-crimson text-base text-red-200">{erro}</p>;
  if (!res) return null;
  const r = res.rolagem;
  return (
    <div
      key={res.texto}
      className={`animate-[sacraPop_0.3s_ease-out] rounded-xl border-2 p-3 text-center ${r?.sucesso === true ? "border-emerald-400/70 bg-emerald-950/40" : r?.sucesso === false ? "border-red-400/70 bg-red-950/40" : "border-arcana-gold/50"}`}
    >
      {r && <p className="font-cinzel text-4xl tabular-nums text-white">{r.dados.join(" · ")}</p>}
      {res.dados && <p className="font-cinzel text-4xl tabular-nums text-white">{res.dados.join(" · ")}</p>}
      {res.carta && (
        <div className="flex justify-center py-1">
          <CartaMini carta={res.carta} />
        </div>
      )}
      <p className="mt-1 font-crimson text-base text-white">{r ? r.texto : res.texto}</p>
      <p className="font-crimson text-xs text-arcana-text">A mesa viu isso.</p>
    </div>
  );
}

const DEFESAS = [
  { v: 3, rotulo: "Surpreso 3" },
  { v: 5, rotulo: "Normal 5" },
  { v: 6, rotulo: "Coberto 6" },
  { v: 7, rotulo: "Coberto total 7" },
];

function SeletorDefesa({ valor, onChange }: { valor: number; onChange: (v: number) => void }) {
  return (
    <div className="space-y-1">
      <p className={LABEL}>Defesa do alvo</p>
      <div className="flex flex-wrap gap-1.5">
        {DEFESAS.map((d) => (
          <button
            key={d.v}
            type="button"
            onClick={() => onChange(d.v)}
            className={`rounded-full border px-3 py-1 font-cinzel text-[11px] ${valor === d.v ? "border-arcana-gold bg-arcana-gold font-bold text-arcana-bg" : "border-arcana-border text-arcana-text"}`}
          >
            {d.rotulo}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Arma de fogo ── */

function PainelArma({ sessionId, character, indice, item, inv, uso, onRefresh, onTremor }: CorpoProps & { uso: Extract<UsoItem, { tipo: "arma-fogo" }> }) {
  const { pending, erro, res, rodar } = useAcao(onRefresh);
  // Estado otimista: a animação não espera o servidor.
  const [carga, setCarga] = useState(cargaDe(item));
  const [vazias, setVazias] = useState(item.vazias ?? 0);
  const [girando, setGirando] = useState(false);
  const [disparo, setDisparo] = useState(0);
  const [defesa, setDefesa] = useState(5);
  const reserva = reservaDe(inv, uso.calibre);
  const lateral = uso.mecanismo === "tambor";

  // Ficha nova do servidor (após refresh) substitui o estado otimista.
  const [origem, setOrigem] = useState(item);
  if (origem !== item) {
    setOrigem(item);
    setCarga(cargaDe(item));
    setVazias(item.vazias ?? 0);
  }

  function gatilho() {
    if (pending) return;
    if (carga === 0) {
      somClique(0.8);
      vibrar(15);
      if (lateral) {
        setGirando(true);
        setTimeout(() => setGirando(false), 190);
      }
      return;
    }
    somTiro();
    vibrar([40, 30, 90]);
    onTremor();
    setDisparo(Date.now());
    if (lateral) setGirando(true);
    setTimeout(() => {
      setCarga((c) => Math.max(0, c - 1));
      if (lateral) setVazias((v) => v + 1);
      setGirando(false);
    }, 190);
    rodar(() => atirar(sessionId, character.id, indice, defesa));
  }

  function recarga() {
    rodar(
      () => recarregar(sessionId, character.id, indice),
      () => {
        somClique(1.2);
        setTimeout(() => somClique(1.4), 120);
        vibrar(20);
      },
    );
  }

  const podeRecarregar = (carga < uso.carga || vazias > 0) && reserva.porte + reserva.caixa > 0;

  return (
    <div className="space-y-4">
      {/* Cena da arma */}
      <div className="relative mx-auto w-full max-w-sm">
        {lateral && (
          <div className="relative mx-auto mb-2 w-full" style={{ aspectRatio: "3 / 2" }}>
            <img
              key={`r-${disparo}`}
              src={USO("armas/revolver-lateral")}
              alt=""
              draggable={false}
              className={`absolute inset-0 h-full w-full origin-[30%_60%] ${disparo ? "animate-[sacraRecoil_0.35s_ease-out]" : ""}`}
            />
            {disparo > 0 && <Clarao key={disparo} x={98.6} y={28.1} />}
          </div>
        )}
        <div className={`relative mx-auto ${uso.mecanismo === "pente" ? "h-64" : uso.mecanismo === "tubo" ? "h-32" : "w-3/4"}`}>
          {uso.mecanismo === "tambor" && <Tambor carga={carga} vazias={vazias} girando={girando} />}
          {uso.mecanismo === "canos" && <Canos carga={carga} total={uso.carga} />}
          {uso.mecanismo === "pente" && <Pente carga={carga} total={uso.carga} />}
          {uso.mecanismo === "tubo" && <Tubo carga={carga} total={uso.carga} calibre={uso.calibre} />}
          {!lateral && disparo > 0 && <Clarao key={disparo} x={50} y={30} />}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <Contagem rotulo="Na arma" valor={`${carga}/${uso.carga}`} alerta={carga === 0} />
        <Contagem rotulo={uso.calibre === "revolver" ? "Cinturão" : "Bandoleira"} valor={String(reserva.porte)} />
        <Contagem rotulo="Caixas" valor={String(reserva.caixa)} />
      </div>
      <p className="font-crimson text-sm text-arcana-text">
        Recarga {uso.recargaAC} AC (igual para 1 bala ou todas){reserva.porte === 0 && reserva.caixa > 0 ? " · +2 AC para tirar da mochila" : ""}
        {uso.cadencia ? ` · ${uso.cadencia}` : ""}
      </p>

      <SeletorDefesa valor={defesa} onChange={setDefesa} />

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={gatilho}
          disabled={pending && carga > 0}
          className="flex h-20 flex-1 items-center justify-center rounded-2xl border-2 border-red-300/80 bg-[radial-gradient(circle_at_50%_35%,#8b2a1f,#3b0f0b)] font-cinzel text-xl font-bold uppercase tracking-[0.25em] text-white shadow-[0_0_24px_rgba(200,60,40,0.45)] active:scale-[0.97]"
        >
          {carga === 0 ? "Clique…" : "Atirar"}
        </button>
        <button type="button" onClick={recarga} disabled={pending || !podeRecarregar} className="arcana-btn-ghost h-20 px-4">
          Recarregar
        </button>
      </div>
      {!podeRecarregar && carga < uso.carga && (
        <p className="font-crimson text-sm text-red-200">Sem {NOME_CALIBRE[uso.calibre]}. Compre no Armazém ou peça ao Juiz.</p>
      )}
      <Resultado erro={erro} res={res} />
    </div>
  );
}

function Clarao({ x, y }: { x: number; y: number }) {
  return (
    <>
      <img
        src={USO("efeitos/clarao-disparo")}
        alt=""
        draggable={false}
        className="pointer-events-none absolute w-[70%] animate-[sacraMuzzle_0.28s_ease-out_forwards] mix-blend-screen"
        style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-4%, -50%)", transformOrigin: "left center" }}
      />
      <img
        src={USO("efeitos/fumaca")}
        alt=""
        draggable={false}
        className="pointer-events-none absolute w-[60%] animate-[sacraSmoke_1.6s_ease-out_forwards] opacity-0 mix-blend-screen"
        style={{ left: `${x - 20}%`, top: `${y - 30}%` }}
      />
    </>
  );
}

function Contagem({ rotulo, valor, alerta }: { rotulo: string; valor: string; alerta?: boolean }) {
  return (
    <div className={`rounded-xl border p-2 ${alerta ? "border-red-400/70" : "border-arcana-border"}`}>
      <p className="font-cinzel text-[10px] uppercase tracking-[0.18em] text-arcana-text">{rotulo}</p>
      <p className={`font-cinzel text-xl tabular-nums ${alerta ? "text-red-200" : "text-white"}`}>{valor}</p>
    </div>
  );
}

/* ── Munição e porte ── */

function PainelMunicao({ sessionId, character, item, inv, uso, onRefresh }: CorpoProps & { uso: Extract<UsoItem, { tipo: "municao" }> }) {
  const { pending, erro, res, rodar } = useAcao(onRefresh);
  const balas = balasDaCaixa(item);
  const porte = inv.findIndex((i) => calibreDoPorte(i) === uso.calibre || (i.id === "bandoleira" && uso.calibre !== "revolver" && balasDoPorte(i) === 0));
  const armas = inv.filter((i) => {
    const u = usoDoItem(i.id);
    return u?.tipo === "arma-fogo" && u.calibre === uso.calibre;
  });
  return (
    <div className="space-y-4">
      <div className="mx-auto w-3/4">
        <Caixa balas={balas} porCaixa={uso.balasPorCaixa} />
      </div>
      <p className="text-center font-cinzel text-2xl text-white">
        {balas} <span className="text-base text-arcana-text">{NOME_CALIBRE[uso.calibre]}</span>
      </p>
      <p className="text-center font-crimson text-sm text-arcana-text">
        {item.quantidade ?? 1} caixa(s) · a aberta tem {balas === 0 ? 0 : balas % uso.balasPorCaixa || uso.balasPorCaixa}/{uso.balasPorCaixa}
      </p>
      {armas.length > 0 && <p className="font-crimson text-sm text-white">Serve em: {armas.map(nomeDoItem).join(", ")}</p>}
      {porte >= 0 ? (
        <button type="button" disabled={pending || balas === 0} onClick={() => rodar(() => encherPorte(sessionId, character.id, porte), () => somClique(1.3))} className="arcana-btn-primary w-full">
          Encher {nomeDoItem(inv[porte]).toLowerCase()}
        </button>
      ) : (
        <p className="font-crimson text-sm text-arcana-text">Sem {uso.calibre === "revolver" ? "coldre" : "bandoleira"}, a munição fica na mochila: tirar dela em combate custa +2 AC.</p>
      )}
      <Resultado erro={erro} res={res} />
    </div>
  );
}

function PainelPorte({ sessionId, character, indice, item, inv, uso, onRefresh }: CorpoProps & { uso: Extract<UsoItem, { tipo: "porte" }> }) {
  const { pending, erro, res, rodar } = useAcao(onRefresh);
  if (!uso.balas) return <p className="font-crimson text-base text-arcana-text">Leva uma lâmina pronta na cintura, sem ocupar a mochila.</p>;
  const calibre: Calibre | null = calibreDoPorte(item);
  const balas = balasDoPorte(item);
  const temCaixa = (["revolver", "espingarda", "fuzil"] as Calibre[]).some(
    (c) => (item.id === "coldre" ? c === "revolver" : c !== "revolver") && reservaDe(inv, c).caixa > 0,
  );
  return (
    <div className="space-y-4">
      <Alcas balas={balas} max={uso.balas.max} calibre={calibre} />
      <p className="text-center font-cinzel text-2xl text-white">
        {balas}/{uso.balas.max} <span className="text-base text-arcana-text">{calibre ? NOME_CALIBRE[calibre] : "vazio"}</span>
      </p>
      <p className="font-crimson text-sm text-arcana-text">A recarga sai daqui primeiro, pagando só o custo da arma.</p>
      <button type="button" disabled={pending || balas >= uso.balas.max || !temCaixa} onClick={() => rodar(() => encherPorte(sessionId, character.id, indice), () => somClique(1.3))} className="arcana-btn-primary w-full">
        Encher com as caixas
      </button>
      <Resultado erro={erro} res={res} />
    </div>
  );
}

/* ── Consumíveis, remédios, fósforos, gazuas ── */

const BOTAO: Record<string, string> = { comer: "Comer", beber: "Beber", fumar: "Fumar" };

function PainelUsar({ sessionId, character, indice, item, uso, onRefresh }: CorpoProps & { uso: Extract<UsoItem, { tipo: "consumivel" | "remedio" | "fogo" | "contador" }> }) {
  const { pending, erro, res, rodar } = useAcao(onRefresh);
  const [chama, setChama] = useState(0);
  const rotulo =
    uso.tipo === "consumivel" ? BOTAO[uso.verbo] : uso.tipo === "remedio" ? (uso.carta ? "Beber e tirar a carta" : "Usar") : uso.verbo;
  const resta = uso.tipo === "fogo" || uso.tipo === "contador" ? (uso.usos ? usosRestantes(item) : null) : (item.quantidade ?? 1);
  return (
    <div className="space-y-4">
      <div className="relative mx-auto flex h-40 w-40 items-center justify-center">
        {item.id && <img src={itemImagem(item.id)} alt="" className="h-32 w-32 object-contain" />}
        {uso.tipo === "fogo" && chama > 0 && (
          <img key={chama} src={USO("efeitos/chama")} alt="" className="absolute bottom-[45%] h-24 animate-[sacraFlicker_0.4s_ease-in-out_infinite] mix-blend-screen" />
        )}
      </div>
      {uso.tipo === "remedio" && <p className="text-center font-crimson text-base text-white">{uso.efeito}</p>}
      {resta != null && <p className="text-center font-crimson text-sm text-arcana-text">Restam {resta}</p>}
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          rodar(
            () => usarItem(sessionId, character.id, indice),
            () => {
              if (uso.tipo === "fogo") {
                somRiscar();
                setChama(Date.now());
                setTimeout(() => setChama(0), 3500);
              } else vibrar(15);
            },
          )
        }
        className="arcana-btn-primary w-full"
      >
        {rotulo}
      </button>
      <Resultado erro={erro} res={res} />
    </div>
  );
}

/* ── Lanterna ── */

function PainelLanterna({ sessionId, character, indice, item, inv, onRefresh }: CorpoProps) {
  const { pending, erro, res, rodar } = useAcao(onRefresh);
  const oleo = inv.filter((i) => i.id === "oleo-lanterna").reduce((t, i) => t + (i.quantidade ?? 1), 0);
  return (
    <div className="space-y-4">
      <div className="relative mx-auto h-64" style={{ aspectRatio: "2 / 3" }}>
        {item.acesa && <span aria-hidden className="absolute inset-[-15%] rounded-full bg-[radial-gradient(circle,rgba(240,180,80,0.45),transparent_65%)]" />}
        <img src={USO("objetos/lanterna")} alt="Lanterna" className="absolute inset-0 h-full w-full" />
        {item.acesa && (
          <img src={USO("efeitos/chama")} alt="" className="absolute left-1/2 top-[40%] h-[22%] -translate-x-1/2 animate-[sacraFlicker_0.5s_ease-in-out_infinite] mix-blend-screen" />
        )}
      </div>
      <p className="text-center font-crimson text-sm text-arcana-text">Óleo de lanterna: {oleo}</p>
      <button type="button" disabled={pending || (!item.acesa && oleo === 0)} onClick={() => rodar(() => usarItem(sessionId, character.id, indice), () => somRiscar())} className="arcana-btn-primary w-full">
        {item.acesa ? "Apagar" : "Acender (gasta 1 óleo)"}
      </button>
      <Resultado erro={erro} res={res} />
    </div>
  );
}

/* ── Dinamite: segura para acender, solta para arremessar ── */

function PainelDinamite({ sessionId, character, indice, item, onRefresh, onTremor }: CorpoProps) {
  const { pending, erro, res, rodar } = useAcao(onRefresh);
  const [defesa, setDefesa] = useState(5);
  const [acesa, setAcesa] = useState(false);
  const [explodiu, setExplodiu] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const soltar = () => {
    if (timer.current) clearTimeout(timer.current);
    if (!acesa) return;
    setAcesa(false);
    somTiro();
    vibrar([80, 40, 160]);
    onTremor();
    setExplodiu(Date.now());
    rodar(() => usarItem(sessionId, character.id, indice, { defesa }));
  };

  return (
    <div className="space-y-4">
      <div className="relative mx-auto flex h-44 w-44 items-center justify-center">
        {item.id && <img src={itemImagem(item.id)} alt="" className="h-36 w-36 object-contain" />}
        {acesa && <img src={USO("efeitos/chama")} alt="" className="absolute right-[22%] top-0 h-12 animate-[sacraFlicker_0.2s_ease-in-out_infinite] mix-blend-screen" />}
        {explodiu > 0 && <Clarao key={explodiu} x={10} y={50} />}
      </div>
      <p className="text-center font-crimson text-sm text-arcana-text">Restam {item.quantidade ?? 1}</p>
      <SeletorDefesa valor={defesa} onChange={setDefesa} />
      <button
        type="button"
        disabled={pending}
        onPointerDown={() => {
          somRiscar();
          timer.current = setTimeout(() => setAcesa(true), 600);
        }}
        onPointerUp={soltar}
        onPointerLeave={soltar}
        className={`h-20 w-full rounded-2xl border-2 font-cinzel text-lg uppercase tracking-[0.2em] text-white select-none ${acesa ? "border-amber-300 bg-amber-900/70" : "border-arcana-gold/60 bg-[#261318]"}`}
      >
        {acesa ? "Solte para arremessar!" : "Segure para acender"}
      </button>
      <Resultado erro={erro} res={res} />
    </div>
  );
}

/* ── Objetos de mão ── */

function PainelGadget({ sessionId, character, indice, uso, onRefresh }: CorpoProps & { uso: Extract<UsoItem, { tipo: "gadget" }> }) {
  const { pending, erro, res, rodar } = useAcao(onRefresh);
  if (uso.gadget === "bussola") return <Bussola />;
  if (uso.gadget === "relogio") return <Relogio />;
  if (uso.gadget === "dados" || uso.gadget === "baralho") {
    return (
      <div className="space-y-4">
        <button type="button" disabled={pending} onClick={() => rodar(() => usarItem(sessionId, character.id, indice))} className="arcana-btn-primary w-full">
          {uso.gadget === "dados" ? "Jogar os 3 dados" : "Puxar uma carta"}
        </button>
        <Resultado erro={erro} res={res} />
      </div>
    );
  }
  return <p className="font-crimson text-base text-arcana-text">Fica à mão para a cena.</p>;
}

function Bussola() {
  const [rumo, setRumo] = useState<number | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  useEffect(() => {
    const on = (e: DeviceOrientationEvent) => {
      const w = (e as DeviceOrientationEvent & { webkitCompassHeading?: number }).webkitCompassHeading;
      if (typeof w === "number") setRumo(w);
      else if (e.alpha != null) setRumo(360 - e.alpha);
    };
    window.addEventListener("deviceorientation", on, true);
    return () => window.removeEventListener("deviceorientation", on, true);
  }, []);
  async function ativar() {
    const D = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> };
    try {
      if (D.requestPermission && (await D.requestPermission()) !== "granted") setAviso("Sem permissão para o sensor.");
    } catch {
      setAviso("Este aparelho não liberou o sensor.");
    }
  }
  return (
    <div className="space-y-3">
      <div className="relative mx-auto aspect-square w-3/4">
        <img src={USO("objetos/bussola")} alt="Bússola" className="absolute inset-0 h-full w-full" />
        <svg viewBox="-50 -50 100 100" className="absolute left-1/2 top-[58%] w-[42%] -translate-x-1/2 -translate-y-1/2 transition-transform duration-300" style={{ transform: `translate(-50%,-50%) rotate(${-(rumo ?? 0)}deg)` }}>
          <polygon points="0,-44 6,0 -6,0" fill="#8a2a22" />
          <polygon points="0,44 6,0 -6,0" fill="#4a5a6a" />
          <circle r="4" fill="#d1ab55" />
        </svg>
      </div>
      {rumo == null && (
        <button type="button" onClick={ativar} className="arcana-btn-ghost w-full">
          Apontar o norte (usar o sensor)
        </button>
      )}
      {aviso && <p className="font-crimson text-sm text-amber-200">{aviso}</p>}
    </div>
  );
}

function Relogio() {
  const [agora, setAgora] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setAgora(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const m = agora.getMinutes() + agora.getSeconds() / 60;
  const h = (agora.getHours() % 12) + m / 60;
  return (
    <div className="relative mx-auto aspect-square w-3/4">
      <img src={USO("objetos/relogio")} alt="Relógio de bolso" className="absolute inset-0 h-full w-full" />
      <svg viewBox="-50 -50 100 100" className="absolute left-1/2 top-[57%] w-[60%] -translate-x-1/2 -translate-y-1/2">
        <line x1="0" y1="4" x2="0" y2="-22" stroke="#1d2436" strokeWidth="3.2" strokeLinecap="round" transform={`rotate(${h * 30})`} />
        <line x1="0" y1="6" x2="0" y2="-34" stroke="#1d2436" strokeWidth="2" strokeLinecap="round" transform={`rotate(${m * 6})`} />
        <circle r="2.6" fill="#d1ab55" />
      </svg>
    </div>
  );
}

/* ── Mochila ── */

function PainelMochila({ inv, uso }: CorpoProps & { uso: Extract<UsoItem, { tipo: "recipiente" }> }) {
  const r = resumoCompras(
    inv.filter((i) => i.id).map((i) => ({ id: i.id!, quantidade: i.quantidade ?? 1 })),
    Infinity,
  );
  const usado = Math.round(r.espacoUsado * 10) / 10;
  const cheio = usado > r.capacidade;
  return (
    <div className="space-y-4">
      <div className="relative mx-auto h-64" style={{ aspectRatio: "2 / 3" }}>
        <img src={USO("guarda/mochila-aberta")} alt="Mochila aberta" className="absolute inset-0 h-full w-full" />
        <div className="absolute left-[20%] right-[20%] top-[30%] grid grid-cols-5 gap-1">
          {Array.from({ length: uso.espacos }, (_, i) => (
            <span key={i} className={`aspect-square rounded-md border ${i < Math.ceil(usado) ? "border-arcana-gold/80 bg-arcana-gold/60" : "border-white/40"}`} />
          ))}
        </div>
      </div>
      <p className={`text-center font-cinzel text-xl ${cheio ? "text-red-200" : "text-white"}`}>
        {usado.toLocaleString("pt-BR")}/{r.capacidade} espaços
      </p>
      <p className="font-crimson text-sm text-arcana-text">
        Armas prontas no coldre/bandoleira/bainha e a primeira roupa vestida não contam. {r.temMontaria ? "A montaria soma 15 espaços." : ""}
      </p>
    </div>
  );
}
