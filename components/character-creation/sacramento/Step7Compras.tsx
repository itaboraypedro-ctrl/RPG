"use client";

import { useMemo, useState } from "react";
import { HowItWorks } from "@/components/campaign-creation/Explainer";
import { PLAYER_GUIDES } from "@/lib/character-creation/sacramento/guidance";
import {
  CATALOGO,
  CATEGORIAS,
  itemById,
  resumoCompras,
  type CategoriaItem,
} from "@/lib/character-creation/sacramento/catalogo";
import {
  FICHA_INICIAL,
  type SacramentoCreationData,
} from "@/lib/character-creation/sacramento/types";

type Props = {
  data: Partial<SacramentoCreationData>;
  onUpdate: (partial: Partial<SacramentoCreationData>) => void;
};

const LABEL = "font-cinzel text-[10px] uppercase tracking-[0.3em] text-arcana-text-dim";

const fmt = (v: number) =>
  `$${Number.isInteger(v) ? v : v.toFixed(2).replace(".", ",")}`;

export default function Step7Compras({ data, onUpdate }: Props) {
  const ficha = data.ficha ?? FICHA_INICIAL;
  const compras = useMemo(() => ficha.compras ?? [], [ficha.compras]);
  const [categoria, setCategoria] = useState<CategoriaItem>("armas");
  const [busca, setBusca] = useState("");

  const setQuantidade = (id: string, quantidade: number) => {
    const outras = compras.filter((c) => c.id !== id);
    const novas = quantidade > 0 ? [...outras, { id, quantidade }] : outras;
    onUpdate({ ficha: { ...ficha, compras: novas } });
  };

  const qty = (id: string) => compras.find((c) => c.id === id)?.quantidade ?? 0;
  const resumo = useMemo(
    () => resumoCompras(compras, ficha.montaria !== null),
    [compras, ficha.montaria],
  );

  const termo = busca.trim().toLowerCase();
  const visiveis = termo
    ? CATALOGO.filter((i) => i.nome.toLowerCase().includes(termo))
    : CATALOGO.filter((i) => i.categoria === categoria);

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
            Espaços {ficha.montaria ? "(mochila + montaria)" : "da mochila"}
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
      {ficha.montaria?.origem === "comprar" && !compras.some((c) => c.id === "cavalo" || c.id === "mula") && (
        <p className="font-crimson text-sm italic text-arcana-text-dim">
          Sua montaria sai destas compras: um cavalo custa $250 (acima do orçamento — negocie
          com o Juiz) e a mula ou burrico sai por $100.
        </p>
      )}
      {resumo.avisos.map((a) => (
        <p key={a} className="font-crimson text-sm italic text-arcana-danger">
          {a}
        </p>
      ))}

      {/* Busca + categorias */}
      <div className="space-y-3">
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar no catálogo…"
          className="arcana-input w-full font-crimson text-base"
        />
        {!termo && (
          <div className="flex flex-wrap gap-2">
            {CATEGORIAS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategoria(c.id)}
                className={categoria === c.id ? "arcana-chip-active" : "arcana-chip"}
              >
                {c.nome}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Itens */}
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
                </p>
                {item.nota && (
                  <p className="font-crimson text-xs italic text-arcana-text-dim leading-snug">
                    {item.nota}
                  </p>
                )}
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
                  aria-label={`Remover ${item.nome}`}
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

      {/* Carrinho */}
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
    </div>
  );
}
