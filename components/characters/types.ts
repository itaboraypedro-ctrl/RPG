import type { Character } from "@/lib/types";

export type CharacterAbility = {
  name: string;
  description: string;
  type: "passive" | "active";
};

export type CharacterSpell = {
  name: string;
  school: string;
  level: number;
  description: string;
  components: string;
};

export type SpellSlotsState = {
  total: number[];
  used: number[];
};

export type CharacterAppearance = {
  gender?: string;
  race_visual?: string;
  armor_style?: string;
  hair_color?: string;
  eye_color?: string;
  skin_tone?: string;
  traits?: string;
  expression?: string;
};

export type CharacterSkillsMeta = {
  proficient?: string[];
  abilities?: CharacterAbility[];
  background?: string;
  alignment?: string;
  spell_slots?: SpellSlotsState;
  appearance?: CharacterAppearance;
};

export type ItemType = "weapon" | "armor" | "potion" | "scroll" | "misc" | "quest";
export type ItemRarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

export type InventoryItem = {
  id: string;
  name: string;
  type: ItemType;
  rarity: ItemRarity;
  icon: string;
  description: string;
  weight: number;
  value: number;
  equipped_slot?: string | null;
  bag_position?: number | null;
  properties?: Record<string, unknown>;
};

export const EQUIPMENT_SLOTS = [
  "head",
  "cape",
  "shoulder_left",
  "shoulder_right",
  "glove_left",
  "glove_right",
  "chest",
  "legs",
  "boots",
  "main_hand",
  "off_hand",
  "ring",
  "amulet",
  "belt",
] as const;

export type EquipmentSlot = (typeof EQUIPMENT_SLOTS)[number];

export const EQUIPMENT_LABELS: Record<EquipmentSlot, string> = {
  head: "Capacete",
  cape: "Capa",
  shoulder_left: "Ombr. Esq",
  shoulder_right: "Ombr. Dir",
  glove_left: "Luva Esq",
  glove_right: "Luva Dir",
  chest: "Peitoral",
  legs: "Calça",
  boots: "Bota",
  main_hand: "Mão Princ.",
  off_hand: "Mão Sec.",
  ring: "Anel",
  amulet: "Amuleto",
  belt: "Cinto",
};

export const BAG_COLS = 6;
export const BAG_ROWS = 5;
export const BAG_SIZE = BAG_COLS * BAG_ROWS;

export const RARITY_BORDER: Record<ItemRarity, string> = {
  common: "border-zinc-600",
  uncommon: "border-emerald-600",
  rare: "border-sky-500",
  epic: "border-violet-500",
  legendary: "border-amber-500",
};

export const RARITY_TEXT: Record<ItemRarity, string> = {
  common: "text-zinc-200",
  uncommon: "text-emerald-300",
  rare: "text-sky-300",
  epic: "text-violet-300",
  legendary: "text-amber-300",
};

// D&D 5e — 18 perícias com atributo modificador
export const SKILLS_5E: { id: string; label: string; ability: keyof CharacterStatBlock }[] = [
  { id: "acrobatics", label: "Acrobacia", ability: "dexterity" },
  { id: "animal_handling", label: "Adestrar Animais", ability: "wisdom" },
  { id: "arcana", label: "Arcanismo", ability: "intelligence" },
  { id: "athletics", label: "Atletismo", ability: "strength" },
  { id: "deception", label: "Enganação", ability: "charisma" },
  { id: "history", label: "História", ability: "intelligence" },
  { id: "insight", label: "Intuição", ability: "wisdom" },
  { id: "intimidation", label: "Intimidação", ability: "charisma" },
  { id: "investigation", label: "Investigação", ability: "intelligence" },
  { id: "medicine", label: "Medicina", ability: "wisdom" },
  { id: "nature", label: "Natureza", ability: "intelligence" },
  { id: "perception", label: "Percepção", ability: "wisdom" },
  { id: "performance", label: "Atuação", ability: "charisma" },
  { id: "persuasion", label: "Persuasão", ability: "charisma" },
  { id: "religion", label: "Religião", ability: "intelligence" },
  { id: "sleight_of_hand", label: "Prestidigitação", ability: "dexterity" },
  { id: "stealth", label: "Furtividade", ability: "dexterity" },
  { id: "survival", label: "Sobrevivência", ability: "wisdom" },
];

export type CharacterStatBlock = {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
};

export const STAT_LABELS: Record<keyof CharacterStatBlock, string> = {
  strength: "FOR",
  dexterity: "DES",
  constitution: "CON",
  intelligence: "INT",
  wisdom: "SAB",
  charisma: "CAR",
};

export const ALIGNMENTS = [
  "Leal e Bom",
  "Neutro e Bom",
  "Caótico e Bom",
  "Leal e Neutro",
  "Neutro",
  "Caótico e Neutro",
  "Leal e Mau",
  "Neutro e Mau",
  "Caótico e Mau",
] as const;

export const DEFAULT_STATS: CharacterStatBlock = {
  strength: 10,
  dexterity: 10,
  constitution: 10,
  intelligence: 10,
  wisdom: 10,
  charisma: 10,
};

export const DEFAULT_SPELL_SLOTS: SpellSlotsState = {
  total: [0, 0, 0, 0, 0, 0, 0, 0, 0],
  used: [0, 0, 0, 0, 0, 0, 0, 0, 0],
};

export function modifierOf(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function proficiencyBonusOf(level: number): number {
  if (level >= 17) return 6;
  if (level >= 13) return 5;
  if (level >= 9) return 4;
  if (level >= 5) return 3;
  return 2;
}

export function maxCarryWeight(strength: number): number {
  return strength * 15;
}

export function statsOf(c: Character): CharacterStatBlock {
  const s = (c.stats ?? {}) as Partial<CharacterStatBlock>;
  return {
    strength: s.strength ?? 10,
    dexterity: s.dexterity ?? 10,
    constitution: s.constitution ?? 10,
    intelligence: s.intelligence ?? 10,
    wisdom: s.wisdom ?? 10,
    charisma: s.charisma ?? 10,
  };
}

export function skillsMetaOf(c: Character): CharacterSkillsMeta {
  return (c.skills ?? {}) as CharacterSkillsMeta;
}

export function inventoryOf(c: Character): InventoryItem[] {
  return (c.inventory ?? []) as unknown as InventoryItem[];
}

export function spellsOf(c: Character): CharacterSpell[] {
  return (c.spells ?? []) as unknown as CharacterSpell[];
}
