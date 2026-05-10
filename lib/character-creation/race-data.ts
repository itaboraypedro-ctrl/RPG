import type { Race } from "./types";

export const RACES: Race[] = [
  {
    id: "anao",
    name: "Anão",
    abilityBonus: { con: 2 },
    speed: 7.5,
    size: "medium",
    traits: ["Visão no Escuro", "Resiliência Anã"],
    languages: ["Comum", "Anão"],
    visualDescription:
      "stocky and broad, thick beard, ruddy skin, deep-set eyes",
    subraces: [
      {
        id: "anao-colina",
        name: "Anão da Colina",
        abilityBonus: { wis: 1 },
        visualDescription: "warmer brown tones, kinder eyes, slightly leaner",
        traits: ["Tenacidade Anã"],
      },
      {
        id: "anao-montanha",
        name: "Anão da Montanha",
        abilityBonus: { str: 2 },
        visualDescription:
          "broader shoulders, paler skin, harsher features, heavier braids",
        traits: ["Treinamento com Armadura Anã"],
      },
    ],
  },
  {
    id: "elfo",
    name: "Elfo",
    abilityBonus: { dex: 2 },
    speed: 9,
    size: "medium",
    traits: [
      "Visão no Escuro",
      "Sentidos Aguçados",
      "Ancestralidade Élfica",
      "Transe",
    ],
    languages: ["Comum", "Élfico"],
    visualDescription:
      "slender frame, pointed ears, almond-shaped eyes, graceful posture",
    subraces: [
      {
        id: "elfo-alto",
        name: "Alto Elfo",
        abilityBonus: { int: 1 },
        visualDescription:
          "fair skin, golden or silver hair, regal bearing",
        traits: ["Truque Adicional", "Idioma Adicional"],
      },
      {
        id: "elfo-floresta",
        name: "Elfo da Floresta",
        abilityBonus: { wis: 1 },
        visualDescription:
          "copper or auburn hair, sun-kissed skin, leaf-toned green eyes",
        traits: ["Pés Ligeiros", "Máscara da Natureza"],
      },
      {
        id: "elfo-drow",
        name: "Drow",
        abilityBonus: { cha: 1 },
        visualDescription:
          "obsidian-dark skin, white hair, glowing pale eyes, lithe build",
        traits: [
          "Visão no Escuro Superior",
          "Sensibilidade à Luz Solar",
          "Magia do Drow",
        ],
      },
    ],
  },
  {
    id: "halfling",
    name: "Halfling",
    abilityBonus: { dex: 2 },
    speed: 7.5,
    size: "small",
    traits: ["Sortudo", "Corajoso", "Agilidade Halfling"],
    languages: ["Comum", "Halfling"],
    visualDescription:
      "small stature, curly hair, cheerful round face, hairy bare feet",
    subraces: [
      {
        id: "halfling-pesleves",
        name: "Pés-Leves",
        abilityBonus: { cha: 1 },
        visualDescription:
          "lighter build, mischievous smile, bright watchful eyes",
        traits: ["Furtividade Natural"],
      },
      {
        id: "halfling-robusto",
        name: "Robusto",
        abilityBonus: { con: 1 },
        visualDescription:
          "thicker frame, ruddier cheeks, sturdier arms",
        traits: ["Resiliência Robusta"],
      },
    ],
  },
  {
    id: "humano",
    name: "Humano",
    abilityBonus: { str: 1, dex: 1, con: 1, int: 1, wis: 1, cha: 1 },
    speed: 9,
    size: "medium",
    traits: ["Versátil"],
    languages: ["Comum", "1 idioma extra"],
    visualDescription:
      "average build for a human adult, varied features, balanced proportions",
    subraces: [],
  },
  {
    id: "draconato",
    name: "Draconato",
    abilityBonus: { str: 2, cha: 1 },
    speed: 9,
    size: "medium",
    traits: ["Ancestralidade Dracônica", "Sopro", "Resistência a dano"],
    languages: ["Comum", "Dracônico"],
    visualDescription:
      "dragon-like humanoid, scaled skin, draconic snout, no hair",
    subraces: [],
  },
  {
    id: "gnomo",
    name: "Gnomo",
    abilityBonus: { int: 2 },
    speed: 7.5,
    size: "small",
    traits: ["Visão no Escuro", "Astúcia Gnômica"],
    languages: ["Comum", "Gnômico"],
    visualDescription:
      "very small, wide curious eyes, big round nose, wild hair",
    subraces: [
      {
        id: "gnomo-floresta",
        name: "Gnomo da Floresta",
        abilityBonus: { dex: 1 },
        visualDescription:
          "leaf-green tinges to skin, sharper ears, more nimble frame",
        traits: ["Falsa Aparência Natural", "Falar com Animais Pequenos"],
      },
      {
        id: "gnomo-rochas",
        name: "Gnomo das Rochas",
        abilityBonus: { con: 1 },
        visualDescription:
          "leathery tan skin, soot-stained hands, thick stocky build",
        traits: ["Conhecimento de Artífice", "Pequeno Construtor"],
      },
    ],
  },
  {
    id: "meio-elfo",
    name: "Meio-Elfo",
    abilityBonus: { cha: 2 },
    speed: 9,
    size: "medium",
    traits: [
      "Visão no Escuro",
      "Sangue Élfico",
      "Versatilidade em Perícias",
    ],
    languages: ["Comum", "Élfico", "1 extra"],
    visualDescription:
      "tall and lean, slightly pointed ears, fine features, expressive eyes",
    subraces: [],
  },
  {
    id: "meio-orc",
    name: "Meio-Orc",
    abilityBonus: { str: 2, con: 1 },
    speed: 9,
    size: "medium",
    traits: [
      "Visão no Escuro",
      "Ameaçador",
      "Resistência Implacável",
      "Ataques Brutais",
    ],
    languages: ["Comum", "Orc"],
    visualDescription:
      "muscular and tall, greenish skin, prominent lower tusks, heavy brow",
    subraces: [],
  },
  {
    id: "tiefling",
    name: "Tiefling",
    abilityBonus: { cha: 2, int: 1 },
    speed: 9,
    size: "medium",
    traits: ["Visão no Escuro", "Resistência Infernal", "Herança Infernal"],
    languages: ["Comum", "Infernal"],
    visualDescription:
      "humanoid with curling horns, thin tail, unusual eye color, slightly reddish or purple skin tone",
    subraces: [],
  },
] as const;
