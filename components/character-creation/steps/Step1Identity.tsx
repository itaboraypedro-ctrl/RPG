"use client";

import { useRef, type ChangeEvent } from "react";
import type {
  CharacterCreationData,
  Sex,
} from "@/lib/character-creation/types";

type Props = {
  data: Partial<CharacterCreationData>;
  onUpdate: (partial: Partial<CharacterCreationData>) => void;
};

const SEX_OPTIONS: { key: Sex; label: string }[] = [
  { key: "male", label: "Masculino" },
  { key: "female", label: "Feminino" },
  { key: "androgynous", label: "Andrógino" },
];

export default function Step1Identity({ data, onUpdate }: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        onUpdate({ referencePhotoBase64: result });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    onUpdate({ referencePhotoBase64: undefined });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerFilePicker = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6">
      {/* Nome */}
      <div className="space-y-2">
        <label
          htmlFor="character-name"
          className="font-cinzel text-xs uppercase tracking-[0.2em] text-arcana-gold"
        >
          Nome do personagem
        </label>
        <input
          id="character-name"
          type="text"
          required
          minLength={2}
          value={data.name ?? ""}
          onChange={(e) => onUpdate({ name: e.target.value })}
          placeholder="Ex.: Aelar Caelnith"
          className="w-full rounded-sm border border-arcana-border/60 bg-arcana-surface/40 px-4 py-3 font-crimson text-arcana-text placeholder:text-arcana-text-dim/40 focus:border-arcana-gold focus:outline-none transition-colors"
        />
      </div>

      {/* Sexo */}
      <div className="space-y-2">
        <span className="font-cinzel text-xs uppercase tracking-[0.2em] text-arcana-gold">
          Sexo
        </span>
        <div className="flex flex-wrap gap-2">
          {SEX_OPTIONS.map((opt) => {
            const selected = data.sex === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => onUpdate({ sex: opt.key })}
                className={`flex-1 min-w-[7rem] rounded-sm border px-4 py-3 font-cinzel text-sm uppercase tracking-[0.18em] transition-all ${
                  selected
                    ? "border-arcana-gold bg-arcana-gold/8 text-arcana-gold-bright"
                    : "border-arcana-border/40 text-arcana-text-dim hover:border-arcana-gold/30 hover:text-arcana-text"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Foto de referência */}
      <div className="space-y-3">
        <p className="font-crimson text-sm text-arcana-text-dim">
          <span className="text-arcana-gold">✦</span> Envie uma foto do rosto
          para manter a aparência entre gerações (opcional)
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        {data.referencePhotoBase64 ? (
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={data.referencePhotoBase64}
              alt="Referência"
              className="h-20 w-20 rounded-full border border-arcana-gold object-cover"
            />
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={triggerFilePicker}
                className="font-cinzel text-xs uppercase tracking-[0.2em] text-arcana-gold hover:text-arcana-gold-bright"
              >
                Trocar foto
              </button>
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="font-cinzel text-xs uppercase tracking-[0.2em] text-arcana-text-dim hover:text-arcana-text"
              >
                Remover
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={triggerFilePicker}
            className="rounded-md border border-dashed border-arcana-border bg-arcana-surface px-4 py-3 font-cinzel text-xs uppercase tracking-[0.2em] text-arcana-text-dim hover:border-arcana-gold/40 hover:text-arcana-gold"
          >
            Selecionar imagem
          </button>
        )}
      </div>
    </div>
  );
}
