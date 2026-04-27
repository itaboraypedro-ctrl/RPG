"use client";

import { useState } from "react";

type Props = {
  prompt: string;
  currentAvatar: string | null;
  onSelect: (url: string) => void;
};

export function AvatarGenerator({ prompt, currentAvatar, onSelect }: Props) {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [placeholder, setPlaceholder] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualUrl, setManualUrl] = useState("");

  async function generate() {
    if (prompt.trim().length === 0) {
      setError("Preencha os campos de aparência primeiro.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/ai/generate-avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "Falha na geração");
      }
      const data = (await res.json()) as { images: string[]; placeholder?: boolean };
      setImages(data.images);
      setPlaceholder(!!data.placeholder);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={generate}
        disabled={loading}
        className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
      >
        {loading ? "Gerando..." : "Gerar Avatar"}
      </button>

      {placeholder && (
        <p className="rounded border border-amber-900/50 bg-amber-950/20 px-3 py-2 text-xs text-amber-300">
          Sem chave OpenAI configurada — exibindo placeholders. Configure
          <code className="mx-1 rounded bg-zinc-900 px-1">OPENAI_API_KEY</code>
          para usar geração real.
        </p>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {images.map((url) => (
            <button
              key={url}
              type="button"
              onClick={() => onSelect(url)}
              className={`relative aspect-square overflow-hidden rounded-md border-2 ${
                currentAvatar === url
                  ? "border-emerald-500"
                  : "border-zinc-800 hover:border-zinc-600"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="Avatar" className="h-full w-full object-cover" />
              {currentAvatar === url && (
                <span className="absolute right-1 top-1 rounded-full bg-emerald-600 px-1.5 py-0.5 text-[9px] font-medium text-white">
                  ✓
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-1.5 border-t border-zinc-800 pt-3">
        <label className="text-xs text-zinc-400">Ou cole uma URL manual</label>
        <div className="flex gap-2">
          <input
            type="url"
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            placeholder="https://..."
            className="flex-1 rounded border border-zinc-800 bg-zinc-900 px-2 py-1.5 text-xs"
          />
          <button
            type="button"
            onClick={() => {
              if (manualUrl.trim()) onSelect(manualUrl.trim());
            }}
            disabled={!manualUrl.trim()}
            className="rounded bg-zinc-800 px-3 py-1.5 text-xs hover:bg-zinc-700 disabled:opacity-50"
          >
            Usar
          </button>
        </div>
      </div>

      {currentAvatar && (
        <div className="flex items-center gap-2 rounded border border-emerald-900/50 bg-emerald-950/20 p-2 text-xs">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentAvatar}
            alt="Avatar selecionado"
            className="h-12 w-12 rounded object-cover"
          />
          <span className="text-emerald-300">Avatar selecionado</span>
        </div>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
