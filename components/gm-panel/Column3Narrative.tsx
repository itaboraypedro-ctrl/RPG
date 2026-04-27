"use client";

import type { Character, SessionEvent, StoryContent } from "@/lib/types";
import { EventLog } from "./EventLog";
import { StoryViewer } from "./StoryViewer";
import { AiChat } from "./AiChat";

type Props = {
  sessionId: string;
  sessionTitle: string;
  currentScene: string;
  storySummary: string;
  characters: Character[];
  events: SessionEvent[];
  templateContent: StoryContent | null;
  disabled: boolean;
};

export function Column3Narrative({
  sessionId,
  sessionTitle,
  currentScene,
  storySummary,
  characters,
  events,
  templateContent,
  disabled,
}: Props) {
  return (
    <div className="flex flex-col gap-3">
      <EventLog events={events} />
      <StoryViewer
        sessionId={sessionId}
        templateContent={templateContent}
        currentScene={currentScene}
        storySummary={storySummary}
        disabled={disabled}
      />
      <AiChat
        sessionId={sessionId}
        sessionTitle={sessionTitle}
        currentScene={currentScene}
        characters={characters}
        events={events}
        templateContent={templateContent}
        disabled={disabled}
      />
    </div>
  );
}
