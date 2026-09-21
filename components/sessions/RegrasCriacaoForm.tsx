"use client";

// Regras de criação de personagem da mesa — o Juiz controla nível, dinheiro,
// lojas, itens compráveis e o equipamento que todos recebem. Salva em
// sessions.settings.regrasCriacao; o wizard aplica via /play/characters/new?mesa=<id>.

import { useMemo, useState } from "react";
import { salvarRegrasCriacao } from "@/app/dashboard/sessions/[id]/edit/actions";
import { CATALOGO, LOJAS } from "@/lib/character-creation/sacramento/catalogo";
import type { LimitesCriacao } from "@/lib/character-creation/sacramento/rules";
import type { Nivel } from "@/lib/character-creation/sacramento/types";

type Props = {
  sessionId: string;
  initial: LimitesCriacao;
};

const NIVEIS: Nivel[] = [1, 2, 3, 4, 5, 6];

const inputClass =
  "rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 focus:border-zinc-500 focus:outline-none";
const labelClass = "text-xs font-medium uppercase tracking-wide text-zinc-500";

function BuscaItem({
  placeholder,
  excluir,
  onPick,
}: {
  placeholder: string;
  excluir: Set<string>;
  onPick: (id: string) => void;
}) {
  const [termo, setTermo] = useState("");
  const resultados = useMemo(() => {
    const t = termo.trim().toLowerCase();
    if (t.length < 2) return [];
    return CATALOGO.filter((i) => i.nome.toLowerCase().includes(t) && !excluir.has(i.id)).slice(0, 6);
  }, [termo, excluir]);

  return (
    <div className="relative">
      <input
        type="text"
        value={termo}
        onChange={(e) => setTermo(e.target.value)}
        placeholder={placeholder}
        className={`${inputClass} w-full`}
      />
      {resultados.length > 0 && (
        <div className="absolute inset-x-0 top-full z-20 mt-1 overflow-hidden rounded-md border border-zinc-700 bg-zinc-900 shadow-xl">
          {resultados.map((i) => (
            <button
              key={i.id}
              type="button"
              onClick={() => {
                onPick(i.id);
                setTermo("");
              }}
              className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-800"
            >
              <span>{i.nome}</span>
              <span className="text-xs text-zinc-500">${i.preco}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function RegrasCriacaoForm({ sessionId, initial }: Props) {
  const [regras, setRegras] = useState<LimitesCriacao>(initial);
  const [salvando, setSalvando] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);

  const set = (partial: Partial<LimitesCriacao>) => {
    setFeedback(null);
    setRegras((r) => ({ ...r, ...partial }));
  };

  const nomeItem = (id: string) => CATALOGO.find((i) => i.id === id)?.nome ?? id;
  const bloqueadosSet = new Set(regras.itensBloqueados);
  const iniciaisSet = new Set(regras.itensIniciais.map((i) => i.id));

  const toggleLoja = (id: string) => {
    const atual = regras.lojasPermitidas ?? LOJAS.map((l) => l.id);
    const nova = atual.includes(id) ? atual.filter((x) => x !== id) : [...atual, id];
    // Todas marcadas = null (libera tudo, inclusive lojas futuras).
    set({ lojasPermitidas: nova.length === LOJAS.length ? null : nova });
  };

  const salvar = async () => {
    setSalvando(true);
    setFeedback(null);
    try {
      const result = await salvarRegrasCriacao(sessionId, regras);
      setFeedback(result.ok ? "Regras salvas." : result.error);
    } catch {
      setFeedback("Não foi possível salvar. Tente de novo.");
    } finally {
      setSalvando(false);
    }
  };

  const linkMesa =
    typeof window !== "undefined"
      ? `${window.location.origin}/play/characters/new?mesa=${sessionId}`
      : `/play/characters/new?mesa=${sessionId}`;

  return (
    <section className="flex flex-col gap-5 rounded-lg border border-zinc-800 bg-zinc-950 p-4">
      <div>
        <h2 className="text-sm font-bold tracking-tight text-zinc-200">
          Regras de criação de personagem
        </h2>
        <p className="mt-1 text-xs text-zinc-500">
          Valem para quem criar personagem pelo link da mesa. Sem regra definida, vale o livro:
          nível 1, $200, todas as lojas.
        </p>
      </div>

      {/* Nível */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Nível inicial</label>
          <select
            value={regras.nivelInicial}
            onChange={(e) => set({ nivelInicial: Number(e.target.value) as Nivel })}
            className={inputClass}
          >
            {NIVEIS.map((n) => (
              <option key={n} value={n}>Nível {n}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelClass}>Nível máximo</label>
          <select
            value={regras.nivelMaximo}
            onChange={(e) => {
              const nivelMaximo = Number(e.target.value) as Nivel;
              set({
                nivelMaximo,
                nivelInicial: (Math.min(regras.nivelInicial, nivelMaximo) as Nivel),
              });
            }}
            className={inputClass}
          >
            {NIVEIS.map((n) => (
              <option key={n} value={n}>Nível {n}</option>
            ))}
          </select>
        </div>
        <label className="flex items-end gap-2 pb-2 text-sm text-zinc-300">
          <input
            type="checkbox"
            checked={regras.nivelTravado}
            onChange={(e) => set({ nivelTravado: e.target.checked })}
            className="h-4 w-4 accent-amber-500"
          />
          Travar no nível inicial
        </label>
      </div>

      {/* Dinheiro */}
      <div className="flex flex-col gap-1.5 sm:max-w-[200px]">
        <label className={labelClass}>Dinheiro inicial ($)</label>
        <input
          type="number"
          min={0}
          max={100000}
          value={regras.dinheiroInicial}
          onChange={(e) => set({ dinheiroInicial: Math.max(0, Number(e.target.value) || 0) })}
          className={inputClass}
        />
      </div>

      {/* Lojas */}
      <div className="flex flex-col gap-2">
        <label className={labelClass}>Lojas acessíveis</label>
        <div className="flex flex-wrap gap-2">
          {LOJAS.map((l) => {
            const ativa = !regras.lojasPermitidas || regras.lojasPermitidas.includes(l.id);
            return (
              <button
                key={l.id}
                type="button"
                onClick={() => toggleLoja(l.id)}
                className={[
                  "rounded-md border px-3 py-1.5 text-xs transition-colors",
                  ativa
                    ? "border-amber-600/60 bg-amber-500/10 text-amber-300"
                    : "border-zinc-700 bg-zinc-900 text-zinc-500 line-through",
                ].join(" ")}
              >
                {l.nome}
              </button>
            );
          })}
        </div>
      </div>

      {/* Itens bloqueados */}
      <div className="flex flex-col gap-2">
        <label className={labelClass}>Itens que ninguém pode comprar</label>
        <BuscaItem
          placeholder="Buscar item para bloquear (ex.: dinamite)…"
          excluir={bloqueadosSet}
          onPick={(id) => set({ itensBloqueados: [...regras.itensBloqueados, id] })}
        />
        {regras.itensBloqueados.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {regras.itensBloqueados.map((id) => (
              <span key={id}
                className="flex items-center gap-1.5 rounded-md border border-red-900/60 bg-red-950/40 px-2 py-1 text-xs text-red-300">
                {nomeItem(id)}
                <button type="button" aria-label={`Desbloquear ${nomeItem(id)}`}
                  onClick={() => set({ itensBloqueados: regras.itensBloqueados.filter((x) => x !== id) })}
                  className="text-red-400 hover:text-red-200">
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Itens iniciais */}
      <div className="flex flex-col gap-2">
        <label className={labelClass}>Equipamento inicial de todos (de graça)</label>
        <BuscaItem
          placeholder="Buscar item para dar de partida (ex.: cantil)…"
          excluir={iniciaisSet}
          onPick={(id) => set({ itensIniciais: [...regras.itensIniciais, { id, quantidade: 1 }] })}
        />
        {regras.itensIniciais.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {regras.itensIniciais.map((i) => (
              <span key={i.id}
                className="flex items-center gap-2 rounded-md border border-emerald-900/60 bg-emerald-950/40 px-2 py-1 text-xs text-emerald-300">
                {nomeItem(i.id)}
                <span className="flex items-center gap-1">
                  <button type="button" aria-label={`Diminuir ${nomeItem(i.id)}`}
                    onClick={() => set({
                      itensIniciais: regras.itensIniciais
                        .map((x) => (x.id === i.id ? { ...x, quantidade: x.quantidade - 1 } : x))
                        .filter((x) => x.quantidade > 0),
                    })}
                    className="text-emerald-400 hover:text-emerald-200">−</button>
                  ×{i.quantidade}
                  <button type="button" aria-label={`Aumentar ${nomeItem(i.id)}`}
                    onClick={() => set({
                      itensIniciais: regras.itensIniciais.map((x) =>
                        x.id === i.id ? { ...x, quantidade: Math.min(99, x.quantidade + 1) } : x),
                    })}
                    className="text-emerald-400 hover:text-emerald-200">+</button>
                </span>
                <button type="button" aria-label={`Remover ${nomeItem(i.id)}`}
                  onClick={() => set({ itensIniciais: regras.itensIniciais.filter((x) => x.id !== i.id) })}
                  className="text-emerald-400 hover:text-emerald-200">✕</button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Salvar + link */}
      <div className="flex flex-wrap items-center gap-3 border-t border-zinc-800 pt-4">
        <button
          type="button"
          onClick={() => void salvar()}
          disabled={salvando}
          className="rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-zinc-950 transition-colors hover:bg-amber-500 disabled:opacity-50"
        >
          {salvando ? "Salvando…" : "Salvar regras"}
        </button>
        <button
          type="button"
          onClick={() => {
            void navigator.clipboard.writeText(linkMesa).then(() => {
              setCopiado(true);
              setTimeout(() => setCopiado(false), 2000);
            });
          }}
          className="rounded-md border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition-colors hover:border-zinc-500"
        >
          {copiado ? "Link copiado ✓" : "Copiar link de criação da mesa"}
        </button>
        {feedback && (
          <p className={`text-sm ${feedback === "Regras salvas." ? "text-emerald-400" : "text-red-400"}`}>
            {feedback}
          </p>
        )}
      </div>
      <p className="text-xs text-zinc-600">
        Compartilhe o link com os jogadores: quem criar personagem por ele já entra com as regras
        da mesa aplicadas.
      </p>
    </section>
  );
}
