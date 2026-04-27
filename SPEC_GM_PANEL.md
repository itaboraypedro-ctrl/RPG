# SPEC_GM_PANEL.md
## GM Controller — Painel do Mestre
**Versão:** 1.0
**Stack:** Next.js App Router, Supabase, Supabase Realtime, Claude API
**Depende de:** SPEC_DATABASE.md, SPEC_AUTH.md, SPEC_SESSION.md, SPEC_STORY_BANK.md
**Rota:** `/dashboard/sessions/[id]/play` (substitui o stub atual)

---

## 1. VISÃO GERAL

O Painel do Mestre é o centro de controle durante uma partida ativa. É uma interface desktop-first, densa e altamente interativa — tudo clicável e editável em tempo real. Organizado em **3 colunas fixas** com scroll independente.

Toda ação do GM que afeta jogadores passa por um **seletor de destino** — o GM escolhe se a ação vai para: todos os jogadores, jogadores específicos, ou apenas para o seu próprio dispositivo (sem notificar ninguém).

---

## 2. LAYOUT GERAL

```
┌─────────────────┬─────────────────┬─────────────────┐
│   COLUNA 1      │   COLUNA 2      │   COLUNA 3      │
│  Combate &      │  Cenário &      │  Log            │
│  Personagens    │  Ambientação    │  ─────────────  │
│                 │                 │  História       │
│                 │                 │  ─────────────  │
│                 │                 │  Chat com IA    │
└─────────────────┴─────────────────┴─────────────────┘
```

- **Layout:** `grid-cols-3` fixo, altura `100vh`, sem overflow no container principal
- **Cada coluna:** scroll independente (`overflow-y-auto`)
- **Header global:** barra superior com título da sessão, rodada, status, e controles rápidos
- **Mobile:** colapsa para abas (uma aba por coluna) — mas o design primário é desktop

---

## 3. HEADER GLOBAL

Barra fixa no topo, altura compacta.

**Elementos:**
- Nome da sessão
- Badge de status com dot pulsante (ativa/pausada)
- Contador de rodada: `Rodada X` com botões `−` e `+`
- Timer de sessão (cronômetro crescente desde o `session_start`)
- Botões de controle: `Pausar` / `Retomar` / `Encerrar partida`
- Botão `Voltar ao Lobby`

**Ações de controle** chamam o `updateStatus` já implementado em `actions.ts`.

---

## 4. COLUNA 1 — COMBATE E PERSONAGENS

### 4.1 Ordem de Iniciativa
- Lista de todos os combatentes (players + NPCs) ordenada por `initiative` decrescente
- Botão "Próximo turno" — avança o turno ativo (highlight visual no combatente atual)
- Turno ativo destacado com borda colorida
- GM pode reordenar arrastando ou editando o valor de iniciativa inline
- Botão "Rolar iniciativa" — gera valores aleatórios para todos (d20 + modificador)

### 4.2 Cards de Jogadores
Para cada `character` vinculado à sessão:

**Exibe:**
- Avatar (imagem ou inicial do nome)
- Nome do personagem + classe
- **Barra de HP** com valores atuais e máximos
- HP atual (editável inline)
- Condições ativas (badges clicáveis para remover)
- AC e nível visíveis

**Ações do GM:**
- **Aplicar dano:** slider (0–200) + campo de texto numérico (ambos sincronizados) + botão `Aplicar`
- **Curar:** mesmo padrão do dano com botão `Curar`
- **Adicionar condição:** dropdown com lista de condições padrão D&D
- **Death saves:** toggle de sucessos/falhas quando HP = 0
- Cada ação tem **seletor de destino** antes de confirmar

### 4.3 NPCs e Inimigos
Seção separada abaixo dos jogadores.

**NPCs do template:** carregados automaticamente do `story_templates.content.npcs`
**Inimigos criados na hora:** GM pode adicionar inline com nome, HP máximo e AC

**Card de NPC/Inimigo:**
- Nome + papel (para NPCs do template) ou tipo (para inimigos)
- Barra de HP
- HP editável inline
- Botão `Derrotado` — marca como morto/inconsciente
- Botão `Remover`

**Criar inimigo inline:**
- Input de nome, HP max, AC
- Botão `+ Adicionar à batalha`

---

## 5. COLUNA 2 — CENÁRIO E AMBIENTAÇÃO

### 5.1 Imagem do Ambiente
- Exibe a imagem atualmente ativa (ou placeholder "Nenhuma cena ativa")
- Galeria das imagens da `media_library` do GM (filtro por category: `illustration`, `map`)
- Clique na imagem → confirma destino → atualiza `session_media_state.current_image`
- Toggle "Modo mapa" — alterna entre `illustration` e `map` no filtro
- Botão `Limpar imagem`

### 5.2 Música Ambiente
- Player de controle: título da faixa ativa, botões `▶ Play` / `⏸ Pause` / `⏹ Stop`
- Volume slider
- Toggle `Loop`
- Galeria das músicas da `media_library` (category: `music`)
- Clique na faixa → confirma destino → atualiza `session_media_state.current_audio`
- Faixa ativa destacada

### 5.3 Sons e Efeitos Sonoros
- Grid de botões de sons rápidos (category: `sfx` e `ambient`)
- Cada botão: ícone/nome do som + botão de play instantâneo
- Múltiplos sons podem tocar simultaneamente
- Destino configurável por som

### 5.4 Sugestões de Trilha do Template
- Lista de `music_cues` do template ativo (cena + sugestão)
- Referência visual para o GM — não tem playback direto, apenas guia

---

## 6. COLUNA 3 — LOG, HISTÓRIA E IA

