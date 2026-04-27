"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { MediaLibraryItem, SessionMediaState } from "@/lib/types";
import { setCurrentAudio } from "@/app/dashboard/sessions/[id]/play/actions";
import type { PlayerOption } from "./types";
import { DestinationPicker } from "./DestinationPicker";

type Props = {
  sessionId: string;
  mediaState: SessionMediaState;
  mediaLibrary: MediaLibraryItem[];
  players: PlayerOption[];
  disabled: boolean;
};

export function AudioControl({
  sessionId,
  mediaState,
  mediaLibrary,
  players,
  disabled,
}: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [volume, setVolume] = useState(0.7);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tracks = useMemo(
    () => mediaLibrary.filter((m) => m.type === "audio" && m.category === "music"),
    [mediaLibrary]
  );

  const current = mediaState.current_audio;

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.volume = volume;
  }, [volume]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
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
    if (current) {
      el.src = current.url;
      el.loop = current.loop;
      el.play().catch(() => {});
    } else {
      el.pause();
      el.removeAttribute("src");
    }
  }, [current]);

  function play() {
    audioRef.current?.play().then(() => setPlaying(true));
  }

  function pause() {
    audioRef.current?.pause();
    setPlaying(false);
  }

  async function selectTrack(
    track: MediaLibraryItem,
    dest: Parameters<typeof setCurrentAudio>[2]
  ) {
    setError(null);
    const r = await setCurrentAudio(
      sessionId,
      {
        media_id: track.id,
        title: track.title,
        url: track.url,
        loop: current?.loop ?? true,
      },
      dest
    );
    if (r.error) setError(r.error);
  }

  async function stopGlobal(dest: Parameters<typeof setCurrentAudio>[2]) {
    setError(null);
    const r = await setCurrentAudio(sessionId, null, dest);
    if (r.error) setError(r.error);
  }

  async function toggleLoop() {
    if (!current) return;
    const r = await setCurrentAudio(
      sessionId,
      { ...current, loop: !current.loop },
      { type: "gm_only" }
    );
    if (r.error) setError(r.error);
  }

  return (
    <section className="flex flex-col gap-2 rounded-md border border-zinc-800 bg-zinc-900 p-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
        Música
      </h3>

      <audio ref={audioRef} />

      <div className="rounded-md border border-zinc-800 bg-zinc-950 p-2">
        <p className="truncate text-sm text-zinc-200">
          {current?.title ?? "Sem música ativa"}
        </p>
        <div className="mt-2 flex items-center gap-2">
          {playing ? (
            <button
              type="button"
              onClick={pause}
              disabled={disabled || !current}
              className="rounded bg-amber-600 px-2 py-1 text-xs text-white hover:bg-amber-500 disabled:opacity-50"
            >
              ⏸ Pausar
            </button>
          ) : (
            <button
              type="button"
              onClick={play}
              disabled={disabled || !current}
              className="rounded bg-emerald-600 px-2 py-1 text-xs text-white hover:bg-emerald-500 disabled:opacity-50"
            >
              ▶ Tocar
            </button>
          )}
          <DestinationPicker
            players={players}
            defaultType="all"
            onConfirm={stopGlobal}
            buttonLabel="⏹ Parar"
            buttonClassName="rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-200 hover:bg-zinc-700 disabled:opacity-50"
            disabled={disabled || !current}
          />
          <button
            type="button"
            onClick={toggleLoop}
            disabled={disabled || !current}
            className={`rounded px-2 py-1 text-xs disabled:opacity-50 ${
              current?.loop
                ? "bg-emerald-900/40 text-emerald-300"
                : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
            }`}
          >
            ↻ Loop
          </button>
        </div>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="mt-2 w-full accent-emerald-500"
        />
      </div>

      <div className="flex flex-col gap-1">
        {tracks.length === 0 ? (
          <p className="py-2 text-center text-xs text-zinc-500">
            Nenhuma música na biblioteca.
          </p>
        ) : (
          tracks.map((t) => (
            <div
              key={t.id}
              className={`flex items-center justify-between gap-2 rounded border p-2 ${
                current?.media_id === t.id
                  ? "border-emerald-500 bg-emerald-900/10"
                  : "border-zinc-800 bg-zinc-950"
              }`}
            >
              <span className="flex-1 truncate text-xs text-zinc-200">{t.title}</span>
              <DestinationPicker
                players={players}
                defaultType="all"
                onConfirm={(dest) => selectTrack(t, dest)}
                buttonLabel="Tocar"
                buttonClassName="rounded bg-emerald-600 px-2 py-0.5 text-[10px] text-white hover:bg-emerald-500 disabled:opacity-50"
                disabled={disabled}
              />
            </div>
          ))
        )}
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}
    </section>
  );
}
