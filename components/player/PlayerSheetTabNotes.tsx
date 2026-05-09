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

  // Sync prop -> state when external value changes (realtime).
  // Pattern: setState during render guarded by ref-like comparison.
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
      const { error } = await commitCharacterField(character.id, {
        backstory: v,
      });
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

  return (
    <div className="flex flex-col gap-4">
      <section>
        <h3
          className="mb-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-rpg-text-dim"
          style={{ fontFamily: "var(--font-rpg-hud)" }}
        >
          Notas de sessão
        </h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={!editable}
          rows={5}
          placeholder="Pistas, decisões, eventos importantes..."
          className="w-full rounded-md border border-rpg-border bg-rpg-bg p-3 text-sm leading-relaxed text-rpg-text placeholder:text-rpg-text-dim focus:border-rpg-blue focus:outline-none disabled:opacity-60"
        />
      </section>

      <section>
        <button
          type="button"
          onClick={() => setShowBackstory((v) => !v)}
          className="flex w-full items-center justify-between rounded-md border border-rpg-border bg-rpg-bg px-3 py-2"
        >
          <span
            className="text-[11px] font-semibold uppercase tracking-[0.25em] text-rpg-text-dim"
            style={{ fontFamily: "var(--font-rpg-hud)" }}
          >
            História do personagem
          </span>
          <span className="text-xs text-rpg-text-dim">
            {showBackstory ? "▲" : "▼"}
          </span>
        </button>
        {showBackstory && (
          <textarea
            value={backstory}
            onChange={(e) => setBackstory(e.target.value)}
            disabled={!editable}
            rows={6}
            placeholder="Origem, motivações, vínculos..."
            className="mt-2 w-full rounded-md border border-rpg-border bg-rpg-bg p-3 text-sm leading-relaxed text-rpg-text placeholder:text-rpg-text-dim focus:border-rpg-blue focus:outline-none disabled:opacity-60"
          />
        )}
      </section>

      <section>
        <header className="mb-2 flex items-center justify-between">
          <h3
            className="text-[11px] font-semibold uppercase tracking-[0.25em] text-rpg-text-dim"
            style={{ fontFamily: "var(--font-rpg-hud)" }}
          >
            NPCs encontrados
          </h3>
          <button
            type="button"
            onClick={addNpc}
            disabled={!editable}
            className="rounded-md border border-rpg-border bg-rpg-bg px-2 py-0.5 text-xs text-rpg-text hover:border-rpg-blue/60 disabled:opacity-40"
          >
            + Novo
          </button>
        </header>
        {npcs.length === 0 ? (
          <p className="rounded-md border border-rpg-border bg-rpg-bg p-3 text-xs text-rpg-text-dim">
            Nenhum NPC anotado ainda.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {npcs.map((n, i) => (
              <div
                key={i}
                className="flex flex-col gap-1.5 rounded-md border border-rpg-border bg-rpg-bg p-2"
              >
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={n.name}
                    onChange={(e) => updateNpc(i, { name: e.target.value })}
                    disabled={!editable}
                    placeholder="Nome"
                    className="flex-1 rounded border border-rpg-border bg-rpg-bg px-2 py-1 text-sm text-rpg-text placeholder:text-rpg-text-dim focus:border-rpg-blue focus:outline-none"
                  />
                  <input
                    type="text"
                    value={n.relation ?? ""}
                    onChange={(e) =>
                      updateNpc(i, { relation: e.target.value })
                    }
                    disabled={!editable}
                    placeholder="Relação"
                    className="w-28 rounded border border-rpg-border bg-rpg-bg px-2 py-1 text-sm text-rpg-text placeholder:text-rpg-text-dim focus:border-rpg-blue focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeNpc(i)}
                    disabled={!editable}
                    aria-label="Remover NPC"
                    className="flex h-7 w-7 items-center justify-center rounded text-rpg-text-dim hover:bg-rpg-red/20 hover:text-rpg-red disabled:opacity-40"
                  >
                    ×
                  </button>
                </div>
                <textarea
                  value={n.notes ?? ""}
                  onChange={(e) => updateNpc(i, { notes: e.target.value })}
                  disabled={!editable}
                  rows={2}
                  placeholder="Notas curtas sobre este NPC..."
                  className="w-full rounded border border-rpg-border bg-rpg-bg px-2 py-1 text-xs leading-relaxed text-rpg-text placeholder:text-rpg-text-dim focus:border-rpg-blue focus:outline-none disabled:opacity-60"
                />
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h3
          className="mb-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-rpg-text-dim"
          style={{ fontFamily: "var(--font-rpg-hud)" }}
        >
          Log do personagem
        </h3>
        {characterEvents.length === 0 ? (
          <p className="rounded-md border border-rpg-border bg-rpg-bg p-3 text-xs text-rpg-text-dim">
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
                <li
                  key={ev.id}
                  className="rounded-md border border-rpg-border bg-rpg-bg px-3 py-2 text-xs text-rpg-text"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span
                      className="text-[10px] uppercase tracking-wider text-rpg-text-dim"
                      style={{ fontFamily: "var(--font-rpg-hud)" }}
                    >
                      {ev.type}
                    </span>
                    <span
                      className="text-[10px] tabular-nums text-rpg-text-dim"
                      style={{ fontFamily: "var(--font-rpg-numbers)" }}
                    >
                      {time}
                    </span>
                  </div>
                  <p className="text-xs text-rpg-text">
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

function summarize(payload: Record<string, unknown> | null | undefined): string {
  if (!payload) return "—";
  if (typeof payload.summary === "string") return payload.summary;
  if (typeof payload.message === "string") return payload.message;
  if (typeof payload.amount === "number" && typeof payload.label === "string") {
    return `${payload.label}: ${payload.amount}`;
  }
  return JSON.stringify(payload);
}
