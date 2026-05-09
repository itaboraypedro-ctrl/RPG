"use client";

import { useEffect, useRef, useState } from "react";
import type {
  Character,
  Notification,
  Session,
  SessionEvent,
  SessionMediaState,
  StoryContent,
} from "@/lib/types";
import { PlayerCharacterSheet } from "./PlayerCharacterSheet";
import { PlayerBottomSheet } from "./PlayerBottomSheet";
import { PlayerTabNotifications } from "./PlayerTabNotifications";

type Props = {
  session: Session;
  character: Character;
  mediaState: SessionMediaState;
  templateContent: StoryContent | null;
  publicEvents: SessionEvent[];
  notifications: Notification[];
  onMarkRead: (id: string) => void;
};

type Act = { title: string; description: string };

export function PlayerGame({
  session,
  character,
  mediaState,
  templateContent,
  publicEvents,
  notifications,
  onMarkRead,
}: Props) {
  const paused = session.status === "paused";
  const editable = !paused;
  const unread = notifications.filter((n) => !n.read).length;

  const [notifOpen, setNotifOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioPlaying, setAudioPlaying] = useState(false);

  const audio = mediaState.current_audio;
  const image = mediaState.current_image;
  const acts = (templateContent?.acts ?? []) as unknown as Act[];
  const currentAct = acts.find((a) => a.title === session.current_scene);
  const sceneTitle = currentAct?.title ?? session.current_scene ?? null;

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onPlay = () => setAudioPlaying(true);
    const onPause = () => setAudioPlaying(false);
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    return () => {
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
    };
  }, []);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    if (audio) {
      el.src = audio.url;
      el.loop = audio.loop;
      el.volume = 0.5;
    } else {
      el.pause();
      el.removeAttribute("src");
    }
  }, [audio]);

  function toggleAudio() {
    const el = audioRef.current;
    if (!el || !audio) return;
    if (el.paused) el.play().catch(() => {});
    else el.pause();
  }

  return (
    <div className="flex flex-1 flex-col bg-rpg-bg">
      <ContextBanner
        sceneTitle={sceneTitle}
        sessionTitle={session.title}
        imageUrl={image?.url ?? null}
        audioTitle={audio?.title ?? null}
        audioPlaying={audioPlaying}
        onToggleAudio={audio ? toggleAudio : undefined}
        unread={unread}
        onOpenNotifications={() => setNotifOpen(true)}
        sessionStatus={session.status}
      />
      <audio ref={audioRef} />

      <div className="flex-1 overflow-hidden">
        <PlayerCharacterSheet
          character={character}
          publicEvents={publicEvents}
          editable={editable}
        />
      </div>

      {paused && (
        <div className="pointer-events-none fixed inset-x-0 top-2 z-[120] flex justify-center">
          <span className="rounded-full border border-amber-500 bg-amber-950/80 px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-amber-300 backdrop-blur-sm">
            Partida pausada
          </span>
        </div>
      )}

      <PlayerBottomSheet
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        title="Notificações"
        subtitle={unread > 0 ? `${unread} não lidas` : "tudo em dia"}
        accent={unread > 0 ? "gold" : "default"}
      >
        <PlayerTabNotifications
          notifications={notifications}
          onRead={onMarkRead}
        />
      </PlayerBottomSheet>
    </div>
  );
}

function ContextBanner({
  sceneTitle,
  sessionTitle,
  imageUrl,
  audioTitle,
  audioPlaying,
  onToggleAudio,
  unread,
  onOpenNotifications,
  sessionStatus,
}: {
  sceneTitle: string | null;
  sessionTitle: string;
  imageUrl: string | null;
  audioTitle: string | null;
  audioPlaying: boolean;
  onToggleAudio?: () => void;
  unread: number;
  onOpenNotifications: () => void;
  sessionStatus: string;
}) {
  return (
    <header className="flex shrink-0 items-center gap-2 border-b border-rpg-border bg-rpg-surface px-3 py-2">
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt=""
          className="h-10 w-10 shrink-0 rounded-md border border-rpg-border object-cover"
        />
      ) : (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-rpg-border bg-rpg-bg text-base">
          🎬
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p
          className="truncate text-sm leading-tight text-rpg-text"
          style={{ fontFamily: "var(--font-rpg-numbers)" }}
        >
          {sceneTitle ?? sessionTitle}
        </p>
        <div className="flex items-center gap-1.5 text-[10px] text-rpg-text-dim">
          {audioTitle ? (
            <>
              <button
                type="button"
                onClick={onToggleAudio}
                className="flex items-center gap-1 rounded px-1 py-0.5 text-rpg-text-dim hover:bg-rpg-bg hover:text-rpg-text"
                aria-label={audioPlaying ? "Pausar trilha" : "Tocar trilha"}
              >
                {audioPlaying ? "⏸" : "▶"}
              </button>
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  audioPlaying
                    ? "animate-pulse bg-rpg-green"
                    : "bg-rpg-text-dim"
                }`}
              />
              <span className="truncate">{audioTitle}</span>
            </>
          ) : (
            <span className="uppercase tracking-wider">
              {sessionStatus === "active" ? "Em jogo" : "Pausada"}
            </span>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={onOpenNotifications}
        className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-rpg-border bg-rpg-bg text-rpg-text transition-colors hover:border-rpg-gold/60"
        aria-label="Notificações"
      >
        <span className="text-base">🔔</span>
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rpg-red px-1 text-[9px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
    </header>
  );
}
