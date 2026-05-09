"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase";
import type { Character } from "@/lib/types";
import type { CharacterSkillsMeta } from "@/components/characters/types";

type CharacterPatch = Partial<Character>;

export async function commitCharacterField(
  charId: string,
  patch: CharacterPatch
): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase
    .from("characters")
    .update(patch)
    .eq("id", charId);
  return { error: error?.message ?? null };
}

export async function commitStatsField(
  charId: string,
  prevStats: Record<string, unknown> | null | undefined,
  key: string,
  value: unknown
): Promise<{ error: string | null }> {
  const nextStats = { ...(prevStats ?? {}), [key]: value };
  const supabase = createClient();
  const { error } = await supabase
    .from("characters")
    .update({ stats: nextStats })
    .eq("id", charId);
  return { error: error?.message ?? null };
}

export async function commitSkillsField<K extends keyof CharacterSkillsMeta>(
  charId: string,
  prevSkills: CharacterSkillsMeta,
  key: K,
  value: CharacterSkillsMeta[K]
): Promise<{ error: string | null }> {
  const nextSkills: CharacterSkillsMeta = { ...prevSkills, [key]: value };
  const supabase = createClient();
  const { error } = await supabase
    .from("characters")
    .update({ skills: nextSkills })
    .eq("id", charId);
  return { error: error?.message ?? null };
}

export type HpStatus = {
  label: string;
  color: "green" | "gold" | "amber" | "red" | "zinc";
  pulse: boolean;
};

export function hpStatusOf(hp: number, maxHp: number): HpStatus {
  if (hp === 0) return { label: "Inconsciente", color: "red", pulse: true };
  const pct = maxHp > 0 ? (hp / maxHp) * 100 : 0;
  if (pct >= 95) return { label: "Vida cheia", color: "green", pulse: false };
  if (pct >= 60) return { label: "Estável", color: "green", pulse: false };
  if (pct >= 30) return { label: "Ferido", color: "amber", pulse: false };
  if (pct >= 25) return { label: "Estado crítico", color: "red", pulse: false };
  return { label: "Estado crítico", color: "red", pulse: true };
}

export function useDebouncedSave<T>(
  value: T,
  delay: number,
  onSave: (value: T) => void | Promise<void>,
  options: { skipFirst?: boolean } = { skipFirst: true }
) {
  const firstRender = useRef(true);
  const lastSaved = useRef<T>(value);

  useEffect(() => {
    if (options.skipFirst && firstRender.current) {
      firstRender.current = false;
      lastSaved.current = value;
      return;
    }
    if (Object.is(lastSaved.current, value)) return;

    const timer = window.setTimeout(() => {
      lastSaved.current = value;
      void onSave(value);
    }, delay);

    return () => window.clearTimeout(timer);
  }, [value, delay, onSave, options.skipFirst]);
}

export function effortOf(stats: Record<string, unknown> | null | undefined): {
  current: number;
  max: number;
} {
  const s = (stats ?? {}) as Record<string, unknown>;
  return {
    current: typeof s.esforco === "number" ? (s.esforco as number) : 0,
    max: typeof s.esforco_max === "number" ? (s.esforco_max as number) : 0,
  };
}
