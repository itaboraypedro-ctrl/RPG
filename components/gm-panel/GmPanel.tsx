"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import type {
  Character,
  Session,
  SessionEvent,
  SessionMediaState,
} from "@/lib/types";
import type { GmPanelData } from "./types";
import { aiContextOf } from "./types";
import { GmPanelHeader } from "./GmPanelHeader";
import { Column1Combat } from "./Column1Combat";
import { Column2Scene } from "./Column2Scene";
import { Column3Narrative } from "./Column3Narrative";

type TemplateNpc = { name: string; role: string; motivation: string };

export function GmPanel({ data }: { data: GmPanelData }) {
  const [supabase] = useState(() => createClient());
  const [session, setSession] = useState<Session>(data.session);
  const [characters, setCharacters] = useState<Character[]>(data.characters);
  const [events, setEvents] = useState<SessionEvent[]>(data.events);
  const [mediaState, setMediaState] = useState<SessionMediaState>(data.mediaState);

  const refetchCharacters = useCallback(async () => {
    const { data: chars } = await supabase
      .from("characters")
      .select("*")
      .eq("session_id", session.id)
      .returns<Character[]>();
    if (chars) setCharacters(chars);
  }, [supabase, session.id]);

  const refetchSession = useCallback(async () => {
    const { data: s } = await supabase
      .from("sessions")
      .select("*")
      .eq("id", session.id)
      .maybeSingle<Session>();
    if (s) setSession(s);
  }, [supabase, session.id]);

  useEffect(() => {
    const channel = supabase
      .channel(`gm-panel-${session.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "characters",
          filter: `session_id=eq.${session.id}`,
        },
        () => {
          refetchCharacters();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "session_events",
          filter: `session_id=eq.${session.id}`,
        },
        (payload) => {
          const newEvent = payload.new as SessionEvent;
          setEvents((prev) => [newEvent, ...prev].slice(0, 200));
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "session_media_state",
          filter: `session_id=eq.${session.id}`,
        },
        (payload) => {
          if (payload.new && Object.keys(payload.new).length > 0) {
            setMediaState(payload.new as SessionMediaState);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "sessions",
          filter: `id=eq.${session.id}`,
        },
        () => {
          refetchSession();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, session.id, refetchCharacters, refetchSession]);

  const ctx = aiContextOf(session);
  const enemies = ctx.enemies ?? [];
  const templateNpcs = ((data.template?.content?.npcs ?? []) as unknown as TemplateNpc[]) || [];
  const disabled = session.status === "paused";

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-zinc-950 text-zinc-100">
      <GmPanelHeader session={session} events={events} />

      <div className="relative flex-1 overflow-hidden">
        {disabled && (
          <div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center bg-zinc-950/60 backdrop-blur-sm">
            <span className="rounded-full border border-amber-500 bg-amber-950/50 px-4 py-1 text-sm font-bold uppercase tracking-widest text-amber-300">
              Pausada
            </span>
          </div>
        )}

        <div className="grid h-full grid-cols-1 lg:grid-cols-3">
          <div className="overflow-y-auto border-r border-zinc-800 p-3">
            <Column1Combat
              sessionId={session.id}
              characters={characters}
              enemies={enemies}
              templateNpcs={templateNpcs}
              players={data.players}
              events={events}
              activeCombatantId={ctx.active_combatant_id}
              disabled={disabled}
            />
          </div>
          <div className="overflow-y-auto border-r border-zinc-800 p-3">
            <Column2Scene
              sessionId={session.id}
              mediaState={mediaState}
              mediaLibrary={data.mediaLibrary}
              templateContent={data.template?.content ?? null}
              players={data.players}
              disabled={disabled}
            />
          </div>
          <div className="overflow-y-auto p-3">
            <Column3Narrative
              sessionId={session.id}
              sessionTitle={session.title}
              currentScene={session.current_scene}
              storySummary={ctx.story_summary ?? ""}
              characters={characters}
              events={events}
              templateContent={data.template?.content ?? null}
              disabled={disabled}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
