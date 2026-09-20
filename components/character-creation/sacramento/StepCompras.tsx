"use client";

import { useEffect, useMemo, useState } from "react";
import { HowItWorks } from "@/components/campaign-creation/Explainer";
import { PLAYER_GUIDES } from "@/lib/character-creation/sacramento/guidance";
import {
  CATALOGO,
  LOJAS,
  itemById,
  montariaComprada,
  resumoCompras,
  type ItemCatalogo,
  type LojaInfo,
} from "@/lib/character-creation/sacramento/catalogo";
import {
  FICHA_INICIAL,
  type SacramentoCreationData,
} from "@/lib/character-creation/sacramento/types";

type Props = {
  data: Partial<SacramentoCreationData>;
  onUpdate: (partial: Partial<SacramentoCreationData>) => void;
  /** Avisa o wizard qual cenário de loja deve ambientar o painel do retrato. */
  onAmbient?: (imagem: string | null) => void;
};

const LABEL = "font-cinzel text-[10px] uppercase tracking-[0.3em] text-arcana-text-dim";

const fmt = (v: number) =>
  `$${Number.isInteger(v) ? v : v.toFixed(2).replace(".", ",")}`;

/** Retrato do vendedor com fallback de monograma enquanto a arte não chega. */
function SellerPortrait({ loja, size }: { loja: LojaInfo; size: string }) {
  const [failed, setFailed] = useState(false);
  if (loja.imagem && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={loja.imagem}
        alt={loja.vendedor}
        loading="lazy"
        onError={() => setFailed(true)}
        className={`${size} shrink-0 rounded-xl object-cover object-top`}
        style={{ background: "#090a11", border: "1px solid rgba(209,171,85,0.3)" }}
      />
    );
  }
  return (
    <span
      aria-hidden
      className={`${size} shrink-0 rounded-xl flex items-center justify-center font-cinzel text-arcana-gold`}
      style={{
        background: "radial-gradient(circle at 50% 30%, rgba(209,171,85,0.18), rgba(9,10,17,0.9))",
        border: "1px solid rgba(209,171,85,0.3)",
      }}
    >
      {loja.nome.charAt(0)}
    </span>
  );
}

