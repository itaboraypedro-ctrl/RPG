# SPEC_CHARACTERS.md
## GM Controller — Sistema de Personagens
**Versão:** 1.0
**Stack:** Next.js App Router, Supabase, OpenAI Images API (estrutura pronta, chave depois)
**Depende de:** SPEC_DATABASE.md (tabela `characters`), SPEC_AUTH.md, SPEC_GM_PANEL.md

---

## 1. VISÃO GERAL

Personagens são criados pelos jogadores antes da partida e podem ser editados pelo GM durante a sessão. Cada personagem tem uma ficha completa com stats, inventário em grade (estilo Minecraft/Diablo), poderes, habilidades e um avatar gerado por IA.

O sistema de regras é definido pelo GM na sessão — por padrão D&D 5e. Outros sistemas (Pathfinder, Tormenta, sistema próprio) podem ser selecionados, e os campos se adaptam.

---

## 2. SISTEMAS DE REGRAS

```typescript
type RuleSystem = 'dnd5e' | 'pathfinder' | 'tormenta20' | 'custom'
```

**D&D 5e (default):**
- Stats: FOR, DES, CON, INT, SAB, CAR
- Skills: lista de 18 perícias com bônus de proficiência
- Spell slots por nível (1–9)
- Death saves: 3 sucessos / 3 falhas

**Custom:**
- GM define os nomes dos atributos
- Sem spell slots automáticos
- Campos livres para poderes

---

## 3. CRIAÇÃO DE PERSONAGEM (`/play/characters/new`)

### 3.1 Wizard de Criação — 4 Passos

**Passo 1 — Identidade**
- Nome (obrigatório)
- Raça (select ou texto livre)
- Classe (select ou texto livre)
- Nível (número, default 1)
- Background/Antecedente (texto)
- Alinhamento (select: Leal Bom, Neutro, Caótico Mau etc.)

**Passo 2 — Atributos e Stats**
- FOR / DES / CON / INT / SAB / CAR (valores 1–30, default 10)
- Modificadores calculados automaticamente `(valor - 10) / 2`
- HP Máximo (número)
- HP Atual (número, default = HP Máximo)
- CA (número)
- Velocidade (número, default 30)
- Bônus de Proficiência (calculado por nível automaticamente)
- Perícias (checkboxes com cálculo automático = modificador + proficiência)

**Passo 3 — Poderes, Habilidades e Feitiços**
- Lista dinâmica de **Habilidades** (nome + descrição + tipo: passiva/ativa)
- Lista dinâmica de **Feitiços** (nome + escola + nível + descrição + componentes)
- Spell slots por nível (grade 1–9, clica para marcar usados)
- Campo de texto livre "Traços especiais"

**Passo 4 — Avatar e Aparência**
- Campos de aparência que constroem o prompt de IA:
  - Gênero
  - Raça/espécie visual
  - Estilo de roupa/armadura
  - Cor de cabelo e olhos
  - Traços marcantes (cicatrizes, tatuagens etc.)
  - Tom de pele
  - Humor/expressão (sério, feroz, sereno etc.)
- Preview do prompt montado automaticamente
- Botão "Gerar Avatar" → chama API de imagem → retorna grid de 4 imagens
- Jogador seleciona 1 das 4 → salva em `characters.avatar_url`
- Alternativa: upload manual de imagem

---

## 4. GERAÇÃO DE AVATAR POR IA

**Endpoint:** `POST /api/ai/generate-avatar`

**Prompt base (fixo no sistema):**
```
Professional fantasy RPG character portrait, front-facing, upper body, 
detailed armor and clothing visible, dramatic lighting, painterly style, 
dark fantasy aesthetic, high detail, no background text, no UI elements.
Character description: {user_description}
```

**`user_description`** montada a partir dos campos do Passo 4:
```
{gender} {race}, {hair_color} hair, {eye_color} eyes, {skin_tone} skin, 
wearing {armor_style}, {expression} expression{traits_if_any}.
```

**Modelo:** `gpt-image-1` (OpenAI)
**Parâmetros:** `n=4`, `size=1024x1024`, `quality=standard`

**Variável de ambiente necessária:**
```env
OPENAI_API_KEY=   # deixar vazio por ora — estrutura pronta
```

**Fallback:** se `OPENAI_API_KEY` não estiver configurada, endpoint retorna um array de 4 URLs de placeholder (imagens genéricas de silhueta).

