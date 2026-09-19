# SPEC: D&D RPG System — Geração de Documentação MD

## Visão Geral

Este spec instrui a geração de **17 arquivos Markdown** que formam a base de conhecimento
do sistema de RPG. Cada MD é extraído diretamente do PDF fonte (`DnD_BasicRules_2018.pdf`)
e serve como fonte de verdade para as regras do sistema.

**Fonte primária:** `DnD_BasicRules_2018.pdf` (180 páginas, D&D Basic Rules 2018)  
**Fonte secundária:** SRD 5.2.1 — https://github.com/downfallx/dnd-5e-srd-markdown  
**Output:** pasta `/docs/dnd-rules/`  
**Executor:** Claude Code (seguir `PROMPT_CLAUDE_CODE.md`)

---

## Estrutura de Pastas

```
/docs/dnd-rules/
├── part1-character-creation/
│   ├── 01-character-creation-steps.md    (PDF págs. 7–11)
│   ├── 02-races.md                        (PDF págs. 12–20)
│   ├── 03-classes.md                      (PDF págs. 21–33)
│   ├── 04-backgrounds.md                  (PDF págs. 34–43)
│   ├── 05-equipment.md                    (PDF págs. 44–56)
│   └── 06-customization.md               (PDF págs. 57–58)
├── part2-playing-the-game/
│   ├── 07-ability-scores.md              (PDF págs. 59–64)
│   ├── 08-adventuring.md                  (PDF págs. 65–70)
│   └── 09-combat.md                       (PDF págs. 71–79)
├── part3-magic/
│   ├── 10-spellcasting-rules.md          (PDF págs. 81–84)
│   └── 11-spells.md                       (PDF págs. 85–107)
├── part4-dm-tools/
│   ├── 12-monsters.md                     (PDF págs. 109–163)
│   ├── 13-encounter-building.md          (PDF págs. 164–166)
│   └── 14-magic-items.md                  (PDF págs. 167–169)
└── appendices/
    ├── appendix-a-conditions.md          (PDF págs. 170–171)
    ├── appendix-b-gods.md                 (PDF págs. 172–173)
    └── appendix-c-factions.md             (PDF págs. 174–176)
```

---

## Template de Frontmatter (obrigatório em todos os arquivos)

```yaml
---
title: "<título do capítulo>"
chapter: <número (1–14) ou "appendix-a/b/c">
source: "D&D Basic Rules 2018, Chapter <N>"
pdf_pages: "<início>–<fim>"
part: "<part1-character-creation | part2-playing-the-game | part3-magic | part4-dm-tools | appendices>"
tags: [<lista de tags relevantes>]
last_updated: "2024-01-01"
---
```

---

## Especificação por Arquivo

### 01 — character-creation-steps.md
**Páginas PDF:** 7–11  
**Conteúdo obrigatório:**
- Introdução: o que é um personagem
- Os 8 passos de criação (Step 1 a Step 8) com descrição completa de cada
- Tabela: Character Advancement (níveis 1–20, XP, Proficiency Bonus)
- Seção: Beyond 1st Level (multiclassing intro, features gained per level)
- Exemplo narrativo: Building Bruenor (manter como sidebar)

**Formato especial:**
```markdown
## Step N: [Nome do Passo]
> **O que fazer:** [descrição direta]

[texto completo do passo]
```

---

### 02 — races.md
**Páginas PDF:** 12–20  
**Conteúdo obrigatório:**

Para cada raça (Dwarf, Elf, Halfling, Human):
- Seção introdutória/flavour text
- Racial Traits (lista completa)
- Tabela de nomes (masculino, feminino, sobrenome/clã quando houver)
- Sub-raças com todos os traços adicionais

**Raças e sub-raças no PDF:**
- Dwarf → Hill Dwarf, Mountain Dwarf
- Elf → High Elf, Wood Elf, Dark Elf (Drow)
- Halfling → Lightfoot, Stout
- Human → padrão + variante (opcional)

**Formato de cada raça:**
```markdown
## [Nome da Raça]

> *[flavour text de abertura]*

### Traços Raciais

**Aumento de Atributo.** [texto]  
**Idade.** [texto]  
**Tendência.** [texto]  
**Tamanho.** [texto]  
**Velocidade.** [texto]  
**[Traço Especial].** [texto]  
**Idiomas.** [texto]  
**Sub-raças.** [texto]

### [Nome da Sub-raça]
**Aumento de Atributo.** [texto]
[demais traços]
```

