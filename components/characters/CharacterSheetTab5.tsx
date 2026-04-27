"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase";
import type { Character } from "@/lib/types";

type Props = {
  character: Character;
  editable: boolean;
};

export function CharacterSheetTab5({ character, editable }: Props) {
  const [notes, setNotes] = useState(character.notes ?? "");
  const [backstory, setBackstory] = useState(character.backstory ?? "");
  const [error, setError] = useState<string | null>(null);
  const lastSavedRef = useRef({ notes: character.notes ?? "", backstory: character.backstory ?? "" });
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    if (
      notes === lastSavedRef.current.notes &&
      backstory === lastSavedRef.current.backstory
    ) {
      return;
    }
    saveTimerRef.current = setTimeout(async () => {
      const supabase = createClient();
      const { error: updateError } = await supabase
        .from("characters")
        .update({ notes, backstory })
        .eq("id", character.id);
      if (updateError) {
        setError(updateError.message);
        return;
      }
      lastSavedRef.current = { notes, backstory };
      setError(null);
    }, 600);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [notes, backstory, character.id]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="backstory" className="text-xs uppercase tracking-wide text-zinc-400">
          História
        </label>
        <textarea
          id="backstory"
          rows={6}
          value={backstory}
          disabled={!editable}
          onChange={(e) => setBackstory(e.target.value)}
          className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none disabled:opacity-60"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="notes" className="text-xs uppercase tracking-wide text-zinc-400">
          Notas
        </label>
        <textarea
          id="notes"
          rows={6}
          value={notes}
          disabled={!editable}
          onChange={(e) => setNotes(e.target.value)}
          className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none disabled:opacity-60"
        />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
