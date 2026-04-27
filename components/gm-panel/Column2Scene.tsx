"use client";

import type { MediaLibraryItem, SessionMediaState, StoryContent } from "@/lib/types";
import type { PlayerOption } from "./types";
import { ImageControl } from "./ImageControl";
import { AudioControl } from "./AudioControl";
import { SfxGrid } from "./SfxGrid";

type MusicCue = { scene: string; suggestion: string };

type Props = {
  sessionId: string;
  mediaState: SessionMediaState;
  mediaLibrary: MediaLibraryItem[];
  templateContent: StoryContent | null;
  players: PlayerOption[];
  disabled: boolean;
};

export function Column2Scene({
  sessionId,
  mediaState,
  mediaLibrary,
  templateContent,
  players,
  disabled,
}: Props) {
  const cues = (templateContent?.music_cues ?? []) as unknown as MusicCue[];

  return (
    <div className="flex flex-col gap-3">
      <ImageControl
        sessionId={sessionId}
        mediaState={mediaState}
        mediaLibrary={mediaLibrary}
        players={players}
        disabled={disabled}
      />
      <AudioControl
        sessionId={sessionId}
        mediaState={mediaState}
        mediaLibrary={mediaLibrary}
        players={players}
        disabled={disabled}
      />
      <SfxGrid
        sessionId={sessionId}
        mediaLibrary={mediaLibrary}
        players={players}
        disabled={disabled}
      />
      {cues.length > 0 && (
        <section className="flex flex-col gap-2 rounded-md border border-zinc-800 bg-zinc-900 p-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Sugestões de trilha (template)
          </h3>
          <ul className="flex flex-col gap-2">
            {cues.map((c, i) => (
              <li key={i} className="rounded border border-zinc-800 bg-zinc-950 p-2">
                <p className="text-xs font-medium text-zinc-200">{c.scene}</p>
                <p className="text-xs text-zinc-400">{c.suggestion}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