---

### 03 — classes.md
**Páginas PDF:** 21–33  
**Conteúdo obrigatório:**

Para cada classe (Cleric, Fighter, Rogue, Wizard):
- Flavour text de abertura
- Tabela de progressão completa (todos os níveis 1–20 com features)
- Class Features (todas, sem omitir nenhuma)
- Subclass (1 por classe conforme o Basic Rules)
- Quick Build (seção de criação rápida)

**Classes e Subclasses no PDF:**
- Cleric → Life Domain
- Fighter → Champion
- Rogue → Thief
- Wizard → School of Evocation

**Formato das tabelas de progressão:**
```markdown
| Nível | Bônus de Proficiência | Features |
|-------|----------------------|----------|
| 1     | +2                   | [features] |
| 2     | +2                   | [features] |
...
```

**Formato de features:**
```markdown
#### [Nome da Feature]
*Nível N*

[texto completo da feature]
```

---

### 04 — backgrounds.md
**Páginas PDF:** 34–43  
**Conteúdo obrigatório:**

- Intro: o que é background, como funciona
- Proficiency grants, Languages, Equipment
- Feature (unique per background)
- Tabelas de Personality Traits, Ideals, Bonds, Flaws

**Backgrounds no PDF:**
Acolyte, Criminal, Folk Hero, Hermit, Noble, Outlander, Sage, Sailor, Soldier, Urchin

**Formato por background:**
```markdown
## [Nome do Background]

**Perícias:** [lista]  
**Ferramentas:** [lista ou "Nenhuma"]  
**Idiomas:** [ou "Nenhum"]  
**Equipamento:** [lista completa]

### Feature: [Nome da Feature]
[texto]

### Características Sugeridas

#### Traços de Personalidade
| d8 | Traço |
|----|-------|
| 1  | [texto] |
...

#### Ideais
| d6 | Ideal |
|----|-------|
...

#### Vínculos
| d6 | Vínculo |
|----|---------|
...

#### Falhas
| d6 | Falha |
|----|-------|
...
```

---