---

## 5. INVENTÁRIO EM GRADE

### 5.1 Estrutura de Slots

```
┌──────────────────────────────────────────────────────────┐
│  [Capacete]           [Personagem]        [Capa]         │
│  [Ombreira Esq]     [  Ilustração  ]      [Ombreira Dir] │
│  [Luva Esq]         [             ]       [Luva Dir]     │
│  [Peitoral]         [             ]       [Calça]        │
│  [Mão Principal]    [             ]       [Mão Secundária]│
│  [Bota]             [             ]       [Anel]         │
│                     [             ]       [Amuleto]      │
│                                                          │
│  Mochila (6x5 grid = 30 slots)                           │
│  ┌──┬──┬──┬──┬──┬──┐                                     │
│  │  │  │  │  │  │  │                                     │
│  ├──┼──┼──┼──┼──┼──┤                                     │
│  │  │  │  │  │  │  │                                     │
│  └──┴──┴──┴──┴──┴──┘                                     │
└──────────────────────────────────────────────────────────┘
```

**Slots de equipamento (14 slots nomeados):**
`head`, `cape`, `shoulder_left`, `shoulder_right`, `glove_left`, `glove_right`, `chest`, `legs`, `boots`, `main_hand`, `off_hand`, `ring`, `amulet`, `belt`

**Mochila:** grid 6x5 = 30 slots. Cada item ocupa 1 slot.

### 5.2 Estrutura de Item

```typescript
type InventoryItem = {
  id: string
  name: string
  type: 'weapon' | 'armor' | 'potion' | 'scroll' | 'misc' | 'quest'
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  icon: string           // emoji ou URL de ícone
  description: string
  weight: number
  value: number          // em ouro
  equipped_slot?: string // null se na mochila
  bag_position?: number  // índice 0–29 na mochila
  properties?: Record<string, unknown>  // bônus, dano, etc.
}
```

### 5.3 Interação com o Inventário

**Drag and drop:**
- Arrastar item da mochila para slot de equipamento → equipa
- Arrastar item equipado para mochila → desequipa
- Arrastar item de slot para slot → troca
- Arrastar item para fora da grade → confirma descarte

**GM pode:**
- Adicionar itens ao personagem (botão "+ Item")
- Remover itens
- Arrastar entre slots
- Editar propriedades de um item (clique no item)

**Jogador pode:**
- Ver seu inventário em tempo real
- Arrastar itens (se GM permitir — toggle de permissão na sessão)

---

## 6. CARD DO PERSONAGEM NO PAINEL DO GM

### 6.1 Card Compacto (visível no painel)

```
┌─────────────────────────────────────────┐
│  [Avatar]   Nome do Personagem          │
│  [Img]      Classe · Nível X · CA XX   │
│             ████████████ HP 45/45       │
│             [⚔][🛡][💊][✨][📜][+]     │  ← ações rápidas
│  [checkbox] Condições: Envenenado       │
└─────────────────────────────────────────┘
```

**Ações rápidas (barra de ícones no card):**

| Ícone | Ação | Comportamento |
|---|---|---|
| ⚔️ | Dano | Abre input de valor + DestinationPicker |
| 💚 | Curar | Abre input de valor + DestinationPicker |
| ✨ | Feitiço | Abre lista de feitiços do personagem para escolher |
| 📜 | Mostrar texto | Abre input de texto/pergaminho → envia para jogador |
| 🖼️ | Mostrar imagem | Abre galeria de mídia → envia para jogador |
| ⚠️ | Condição | Dropdown de condições |
| 🎁 | Item | Abre biblioteca de itens para dar ao personagem |
| 📍 | Mover | Input de texto de localização → envia para jogador |
| 🎲 | Rolar dado | Rola dado customizado, resultado aparece no log |
| 💀 | Death saves | Toggle de sucessos/falhas |
| ⭐ | XP | Input de XP a conceder |
| ➕ | Mais | Abre menu expandido com todas as ações |

**Seleção múltipla:**
- Checkbox no canto do card
- Quando 2+ selecionados, barra flutuante aparece no topo da coluna com as ações em massa
- Ações em massa: Dano em área, Curar todos, Aplicar condição, Mostrar texto, Mostrar imagem, Mover

### 6.2 Modal de Detalhes (ao clicar no card)

Modal fullscreen com tabs:

