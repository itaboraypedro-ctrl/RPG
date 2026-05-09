# SPEC_PLAYER_CHARACTER_SHEET.md
## GM Controller — Ficha do Jogador (Mobile, Durante Partida)
**Versão:** 1.0
**Rota:** `/play/[session_id]` — substitui/expande o `PlayerTabStatus` atual
**Stack:** Next.js, Supabase Realtime, mobile-first 390px
**Depende de:** SPEC_CHARACTERS.md, SPEC_PLAYER_VIEW.md, SPEC_DATABASE.md

---

## 1. VISÃO GERAL

Durante a partida, o jogador usa o celular como ficha de personagem interativa — estilo jogo, não planilha. Tudo que muda durante o jogo (HP, esforço, spell slots, condições) atualiza em tempo real via Supabase Realtime. O Mestre pode aplicar dano e efeitos pelo painel GM, e o jogador vê instantaneamente.

O visual é inspirado em jogos como Witcher 3 e RPGs mobile — personagem centralizado, stats ao redor, ações na base. Escuro, denso, premium.

---

## 2. ESTRUTURA DE ABAS (substitui as 4 abas atuais)

O `PlayerGame` mantém navegação por abas no rodapé, mas o conteúdo de cada aba é redesenhado:

```
❤️ Status    ⚔️ Combate    📖 Magias    🎒 Mochila    📝 Notas
```

---

## 3. ABA STATUS (❤️) — Visão Principal

### 3.1 Layout geral
```
┌─────────────────────────────────┐
│  [Nome] · [Classe] · Nv.[X]     │  ← header compacto
│  [Raça] · [Alinhamento]         │
├─────────────────────────────────┤
│                                 │
│        [AVATAR 120px]           │  ← centralizado
│    condições como dots/badges   │
│                                 │
│  ┌──────┬──────┬──────┬──────┐  │
│  │  CA  │INIC. │ VEL  │PROF  │  ← 4 stats rápidos
│  └──────┴──────┴──────┴──────┘  │
├─────────────────────────────────┤
│  HP  ████████████░░░░  45/50    │  ← barra HP grande
│  [−] [campo editável] [+]       │  ← botões rápidos ±
│                                 │
│  ESFORÇO ████░░░░░░  32/40      │  ← barra esforço (dourada)
│  [−] [campo editável] [+]       │
└─────────────────────────────────┘
```

### 3.2 Campos do Header
- Nome do personagem (grande)
- Classe · Nível · Raça
- Alinhamento · Background (pequeno, cinza)

### 3.3 Avatar
- Imagem `avatar_url` ou inicial do nome
- 120x120px, bordas arredondadas, borda colorida por HP (verde/amarelo/vermelho)
- Condições ativas como dots coloridos ao redor do avatar (até 5, o restante como "+N")
- Ao tocar em um dot → bottom sheet com nome e descrição D&D 5e da condição

### 3.4 Stats Rápidos (4 blocos)
Grid 2x2 ou linha horizontal:
- **CA** — `character.ac`
- **Iniciativa** — `+X` calculado de DES
- **Velocidade** — `character.speed`m
- **Proficiência** — `+X` calculado por nível

### 3.5 HP e Esforço
**HP:**
- Barra larga com cor dinâmica (verde > 60%, amarelo 30-60%, vermelho < 30%, pulsante < 25%)
- Botão `−` e `+` (incrementos de 1) flanqueando campo editável
- Campo numérico editável inline
- Texto de status: "✦ Vida cheia", "🟢 Estável", "🟡 Ferido", "🔴 Estado crítico", "⚠ Inconsciente"

**Temp HP:**
- Campo menor abaixo do HP: `Temp HP: [campo]`

**Esforço (Homebrew):**
- Mesmo padrão visual do HP, cor dourada
- Campo `esforco` / `esforcoMax` em `characters.stats` (JSONB)

**Death saves (quando HP = 0):**
- 3 círculos de sucesso (verde) + 3 círculos de falha (vermelho)
- Jogador toca para marcar
- Persiste em `characters.death_saves`

### 3.6 Atributos
Grid 3x2 com os 6 atributos D&D:
```
FOR   DES   CON
INT   SAB   CAR
```
Cada bloco: valor grande + modificador calculado embaixo (`+2`, `−1` etc.)
Toque → bottom sheet com explicação do atributo e salvaguarda

