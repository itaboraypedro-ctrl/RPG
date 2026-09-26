"use client";

import { useState } from "react";

/**
 * Popup de confirmação da mesa. Com `palavra`, o botão só libera depois que
 * a pessoa digita a palavra (ações pesadas, como encerrar a campanha).
 */
export function ConfirmarAcao({
  titulo,
  texto,
  confirmar,
  palavra,
  perigo = false,
  pending = false,
  onConfirmar,
  onFechar,
}: {
  titulo: string;
  texto: string;
  confirmar: string;
  palavra?: string;
  perigo?: boolean;
  pending?: boolean;
  onConfirmar: () => void;
  onFechar: () => void;
}) {
  const [digitado, setDigitado] = useState("");
  const liberado = !palavra || digitado.trim().toLowerCase() === palavra;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={titulo}>
      <button aria-label="Fechar" onClick={onFechar} className="absolute inset-0 bg-black/75" />
      <form
        className="arcana-card relative w-full max-w-md space-y-4 p-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (liberado && !pending) onConfirmar();
        }}
      >
        <h2 className="arcana-heading text-xl tracking-[0.12em]">{titulo}</h2>
        <p className="font-crimson text-base text-white">{texto}</p>
        {palavra && (
          <label className="block space-y-1.5">
            <span className="font-cinzel text-[10px] uppercase tracking-[0.2em] text-arcana-text">
              Digite <strong className="text-arcana-gold-bright">{palavra}</strong> para confirmar
            </span>
            <input
              autoFocus
              value={digitado}
              onChange={(e) => setDigitado(e.target.value)}
              className="arcana-input w-full"
              autoComplete="off"
              spellCheck={false}
            />
          </label>
        )}
        <div className="flex justify-end gap-2">
          <button type="button" className="arcana-btn-ghost" onClick={onFechar} disabled={pending}>
            Cancelar
          </button>
          <button type="submit" className={perigo ? "arcana-btn-danger" : "arcana-btn-primary"} disabled={!liberado || pending}>
            {pending ? "Aguarde…" : confirmar}
          </button>
        </div>
      </form>
    </div>
  );
}
