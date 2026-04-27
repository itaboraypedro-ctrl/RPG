"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import type { StoryContent } from "@/lib/types";
import {
  advanceAct,
  saveStoryAnnotation,
} from "@/app/dashboard/sessions/[id]/play/actions";

type Tab = "synopsis" | "acts" | "npcs" | "locations";

type Act = { title: string; description: string };
type Npc = { name: string; role: string; motivation: string };
type Loc = { name: string; description: string; atmosphere: string };

type Props = {
  sessionId: string;
  templateContent: StoryContent | null;
  currentScene: string;
  storySummary: string;
  disabled: boolean;
};

export function StoryViewer({
  sessionId,
  templateContent,
  currentScene,
  storySummary,
  disabled,
}: Props) {
  const [tab, setTab] = useState<Tab>("synopsis");
  const [annotation, setAnnotation] = useState(storySummary);
  const lastSavedRef = useRef(storySummary);
  const [, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (annotation === lastSavedRef.current) return;
    const handle = setTimeout(() => {
      saveStoryAnnotation(sessionId, annotation).then((r) => {
        if (r.error) setError(r.error);
        else lastSavedRef.current = annotation;
      });
    }, 800);
    return () => clearTimeout(handle);
  }, [annotation, sessionId]);

  function onAdvance(title: string) {
    startTransition(async () => {
      const r = await advanceAct(sessionId, title);
      if (r.error) setError(r.error);
    });
  }

  if (!templateContent) {
    return (
      <section className="rounded-md border border-zinc-800 bg-zinc-900 p-3">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
          História
        </h3>
        <p className="text-xs text-zinc-500">Sessão sem template vinculado.</p>
      </section>
    );
  }

  const acts = (templateContent.acts ?? []) as unknown as Act[];
  const npcs = (templateContent.npcs ?? []) as unknown as Npc[];
  const locations = (templateContent.locations ?? []) as unknown as Loc[];

  return (
    <section className="flex flex-col gap-2 rounded-md border border-zinc-800 bg-zinc-900 p-3">
      <header className="flex flex-wrap items-center gap-1">
        <h3 className="mr-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
          História
        </h3>
        {(["synopsis", "acts", "npcs", "locations"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded px-2 py-0.5 text-[10px] uppercase tracking-wide ${
              tab === t
                ? "bg-emerald-600 text-white"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }`}
          >
            {t === "synopsis"
              ? "Sinopse"
              : t === "acts"
                ? "Atos"
                : t === "npcs"
                  ? "NPCs"
                  : "Locais"}
          </button>
        ))}
      </header>

      <div className="max-h-64 overflow-y-auto rounded border border-zinc-800 bg-zinc-950 p-2 text-xs text-zinc-200">
        {tab === "synopsis" && (
          <p className="whitespace-pre-wrap">
            {templateContent.synopsis || "(sem sinopse)"}
          </p>
        )}
        {tab === "acts" && (
          <div className="flex flex-col gap-2">
            {acts.length === 0 ? (
              <p className="text-zinc-500">(nenhum ato)</p>
            ) : (
              acts.map((a, i) => {
                const isCurrent = currentScene === a.title;
                return (
                  <div
                    key={i}
                    className={`rounded border p-2 ${
                      isCurrent
                        ? "border-emerald-500 bg-emerald-900/10"
                        : "border-zinc-800"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-zinc-100">
                        {i + 1}. {a.title}
                      </p>
                      {!isCurrent && (
                        <button
                          type="button"
                          onClick={() => onAdvance(a.title)}
                          disabled={disabled}
                          className="shrink-0 rounded bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-200 hover:bg-zinc-700 disabled:opacity-50"
                        >
                          Avançar
                        </button>
                      )}
                    </div>
                    <p className="mt-1 text-zinc-300">{a.description}</p>
                  </div>
                );
              })
            )}
          </div>
        )}
        {tab === "npcs" && (
          <div className="flex flex-col gap-2">
            {npcs.length === 0 ? (
              <p className="text-zinc-500">(nenhum NPC)</p>
            ) : (
              npcs.map((n, i) => (
                <div key={i} className="rounded border border-zinc-800 p-2">
                  <p className="font-medium text-zinc-100">{n.name}</p>
                  <p className="text-zinc-400 italic">{n.role}</p>
                  <p className="text-zinc-300">{n.motivation}</p>
                </div>
              ))
            )}
          </div>
        )}
        {tab === "locations" && (
          <div className="flex flex-col gap-2">
            {locations.length === 0 ? (
              <p className="text-zinc-500">(nenhum local)</p>
            ) : (
              locations.map((l, i) => (
                <div key={i} className="rounded border border-zinc-800 p-2">
                  <p className="font-medium text-zinc-100">{l.name}</p>
                  <p className="text-zinc-400 italic">{l.atmosphere}</p>
                  <p className="text-zinc-300">{l.description}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <textarea
        rows={3}
        placeholder="Anotações privadas..."
        value={annotation}
        onChange={(e) => setAnnotation(e.target.value)}
        disabled={disabled}
        className="rounded border border-zinc-800 bg-zinc-950 px-2 py-1 text-xs text-zinc-200 focus:border-emerald-500 focus:outline-none"
      />

      {error && <p className="text-xs text-red-400">{error}</p>}
    </section>
  );
}
