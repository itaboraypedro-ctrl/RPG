"use client";

import { useMemo, useState } from "react";
import type { SessionEvent, SessionEventType } from "@/lib/types";

type Filter = "all" | "combat" | "scene" | "system";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "combat", label: "Combate" },
  { value: "scene", label: "Cena" },
  { value: "system", label: "Sistema" },
];

const COMBAT_TYPES: SessionEventType[] = [
  "combat_damage",
  "combat_heal",
  "combat_kill",
  "condition_added",
  "condition_removed",
  "round_start",
  "round_end",
];

const SCENE_TYPES: SessionEventType[] = ["scene_change", "media_play", "media_stop"];

const ICON: Record<SessionEventType, string> = {
  combat_damage: "⚔️",
  combat_heal: "💚",
  combat_kill: "💀",
  condition_added: "⚠️",
  condition_removed: "✓",
  round_start: "▶",
  round_end: "■",
  scene_change: "🎬",
  media_play: "▶",
  media_stop: "⏹",
  item_given: "🎁",
  item_removed: "📤",
  xp_gained: "✨",
  level_up: "⭐",
  player_joined: "➕",
  player_left: "➖",
  gm_note: "📝",
  player_note: "📝",
  ai_suggestion: "🤖",
  ai_illustration: "🎨",
  session_start: "🟢",
  session_pause: "⏸",
  session_end: "🔴",
};

function describe(event: SessionEvent): string {
  const p = event.payload as Record<string, unknown>;
  switch (event.type) {
    case "combat_damage": {
      const name = String(p.target_name ?? p.enemy_name ?? "Alvo");
      const delta = Number(p.delta ?? 0);
      const newHp = Number(p.new_hp ?? 0);
      return `${name} recebeu ${Math.abs(delta)} de dano (HP: ${newHp})`;
    }
    case "combat_heal": {
      const name = String(p.target_name ?? p.enemy_name ?? "Alvo");
      const delta = Number(p.delta ?? 0);
      const newHp = Number(p.new_hp ?? 0);
      return `${name} foi curado em ${delta} (HP: ${newHp})`;
    }
    case "combat_kill": {
      const name = String(p.target_name ?? p.enemy_name ?? "Alvo");
      return `${name} caiu inconsciente`;
    }
    case "condition_added": {
      const name = String(p.target_name ?? "");
      return `${name}: condição "${String(p.condition ?? "")}"`;
    }
    case "condition_removed": {
      const name = String(p.target_name ?? "");
      return `${name}: removeu "${String(p.condition ?? "")}"`;
    }
    case "round_start":
      return `Rodada ${p.round} iniciada`;
    case "round_end":
      return `Rodada ${p.round} encerrada`;
    case "scene_change":
      return `Cena: ${String(p.scene ?? "")}`;
    case "media_play":
      return `Mídia: ${String(p.title ?? p.url ?? p.kind ?? "play")}`;
    case "media_stop":
      return `Mídia parada (${String(p.kind ?? "")})`;
    case "session_start":
      return "Sessão iniciada";
    case "session_pause":
      return "Sessão pausada";
    case "session_end":
      return "Sessão encerrada";
    default:
      return event.type;
  }
}

function category(t: SessionEventType): Filter {
  if (COMBAT_TYPES.includes(t)) return "combat";
  if (SCENE_TYPES.includes(t)) return "scene";
  return "system";
}

export function EventLog({ events }: { events: SessionEvent[] }) {
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(
    () => (filter === "all" ? events : events.filter((e) => category(e.type) === filter)),
    [events, filter]
  );

  return (
    <section className="flex h-full flex-col gap-2 rounded-md border border-zinc-800 bg-zinc-900 p-3">
      <header className="flex flex-wrap items-center gap-1">
        <h3 className="mr-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Log
        </h3>
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={`rounded px-2 py-0.5 text-[10px] uppercase tracking-wide ${
              filter === f.value
                ? "bg-emerald-600 text-white"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }`}
          >
            {f.label}
          </button>
        ))}
      </header>

      {filtered.length === 0 ? (
        <p className="py-4 text-center text-xs text-zinc-500">Sem eventos.</p>
      ) : (
        <ul className="flex max-h-80 flex-1 flex-col gap-1 overflow-y-auto">
          {filtered.map((e) => {
            const time = new Date(e.created_at).toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            });
            return (
              <li
                key={e.id}
                className="flex items-start gap-2 rounded border border-zinc-800 bg-zinc-950 p-2 text-[11px] @[360px]:text-xs @[480px]:text-sm"
              >
                <span className="text-base leading-none">{ICON[e.type]}</span>
                <div className="flex-1">
                  <p className="text-zinc-200">{describe(e)}</p>
                  <p className="text-[10px] text-zinc-500">
                    {time}
                    {e.is_public && (
                      <span className="ml-2 rounded bg-emerald-900/40 px-1 py-0.5 text-[9px] uppercase text-emerald-300">
                        Visível
                      </span>
                    )}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
