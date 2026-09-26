"use client";

import { useState } from "react";
import { applyWovenCampaign } from "@/app/campaigns/[id]/story/actions";
import type { CampaignConfig, CampaignElement } from "@/lib/types";
import {
  WOVEN_LISTS,
  wovenTitle,
  type WovenCampaign,
  type WovenListKey,
} from "@/lib/rulesets/sacramento/weave";
import { GhostButton, GoldButton, hintClass, labelClass } from "./ui";

type Selecao = Record<WovenListKey, boolean[]>;

const MENSAGENS = [
  "Lendo as histórias do bando…",
  "Consultando o livro do Juiz…",
  "Cruzando vínculos, dívidas e rancores…",
  "Pregando cartazes nas vilas de Minas…",
  "Afiando as cenas de abertura…",
];

/**
 * A IA lê as histórias do bando + docs 01/02 e propõe a campanha inteira.
 * O Juiz escolhe o que entra; depois tudo é editável nas seções do hub.
 */
export function WeavePanel({
  sessionId,
  readyCount,
  onApplied,
}: {
  sessionId: string;
  readyCount: number;
  onApplied: (elements: CampaignElement[], config: CampaignConfig | null) => void;
}) {
  const [instruction, setInstruction] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [proposal, setProposal] = useState<WovenCampaign | null>(null);
  const [selecao, setSelecao] = useState<Selecao | null>(null);
  const [usarPremissa, setUsarPremissa] = useState(true);
  const [aberto, setAberto] = useState<string | null>(null);
  const [aplicando, setAplicando] = useState(false);
  const [aplicado, setAplicado] = useState<number | null>(null);

  async function tecer() {
    if (loading) return;
    setLoading(true);
    setError(null);
    setAplicado(null);
    const timer = setInterval(() => setMsg((m) => (m + 1) % MENSAGENS.length), 6000);
    try {
      const res = await fetch("/api/ai/weave-campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, instruction: instruction.trim() || undefined }),
      });
      const json = (await res.json().catch(() => ({}))) as { proposal?: WovenCampaign; error?: string };
      if (!res.ok || !json.proposal) {
        setError(json.error ?? "A IA demorou demais ou falhou. Tente de novo.");
        return;
      }
      setProposal(json.proposal);
      setSelecao(
        Object.fromEntries(
          WOVEN_LISTS.map(({ key }) => [key, json.proposal![key].map(() => true)]),
        ) as Selecao,
      );
    } catch {
      setError("Erro de rede ao chamar a IA.");
    } finally {
      clearInterval(timer);
      setLoading(false);
    }
  }

  async function aplicar() {
    if (!proposal || !selecao || aplicando) return;
    setAplicando(true);
    setError(null);
    const escolhida: WovenCampaign = {
      ...proposal,
      ...(Object.fromEntries(
        WOVEN_LISTS.map(({ key }) => [key, proposal[key].filter((_, i) => selecao[key][i])]),
      ) as Pick<WovenCampaign, WovenListKey>),
    };
    const result = await applyWovenCampaign(sessionId, escolhida, { replacePremise: usarPremissa });
    setAplicando(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onApplied(result.elements, result.config);
    setAplicado(result.elements.length);
    setProposal(null);
    setSelecao(null);
  }

  const total = selecao
    ? WOVEN_LISTS.reduce((n, { key }) => n + selecao[key].filter(Boolean).length, 0) +
      (proposal?.arco.texto ? 1 : 0)
    : 0;

  return (
    <div className="arcana-card space-y-5 p-5">
      <div className="space-y-1">
        <p className="font-cinzel text-xs uppercase tracking-[0.3em] text-arcana-gold-bright">
          ✦ Tecer a campanha com IA
        </p>
        <p className="font-crimson text-base text-arcana-text">
          A IA lê as histórias do bando e os documentos do Sacramento (Criador de Personagens e
          Gerenciador de Partidas) e propõe lugares, facções, NPCs, cenas, missões, calendário e
          segredos — tudo costurado nos passados dos personagens. Você escolhe o que entra e edita
          depois em cada seção.
        </p>
      </div>

      {readyCount === 0 ? (
        <p className={hintClass}>
          Disponível quando o primeiro personagem do bando estiver pronto.
        </p>
      ) : !proposal ? (
        <div className="space-y-3">
          <textarea
            rows={2}
            value={instruction}
            maxLength={2000}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="Direção opcional — ex.: começar num velório em Desemboque; vilão principal ligado à ferrovia"
            className="arcana-input w-full resize-y font-crimson text-sm"
          />
          <div className="flex flex-wrap items-center gap-3">
            <GoldButton onClick={tecer} disabled={loading}>
              {loading ? "Tecendo…" : `Tecer a partir de ${readyCount} personagem${readyCount > 1 ? "s" : ""}`}
            </GoldButton>
            {loading && (
              <span className="font-crimson text-sm italic text-arcana-text">
                {MENSAGENS[msg]} (leva de 1 a 4 minutos)
              </span>
            )}
          </div>
        </div>
      ) : null}

      {error && <p className="font-crimson text-sm italic text-red-300">{error}</p>}
      {aplicado !== null && (
        <p className="font-crimson text-base text-emerald-300">
          {aplicado} elementos entraram na campanha. Revise e edite nas seções ao lado.
        </p>
      )}

      {proposal && selecao && (
        <div className="space-y-5">
          {(proposal.premissa || proposal.objetivoDoBando) && (
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-arcana-border-dim p-3">
              <input
                type="checkbox"
                checked={usarPremissa}
                onChange={(e) => setUsarPremissa(e.target.checked)}
                className="mt-1 accent-[#c9a84c]"
              />
              <span className="space-y-1">
                <span className={labelClass}>Substituir premissa e objetivo do bando</span>
                <span className="block font-crimson text-base text-arcana-text">{proposal.premissa}</span>
                {proposal.objetivoDoBando && (
                  <span className="block font-crimson text-sm italic text-arcana-text">
                    Objetivo: {proposal.objetivoDoBando}
                  </span>
                )}
              </span>
            </label>
          )}

          {proposal.arco.texto && (
            <details className="rounded-xl border border-arcana-gold/30 p-3">
              <summary className="cursor-pointer font-cinzel text-[11px] uppercase tracking-[0.2em] text-arcana-gold-bright">
                Arco da campanha — {proposal.arco.titulo || "só para o Juiz"}
              </summary>
              <p className="mt-2 whitespace-pre-line font-crimson text-base text-arcana-text">{proposal.arco.texto}</p>
            </details>
          )}

          {WOVEN_LISTS.map(({ key, label }) =>
            proposal[key].length === 0 ? null : (
              <div key={key} className="space-y-2">
                <p className={labelClass}>
                  {label} · {selecao[key].filter(Boolean).length}/{proposal[key].length}
                </p>
                <ul className="space-y-2">
                  {(proposal[key] as unknown as Record<string, string>[]).map((item, i) => {
                    const id = `${key}-${i}`;
                    return (
                      <li key={id} className="rounded-xl border border-arcana-border-dim">
                        <div className="flex items-center gap-3 px-3 py-2">
                          <input
                            type="checkbox"
                            aria-label={`Incluir ${wovenTitle(item)}`}
                            checked={selecao[key][i]}
                            onChange={(e) =>
                              setSelecao((s) =>
                                s && { ...s, [key]: s[key].map((v, j) => (j === i ? e.target.checked : v)) },
                              )
                            }
                            className="accent-[#c9a84c]"
                          />
                          <button
                            type="button"
                            onClick={() => setAberto(aberto === id ? null : id)}
                            className="flex min-w-0 flex-1 items-center justify-between gap-2 text-left"
                          >
                            <span className="truncate font-crimson text-base text-arcana-text">
                              {wovenTitle(item)}
                              {item.canonId && <span className="text-arcana-gold"> · cânone</span>}
                            </span>
                            <span className="font-cinzel text-xs text-arcana-text-dim">{aberto === id ? "−" : "+"}</span>
                          </button>
                        </div>
                        {aberto === id && (
                          <div className="space-y-1 border-t border-arcana-border-dim px-3 py-2">
                            {Object.entries(item)
                              .filter(([k, v]) => v && k !== "nome" && k !== "titulo" && k !== "canonId")
                              .map(([k, v]) => (
                                <p key={k} className="font-crimson text-sm text-arcana-text">
                                  <span className="font-cinzel text-[10px] uppercase tracking-[0.18em] text-arcana-gold">
                                    {k.replace(/([A-Z])/g, " $1")} ·{" "}
                                  </span>
                                  {v}
                                </p>
                              ))}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ),
          )}

          <div className="flex flex-wrap justify-end gap-2 border-t border-arcana-border-dim pt-4">
            <GhostButton
              onClick={() => {
                setProposal(null);
                setSelecao(null);
              }}
            >
              Descartar
            </GhostButton>
            <GhostButton onClick={tecer} disabled={loading || aplicando}>
              {loading ? "Tecendo…" : "Tecer de novo"}
            </GhostButton>
            <GoldButton onClick={aplicar} disabled={aplicando || total === 0}>
              {aplicando ? "Preenchendo…" : `Preencher campanha (${total})`}
            </GoldButton>
          </div>
        </div>
      )}
    </div>
  );
}
