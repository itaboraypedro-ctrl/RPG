"use client";

// Slot de imagem para cartas de elementos (lugares etc.) — retrato do Oeste
// no topo da carta: vazio vira um convite discreto, preenchido ganha vinheta.

import { useRef, useState } from "react";

type Props = {
  imageUrl?: string;
  alt: string;
  /** Faz o upload e devolve mensagem de erro, ou null em caso de sucesso. */
  onUpload: (file: File) => Promise<string | null>;
  /** Remove a imagem atual (storage + dado). */
  onRemove: () => Promise<void>;
};

export function ImageSlot({ imageUrl, alt, onUpload, onRemove }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file || busy) return;
    setBusy(true);
    setError(null);
    const failure = await onUpload(file);
    if (failure) setError(failure);
    setBusy(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleRemove() {
    if (busy) return;
    setBusy(true);
    setError(null);
    await onRemove();
    setBusy(false);
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => void handleFile(e.target.files?.[0])}
      />

      {imageUrl ? (
        <div className="group/img relative h-36 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={alt}
            className="h-full w-full object-cover"
            loading="lazy"
          />
          {/* Vinheta para a carta continuar legível sobre a foto */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(11,11,20,0.15), transparent 35%, transparent 60%, rgba(11,11,20,0.65))",
              boxShadow: "inset 0 0 40px rgba(11,11,20,0.45)",
            }}
          />
          <div className="absolute right-2 top-2 flex gap-1.5 opacity-0 transition-opacity group-hover/img:opacity-100">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              title="Trocar imagem"
              className="arcana-glass rounded-xl px-2 py-1 font-cinzel text-[9px] uppercase tracking-[0.2em] text-arcana-text transition-colors hover:text-arcana-gold"
            >
              Trocar
            </button>
            <button
              type="button"
              onClick={() => void handleRemove()}
              disabled={busy}
              title="Remover imagem"
              className="arcana-glass rounded-xl px-2 py-1 font-cinzel text-[9px] uppercase tracking-[0.2em] text-arcana-danger transition-colors hover:text-red-300"
            >
              ✕
            </button>
          </div>
          {busy && (
            <div className="absolute inset-0 flex items-center justify-center bg-arcana-bg/60">
              <span className="font-cinzel text-[10px] uppercase tracking-[0.25em] text-arcana-gold">
                Enviando...
              </span>
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="group/img flex h-20 w-full flex-col items-center justify-center gap-1 border-b border-dashed border-arcana-border/60 transition-colors hover:border-arcana-gold/40 hover:bg-arcana-gold/[0.03]"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5 text-arcana-text-muted transition-colors group-hover/img:text-arcana-gold"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <rect x="3" y="5" width="18" height="14" rx="1.5" />
            <path d="m3 16 5-5 4 4 3.5-3.5L21 17" />
            <circle cx="9" cy="9.5" r="1.4" />
          </svg>
          <span className="font-cinzel text-[9px] uppercase tracking-[0.25em] text-arcana-text-dim transition-colors group-hover/img:text-arcana-gold">
            {busy ? "Enviando..." : "Adicionar imagem"}
          </span>
        </button>
      )}

      {error && (
        <p className="px-1 py-1.5 font-crimson text-xs italic text-arcana-danger">
          {error}
        </p>
      )}
    </div>
  );
}
