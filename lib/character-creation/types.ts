export type WizardStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type AbilityKey = "str" | "dex" | "con" | "int" | "wis" | "cha";

export type StatBlock = Record<AbilityKey, number>;

export type Sex = "male" | "female" | "androgynous";
export type AgeCategory = "young" | "adult" | "mature" | "elder";

export type SubRace = {
  id: string;
  name: string;
  abilityBonus: Partial<Record<AbilityKey, number>>;
  visualDescription: string;
  traits?: string[];
};

export type Race = {
  id: string;
  name: string;
  subraces: SubRace[];
  abilityBonus: Partial<Record<AbilityKey, number>>;
  speed: number;
  size: "small" | "medium";
  traits: string[];
  languages: string[];
  visualDescription: string;
};

export type EquipmentChoiceOption = {
  id: string;
  label: string;
  items: string[];
};

export type EquipmentChoice = {
  id: string;
  prompt: string;
  options: EquipmentChoiceOption[];
};

export type Class = {
  id: string;
  name: string;
  hitDie: 6 | 8 | 10 | 12;
  primaryAbility: string;
  primaryAttribute: AbilityKey;
  savingThrows: [AbilityKey, AbilityKey];
  armorProficiency: string[];
  weaponProficiency: string[];
  visualDescription: string;
  basicAttire: string;
  startingEquipmentChoices: EquipmentChoice[];
  isSpellcaster: boolean;
  spellcastingAbility?: AbilityKey;
  vibe: string;
};

export type Background = {
  id: string;
  name: string;
  skills: string[];
  tools?: string[];
  languages?: number;
  equipment: string[];
  gold: number;
  visualDetail: string;
  feature: string;
  featureDesc: string;
  personalityTraits: string[];
  ideals: string[];
  bonds: string[];
  flaws: string[];
};

export type CharacterCreationData = {
  name?: string;
  sex?: Sex;
  ageCategory?: AgeCategory;
  referencePhotoBase64?: string;

  raceId?: string;
  subraceId?: string;

  classId?: string;

  stats?: StatBlock;
  statMethod?: "array" | "pointbuy" | "roll";

  backgroundId?: string;
  personality?: { trait?: string; ideal?: string; bond?: string; flaw?: string };

  equipmentChoices?: Record<string, string>;
  outfitDescription?: string;
  weaponDescription?: string;
  focusDescription?: string;

  cantripIds?: string[];
  level1SpellIds?: string[];

  currentImageUrl?: string | null;
  imageHistory?: string[];
};