### 05 — equipment.md
**Páginas PDF:** 44–56  
**Conteúdo obrigatório:**
- Wealth & Currency (tabela de conversão de moedas)
- Armor (Light, Medium, Heavy, Shields) — tabela completa com AC, Stealth, peso, preço
- Weapons — tabela completa (nome, custo, dano, peso, propriedades)
- Weapon Properties (todas as propriedades definidas: Ammunition, Finesse, Heavy, etc.)
- Adventuring Gear — tabela completa
- Tools (Artisan's tools, Gaming sets, Musical instruments)
- Mounts & Vehicles
- Trade Goods
- Expenses (lifestyle)
- Trinkets (tabela d100)

**Formato de tabela de armaduras:**
```markdown
| Armadura | Custo | Classe de Armadura | Força | Furtividade | Peso |
|----------|-------|---------------------|-------|-------------|------|
```

---

### 06 — customization.md
**Páginas PDF:** 57–58  
**Conteúdo obrigatório:**
- Multiclassing: pré-requisitos, como funciona, Proficiencies ganhos
- Tabela: Multiclass Spellcaster (Spell Slots por nível combinado)
- Feats: o que são, quando pegar, lista completa dos feats do Basic Rules
- Cada feat com descrição completa e pré-requisitos

---

### 07 — ability-scores.md
**Páginas PDF:** 59–64  
**Conteúdo obrigatório:**
- Os 6 ability scores com descrição completa (STR, DEX, CON, INT, WIS, CHA)
- Tabela: Ability Scores e Modifiers (score 1–30, modifier correspondente)
- Advantage e Disadvantage (como funciona, quando se cancela)
- Proficiency Bonus
- Ability Checks: DC, contests
- Skills completas: qual atributo, o que cobrem (Athletics, Acrobatics, etc.)
- Passive Checks
- Working Together
- Saving Throws

**Formato das skills:**
```markdown
#### [Nome da Skill] ([Atributo])
[texto completo de uso]
```

---

### 08 — adventuring.md
**Páginas PDF:** 65–70  
**Conteúdo obrigatório:**
- Time (dias de aventura, jornada)
- Movement: velocidade, terreno difícil, saltar, nadar, escalar, voar
- The Environment: visão e luz (Bright/Dim/Darkness), cair, sufocamento, água
- Social Interaction
- Resting: Short Rest (Hit Dice recovery), Long Rest (HP full, features reset)
- Between Adventures: downtime, lifestyle expenses, crafting, training

---

### 09 — combat.md
**Páginas PDF:** 71–79  
**Conteúdo obrigatório (CRÍTICO para o sistema):**
- The Order of Combat: surprise, initiative
- Movement and Position: difficult terrain, moving through spaces, grappling
- Actions in Combat — lista completa:
  - Attack, Cast a Spell, Dash, Disengage, Dodge, Help, Hide, Ready, Search, Use an Object
- Making an Attack: attack rolls, unseen attackers, ranged + melee
- Cover: Half Cover (+2 AC), Three-Quarters Cover (+5 AC), Total Cover
- Damage and Healing: damage types, resistances, vulnerabilities, immunities
  - Critical Hits
  - Damage at 0 HP, Death Saving Throws, Stabilizing
  - Instant Death
  - Healing (regain HP)
  - Temporary Hit Points
- Mounted Combat
- Underwater Combat

**Formato das ações:**
```markdown
### [Nome da Ação]

**Quando usar:** [trigger/contexto]

[texto completo]
```

---

### 10 — spellcasting-rules.md
**Páginas PDF:** 81–84  
**Conteúdo obrigatório:**
- O que é uma magia (spell level, known vs prepared)
- Spell Slots (como funcionam, regaining slots)
- Cantrips
- Ritual Casting
- Casting a Spell:
  - Casting Time (action, bonus action, reaction, 1 minute, etc.)
  - Range
  - Components (V, S, M — material components, spell focus)
  - Duration (instantaneous, concentration, até X rounds)
  - Targets
  - Areas of Effect (cone, cube, cylinder, line, sphere)
  - Saving Throws de magia
  - Attack Rolls de magia
- Combining Magical Effects

---

### 11 — spells.md
**Páginas PDF:** 85–107  
**Conteúdo obrigatório:**
- Índice de Spells por Classe (Cleric Spells e Wizard Spells, organizadas por nível)
- Cada spell com formato completo e padronizado

**Formato de spell:**
```markdown
## [Nome da Magia]
*[Nível]-level [escola] [ritual?]*

**Tempo de Conjuração:** [tempo]  
**Alcance:** [alcance]  
**Componentes:** [V, S, M (descrição do material)]  
**Duração:** [duração] *(Concentração)*  

[texto completo]

***Em Níveis Superiores.*** [texto se existir]
```

---

### 12 — monsters.md
**Páginas PDF:** 109–163  
**Conteúdo obrigatório:**

**Parte 1: Como Ler Stat Blocks**
- Size, Type, Alignment
- Armor Class
- Hit Points (dice notation explicada)
- Speed
- Ability Scores & Modifiers
- Saving Throws
- Skills
- Vulnerabilities, Resistances, Immunities
- Senses (Darkvision, Tremorsense, etc.)
- Languages
- Challenge Rating & XP

**Tabela: CR → XP**
```markdown
| CR | XP      | CR | XP       |
|----|---------|-----|---------|
| 0  | 0 ou 10 | 9   | 5,000   |
...
```

**Parte 2: Tipos de Criaturas** (Aberration, Beast, Celestial, etc.)

**Parte 3: Legendary Creatures** (Legendary Actions, Lair Actions)

**Parte 4: Stat Blocks Completos**
Cada monstro em formato padronizado:

```markdown
## [Nome do Monstro]
*[Tamanho] [tipo], [alinhamento]*

**Classe de Armadura** [AC] ([fonte])  
**Pontos de Vida** [HP médio] ([dados])  
**Velocidade** [velocidade]

| FOR | DES | CON | INT | SAB | CAR |
|-----|-----|-----|-----|-----|-----|
| [valor] ([mod]) | ... |

**Saving Throws** [lista]  
**Perícias** [lista]  
**Resistências a Dano** [lista]  
**Imunidades a Dano** [lista]  
**Imunidades a Condição** [lista]  
**Sentidos** [lista], Percepção Passiva [valor]  
**Idiomas** [lista]  
**Nível de Desafio** [CR] ([XP] XP)

### Traços
**[Nome do Traço].** [texto]

### Ações
**Multiattack.** [texto]  
**[Nome do Ataque].** *[Melee/Ranged] Weapon Attack:* +[bônus] para acertar, alcance [X] ft., [alvo]. *Acerto:* [dano] ([dados] + [mod]) [tipo] de dano.

### Ações Lendárias *(se houver)*
[texto de intro]

**[Nome da Ação Lendária] (Custa [X] Ações).** [texto]
```

---

### 13 — encounter-building.md
**Páginas PDF:** 164–166  
**Conteúdo obrigatório:**
- XP Thresholds por nível de personagem (tabela completa, todos os níveis, 4 colunas: Easy/Medium/Hard/Deadly)
- Passo a passo: como calcular dificuldade de encontro
- Multiplicador por quantidade de monstros (tabela)
- Modifying Encounter Difficulty (modificadores situacionais)
- Monsters by Challenge Rating (lista de todos os monstros do Basic Rules por CR)

---

### 14 — magic-items.md
**Páginas PDF:** 167–169  
**Conteúdo obrigatório:**
- Using a Magic Item (attunement, wearing, wielding, activating)
- Magic Item Categories (Armor, Potions, Rings, Rods, Scrolls, Staffs, Wands, Weapons, Wondrous Items)
- Tabela de raridade
- Cada item em formato padronizado:

```markdown
## [Nome do Item]
*[categoria], [raridade] [requer sintonização?]*

[descrição completa]
```

---

### appendix-a-conditions.md
**Páginas PDF:** 170–171  
**Conteúdo obrigatório:**
Cada condição com descrição completa dos efeitos:
Blinded, Charmed, Deafened, Frightened, Grappled, Incapacitated, Invisible,
Paralyzed, Petrified, Poisoned, Prone, Restrained, Stunned, Unconscious, Exhaustion (níveis 1–6)

**Formato:**
```markdown
## [Nome da Condição]
- [efeito 1]
- [efeito 2]
```

---

### appendix-b-gods.md
**Páginas PDF:** 172–173  
**Conteúdo obrigatório:**
- Intro: deuses no D&D, como funcionam
- Panteão de Greyhawk (tabela completa: deus, alinhamento, domínios, símbolo)
- Panteão de Forgotten Realms
- Panteão Élfico, Anão, Halfling, Gnomo, Orc, Gigante, Dracônico

---

### appendix-c-factions.md
**Páginas PDF:** 174–176  
**Conteúdo obrigatório:**
- The Harpers
- The Order of the Gauntlet
- The Emerald Enclave
- The Lords' Alliance
- The Zhentarim

Para cada: missão, valores, quem se junta, rank structure, benefits

---

## Regras de Qualidade (aplicar em TODOS os arquivos)

1. **Zero omissão:** Cada item, regra, tabela e texto do PDF deve estar no MD correspondente. Nada pode ser resumido ou cortado.

2. **Tabelas em Markdown nativo:** Toda tabela do PDF deve ser recriada como tabela Markdown (`|---|`). Nunca usar imagem, nunca deixar como texto corrido.

3. **Dados numéricos exatos:** Valores de dano, AC, HP, XP, DC, alcance etc. devem ser copiados com precisão do PDF. Nunca aproximar.

4. **Hierarquia de headers consistente:**
   - `#` → Título do arquivo (1x no topo)
   - `##` → Seções principais
   - `###` → Sub-seções
   - `####` → Features, itens individuais, criaturas secundárias

5. **Dados de dados (dice notation):** Sempre manter o formato `Xd Y + Z` (ex: `2d6 + 3`)

6. **Cross-references:** Quando o texto citar outro capítulo, adicionar link relativo:
   `[capítulo 9](../part2-playing-the-game/09-combat.md)`

7. **Sidebars e exemplos:** Manter como blockquotes:
   ```markdown
   > **Building Bruenor, Step 1**
   > [texto do exemplo]
   ```

8. **Sem interpretação:** O MD deve refletir o texto do PDF, não interpretar ou traduzir regras.

9. **Nomes em inglês:** Manter todos os termos técnicos em inglês (Hit Points, Armor Class, etc.) — o sistema vai consumir esses termos programaticamente.
