"use client";

import { useState } from "react";
import type { Genre } from "@/lib/types";
import { TemplateWizard, type TemplateDraft } from "./TemplateWizard";

const MAX_PROMPT = 2000;

const LOADING_MESSAGES = [
  "A IA está tecendo sua história...",
  "Conjurando NPCs e cenários...",
  "Compondo a trilha sonora...",
];

type AiResponse = {
  title: string;
  genre: Genre;
  description: string;
  tags: string[];
  content: {
    synopsis: string;
    acts: { title: string; description: string }[];
    npcs: { name: string; role: string; motivation: string }[];
    locations: { name: string; description: string; atmosphere: string }[];
    music_cues: { scene: string; suggestion: string }[];
  };
};

export function AiTemplateGenerator() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<TemplateDraft | null>(null);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);

  async function generate() {
    if (prompt.trim().length === 0) {
      setError("Descreva sua aventura.");
      return;
    }
    setError(null);
    setLoading(true);

    const interval = setInterval(() => {
      setLoadingMsgIdx((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 2500);

    try {
      const res = await fetch("/api/ai/generate-template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "Falha na geração");
      }

      const data = (await res.json()) as AiResponse;
      setDraft({
        title: data.title,
        genre: data.genre,
        description: data.description,
        tags: data.tags,
        cover_image_url: "",
        is_public: false,
        ai_generated: true,
        content: data.content,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro desconhecido");
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  }

  if (draft) {
    return <TemplateWizard mode="create" initial={draft} />;
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="ai-prompt" className="text-sm text-zinc-400">
          Descreva sua aventura em poucas palavras
        </label>
        <textarea
          id="ai-prompt"
          rows={5}
          maxLength={MAX_PROMPT}
          placeholder="Uma vila assombrada por um dragão esquecido que na verdade protege um segredo..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={loading}
          className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none disabled:opacity-50"
        />
        <span className="text-right text-xs text-zinc-500">
          {prompt.length}/{MAX_PROMPT}
        </span>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {loading && (
        <div className="flex flex-col items-center gap-3 py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-emerald-500" />
          <p className="text-sm text-zinc-400">{LOADING_MESSAGES[loadingMsgIdx]}</p>
        </div>
      )}

      <button
        type="button"
        onClick={generate}
        disabled={loading}
        className="mt-auto rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
      >
        {loading ? "Gerando..." : "Gerar com IA"}
      </button>
    </div>
  );
}