### 3.7 Salvaguardas
Lista compacta com dot de proficiência:
- `● CON +5` (proficiente)
- `● INT +6` (proficiente)
- `○ FOR −1`
- etc.

---

## 4. ABA COMBATE (⚔️)

### 4.1 Ataques
Lista de ataques cadastrados pelo jogador:
```
┌────────────────────────────────┐
│  Punhos de Trovão              │
│  Corpo a corpo · Mágico        │
│  Bônus: +6      Dano: 1d8+3    │
└────────────────────────────────┘
```
- Nome, subtítulo, bônus de ataque, dado de dano
- Toque → bottom sheet com descrição completa
- GM pode ter adicionado ataques via painel

### 4.2 Habilidades Especiais
Lista de `character.skills.abilities`:
- Nome + tipo (Passiva/Ativa) + descrição
- Toque → bottom sheet

### 4.3 Astúcia Racial / Traços
Campo de texto livre: `character.skills.traits` (JSONB)

---

## 5. ABA MAGIAS (📖)

### 5.1 Dados de Conjuração
- CD de Magia: calculado `8 + prof + INT mod`
- Bônus de Ataque: `prof + INT mod`
- Atributo conjurador: INT (D&D 5e padrão)

### 5.2 Spell Slots
Grid por nível (1–9):
```
Nível 1: ● ● ● ○  (3 usados de 4)
Nível 2: ● ○      (1 usado de 2)
```
- Dots verdes = disponível, cinza/X = usado
- Toque no dot → marca como usado/disponível
- Persiste em `character.skills.spell_slots`

### 5.3 Lista de Feitiços
Agrupados por nível (Truques, 1º Círculo, 2º Círculo...):
```
TRUQUES
  ▸ Rajada Mágica — Ranged 18m · 1d10+3
  ▸ Luz — Objeto emite luz 9m
1º CÍRCULO
  ▸ ♦ Cura Ferimentos — Toque · 1d8+3
```
- Toque → bottom sheet com descrição completa, componentes, duração
- Feitiços de concentração marcados com badge especial
- `♦` indica feitiço que consome slot

---

## 6. ABA MOCHILA (🎒)

### 6.1 Grade de Equipamento + Inventário
Reusa o `InventoryGrid` já implementado em modo `editable={false}`:
- Slots de equipamento (14 slots)
- Grade 6x5 da mochila
- Peso atual / máximo (FOR × 15)
- Total de ouro

### 6.2 Itens Coletados (Lista simples)
Para itens sem slot visual (quest items, consumíveis simples):
- Nome + quantidade
- Campo editável pelo jogador
- Persiste em `character.inventory` (JSONB array)

---

## 7. ABA NOTAS (📝)

### 7.1 Notas de Sessão
Textarea livre — persiste em `character.notes`
Placeholder: "Pistas, decisões, eventos importantes..."

### 7.2 História do Personagem
Textarea — persiste em `character.backstory`
Colapsável (toque para expandir)

### 7.3 NPCs Encontrados
Lista editável: nome + relação + notas curtas
Persiste em `character.skills.npcs` (JSONB array)

### 7.4 Log do Personagem
Últimos 10 eventos de `session_events` relacionados ao personagem
Filtrado por `actor_id = character.owner_id` ou `payload.target_id = character.id`
Read-only

---

## 8. REALTIME

O componente escuta:

```typescript
supabase.channel(`player-sheet-${characterId}`)
  .on('postgres_changes', {
    event: 'UPDATE',
    table: 'characters',
    filter: `id=eq.${characterId}`
  }, () => refetchCharacter())
  .subscribe()
```

**Atualizações que chegam do GM:**
- HP reduzido → barra anima, número atualiza, texto de status muda
- Condição adicionada → dot aparece ao redor do avatar
- XP ganho → barra de XP avança
- Notificação → badge na aba de notificações

**Atualizações do próprio jogador (write direto):**
- HP editado inline → `update characters set hp=X`
- Spell slot marcado → `update characters set skills=...`
- Nota escrita → debounced 600ms → `update characters set notes=X`
- Death save marcado → `update characters set death_saves=...`

---

## 9. PERSISTÊNCIA — MAPEAMENTO DE CAMPOS

