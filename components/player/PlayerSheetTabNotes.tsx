"use client";

import { useCallback, useMemo, useState } from "react";
import type { Character, SessionEvent } from "@/lib/types";
import { skillsMetaOf } from "@/components/characters/types";
import {
  commitCharacterField,
  commitSkillsField,
  useDebouncedSave,
} from "./sheet-utils";

type NpcEntry = { name: string; relation?: string; notes?: string };

type Props = {
  character: Character;
  publicEvents: SessionEvent[];
  editable: boolean;
  onError: (message: string | null) => void;
};

export function PlayerSheetTabNotes({
  character,
  publicEvents,
  editable,
  onError,
}: Props) {
  const meta = skillsMetaOf(character);
  const initialNpcs =
    ((meta as Record<string, unknown>).npcs as NpcEntry[] | undefined) ?? [];

  const [notes, setNotes] = useState(character.notes ?? "");
  const [backstory, setBackstory] = useState(character.backstory ?? "");
  const [showBackstory, setShowBackstory] = useState(false);
  const [npcs, setNpcs] = useState<NpcEntry[]>(initialNpcs);

  const [lastNotesProp, setLastNotesProp] = useState(character.notes);
  if (character.notes !== lastNotesProp) {
    setLastNotesProp(character.notes);
    setNotes(character.notes ?? "");
  }
  const [lastBackstoryProp, setLastBackstoryProp] = useState(character.backstory);
  if (character.backstory !== lastBackstoryProp) {
    setLastBackstoryProp(character.backstory);
    setBackstory(character.backstory ?? "");
  }
  const [lastSkillsProp, setLastSkillsProp] = useState(character.skills);
  if (character.skills !== lastSkillsProp) {
    setLastSkillsProp(character.skills);
    const fresh =
      ((skillsMetaOf(character) as Record<string, unknown>).npcs as
        | NpcEntry[]
        | undefined) ?? [];
    setNpcs(fresh);
  }

  const saveNotes = useCallback(
    async (v: string) => {
      if (!editable) return;
      const { error } = await commitCharacterField(character.id, { notes: v });
      onError(error);
    },
    [character.id, editable, onError]
  );

  const saveBackstory = useCallback(
    async (v: string) => {
      if (!editable) return;
      const { error } = await commitCharacterField(character.id, { backstory: v });
      onError(error);
    },
    [character.id, editable, onError]
  );

  const saveNpcs = useCallback(
    async (next: NpcEntry[]) => {
      if (!editable) return;
      const fresh = skillsMetaOf(character);
      const { error } = await commitSkillsField(
        character.id,
        fresh,
        "npcs" as never,
        next as never
      );
      onError(error);
    },
    [character, editable, onError]
  );

  useDebouncedSave(notes, 600, saveNotes);
  useDebouncedSave(backstory, 600, saveBackstory);
  useDebouncedSave(npcs, 600, saveNpcs);

  const characterEvents = useMemo(() => {
    return publicEvents
      .filter((e) => {
        const targetId = (e.payload as Record<string, unknown>)?.target_id;
        return (
          e.actor_id === character.owner_id ||
          (typeof targetId === "string" && targetId === character.id)
        );
      })
      .slice(0, 10);
  }, [publicEvents, character.id, character.owner_id]);

  function addNpc() {
    setNpcs((prev) => [...prev, { name: "", relation: "", notes: "" }]);
  }
  function updateNpc(idx: number, patch: Partial<NpcEntry>) {
    setNpcs((prev) => prev.map((n, i) => (i === idx ? { ...n, ...patch } : n)));
  }
  function removeNpc(idx: number) {
    setNpcs((prev) => prev.filter((_, i) => i !== idx));
  }

  const personality = character.personality ?? {};
  const trait = (personality as Record<string, unknown>).trait as string | undefined;
  const ideal = (personality as Record<string, unknown>).ideal as string | undefined;
  const bond = (personality as Record<string, unknown>).bond as string | undefined;
  const flaw = (personality as Record<string, unknown>).flaw as string | undefined;
  const hasPersonality = trait || ideal || bond || flaw;

  return (
    <div className="flex flex-col gap-4">
      {/* Personality from wizard */}
      {hasPersonality && (
        <section>
          <SectionLabel>Personalidade</SectionLabel>
          <div className="flex flex-col gap-1.5">
            {[
              { label: "Traço", value: trait },
              { label: "Ideal", value: ideal },
              { label: "Vínculo", value: bond },
              { label: "Defeito", value: flaw },
            ]
              .filter((p) => p.value)
              .map((p) => (
                <div key={p.label} className="relative overflow-hidden rounded border border-zinc-800 bg-zinc-900 px-3 py-2">
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
                  <span className="block text-[9px] uppercase tracking-[0.25em] text-amber-400" style={{ fontFamily: "var(--font-rpg-hud)" }}>
                    {p.label}
                  </span>
                  <p className="mt-0.5 text-sm text-zinc-300">{p.value}</p>
                </div>
              ))}
          </div>
        </section>
      )}

      {/* Backstory — always visible at top, collapsible */}
      <section>
        <button
          type="button"
          onClick={() => setShowBackstory((v) => !v)}
          className="relative flex w-full items-center justify-between overflow-hidden rounded border border-zinc-800 bg-zinc-900 px-3 py-2.5 transition-colors hover:border-amber-500/40"
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-amber-400" style={{ fontFamily: "var(--font-rpg-hud)" }}>
            História do personagem
          </span>
          <span className="text-xs text-zinc-500">{showBackstory ? "▲" : "▼"}</span>
        </button>
        {showBackstory && (
          <textarea
            value={backstory}
            onChange={(e) => setBackstory(e.target.value)}
            disabled={!editable}
            rows={7}
            placeholder="Origem, motivações, vínculos..."
            className="mt-1 w-full rounded border border-zinc-800 bg-zinc-950 p-3 text-sm leading-relaxed text-zinc-300 placeholder:text-zinc-700 focus:border-amber-500/50 focus:outline-none disabled:opacity-60"
          />
        )}
      </section>

      {/* Session notes */}
      <section>
        <SectionLabel>Notas de sessão</SectionLabel>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={!editable}
          rows={5}
          placeholder="Pistas, decisões, eventos importantes..."
          className="w-full rounded border border-zinc-800 bg-zinc-950 p-3 text-sm leading-relaxed text-zinc-300 placeholder:text-zinc-700 focus:border-blue-500/50 focus:outline-none disabled:opacity-60"
          style={{ resize: "vertical" }}
        />
      </section>

      {/* NPCs */}
      <section>
        <header className="mb-2 flex items-center justify-between">
          <SectionLabel>NPCs encontrados</SectionLabel>
          <button
            type="button"
            onClick={addNpc}
            disabled={!editable}
            className="rounded border border-zinc-700 bg-zinc-900 px-2 py-0.5 text-xs text-zinc-400 hover:border-violet-500/50 hover:text-violet-400 disabled:opacity-40"
          >
            + Novo
          </button>
        </header>
        {npcs.length === 0 ? (
          <p className="rounded border border-zinc-800 bg-zinc-900 p-3 text-xs text-zinc-500">
            Nenhum NPC anotado ainda.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {npcs.map((n, i) => (
              <div key={i} className="relative overflow-hidden flex flex-col gap-1.5 rounded border border-zinc-800 bg-zinc-900 p-3">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={n.name}
                    onChange={(e) => updateNpc(i, { name: e.target.value })}
                    disabled={!editable}
                    placeholder="Nome"
                    className="flex-1 rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-sm font-semibold text-violet-300 placeholder:text-zinc-600 focus:border-violet-500/50 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={n.relation ?? ""}
                    onChange={(e) => updateNpc(i, { relation: e.target.value })}
                    disabled={!editable}
                    placeholder="Relação"
                    className="w-28 rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-xs text-zinc-400 placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeNpc(i)}
                    disabled={!editable}
                    aria-label="Remover NPC"
                    className="flex h-7 w-7 items-center justify-center rounded text-zinc-500 hover:bg-red-950/40 hover:text-red-400 disabled:opacity-40"
                  >
                    ×
                  </button>
                </div>
                <textarea
                  value={n.notes ?? ""}
                  onChange={(e) => updateNpc(i, { notes: e.target.value })}
                  disabled={!editable}
                  rows={2}
                  placeholder="Notas sobre este NPC..."
                  className="w-full rounded border border-zinc-800 bg-zinc-950 px-2 py-1 text-xs leading-relaxed text-zinc-400 placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none disabled:opacity-60"
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Character event log */}
      <section>
        <SectionLabel>Log do personagem</SectionLabel>
        {characterEvents.length === 0 ? (
          <p className="rounded border border-zinc-800 bg-zinc-900 p-3 text-xs text-zinc-500">
            Sem eventos recentes envolvendo este personagem.
          </p>
        ) : (
          <ul className="flex flex-col gap-1">
            {characterEvents.map((ev) => {
              const time = new Date(ev.created_at).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              });
              return (
                <li key={ev.id} className="relative overflow-hidden rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs">
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-[10px] uppercase tracking-wider text-zinc-500" style={{ fontFamily: "var(--font-rpg-hud)" }}>
                      {ev.type}
                    </span>
                    <span className="text-[10px] tabular-nums text-zinc-600" style={{ fontFamily: "var(--font-rpg-numbers)" }}>
                      {time}
                    </span>
                  </div>
                  <p className="mt-0.5 text-zinc-300">
                    {summarize(ev.payload as Record<string, unknown>)}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-zinc-500" style={{ fontFamily: "var(--font-rpg-hud)" }}>
      {children}
    </h3>
  );
}

function summarize(payload: Record<string, unknown> | null | undefined): string {
  if (!payload) return "—";
  if (typeof payload.summary === "string") return payload.summary;
  if (typeof payload.message === "string") return payload.message;
  if (typeof payload.amount === "number" && typeof payload.label === "string") {
    return `${payload.label}: ${payload.amount}`;
  }
  return JSON.stringify(payload);
}
