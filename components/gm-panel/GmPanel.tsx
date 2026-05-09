"use client";

import { useCallback, useEffect, useState } from "react";
import { Group, Panel, useDefaultLayout } from "react-resizable-panels";
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
import { ResizeHandle } from "./ResizeHandle";

const PANEL_IDS = ["gm-col1", "gm-col2", "gm-col3"];

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

  const [isDesktop, setIsDesktop] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const storage =
    typeof window !== "undefined" ? window.localStorage : undefined;
  const { defaultLayout, onLayoutChanged } = useDefaultLayout({
    id: "gm-panel-columns",
    panelIds: PANEL_IDS,
    storage,
  });

  const col1 = (
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
  );
  const col2 = (
    <Column2Scene
      sessionId={session.id}
      mediaState={mediaState}
      mediaLibrary={data.mediaLibrary}
      templateContent={data.template?.content ?? null}
      players={data.players}
      disabled={disabled}
    />
  );
  const col3 = (
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
  );

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

        {isDesktop ? (
          <Group
            orientation="horizontal"
            defaultLayout={defaultLayout}
            onLayoutChanged={onLayoutChanged}
            className="flex h-full"
          >
            <Panel
              id="gm-col1"
              defaultSize={1}
              minSize="20%"
              maxSize="60%"
              className="@container overflow-y-auto p-3"
            >
              {col1}
            </Panel>
            <ResizeHandle />
            <Panel
              id="gm-col2"
              defaultSize={1}
              minSize="20%"
              maxSize="60%"
              className="@container overflow-y-auto p-3"
            >
              {col2}
            </Panel>
            <ResizeHandle />
            <Panel
              id="gm-col3"
              defaultSize={1}
              minSize="20%"
              maxSize="60%"
              className="@container overflow-y-auto p-3"
            >
              {col3}
            </Panel>
          </Group>
        ) : (
          <div className="h-full overflow-y-auto">
            <div className="flex flex-col gap-3 p-3">
              {col1}
              {col2}
              {col3}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
