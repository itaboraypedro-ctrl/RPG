"use client";

import { useState } from "react";
import { GhostButton, GoldButton, hintClass } from "./ui";

export type AiProposal = Record<string, string>;

const FIELD_LABELS: Record<string, string> = {
  texto: "Gancho",
  nome: "Nome",
  ocupacao: "Ocupação",
  descricao: "Descrição",
  desejo: "Desejo",
  medo: "Medo",
  segredo: "Segredo",
  agenda: "Agenda",
  lugar: "Lugar",
  descricaoPublica: "Descrição pública",
  fatosVerdadeiros: "Fatos verdadeiros",
  rumores: "Rumores",
  testesPossiveis: "Testes possíveis",
  consequenciasPossiveis: "Consequências",
  proponente: "Proponente",
  objetivo: "Objetivo",
  motivo: "Motivo",
  recompensa: "Recompensa",
  consequencias: "Consequências",
};

type Props = {
  sessionId: string;
  section: "hooks" | "npc" | "scene" | "mission";
  title: string;
  /** Aplica a proposta na campanha (cria o elemento). Retorna false em erro. */
  onApply: (proposal: AiProposal) => Promise<boolean>;
};

export function AiAssist({ sessionId, section, title, onApply }: Props) {
  const [open, setOpen] = useState(false);
  const [instruction, setInstruction] = useState("");
  const [proposals, setProposals] = useState<AiProposal[]>([]);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/generate-campaign-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          section,
          instruction: instruction.trim() || undefined,
        }),
      });
      const json = (await res.json()) as { proposals?: AiProposal[]; error?: string };
      if (!res.ok) {
        setError(json.error ?? "Erro ao gerar propostas");
        return;
      }
      setProposals(json.proposals ?? []);
    } catch {
      setError("Erro de rede ao chamar a IA");
    } finally {
      setLoading(false);
    }
  }

  async function apply(index: number) {
    setApplying(index);
    const ok = await onApply(proposals[index]);
    setApplying(null);
    if (ok) setProposals((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="rounded-sm border border-arcana-border-dim bg-arcana-surface/40">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="font-cinzel text-[10px] uppercase tracking-[0.3em] text-arcana-gold/80">
          ✦ {title}
        </span>
        <span className="font-cinzel text-xs text-arcana-text-dim">{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div className="space-y-4 border-t border-arcana-border-dim px-4 py-4">
          <p className={hintClass}>
            A IA gera apenas propostas — nada entra na campanha até você aplicar.
            Detalhes mecânicos vêm com página do livro ou marcados como decisão proposta.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void generate();
                }
              }}
              maxLength={1000}
              placeholder="Direção opcional — ex.: envolvendo a ferrovia e os Novos Sagrados"
              className="arcana-input flex-1 font-crimson text-sm"
            />
            <GoldButton onClick={generate} disabled={loading}>
              {loading ? "Consultando..." : "Gerar propostas"}
            </GoldButton>
          </div>

          {error && <p className="font-crimson text-sm italic text-red-400">{error}</p>}

          {proposals.map((proposal, i) => (
            <div
              key={`${proposal.titulo}-${i}`}
              className="rounded-sm border border-arcana-gold/25 bg-arcana-surface/80 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="font-cinzel text-sm uppercase tracking-[0.15em] text-arcana-gold-bright">
                  {proposal.titulo}
                </p>
                <span className="shrink-0 border border-arcana-gold/40 px-1.5 py-0.5 font-cinzel text-[7px] uppercase tracking-[0.2em] text-arcana-gold/80">
                  Proposta da IA
                </span>
              </div>
              <div className="mt-2 space-y-1">
                {Object.entries(proposal)
                  .filter(([key, value]) => key !== "titulo" && key !== "referencias" && value)
                  .map(([key, value]) => (
                    <p key={key} className="font-crimson text-sm text-arcana-text-dim">
                      <span className="font-cinzel text-[8px] uppercase tracking-[0.2em] text-arcana-gold/60">
                        {FIELD_LABELS[key] ?? key} ·{" "}
                      </span>
                      {value}
                    </p>
                  ))}
                {proposal.referencias && (
                  <p className="font-crimson text-xs italic text-arcana-text-dim/50">
                    Referências: {proposal.referencias}
                  </p>
                )}
              </div>
              <div className="mt-3 flex justify-end gap-2">
                <GhostButton
                  onClick={() => setProposals((prev) => prev.filter((_, j) => j !== i))}
                >
                  Descartar
                </GhostButton>
                <GhostButton onClick={() => apply(i)} disabled={applying === i}>
                  {applying === i ? "Aplicando..." : "✓ Aplicar"}
                </GhostButton>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
