import type { Class } from "./types";

export const CLASSES: Class[] = [
  {
    id: "barbaro",
    name: "Bárbaro",
    hitDie: 12,
    primaryAbility: "Força",
    primaryAttribute: "str",
    savingThrows: ["str", "con"],
    armorProficiency: ["Armaduras leves", "Armaduras médias", "Escudos"],
    weaponProficiency: ["Armas simples", "Armas marciais"],
    visualDescription:
      "fierce warrior with raw muscular build, war paint, primal aura",
    basicAttire: "tribal hide vest, fur-lined boots, leather wraps",
    isSpellcaster: false,
    vibe: "Selvagem · Brutal · Resiliente",
    startingEquipmentChoices: [
      {
        id: "barbaro-arma-principal",
        prompt: "Escolha sua arma principal",
        options: [
          { id: "a", label: "(a) um machado grande", items: ["Machado Grande"] },
          {
            id: "b",
            label: "(b) qualquer arma marcial corpo-a-corpo",
            items: ["Arma marcial corpo-a-corpo"],
          },
        ],
      },
      {
        id: "barbaro-arma-secundaria",
        prompt: "Escolha sua arma secundária",
        options: [
          { id: "a", label: "(a) duas machadinhas", items: ["Machadinha", "Machadinha"] },
          {
            id: "b",
            label: "(b) qualquer arma simples",
            items: ["Arma simples"],
          },
        ],
      },
      {
        id: "barbaro-pacote",
        prompt: "Pacote inicial",
        options: [
          {
            id: "a",
            label: "Pacote de Aventureiro + 4 azagaias",
            items: ["Pacote de Aventureiro", "Azagaia", "Azagaia", "Azagaia", "Azagaia"],
          },
        ],
      },
    ],
  },
  {
    id: "bardo",
    name: "Bardo",
    hitDie: 8,
    primaryAbility: "Carisma",
    primaryAttribute: "cha",
    savingThrows: ["dex", "cha"],
    armorProficiency: ["Armaduras leves"],
    weaponProficiency: [
      "Armas simples",
      "Bestas de mão",
      "Espadas longas",
      "Rapieiras",
      "Espadas curtas",
    ],
    visualDescription:
      "charismatic performer with poised stance, expressive features, musical accessory",
    basicAttire: "colorful traveling clothes, simple lute on back",
    isSpellcaster: true,
    spellcastingAbility: "cha",
    vibe: "Carismático · Versátil · Inspirador",
    startingEquipmentChoices: [
      {
        id: "bardo-arma",
        prompt: "Escolha sua arma",
        options: [
          { id: "a", label: "(a) uma rapieira", items: ["Rapieira"] },
          { id: "b", label: "(b) uma espada longa", items: ["Espada Longa"] },
          { id: "c", label: "(c) qualquer arma simples", items: ["Arma simples"] },
        ],
      },
      {
        id: "bardo-pacote",
        prompt: "Pacote",
        options: [
          { id: "a", label: "(a) Pacote de Diplomata", items: ["Pacote de Diplomata"] },
          { id: "b", label: "(b) Pacote de Artista", items: ["Pacote de Artista"] },
        ],
      },
      {
        id: "bardo-instrumento",
        prompt: "Instrumento musical",
        options: [
          { id: "a", label: "(a) um alaúde", items: ["Alaúde"] },
          { id: "b", label: "(b) qualquer outro instrumento musical", items: ["Instrumento musical"] },
        ],
      },
      {
        id: "bardo-armadura",
        prompt: "Armadura inicial",
        options: [
          {
            id: "a",
            label: "Armadura de couro e adaga",
            items: ["Armadura de Couro", "Adaga"],
          },
        ],
      },
    ],
  },
  {
    id: "bruxo",
    name: "Bruxo",
    hitDie: 8,
    primaryAbility: "Carisma",
    primaryAttribute: "cha",
    savingThrows: ["wis", "cha"],
    armorProficiency: ["Armaduras leves"],
    weaponProficiency: ["Armas simples"],
    visualDescription:
      "occult figure with shadowed gaze, esoteric symbols, brooding presence",
    basicAttire: "dark hooded cloak, mysterious robes",
    isSpellcaster: true,
    spellcastingAbility: "cha",
    vibe: "Sombrio · Pactual · Arcano",
    startingEquipmentChoices: [
      {
        id: "bruxo-arma",
        prompt: "Escolha sua arma",
        options: [
          { id: "a", label: "(a) uma besta leve e 20 virotes", items: ["Besta Leve", "Virote x20"] },
          { id: "b", label: "(b) qualquer arma simples", items: ["Arma simples"] },
        ],
      },
      {
        id: "bruxo-foco",
        prompt: "Foco arcano",
        options: [
          { id: "a", label: "(a) uma bolsa de componentes", items: ["Bolsa de Componentes"] },
          { id: "b", label: "(b) um foco arcano", items: ["Foco Arcano"] },
        ],
      },
      {
        id: "bruxo-pacote",
        prompt: "Pacote",
        options: [
          { id: "a", label: "(a) Pacote de Estudioso", items: ["Pacote de Estudioso"] },
          { id: "b", label: "(b) Pacote de Assaltante", items: ["Pacote de Assaltante"] },
        ],
      },
      {
        id: "bruxo-armadura",
        prompt: "Equipamento inicial",
        options: [
          {
            id: "a",
            label: "Armadura de couro, qualquer arma simples e duas adagas",
            items: ["Armadura de Couro", "Arma simples", "Adaga", "Adaga"],
          },
        ],
      },
    ],
  },
  {
    id: "clerigo",
    name: "Clérigo",
    hitDie: 8,
    primaryAbility: "Sabedoria",
    primaryAttribute: "wis",
    savingThrows: ["wis", "cha"],
    armorProficiency: ["Armaduras leves", "Armaduras médias", "Escudos"],
    weaponProficiency: ["Armas simples"],
    visualDescription:
      "devout servant of a deity, calm gaze, sacred bearing",
    basicAttire: "simple religious vestments, holy symbol pendant",
    isSpellcaster: true,
    spellcastingAbility: "wis",
    vibe: "Devoto · Sagrado · Curador",
    startingEquipmentChoices: [
      {
        id: "clerigo-arma",
        prompt: "Escolha sua arma",
        options: [
          { id: "a", label: "(a) uma maça", items: ["Maça"] },
          { id: "b", label: "(b) um martelo de guerra (se proficiente)", items: ["Martelo de Guerra"] },
        ],
      },
      {
        id: "clerigo-armadura",
        prompt: "Escolha sua armadura",
        options: [
          { id: "a", label: "(a) brunea", items: ["Brunea"] },
          { id: "b", label: "(b) armadura de couro", items: ["Armadura de Couro"] },
          { id: "c", label: "(c) cota de malha (se proficiente)", items: ["Cota de Malha"] },
        ],
      },
      {
        id: "clerigo-arma-secundaria",
        prompt: "Arma secundária",
        options: [
          { id: "a", label: "(a) besta leve e 20 virotes", items: ["Besta Leve", "Virote x20"] },
          { id: "b", label: "(b) qualquer arma simples", items: ["Arma simples"] },
        ],
      },
      {
        id: "clerigo-pacote",
        prompt: "Pacote",
        options: [
          { id: "a", label: "(a) Pacote de Sacerdote", items: ["Pacote de Sacerdote"] },
          { id: "b", label: "(b) Pacote de Explorador", items: ["Pacote de Explorador"] },
        ],
      },
      {
        id: "clerigo-final",
        prompt: "Equipamento final",
        options: [
          {
            id: "a",
            label: "Escudo e símbolo sagrado",
            items: ["Escudo", "Símbolo Sagrado"],
          },
        ],
      },
    ],
  },
  {
    id: "druida",
    name: "Druida",
    hitDie: 8,
    primaryAbility: "Sabedoria",
    primaryAttribute: "wis",
    savingThrows: ["int", "wis"],
    armorProficiency: ["Armaduras leves", "Armaduras médias", "Escudos (não-metal)"],
    weaponProficiency: [
      "Bordões",
      "Adagas",
      "Dardos",
      "Fundas",
      "Lanças",
      "Maças",
      "Cimitarras",
      "Foices curtas",
      "Azagaias",
    ],
    visualDescription:
      "natural keeper attuned to the wild, weathered hands, leaf-touched skin",
    basicAttire: "natural fiber robes, leaves and wood accessories",
    isSpellcaster: true,
    spellcastingAbility: "wis",
    vibe: "Natural · Místico · Mutável",
    startingEquipmentChoices: [
      {
        id: "druida-arma",
        prompt: "Escolha sua arma",
        options: [
          { id: "a", label: "(a) um escudo de madeira", items: ["Escudo de Madeira"] },
          { id: "b", label: "(b) qualquer arma simples", items: ["Arma simples"] },
        ],
      },
      {
        id: "druida-arma-secundaria",
        prompt: "Arma corpo-a-corpo",
        options: [
          { id: "a", label: "(a) uma cimitarra", items: ["Cimitarra"] },
          { id: "b", label: "(b) qualquer arma simples corpo-a-corpo", items: ["Arma simples corpo-a-corpo"] },
        ],
      },
      {
        id: "druida-final",
        prompt: "Equipamento final",
        options: [
          {
            id: "a",
            label: "Armadura de couro, Pacote de Explorador e foco druídico",
            items: ["Armadura de Couro", "Pacote de Explorador", "Foco Druídico"],
          },
        ],
      },
    ],
  },
  {
    id: "feiticeiro",
    name: "Feiticeiro",
    hitDie: 6,
    primaryAbility: "Carisma",
    primaryAttribute: "cha",
    savingThrows: ["con", "cha"],
    armorProficiency: [],
    weaponProficiency: [
      "Adagas",
      "Dardos",
      "Fundas",
      "Bordões",
      "Bestas leves",
    ],
    visualDescription:
      "innate magical being with subtle arcane marks across skin",
    basicAttire: "ornate but worn robes, faint magical marks visible",
    isSpellcaster: true,
    spellcastingAbility: "cha",
    vibe: "Inato · Caótico · Místico",
    startingEquipmentChoices: [
      {
        id: "feiticeiro-arma",
        prompt: "Escolha sua arma",
        options: [
          { id: "a", label: "(a) uma besta leve e 20 virotes", items: ["Besta Leve", "Virote x20"] },
          { id: "b", label: "(b) qualquer arma simples", items: ["Arma simples"] },
        ],
      },
      {
        id: "feiticeiro-foco",
        prompt: "Foco arcano",
        options: [
          { id: "a", label: "(a) uma bolsa de componentes", items: ["Bolsa de Componentes"] },
          { id: "b", label: "(b) um foco arcano", items: ["Foco Arcano"] },
        ],
      },
      {
        id: "feiticeiro-pacote",
        prompt: "Pacote",
        options: [
          { id: "a", label: "(a) Pacote de Diplomata", items: ["Pacote de Diplomata"] },
          { id: "b", label: "(b) Pacote de Explorador", items: ["Pacote de Explorador"] },
        ],
      },
      {
        id: "feiticeiro-final",
        prompt: "Equipamento final",
        options: [
          { id: "a", label: "Duas adagas", items: ["Adaga", "Adaga"] },
        ],
      },
    ],
  },
  {
    id: "guerreiro",
    name: "Guerreiro",
    hitDie: 10,
    primaryAbility: "Força ou Destreza",
    primaryAttribute: "str",
    savingThrows: ["str", "con"],
    armorProficiency: [
      "Todas as armaduras",
      "Escudos",
    ],
    weaponProficiency: ["Armas simples", "Armas marciais"],
    visualDescription:
      "trained combatant with disciplined posture and battle-hardened features",
    basicAttire: "leather gambeson, simple soldier's tunic",
    isSpellcaster: false,
    vibe: "Disciplinado · Marcial · Versátil",
    startingEquipmentChoices: [
      {
        id: "guerreiro-armadura",
        prompt: "Escolha sua armadura",
        options: [
          { id: "a", label: "(a) cota de malha", items: ["Cota de Malha"] },
          { id: "b", label: "(b) couro batido, arco longo e 20 flechas", items: ["Couro Batido", "Arco Longo", "Flecha x20"] },
        ],
      },
      {
        id: "guerreiro-arma",
        prompt: "Escolha sua arma",
        options: [
          { id: "a", label: "(a) uma arma marcial e um escudo", items: ["Arma marcial", "Escudo"] },
          { id: "b", label: "(b) duas armas marciais", items: ["Arma marcial", "Arma marcial"] },
        ],
      },
      {
        id: "guerreiro-arma-secundaria",
        prompt: "Arma secundária",
        options: [
          { id: "a", label: "(a) uma besta de mão e 20 virotes", items: ["Besta de Mão", "Virote x20"] },
          { id: "b", label: "(b) duas machadinhas", items: ["Machadinha", "Machadinha"] },
        ],
      },
      {
        id: "guerreiro-pacote",
        prompt: "Pacote",
        options: [
          { id: "a", label: "(a) Pacote de Assaltante", items: ["Pacote de Assaltante"] },
          { id: "b", label: "(b) Pacote de Explorador", items: ["Pacote de Explorador"] },
        ],
      },
    ],
  },
  {
    id: "ladino",
    name: "Ladino",
    hitDie: 8,
    primaryAbility: "Destreza",
    primaryAttribute: "dex",
    savingThrows: ["dex", "int"],
    armorProficiency: ["Armaduras leves"],
    weaponProficiency: [
      "Armas simples",
      "Bestas de mão",
      "Espadas longas",
      "Rapieiras",
      "Espadas curtas",
    ],
    visualDescription:
      "agile rogue with sharp eyes, light frame, hidden tools",
    basicAttire: "dark leather outfit, hooded cloak, hidden daggers",
    isSpellcaster: false,
    vibe: "Furtivo · Astuto · Mortal",
    startingEquipmentChoices: [
      {
        id: "ladino-arma",
        prompt: "Escolha sua arma",
        options: [
          { id: "a", label: "(a) uma rapieira", items: ["Rapieira"] },
          { id: "b", label: "(b) uma espada curta", items: ["Espada Curta"] },
        ],
      },
      {
        id: "ladino-arma-secundaria",
        prompt: "Arma secundária",
        options: [
          { id: "a", label: "(a) um arco curto e aljava com 20 flechas", items: ["Arco Curto", "Aljava", "Flecha x20"] },
          { id: "b", label: "(b) uma espada curta", items: ["Espada Curta"] },
        ],
      },
      {
        id: "ladino-pacote",
        prompt: "Pacote",
        options: [
          { id: "a", label: "(a) Pacote de Assaltante", items: ["Pacote de Assaltante"] },
          { id: "b", label: "(b) Pacote de Diplomata", items: ["Pacote de Diplomata"] },
          { id: "c", label: "(c) Pacote de Explorador", items: ["Pacote de Explorador"] },
        ],
      },
      {
        id: "ladino-final",
        prompt: "Equipamento final",
        options: [
          {
            id: "a",
            label: "Armadura de couro, duas adagas e ferramentas de ladrão",
            items: ["Armadura de Couro", "Adaga", "Adaga", "Ferramentas de Ladrão"],
          },
        ],
      },
    ],
  },
  {
    id: "mago",
    name: "Mago",
    hitDie: 6,
    primaryAbility: "Inteligência",
    primaryAttribute: "int",
    savingThrows: ["int", "wis"],
    armorProficiency: [],
    weaponProficiency: [
      "Adagas",
      "Dardos",
      "Fundas",
      "Bordões",
      "Bestas leves",
    ],
    visualDescription:
      "scholarly arcanist with thoughtful gaze, ink-stained fingers, robe and tome",
    basicAttire: "scholarly robes, simple cloth belt, satchel",
    isSpellcaster: true,
    spellcastingAbility: "int",
    vibe: "Erudito · Arcano · Estudioso",
    startingEquipmentChoices: [
      {
        id: "mago-arma",
        prompt: "Escolha sua arma",
        options: [
          { id: "a", label: "(a) um cajado", items: ["Cajado"] },
          { id: "b", label: "(b) uma adaga", items: ["Adaga"] },
        ],
      },
      {
        id: "mago-foco",
        prompt: "Foco arcano",
        options: [
          { id: "a", label: "(a) uma bolsa de componentes", items: ["Bolsa de Componentes"] },
          { id: "b", label: "(b) um foco arcano", items: ["Foco Arcano"] },
        ],
      },
      {
        id: "mago-pacote",
        prompt: "Pacote",
        options: [
          { id: "a", label: "(a) Pacote de Estudioso", items: ["Pacote de Estudioso"] },
          { id: "b", label: "(b) Pacote de Explorador", items: ["Pacote de Explorador"] },
        ],
      },
      {
        id: "mago-final",
        prompt: "Grimório",
        options: [
          { id: "a", label: "Um grimório", items: ["Grimório"] },
        ],
      },
    ],
  },
  {
    id: "monge",
    name: "Monge",
    hitDie: 8,
    primaryAbility: "Destreza e Sabedoria",
    primaryAttribute: "dex",
    savingThrows: ["str", "dex"],
    armorProficiency: [],
    weaponProficiency: ["Armas simples", "Espadas curtas"],
    visualDescription:
      "lithe martial artist with serene composure and balanced stance",
    basicAttire: "loose-fitting monk's robes, no shoes",
    isSpellcaster: false,
    vibe: "Disciplinado · Ágil · Espiritual",
    startingEquipmentChoices: [
      {
        id: "monge-arma",
        prompt: "Escolha sua arma",
        options: [
          { id: "a", label: "(a) uma espada curta", items: ["Espada Curta"] },
          { id: "b", label: "(b) qualquer arma simples", items: ["Arma simples"] },
        ],
      },
      {
        id: "monge-pacote",
        prompt: "Pacote",
        options: [
          { id: "a", label: "(a) Pacote de Assaltante", items: ["Pacote de Assaltante"] },
          { id: "b", label: "(b) Pacote de Explorador", items: ["Pacote de Explorador"] },
        ],
      },
      {
        id: "monge-final",
        prompt: "Equipamento final",
        options: [
          { id: "a", label: "10 dardos", items: ["Dardo x10"] },
        ],
      },
    ],
  },
  {
    id: "paladino",
    name: "Paladino",
    hitDie: 10,
    primaryAbility: "Força e Carisma",
    primaryAttribute: "str",
    savingThrows: ["wis", "cha"],
    armorProficiency: [
      "Todas as armaduras",
      "Escudos",
    ],
    weaponProficiency: ["Armas simples", "Armas marciais"],
    visualDescription:
      "righteous knight with radiant aura, sacred crest, regal bearing",
    basicAttire: "white tunic with religious sigil, traveling cape",
    isSpellcaster: true,
    spellcastingAbility: "cha",
    vibe: "Sagrado · Honrado · Imparável",
    startingEquipmentChoices: [
      {
        id: "paladino-arma",
        prompt: "Escolha sua arma",
        options: [
          { id: "a", label: "(a) uma arma marcial e um escudo", items: ["Arma marcial", "Escudo"] },
          { id: "b", label: "(b) duas armas marciais", items: ["Arma marcial", "Arma marcial"] },
        ],
      },
      {
        id: "paladino-arma-secundaria",
        prompt: "Arma de arremesso",
        options: [
          { id: "a", label: "(a) cinco azagaias", items: ["Azagaia x5"] },
          { id: "b", label: "(b) qualquer arma simples corpo-a-corpo", items: ["Arma simples corpo-a-corpo"] },
        ],
      },
      {
        id: "paladino-pacote",
        prompt: "Pacote",
        options: [
          { id: "a", label: "(a) Pacote de Sacerdote", items: ["Pacote de Sacerdote"] },
          { id: "b", label: "(b) Pacote de Explorador", items: ["Pacote de Explorador"] },
        ],
      },
      {
        id: "paladino-final",
        prompt: "Equipamento final",
        options: [
          {
            id: "a",
            label: "Cota de malha e símbolo sagrado",
            items: ["Cota de Malha", "Símbolo Sagrado"],
          },
        ],
      },
    ],
  },
  {
    id: "patrulheiro",
    name: "Patrulheiro",
    hitDie: 10,
    primaryAbility: "Destreza e Sabedoria",
    primaryAttribute: "dex",
    savingThrows: ["str", "dex"],
    armorProficiency: ["Armaduras leves", "Armaduras médias", "Escudos"],
    weaponProficiency: ["Armas simples", "Armas marciais"],
    visualDescription:
      "wilderness scout with keen eyes, weathered cloak, bow at the ready",
    basicAttire: "green forest cloak, leather vest, longbow on back",
    isSpellcaster: true,
    spellcastingAbility: "wis",
    vibe: "Selvagem · Caçador · Atento",
    startingEquipmentChoices: [
      {
        id: "patrulheiro-armadura",
        prompt: "Escolha sua armadura",
        options: [
          { id: "a", label: "(a) armadura escamada", items: ["Armadura Escamada"] },
          { id: "b", label: "(b) couro batido", items: ["Couro Batido"] },
        ],
      },
      {
        id: "patrulheiro-arma",
        prompt: "Escolha sua arma",
        options: [
          { id: "a", label: "(a) duas espadas curtas", items: ["Espada Curta", "Espada Curta"] },
          { id: "b", label: "(b) duas armas simples corpo-a-corpo", items: ["Arma simples corpo-a-corpo", "Arma simples corpo-a-corpo"] },
        ],
      },
      {
        id: "patrulheiro-pacote",
        prompt: "Pacote",
        options: [
          { id: "a", label: "(a) Pacote de Assaltante", items: ["Pacote de Assaltante"] },
          { id: "b", label: "(b) Pacote de Explorador", items: ["Pacote de Explorador"] },
        ],
      },
      {
        id: "patrulheiro-final",
        prompt: "Equipamento final",
        options: [
          {
            id: "a",
            label: "Arco longo e aljava com 20 flechas",
            items: ["Arco Longo", "Aljava", "Flecha x20"],
          },
        ],
      },
    ],
  },
] as const;
