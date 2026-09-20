"use client";

import { useState } from "react";
import { ESTILOS_SUGERIDOS } from "@/lib/character-creation/sacramento/story-data";
import type { SacramentoCreationData } from "@/lib/character-creation/sacramento/types";

type Props = {
  data: Partial<SacramentoCreationData>;
  onCustomize: (instruction: string) => Promise<boolean>;
  isGenerating: boolean;
  error: string | null;
};

const LABEL = "font-cinzel text-[10px] uppercase tracking-[0.3em] text-arcana-text-dim";

export default function Step2Estilo({ data, onCustomize, isGenerating, error }: Props) {
  const [texto, setTexto] = useState("");
  const aplicadas = data.customizacoes ?? [];

  const aplicar = async () => {
    const pedido = texto.trim();
    if (!pedido || isGenerating) return;
    const ok = await onCustomize(pedido);
    if (ok) setTexto("");
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <p className="font-crimson text-sm italic text-arcana-text-dim">
        Descreva roupas, chapéu, cabelo e acessórios — a IA redesenha o retrato
        mantendo rosto, corpo e pose. Você pode aplicar quantos ajustes quiser,
        um pedido por vez, ou seguir com a base como está.
      </p>

      <div className="space-y-2">
        <label htmlFor="estilo-pedido" className={LABEL}>
          O que seu personagem veste?
        </label>
        <textarea
          id="estilo-pedido"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Ex.: sobretudo de couro gasto, chapéu de aba larga, lenço vermelho e botas com esporas"
          maxLength={600}
          rows={4}
          disabled={isGenerating}
          className="arcana-input w-full font-crimson text-lg resize-none"
        />
        <div className="flex items-center justify-between gap-3">
          <p className="font-crimson text-xs italic text-arcana-text-dim">
            {texto.length}/600
          </p>
          <button
            type="button"
            onClick={aplicar}
            disabled={isGenerating || texto.trim().length === 0}
            className={
              isGenerating || texto.trim().length === 0
                ? "arcana-btn-disabled arcana-btn-sm"
                : "arcana-btn-primary arcana-btn-sm"
            }
          >
            {isGenerating ? "Redesenhando…" : "Aplicar com IA"}
          </button>
        </div>
      </div>

      {error && (
        <p className="font-crimson text-sm italic text-arcana-danger" role="alert">
          {error}
        </p>
      )}

      <div className="space-y-3">
        <span className={LABEL}>Sugestões do Oeste</span>
        <div className="flex flex-wrap gap-2">
          {ESTILOS_SUGERIDOS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setTexto(s)}
              disabled={isGenerating}
              className="arcana-chip text-left"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {aplicadas.length > 0 && (
        <div className="space-y-3">
          <span className={LABEL}>Ajustes aplicados</span>
          <ol className="space-y-2">
            {aplicadas.map((c, i) => (
              <li
                key={`${i}-${c.slice(0, 24)}`}
                className="font-crimson text-sm text-arcana-text rounded-xl px-4 py-2.5"
                style={{
                  background: "rgba(27,27,42,0.72)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <span className="font-cinzel text-[10px] uppercase tracking-[0.2em] text-arcana-gold mr-2">
                  {i + 1}
                </span>
                {c}
              </li>
            ))}
          </ol>
          <p className="font-crimson text-xs italic text-arcana-text-dim">
            Use as setas no retrato para comparar versões anteriores.
          </p>
        </div>
      )}
    </div>
  );
}