**Tab 1 — Ficha**
- Avatar grande
- Todos os atributos (FOR/DES/CON etc. com modificadores)
- HP / CA / Velocidade / Iniciativa
- Perícias com bônus calculados
- Proficiências e idiomas

**Tab 2 — Inventário**
- Grade completa de equipamento + mochila
- Drag and drop entre slots
- Botão "+ Adicionar item"
- Total de peso / peso máximo
- Total de ouro

**Tab 3 — Poderes e Feitiços**
- Lista de habilidades com descrições
- Grid de spell slots (marcar usados)
- Lista de feitiços organizados por nível
- Botão "+ Adicionar"

**Tab 4 — Log do Personagem**
- `session_events` filtrados por `actor_id` ou onde `payload.target_id = character.id`
- Mesmo componente EventLog mas filtrado

**Tab 5 — Notas**
- Textarea de notas do GM sobre o personagem (salva em `characters.notes`)
- Textarea de backstory (salva em `characters.backstory`)

---

## 7. FICHA DO JOGADOR (`/play/[session_id]/character`)

Visão do próprio personagem durante a partida (mobile-first):

- Avatar + nome + classe
- Barra de HP em destaque
- Stats principais
- Condições ativas (com descrição ao clicar)
- Inventário em grade (compacto)
- Feitiços e spell slots
- Log de eventos relacionados ao personagem
- Notificações recebidas

Atualiza em tempo real via Supabase Realtime (tabela `characters`).

---

## 8. ROTAS

```
/play/characters/new                    → criar personagem
/play/characters/[id]                   → ver/editar personagem (jogador)
/play/[session_id]/character            → ficha do jogador durante a partida

/dashboard/characters                   → lista de personagens do GM
/dashboard/sessions/[id]/characters     → personagens da sessão

/api/ai/generate-avatar                 → POST — geração de avatar
/api/characters/[id]/inventory          → PATCH — atualizar inventário
```

---

## 9. COMPONENTES

```
components/characters/
├── CharacterWizard.tsx               ← wizard de criação (4 passos)
├── CharacterWizardStep1.tsx          ← identidade
├── CharacterWizardStep2.tsx          ← atributos e stats
├── CharacterWizardStep3.tsx          ← poderes e feitiços
├── CharacterWizardStep4.tsx          ← avatar e aparência
├── AvatarGenerator.tsx               ← geração de avatar via IA
├── InventoryGrid.tsx                 ← grade de inventário drag and drop
├── InventorySlot.tsx                 ← slot individual
├── InventoryItem.tsx                 ← item arrastável
├── SpellSlots.tsx                    ← grade de spell slots
├── CharacterSheet.tsx                ← ficha completa (modal)
├── CharacterSheetTab1.tsx            ← ficha de stats
├── CharacterSheetTab2.tsx            ← inventário
├── CharacterSheetTab3.tsx            ← poderes
├── CharacterSheetTab4.tsx            ← log
├── CharacterSheetTab5.tsx            ← notas
└── PlayerCharacterView.tsx           ← visão mobile do jogador

components/gm-panel/
├── CharacterCard.tsx                 ← atualizar card existente com avatar + ações rápidas
├── CharacterCardQuickActions.tsx     ← barra de ações rápidas
├── MultiSelectBar.tsx                ← barra flutuante para seleção múltipla
└── CharacterDetailModal.tsx          ← modal de detalhes com tabs

app/api/ai/
└── generate-avatar/
    └── route.ts

app/api/characters/
└── [id]/
    └── inventory/
        └── route.ts
```

---

## 10. REGRAS DE NEGÓCIO

- Personagem pertence ao jogador (`owner_id`) mas GM pode editar durante sessão ativa
- Avatar é gerado uma única vez — não pode ser regerado depois (apenas substituído por upload)
- Inventário salvo em `characters.inventory` como array de `InventoryItem`
- Peso máximo = FOR × 15 (D&D 5e) — alerta visual quando ultrapassar
- Spell slots zerados automaticamente ao início de cada sessão (toggle configurável)
- Itens de quest não podem ser descartados
- GM pode dar itens de qualquer personagem para qualquer outro
- Drag and drop do inventário gera evento `item_given` ou `item_removed` em `session_events`

---

## 11. VARIÁVEIS DE AMBIENTE

```env
OPENAI_API_KEY=   # para geração de avatar — deixar vazio por ora
```

Enquanto vazio, endpoint retorna 4 placeholders de silhueta em SVG geradas localmente.
