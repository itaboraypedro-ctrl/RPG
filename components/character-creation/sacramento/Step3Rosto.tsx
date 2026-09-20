"use client";

import { useRef, useState } from "react";
import type { SacramentoCreationData } from "@/lib/character-creation/sacramento/types";

type Props = {
  data: Partial<SacramentoCreationData>;
  onUpdate: (partial: Partial<SacramentoCreationData>) => void;
  onApplyFace: (mode: "rosto-foto" | "rosto-descricao", payload: string) => Promise<boolean>;
  isGenerating: boolean;
  error: string | null;
};

const LABEL = "font-cinzel text-[10px] uppercase tracking-[0.3em] text-arcana-text-dim";
const MAX_PHOTO_BYTES = 8 * 1024 * 1024;

export default function Step3Rosto({ data, onUpdate, onApplyFace, isGenerating, error }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [descricao, setDescricao] = useState(data.rosto?.descricao ?? "");
  const [mostrarDescricao, setMostrarDescricao] = useState(data.rosto?.modo === "descricao");

  const rostoAplicado = data.rosto?.aplicado === true;

  const handleFile = (file: File | undefined) => {
    setPhotoError(null);
    if (!file) return;
    if (!/^image\/(png|jpeg|webp)$/.test(file.type)) {
      setPhotoError("Use uma foto JPG, PNG ou WebP.");
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setPhotoError("Foto acima de 8MB — reduza e tente de novo.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPhotoDataUrl(typeof reader.result === "string" ? reader.result : null);
    reader.readAsDataURL(file);
  };

  const aplicarFoto = async () => {
    if (!photoDataUrl || isGenerating) return;
    await onApplyFace("rosto-foto", photoDataUrl);
  };

  const aplicarDescricao = async () => {
    const texto = descricao.trim();
    if (!texto || isGenerating) return;
    await onApplyFace("rosto-descricao", texto);
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <p className="font-crimson text-sm italic text-arcana-text-dim">
        Para fechar o visual, envie uma foto do seu rosto — o retrato ganha a
        sua cara, pintada no mesmo estilo. A foto é usada apenas para gerar a
        imagem e não fica salva.
      </p>

      {/* Caminho principal: foto */}
      <div className="space-y-3">
        <span className={LABEL}>Sua foto no Oeste</span>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isGenerating}
          className="w-full rounded-2xl px-6 py-8 text-center transition-all hover:-translate-y-px"
          style={{
            background: "rgba(27,27,42,0.72)",
            border: photoDataUrl
              ? "1px solid var(--color-arcana-gold)"
              : "1.5px dashed rgba(209,171,85,0.45)",
            boxShadow: photoDataUrl ? "0 0 18px rgba(209,171,85,0.2)" : "none",
          }}
        >
          {photoDataUrl ? (
            <span className="flex items-center justify-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoDataUrl}
                alt="Prévia da sua foto"
                className="w-16 h-16 rounded-xl object-cover"
              />
              <span className="font-crimson text-sm text-arcana-text">
                Foto carregada — troque clicando aqui
              </span>
            </span>
          ) : (
            <span className="space-y-2 block">
              <span className="block font-cinzel text-sm uppercase tracking-[0.2em] text-arcana-gold-bright">
                Enviar foto do rosto
              </span>
              <span className="block font-crimson text-sm italic text-arcana-text-dim">
                De frente, com boa luz — o resto é com a gente
              </span>
            </span>
          )}
        </button>
        {photoError && (
          <p className="font-crimson text-sm italic text-arcana-danger" role="alert">
            {photoError}
          </p>
        )}
        {photoDataUrl && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={aplicarFoto}
              disabled={isGenerating}
              className={isGenerating ? "arcana-btn-disabled arcana-btn-sm" : "arcana-btn-primary arcana-btn-sm"}
            >
              {isGenerating ? "Pintando o retrato…" : "Aplicar meu rosto"}
            </button>
          </div>
        )}
      </div>

      {error && (
        <p className="font-crimson text-sm italic text-arcana-danger" role="alert">
          {error}
        </p>
      )}

      {rostoAplicado && (
        <p className="font-crimson text-sm text-arcana-gold-bright">
          Rosto aplicado ao retrato — confira ao lado. Pode enviar outra foto ou
          ajustar a descrição se quiser refinar.
        </p>
      )}

      {/* Caminho secundário: descrição (menor destaque) */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setMostrarDescricao((v) => !v)}
          className="font-crimson text-sm italic text-arcana-text-dim underline underline-offset-4 hover:text-arcana-text transition-colors"
        >
          Prefiro não enviar foto — descrever o rosto
        </button>
        {mostrarDescricao && (
          <div className="space-y-2">
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex.: rosto anguloso, cicatriz na sobrancelha, olhos claros, bigode grisalho"
              maxLength={600}
              rows={3}
              disabled={isGenerating}
              className="arcana-input w-full font-crimson text-lg resize-none"
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={aplicarDescricao}
                disabled={isGenerating || descricao.trim().length === 0}
                className={
                  isGenerating || descricao.trim().length === 0
                    ? "arcana-btn-disabled arcana-btn-sm"
                    : "arcana-btn-ghost arcana-btn-sm"
                }
              >
                {isGenerating ? "Pintando…" : "Aplicar descrição"}
              </button>
            </div>
          </div>
        )}
        {!rostoAplicado && (
          <button
            type="button"
            onClick={() => onUpdate({ rosto: { modo: "manter", aplicado: false } })}
            className={[
              "font-crimson text-sm italic underline underline-offset-4 transition-colors",
              data.rosto?.modo === "manter"
                ? "text-arcana-gold-bright"
                : "text-arcana-text-dim hover:text-arcana-text",
            ].join(" ")}
          >
            {data.rosto?.modo === "manter"
              ? "Mantendo o rosto atual do retrato ✓"
              : "Manter o rosto atual do retrato"}
          </button>
        )}
      </div>
    </div>
  );
}