export default function StepCompras({ data, onUpdate, onAmbient }: Props) {
  const ficha = data.ficha ?? FICHA_INICIAL;
  const compras = useMemo(() => ficha.compras ?? [], [ficha.compras]);
  const [lojaId, setLojaId] = useState<string>(LOJAS[0].id);
  const [busca, setBusca] = useState("");

  const setQuantidade = (id: string, quantidade: number) => {
    const outras = compras.filter((c) => c.id !== id);
    const novas = quantidade > 0 ? [...outras, { id, quantidade }] : outras;
    onUpdate({ ficha: { ...ficha, compras: novas } });
  };

  const qty = (id: string) => compras.find((c) => c.id === id)?.quantidade ?? 0;
  const resumo = useMemo(() => resumoCompras(compras), [compras]);
  const montaria = montariaComprada(compras);

  const loja = LOJAS.find((l) => l.id === lojaId) ?? LOJAS[0];

  // A cena da loja ativa ambienta o painel do retrato.
  useEffect(() => {
    onAmbient?.(loja.imagem ?? null);
    return () => onAmbient?.(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loja.imagem]);

  const termo = busca.trim().toLowerCase();
  const visiveis: ItemCatalogo[] = termo
    ? CATALOGO.filter((i) => i.nome.toLowerCase().includes(termo))
    : CATALOGO.filter((i) => loja.categorias.includes(i.categoria));

  const carrinho = compras
    .map((c) => ({ ...c, item: itemById(c.id) }))
    .filter((c) => c.item)
    .sort((a, b) => a.item!.nome.localeCompare(b.item!.nome));

  const estourou = resumo.saldo < 0;
  const semEspaco = resumo.espacoUsado > resumo.capacidade;

  return (
    <div className="space-y-6 max-w-2xl">
      <HowItWorks guide={PLAYER_GUIDES.compras} />

      {/* Painel de orçamento e espaço */}
      <div
        className="rounded-2xl p-4 grid grid-cols-3 gap-3 text-center"
        style={{ background: "rgba(27,27,42,0.72)", border: "1px solid rgba(209,171,85,0.25)" }}
      >
        <div>
          <p
            className={[
              "font-cinzel text-2xl leading-none",
              estourou ? "text-arcana-danger" : "text-arcana-gold-bright",
            ].join(" ")}
          >
            {fmt(resumo.saldo)}
          </p>
          <p className="font-cinzel text-[10px] uppercase tracking-[0.15em] text-arcana-text-dim mt-1.5">
            Saldo de $200
          </p>
        </div>
        <div>
          <p
            className={[
              "font-cinzel text-2xl leading-none",
              semEspaco ? "text-arcana-danger" : "text-arcana-gold-bright",
            ].join(" ")}
          >
            {resumo.espacoUsado} / {resumo.capacidade}
          </p>
          <p className="font-cinzel text-[10px] uppercase tracking-[0.15em] text-arcana-text-dim mt-1.5">
            Espaços {resumo.temMontaria ? "(mochila + montaria)" : "da mochila"}
          </p>
        </div>
        <div>
          <p className="font-cinzel text-2xl leading-none text-arcana-gold-bright">
            {resumo.armasProntas} / {resumo.limiteArmasProntas}
          </p>
          <p className="font-cinzel text-[10px] uppercase tracking-[0.15em] text-arcana-text-dim mt-1.5">
            Armas prontas
          </p>
        </div>
      </div>
      {montaria && (
        <p className="font-crimson text-sm italic text-arcana-gold-bright">
          {montaria === "cavalo" ? "Cavalo" : "Mula"} no alforje — a próxima etapa é batizar e
          configurar sua montaria.
        </p>
      )}
      {resumo.avisos.map((a) => (
        <p key={a} className="font-crimson text-sm italic text-arcana-danger">
          {a}
        </p>
      ))}

      {/* Rua das lojas */}
      <div className="space-y-3">
        <span className={LABEL}>As lojas do vilarejo</span>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {LOJAS.map((l) => {
            const active = !termo && l.id === lojaId;
            return (
              <button
                key={l.id}
                type="button"
                onClick={() => {
                  setLojaId(l.id);
                  setBusca("");
                }}
                aria-pressed={active}
                className={[
                  "relative rounded-xl border p-1.5 flex flex-col items-center gap-1.5 transition-all duration-150",
                  active
                    ? "border-arcana-gold/70 bg-arcana-gold/[0.08]"
                    : "border-arcana-border bg-arcana-surface/60 hover:border-arcana-gold/40",
                ].join(" ")}
                style={active ? { boxShadow: "0 0 16px rgba(209,171,85,0.2)" } : undefined}
              >
                <SellerPortrait loja={l} size="w-full aspect-square text-2xl" />
                <span
                  className={[
                    "font-cinzel text-[10px] uppercase tracking-[0.08em] leading-tight text-center",
                    active ? "text-arcana-gold-bright" : "text-arcana-text-dim",
                  ].join(" ")}
                >
                  {l.nome.split(" ").slice(0, 2).join(" ")}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Balcão da loja ativa — cena grande do vendedor */}
      {!termo &&
        (loja.imagem ? (
          <div
            key={loja.id}
            className="balcao relative h-56 sm:h-64 rounded-2xl overflow-hidden"
            style={{
              border: "1px solid rgba(209,171,85,0.35)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.55), 0 0 22px rgba(209,171,85,0.1)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={loja.imagem}
              alt={loja.vendedor}
              className="balcao-img absolute inset-0 h-full w-full object-cover"
              style={{ objectPosition: "center 22%" }}
            />
            <span
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(90deg, rgba(11,11,20,0.82), rgba(11,11,20,0.3) 45%, rgba(11,11,20,0.1) 70%), linear-gradient(0deg, rgba(11,11,20,0.85), transparent 45%)",
              }}
            />
            <div className="absolute inset-x-5 bottom-4">
              <h4
                className="font-cinzel text-lg sm:text-xl uppercase tracking-[0.2em] text-arcana-gold-bright"
                style={{ textShadow: "0 2px 10px rgba(0,0,0,0.9)" }}
              >
                {loja.nome}
              </h4>
              <p
                className="font-cinzel text-[10px] uppercase tracking-[0.25em] text-arcana-text mt-0.5"
                style={{ textShadow: "0 2px 6px rgba(0,0,0,0.9)" }}
              >
                {loja.vendedor}
              </p>
              <p
                className="font-crimson text-lg italic text-arcana-text leading-snug mt-1.5 max-w-[85%]"
                style={{ textShadow: "0 2px 8px rgba(0,0,0,0.95)" }}
              >
                “{loja.fala}”
              </p>
            </div>
          </div>
        ) : (
          <div
            className="rounded-2xl p-4 flex items-center gap-4"
            style={{
              background: "linear-gradient(135deg, rgba(38,19,24,0.85), rgba(27,27,42,0.72) 70%)",
              border: "1px solid rgba(209,171,85,0.3)",
            }}
          >
            <SellerPortrait loja={loja} size="w-20 h-20 text-3xl" />
            <div className="min-w-0">
              <h4 className="font-cinzel text-sm uppercase tracking-[0.2em] text-arcana-gold-bright">
                {loja.nome}
              </h4>
              <p className="font-cinzel text-[10px] uppercase tracking-[0.2em] text-arcana-text-dim mt-0.5">
                {loja.vendedor}
              </p>
              <p className="font-crimson text-base italic text-arcana-text leading-snug mt-1.5">
                “{loja.fala}”
              </p>
            </div>
          </div>
        ))}

      <input
        type="text"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder="Buscar em todas as lojas…"
        className="arcana-input w-full font-crimson text-base"
      />

      {/* Prateleira */}
      <div className="space-y-1.5">
        {visiveis.map((item) => {
          const q = qty(item.id);
          return (
            <div
              key={item.id}
              className={[
                "flex items-center gap-3 rounded-xl border px-3.5 py-2.5 transition-colors",
                q > 0
                  ? "border-arcana-gold/50 bg-arcana-gold/[0.06]"
                  : "border-arcana-border bg-arcana-surface/60",
              ].join(" ")}
            >
              <div className="min-w-0 flex-1">
                <p className="font-crimson text-base text-arcana-text leading-tight">
                  {item.nome}
                  {item.nota && (
                    <span className="ml-2 font-cinzel text-[10px] uppercase tracking-[0.08em] text-arcana-gold">
                      {item.nota}
                    </span>
                  )}
                </p>
                <p className="font-crimson text-[13px] italic text-arcana-text-dim leading-snug mt-0.5">
                  {item.descricao}
                </p>
              </div>
              <span className="font-cinzel text-sm text-arcana-gold-bright shrink-0 w-14 text-right">
                {fmt(item.preco)}
              </span>
              <span className="font-cinzel text-[10px] uppercase tracking-[0.1em] text-arcana-text-dim shrink-0 w-10 text-right">
                {item.espaco === null ? "—" : item.espaco} esp
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setQuantidade(item.id, q - 1)}
                  disabled={q === 0}
                  aria-label={`Devolver ${item.nome}`}
                  className="w-7 h-7 rounded-full font-cinzel text-sm text-arcana-text-dim hover:text-arcana-gold-bright disabled:opacity-25 transition-colors"
                  style={{ border: "1px solid var(--color-arcana-border)", background: "rgba(8,8,15,0.5)" }}
                >
                  −
                </button>
                <span
                  className={[
                    "w-7 text-center font-cinzel text-base",
                    q > 0 ? "text-arcana-gold-bright" : "text-arcana-text-dim",
                  ].join(" ")}
                >
                  {q}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantidade(item.id, q + 1)}
                  aria-label={`Comprar ${item.nome}`}
                  className="w-7 h-7 rounded-full font-cinzel text-sm text-arcana-text-dim hover:text-arcana-gold-bright transition-colors"
                  style={{ border: "1px solid var(--color-arcana-border)", background: "rgba(8,8,15,0.5)" }}
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
        {visiveis.length === 0 && (
          <p className="font-crimson text-sm italic text-arcana-text-dim py-4 text-center">
            Nada encontrado com esse nome.
          </p>
        )}
      </div>

      {/* Alforje */}
      {carrinho.length > 0 && (
        <div
          className="rounded-2xl p-4 space-y-2"
          style={{ background: "rgba(27,27,42,0.72)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div className="flex items-baseline justify-between">
            <span className={LABEL}>Alforje</span>
            <span className="font-cinzel text-sm text-arcana-gold-bright">
              {fmt(resumo.custoTotal)}
            </span>
          </div>
          <ul className="space-y-1">
            {carrinho.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-2">
                <span className="font-crimson text-sm text-arcana-text">
                  {c.quantidade > 1 ? `${c.quantidade}× ` : ""}
                  {c.item!.nome}
                </span>
                <span className="flex items-center gap-2">
                  <span className="font-crimson text-sm text-arcana-text-dim">
                    {fmt(c.item!.preco * c.quantidade)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantidade(c.id, 0)}
                    aria-label={`Tirar ${c.item!.nome} do alforje`}
                    className="font-cinzel text-[10px] text-arcana-text-dim hover:text-arcana-danger transition-colors"
                  >
                    ✕
                  </button>
                </span>
              </li>
            ))}
          </ul>
          <p className="font-crimson text-xs italic text-arcana-text-dim pt-1">
            Preços de primeira compra: máximo da tabela, sem barganha (p. 52). O saldo vira seu
            dinheiro na campanha.
          </p>
        </div>
      )}

      <style jsx>{`
        .balcao {
          animation: balcaoIn 380ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes balcaoIn {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .balcao-img {
          animation: kenburns 16s ease-in-out infinite alternate;
          will-change: transform;
        }
        @keyframes kenburns {
          from {
            transform: scale(1) translateY(0);
          }
          to {
            transform: scale(1.08) translateY(-2%);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .balcao,
          .balcao-img {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
