"use client";

import { useMemo, useState } from "react";
import type { MediaLibraryItem } from "@/lib/types";
import { playSound } from "@/app/dashboard/sessions/[id]/play/actions";
import type { PlayerOption } from "./types";
import { DestinationPicker } from "./DestinationPicker";

type Props = {
  sessionId: string;
  mediaLibrary: MediaLibraryItem[];
  players: PlayerOption[];
  disabled: boolean;
};

export function SfxGrid({ sessionId, mediaLibrary, players, disabled }: Props) {
  const sounds = useMemo(
    () =>
      mediaLibrary.filter(
        (m) => m.type === "audio" && (m.category === "sfx" || m.category === "ambient")
      ),
    [mediaLibrary]
  );
  const [activeIds, setActiveIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  function trigger(media: MediaLibraryItem) {
    const audio = new Audio(media.url);
    audio.play().catch(() => {});
    setActiveIds((prev) => new Set(prev).add(media.id));
    audio.addEventListener("ended", () => {
      setActiveIds((prev) => {
        const next = new Set(prev);
        next.delete(media.id);
        return next;
      });
    });
  }

  async function trigggerWithBroadcast(
    media: MediaLibraryItem,
    dest: Parameters<typeof playSound>[3]
  ) {
    setError(null);
    trigger(media);
    if (dest.type !== "gm_only") {
      const r = await playSound(sessionId, media.id, media.title, dest);
      if (r.error) setError(r.error);
    }
  }

  return (
    <section className="flex flex-col gap-2 rounded-md border border-zinc-800 bg-zinc-900 p-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
        Sons e efeitos
      </h3>
      {sounds.length === 0 ? (
        <p className="py-2 text-center text-xs text-zinc-500">
          Nenhum efeito sonoro na biblioteca.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-1.5">
          {sounds.map((s) => (
            <DestinationPicker
              key={s.id}
              players={players}
              defaultType="all"
              onConfirm={(dest) => trigggerWithBroadcast(s, dest)}
              buttonLabel={
                <span className="flex items-center justify-center gap-1">
                  {activeIds.has(s.id) && (
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                  )}
                  <span className="truncate">{s.title}</span>
                </span>
              }
              buttonClassName={`rounded border px-2 py-2 text-xs disabled:opacity-50 ${
                activeIds.has(s.id)
                  ? "border-emerald-500 bg-emerald-900/20 text-emerald-200"
                  : "border-zinc-800 bg-zinc-950 text-zinc-200 hover:border-zinc-700"
              }`}
              disabled={disabled}
            />
          ))}
        </div>
      )}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </section>
  );
}