### 6.1 Log de Eventos
- Feed em tempo real de todos os `session_events` da sessão
- Eventos recentes no topo (scroll invertido)
- Cada evento: ícone por tipo, descrição, timestamp, quem causou
- Filtro rápido: Combate / Cena / Sistema / Todos
- Eventos marcados como `is_public = true` mostram badge "Visível aos players"

### 6.2 História
- Exibe o conteúdo do template da sessão em formato navegável
- Tabs: `Sinopse` / `Atos` / `NPCs` / `Locais`
- GM pode adicionar **anotações privadas** inline (salvas em `sessions.ai_context.story_summary`)
- Botão "Avançar ato" — destaca o ato atual visualmente

### 6.3 Chat com IA
- Campo de texto para o GM digitar uma pergunta/pedido
- Contexto enviado automaticamente com cada mensagem:
  - Status atual da sessão
  - HP de todos os personagens
  - Último evento do log
  - Ato atual da história
- Respostas da IA aparecem em balões no chat
- Histórico da conversa mantido durante a sessão (não persiste entre sessões)
- Sugestões rápidas (chips clicáveis): `"Descreva esta cena"` / `"Sugira um NPC"` / `"O que acontece se..."` / `"Crie um encontro"`
- Cada chamada registrada em `ai_requests` com `type = 'gm_suggestion'`

---

## 7. SELETOR DE DESTINO

Componente reutilizável usado em todas as ações que afetam jogadores.

```typescript
type Destination =
  | { type: 'gm_only' }           // apenas aparece no painel do GM
  | { type: 'all' }               // todos os jogadores
  | { type: 'specific'; playerIds: string[] }  // jogadores específicos
```

**UI:** dropdown ou modal compacto com:
- Opção "Apenas eu" (GM only)
- Opção "Todos os jogadores"
- Lista de jogadores com checkboxes para seleção individual

**Comportamento:**
- Ações com destino `gm_only` → não criam `notification`, não atualizam estado público
- Ações com destino `all` ou `specific` → criam `notification` para os targets + atualizam estado via Realtime
- Default configurável por tipo de ação (dano → default `all`, som → default `all`, imagem → default `all`)

---

## 8. REALTIME NO PAINEL

O painel escuta mudanças em tempo real:

```typescript
// Canal da sessão — escuta tudo
supabase.channel(`gm-panel-${sessionId}`)
  .on('postgres_changes', { table: 'characters', filter: `session_id=eq.${sessionId}` }, ...)
  .on('postgres_changes', { table: 'session_events', filter: `session_id=eq.${sessionId}` }, ...)
  .on('postgres_changes', { table: 'session_media_state', filter: `session_id=eq.${sessionId}` }, ...)
  .subscribe()
```

---

## 9. INTEGRAÇÃO COM IA

**Endpoint:** `POST /api/ai/gm-assistant`

**Request:**
```typescript
{
  message: string,
  context: {
    session_title: string,
    current_act: string,
    characters: { name: string, hp: number, max_hp: number, conditions: string[] }[],
    last_events: string[],
    story_synopsis: string
  }
}
```

**System prompt:**
```
Você é um assistente de RPG de mesa para o Mestre da partida.
Você tem acesso ao estado atual da sessão.
Seja conciso, criativo e útil. Respostas máximo de 3 parágrafos.
Foque em sugestões práticas que o Mestre pode usar imediatamente.
Responda sempre em português.
```

**Registro em `ai_requests`:** `type = 'gm_suggestion'`

---

## 10. ROTAS E ARQUIVOS

```
app/dashboard/sessions/[id]/play/
└── page.tsx                          ← substitui o stub (Server Component)

components/gm-panel/
├── GmPanel.tsx                       ← orquestrador principal (Client)
├── GmPanelHeader.tsx                 ← header global com controles
├── Column1Combat.tsx                 ← coluna 1 completa
├── InitiativeTracker.tsx             ← ordem de iniciativa
├── CharacterCard.tsx                 ← card de jogador
├── NpcCard.tsx                       ← card de NPC/inimigo
├── AddNpcForm.tsx                    ← formulário inline de inimigo
├── Column2Scene.tsx                  ← coluna 2 completa
├── ImageControl.tsx                  ← controle de imagem
├── AudioControl.tsx                  ← controle de música
├── SfxGrid.tsx                       ← grid de efeitos sonoros
├── Column3Narrative.tsx              ← coluna 3 completa
├── EventLog.tsx                      ← log de eventos em tempo real
├── StoryViewer.tsx                   ← visualizador da história
├── AiChat.tsx                        ← chat com IA
└── DestinationPicker.tsx             ← seletor de destino reutilizável

app/api/ai/
└── gm-assistant/
    └── route.ts                      ← handler do chat com IA
```

---

## 11. REGRAS DE NEGÓCIO

- Painel só acessível se `session.status = 'active'` ou `'paused'`
- Quando pausado, todas as ações ficam desabilitadas exceto "Retomar" e navegação
- HP nunca vai abaixo de 0
- Ao aplicar dano fatal (HP = 0), sugere ativar death saves automaticamente
- NPCs criados na hora têm `session_id` mas não `owner_id` (são do GM)
- Contador de rodadas persiste em `sessions.current_round`
- Avançar ato persiste em `sessions.current_scene`
- Todas as mutações de `characters` geram evento em `session_events`

---

## 12. ESTADOS DE UI

| Estado | Comportamento |
|---|---|
| Sessão pausada | Overlay semitransparente nas colunas + badge "PAUSADA" |
| HP crítico (< 25%) | Barra de HP vermelha pulsante |
| HP zero | Card do personagem com overlay de morte |
| Som tocando | Botão com animação de onda sonora |
| Imagem ativa | Thumbnail com borda colorida |
| IA respondendo | Bolha de "digitando..." no chat |
| Ação pendente | Botão disabled + spinner |
