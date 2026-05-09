"use client";

import { useState } from "react";
import type { Character, SessionEvent, StoryContent } from "@/lib/types";

const SUGGESTIONS = [
  "Descreva esta cena",
  "Sugira um NPC",
  "O que acontece se...",
  "Crie um encontro",
];

type Message = { role: "user" | "assistant"; content: string };

type Props = {
  sessionId: string;
  sessionTitle: string;
  currentScene: string;
  characters: Character[];
  events: SessionEvent[];
  templateContent: StoryContent | null;
  disabled: boolean;
};

export function AiChat({
  sessionId,
  sessionTitle,
  currentScene,
  characters,
  events,
  templateContent,
  disabled,
}: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send(prompt: string) {
    if (loading || prompt.trim().length === 0) return;
    setError(null);
    setLoading(true);

    const lastEvents = events
      .slice(0, 5)
      .map((e) => `${e.type}: ${JSON.stringify(e.payload)}`);

    const context = {
      session_title: sessionTitle,
      current_act: currentScene,
      characters: characters.map((c) => ({
        name: c.name,
        hp: c.hp,
        max_hp: c.max_hp,
        conditions: c.conditions,
      })),
      last_events: lastEvents,
      story_synopsis: templateContent?.synopsis ?? "",
    };

    const history = [...messages];
    setMessages((prev) => [...prev, { role: "user", content: prompt }]);
    setInput("");

    try {
      const res = await fetch("/api/ai/gm-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          message: prompt,
          context,
          history,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "Falha na chamada");
      }
      const data = (await res.json()) as { text: string };
      setMessages((prev) => [...prev, { role: "assistant", content: data.text }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="flex flex-col gap-2 rounded-md border border-zinc-800 bg-zinc-900 p-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
        Chat com IA
      </h3>

      <div className="flex max-h-64 flex-col gap-2 overflow-y-auto rounded border border-zinc-800 bg-zinc-950 p-2 text-xs @[420px]:text-sm">
        {messages.length === 0 && !loading && (
          <p className="text-zinc-500">
            Pergunte algo ao assistente sobre a sessão.
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[90%] rounded p-2 @[360px]:max-w-[80%] @[520px]:max-w-[70%] ${
              m.role === "user"
                ? "self-end bg-emerald-900/30 text-emerald-100"
                : "self-start bg-zinc-800 text-zinc-200"
            }`}
          >
            <p className="whitespace-pre-wrap">{m.content}</p>
          </div>
        ))}
        {loading && (
          <div className="self-start rounded bg-zinc-800 px-2 py-1 text-zinc-400">
            <span className="animate-pulse">digitando...</span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-1">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => send(s)}
            disabled={disabled || loading}
            className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-300 hover:bg-zinc-700 disabled:opacity-50"
          >
            {s}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pergunte algo..."
          disabled={disabled || loading}
          className="flex-1 rounded border border-zinc-800 bg-zinc-950 px-2 py-1 text-xs"
        />
        <button
          type="submit"
          disabled={disabled || loading || input.trim().length === 0}
          className="rounded bg-emerald-600 px-3 py-1 text-xs text-white hover:bg-emerald-500 disabled:opacity-50"
        >
          Enviar
        </button>
      </form>

      {error && <p className="text-xs text-red-400">{error}</p>}
    </section>
  );
}
