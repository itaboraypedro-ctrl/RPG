"use client";

import { useRef, type ChangeEvent } from "react";
import type {
  AgeCategory,
  CharacterCreationData,
  Sex,
} from "@/lib/character-creation/types";

type Props = {
  data: Partial<CharacterCreationData>;
  onUpdate: (partial: Partial<CharacterCreationData>) => void;
  onNext: () => void;
};

const SEX_OPTIONS: { key: Sex; label: string }[] = [
  { key: "male", label: "Masculino" },
  { key: "female", label: "Feminino" },
  { key: "androgynous", label: "Andrógino" },
];

const AGE_OPTIONS: { key: AgeCategory; label: string }[] = [
  { key: "young", label: "Jovem" },
  { key: "adult", label: "Adulto" },
  { key: "mature", label: "Maduro" },
  { key: "elder", label: "Ancião" },
];

export default function Step1Identity({ data, onUpdate, onNext }: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isValid =
    !!data.name &&
    data.name.trim().length >= 2 &&
    !!data.sex &&
    !!data.ageCategory;

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
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-6 overflow-y-auto px-1 pb-4">
        <header className="space-y-1">
          <h2 className="font-cinzel text-2xl uppercase tracking-[0.25em] text-arcana-gold-bright">
            Identidade Básica
          </h2>
          <p className="font-crimson text-arcana-text-dim">
            Quem é seu personagem?
          </p>
        </header>

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
            className="w-full rounded-md border border-arcana-border bg-arcana-surface px-4 py-3 font-crimson text-arcana-text placeholder:text-arcana-text-dim/60 focus:border-arcana-gold focus:outline-none"
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
                  className={`flex-1 min-w-[7rem] rounded-md border px-4 py-3 font-cinzel text-sm uppercase tracking-[0.18em] transition ${
                    selected
                      ? "border-arcana-gold bg-arcana-gold/10 text-arcana-text"
                      : "border-arcana-border text-arcana-text-dim hover:border-arcana-gold/40"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Idade */}
        <div className="space-y-2">
          <span className="font-cinzel text-xs uppercase tracking-[0.2em] text-arcana-gold">
            Idade
          </span>
          <div className="flex flex-wrap gap-2">
            {AGE_OPTIONS.map((opt) => {
              const selected = data.ageCategory === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => onUpdate({ ageCategory: opt.key })}
                  className={`flex-1 min-w-[6rem] rounded-md border px-4 py-3 font-cinzel text-sm uppercase tracking-[0.18em] transition ${
                    selected
                      ? "border-arcana-gold bg-arcana-gold/10 text-arcana-text"
                      : "border-arcana-border text-arcana-text-dim hover:border-arcana-gold/40"
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

      {/* Ações sticky */}
      <div className="sticky bottom-0 flex justify-end gap-3 border-t border-arcana-border bg-arcana-bg/95 pt-4 backdrop-blur">
        <button
          type="button"
          disabled={!isValid}
          onClick={onNext}
          className={`font-cinzel uppercase tracking-[0.3em] px-8 py-3 rounded-md transition ${
            isValid
              ? "bg-arcana-gold text-arcana-bg hover:bg-arcana-gold-bright"
              : "bg-arcana-gold text-arcana-bg opacity-50 cursor-not-allowed"
          }`}
        >
          Próximo →
        </button>
      </div>
    </div>
  );
}
