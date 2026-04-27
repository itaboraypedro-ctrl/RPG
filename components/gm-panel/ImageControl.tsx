"use client";

import { useMemo, useState } from "react";
import type { MediaCategory, MediaLibraryItem, SessionMediaState } from "@/lib/types";
import { setCurrentImage } from "@/app/dashboard/sessions/[id]/play/actions";
import type { PlayerOption } from "./types";
import { DestinationPicker } from "./DestinationPicker";

type Props = {
  sessionId: string;
  mediaState: SessionMediaState;
  mediaLibrary: MediaLibraryItem[];
  players: PlayerOption[];
  disabled: boolean;
};

export function ImageControl({
  sessionId,
  mediaState,
  mediaLibrary,
  players,
  disabled,
}: Props) {
  const [filter, setFilter] = useState<MediaCategory>("illustration");
  const [error, setError] = useState<string | null>(null);

  const images = useMemo(
    () =>
      mediaLibrary.filter((m) => m.type === "image" && m.category === filter),
    [mediaLibrary, filter]
  );

  const current = mediaState.current_image;

  async function selectImage(media: MediaLibraryItem, dest: Parameters<typeof setCurrentImage>[2]) {
    setError(null);
    const r = await setCurrentImage(
      sessionId,
      { media_id: media.id, url: media.url, caption: media.title },
      dest
    );
    if (r.error) setError(r.error);
  }

  async function clear(dest: Parameters<typeof setCurrentImage>[2]) {
    setError(null);
    const r = await setCurrentImage(sessionId, null, dest);
    if (r.error) setError(r.error);
  }

  return (
    <section className="flex flex-col gap-2 rounded-md border border-zinc-800 bg-zinc-900 p-3">
      <header className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Cena
        </h3>
        <button
          type="button"
          onClick={() => setFilter(filter === "illustration" ? "map" : "illustration")}
          disabled={disabled}
          className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] uppercase tracking-wide text-zinc-300 hover:bg-zinc-700 disabled:opacity-50"
        >
          {filter === "illustration" ? "Modo mapa" : "Modo cena"}
        </button>
      </header>

      <div className="flex h-32 items-center justify-center overflow-hidden rounded-md border border-zinc-800 bg-zinc-950">
        {current ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={current.url}
            alt={current.caption ?? ""}
            className="h-full w-full object-cover"
          />
        ) : (
          <p className="text-xs text-zinc-600">Nenhuma cena ativa</p>
        )}
      </div>

      {current && (
        <DestinationPicker
          players={players}
          defaultType="all"
          onConfirm={clear}
          buttonLabel="Limpar imagem"
          buttonClassName="rounded-md bg-zinc-800 px-2 py-1 text-xs text-zinc-200 hover:bg-zinc-700 disabled:opacity-50"
          disabled={disabled}
        />
      )}

      <div className="grid grid-cols-3 gap-1.5">
        {images.length === 0 ? (
          <p className="col-span-3 py-4 text-center text-xs text-zinc-500">
            Nenhuma imagem nesta categoria.
          </p>
        ) : (
          images.map((m) => (
            <button
              key={m.id}
              type="button"
              disabled={disabled}
              className="group relative aspect-square overflow-hidden rounded border border-zinc-800 hover:border-emerald-500 disabled:opacity-50"
              onClick={(e) => e.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={m.url}
                alt={m.title}
                className={`h-full w-full object-cover transition ${
                  current?.media_id === m.id ? "ring-2 ring-emerald-500" : ""
                }`}
              />
              <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1 text-[10px] text-zinc-200">
                <DestinationPicker
                  players={players}
                  defaultType="all"
                  onConfirm={(dest) => selectImage(m, dest)}
                  buttonLabel={m.title}
                  buttonClassName="block w-full truncate text-left text-[10px] text-zinc-200"
                  disabled={disabled}
                />
              </div>
            </button>
          ))
        )}
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}
    </section>
  );
}
