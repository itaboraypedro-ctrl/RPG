"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase-server";

type AbilityKey = "str" | "dex" | "con" | "int" | "wis" | "cha";
type StatBlock = Record<AbilityKey, number>;

export type CreateCharacterPayload = {
  name: string;
  sex: string;
  ageCategory: string;
  raceId: string;
  subraceId?: string;
  raceName: string;
  classId: string;
  className: string;
  hitDie: number;
  raceSpeed: number;
  stats: StatBlock;
  backgroundId: string;
  backgroundName: string;
  alignment?: string;
  personality?: { trait?: string; ideal?: string; bond?: string; flaw?: string };
  raceTraits?: string[];
  classFeatures?: string[];
  inventory: Record<string, unknown>[];
  spellIds?: string[];
  outfitDescription?: string;
  weaponDescription?: string;
  focusDescription?: string;
  avatarUrl?: string | null;
  avatarHistory?: string[];
  referencePhotoUrl?: string;
  appearanceDescription?: string;
  level: 1;
  goldFromBackground: number;
};

export async function createCharacter(payload: CreateCharacterPayload): Promise<{ ok: false; error: string }> {
  const auth = await getProfile();
  if (!auth) {
    return { ok: false, error: "Não autenticado" };
  }

  const mod = (val: number) => Math.floor((val - 10) / 2);
  const con = payload.stats.con ?? 10;
  const dex = payload.stats.dex ?? 10;
  const max_hp = payload.hitDie + mod(con);
  const ac = 10 + mod(dex);
  const initiative = mod(dex);
  const speed = payload.raceSpeed ?? 9;

  const supabase = await createClient();

  const insertRow: Record<string, unknown> = {
    owner_id: auth.user.id,
    name: payload.name,
    class: payload.className,
    race: payload.raceName,
    level: 1,
    hp: max_hp,
    max_hp,
    temp_hp: 0,
    ac,
    initiative,
    speed,
    xp: 0,
    xp_next_level: 300,
    gold: payload.goldFromBackground,
    conditions: [],
    death_saves: { successes: 0, failures: 0 },
    stats: payload.stats,
    skills: {},
    inventory: payload.inventory,
    spells: (payload.spellIds ?? []).map((id) => ({ id })),
    backstory: "",
    notes: "",
    avatar_url: payload.avatarUrl ?? null,
    ai_summary: "",
    // colunas novas (idempotente — se migration não rodou, supabase ignora se schema cache estiver atualizado)
    background: payload.backgroundName,
    subrace: payload.subraceId ?? null,
    sex: payload.sex,
    age_category: payload.ageCategory,
    alignment: payload.alignment ?? null,
    personality: payload.personality ?? {},
    race_traits: { traits: payload.raceTraits ?? [] },
    class_features: { features: payload.classFeatures ?? [] },
    appearance_description: payload.appearanceDescription ?? null,
    reference_photo_url: payload.referencePhotoUrl ?? null,
    avatar_history: payload.avatarHistory ?? [],
  };

  const { error } = await supabase.from("characters").insert(insertRow);
  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/hub");
  redirect("/hub");
}