| Campo visual | Coluna no banco | Tipo |
|---|---|---|
| HP atual | `characters.hp` | integer |
| HP máximo | `characters.max_hp` | integer |
| HP temporário | `characters.temp_hp` | integer |
| CA | `characters.ac` | integer |
| Velocidade | `characters.speed` | integer |
| Iniciativa | calculado de DES | — |
| Proficiência | calculado de level | — |
| Atributos (6) | `characters.stats` | JSONB `{strength, dexterity...}` |
| Salvaguardas proficientes | `characters.skills.proficient_saves` | JSONB array |
| Esforço atual | `characters.stats.esforco` | JSONB |
| Esforço máximo | `characters.stats.esforco_max` | JSONB |
| Death saves | `characters.death_saves` | JSONB `{successes, failures}` |
| Spell slots | `characters.skills.spell_slots` | JSONB `{total[], used[]}` |
| Feitiços | `characters.spells` | JSONB array |
| Habilidades | `characters.skills.abilities` | JSONB array |
| Ataques | `characters.skills.attacks` | JSONB array |
| Condições | `characters.conditions` | text[] |
| Inventário | `characters.inventory` | JSONB array |
| Notas | `characters.notes` | text |
| Backstory | `characters.backstory` | text |
| NPCs encontrados | `characters.skills.npcs` | JSONB array |
| XP | `characters.xp` | integer |
| XP próximo nível | `characters.xp_next_level` | integer |
| Ouro | `characters.gold` | integer |

---

## 10. VISUAL — TOKENS DE DESIGN

```
Fundo: #0a0c10 (mais escuro que zinc-950)
Superfície: #0e1118
Borda: #1e2d3d
Azul: #4fa8e8 (stats, bônus)
Dourado: #c9a84c (esforço, destaque)
Verde: #4ecb8a (HP cheio, sucesso)
Vermelho: #e05050 (HP crítico, falha)
Roxo: #9b7fe8 (magias)
Texto: #d4e8f4
Texto dim: #5a7a8a
```

**Fonte para valores numéricos:** Georgia, serif (estilo RPG)
**Fonte para labels:** Rajdhani, sans-serif (estilo HUD)

**Animações:**
- HP muda → barra anima `transition: width 400ms ease-out`
- HP crítico → `animate-pulse` na borda do avatar
- Novo dano recebido → flash vermelho `opacity 0→0.4→0` em 600ms no card
- Level up → overlay fullscreen 3s (já implementado)

---

## 11. BOTTOM SHEETS

Componente reutilizável `<CharacterBottomSheet>`:
- Desliza de baixo para cima
- Overlay escuro com blur
- Handle de arrasto no topo
- Conteúdo: título, categoria, descrição, impacto (com borda colorida)
- Fecha ao tocar fora ou arrastar para baixo

Usado para:
- Detalhes de atributo/salvaguarda
- Descrição de feitiço
- Descrição de habilidade
- Descrição de condição
- Detalhes de ataque

---

## 12. ARQUIVOS A CRIAR/MODIFICAR

```
components/player/
├── PlayerCharacterSheet.tsx        ← orquestrador com 5 abas
├── PlayerSheetHeader.tsx           ← header com avatar + stats rápidos + HP
├── PlayerSheetTabStatus.tsx        ← substitui PlayerTabStatus
├── PlayerSheetTabCombat.tsx        ← ataques + habilidades
├── PlayerSheetTabSpells.tsx        ← feitiços + spell slots
├── PlayerSheetTabInventory.tsx     ← mochila + itens (reusa InventoryGrid)
├── PlayerSheetTabNotes.tsx         ← notas + NPCs + log + backstory
├── PlayerBottomSheet.tsx           ← sheet deslizante reutilizável
└── PlayerHpBar.tsx                 ← barra HP/Esforço reutilizável

app/play/[session_id]/page.tsx      ← integra PlayerCharacterSheet
```

---

## 13. REGRAS DE NEGÓCIO

- Jogador edita apenas o próprio personagem (RLS garante)
- GM pode sobrescrever qualquer campo via painel (já implementado)
- Notas salvam com debounce de 600ms
- Spell slots salvam imediatamente ao tocar
- HP salva imediatamente (otimismo no client)
- Se GM e jogador editarem HP ao mesmo tempo → última escrita vence (last-write-wins)
- Condições são read-only para o jogador (apenas GM adiciona/remove)
- Death saves são editáveis pelo jogador quando HP = 0

---

## 14. FORA DE ESCOPO NESTE SPEC

- Rolagem de dados integrada (o dado fica no painel do GM)
- Chat entre jogadores
- Histórico de dano (está no log de eventos)
- Edição de ataques/feitiços durante a partida (feito no wizard de criação)
