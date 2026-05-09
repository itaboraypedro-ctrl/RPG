# SPEC_PLAYER_VIEW.md
## GM Controller — Visão do Jogador
**Versão:** 1.0
**Stack:** Next.js App Router, Supabase Realtime, mobile-first
**Depende de:** SPEC_DATABASE.md, SPEC_AUTH.md, SPEC_SESSION.md, SPEC_CHARACTERS.md
**Rotas principais:** `/play/[session_id]` e `/play/characters/[id]`

---

## 1. VISÃO GERAL

A visão do jogador é a interface que o jogador usa no celular durante a partida. É mobile-first, simples e direta — o jogador precisa ver o que importa de forma rápida: HP, condições, o que está acontecendo, notificações do GM e seu inventário.

Tudo atualiza em tempo real via Supabase Realtime. Quando o GM aplica dano, a barra de HP cai instantaneamente na tela do jogador. Quando o GM muda a cena ou toca uma música, o jogador recebe.

---

## 2. FLUXO DE ENTRADA DO JOGADOR

```
Jogador recebe link /join/[invite_code]
    → Se não logado: /login?redirect=/join/[invite_code]
    → Se logado: entra na sessão (já implementado em SPEC_SESSION)
    → Redireciona para /play/[session_id]
```

Na rota `/play/[session_id]` o jogador vê:
- Se sessão está em `lobby` → tela de espera
- Se sessão está `active` ou `paused` → interface de jogo
- Se sessão está `finished` → tela de encerramento com resumo

---

## 3. TELA DE ESPERA (lobby)

**Rota:** `/play/[session_id]` com `session.status = 'lobby'`

- Avatar e nome da sessão
- Mensagem: "Aguardando o Mestre iniciar a partida..."
- Lista de jogadores já no lobby (nomes e avatares)
- Botão "Selecionar personagem" → `/play/characters/select?session=[id]`
- Atualiza em tempo real quando GM inicia → redireciona automaticamente para a visão de jogo

---

## 4. INTERFACE DE JOGO — ABAS

**Rota:** `/play/[session_id]` com `session.status = 'active' | 'paused'`

Layout mobile com **4 abas no rodapé**:

| Aba | Ícone | Conteúdo |
|---|---|---|
| Status | ❤️ | HP, condições, stats rápidos, death saves |
| Mundo | 🌍 | Cena atual, imagem do ambiente, música |
| Inventário | 🎒 | Grade de inventário compacta |
| Notificações | 🔔 | Feed de notificações do GM |

---

## 5. ABA STATUS (❤️)

### 5.1 Header do Personagem
- Avatar grande (se houver)
- Nome, classe, nível, raça
- Alinhamento e background

### 5.2 HP em Destaque
- Número grande e barra animada
- Cor: verde > 60%, amarelo 30-60%, vermelho < 30%, pulsante < 25%
- HP atual editável pelo jogador (input inline)
- Temp HP separado

### 5.3 Stats Rápidos
Grid compacto:
- CA / Iniciativa / Velocidade
- FOR / DES / CON / INT / SAB / CAR com modificadores

### 5.4 Condições Ativas
- Badges coloridos com nome da condição
- Ao clicar: abre tooltip com descrição da condição D&D 5e

### 5.5 Death Saves
- Visível quando HP = 0
- 3 círculos de sucesso (verde) + 3 círculos de falha (vermelho)
- Jogador pode marcar os próprios death saves

### 5.6 XP e Progressão
- Barra de XP com valor atual / próximo nível
- Badge de nível

### 5.7 Spell Slots
- Grid compacto de spell slots (níveis 1-9)
- Jogador pode marcar slots usados

---

## 6. ABA MUNDO (🌍)

### 6.1 Imagem da Cena
- Imagem atual de `session_media_state.current_image`
- Ocupa a maior parte da tela
- Caption da imagem se houver
- Se não houver imagem: placeholder com nome da cena atual

### 6.2 Música Ambiente
- Título da faixa atual
- Indicador visual de "tocando" (animação de onda)
- Player de áudio com controle de volume (apenas local — não afeta outros)

### 6.3 Cena Atual
- Nome do ato/cena atual (`session.current_scene`)
- Descrição do ato atual (do template, se houver)

### 6.4 Log Público
- Últimos 10 eventos com `is_public = true`
- Feed simples com ícone + descrição + timestamp

---

## 7. ABA INVENTÁRIO (🎒)

- Grade de inventário compacta (versão menor do `InventoryGrid`)
- Slots de equipamento visíveis
- Mochila compacta (4x5 = 20 slots visíveis, scroll para mais)
- Jogador pode arrastar itens (se GM permitir na sessão)
- Itens com tooltip de detalhes ao segurar
- Total de peso / máximo

---

## 8. ABA NOTIFICAÇÕES (🔔)

- Feed de `notifications` direcionadas ao jogador (`target_id = user.id` ou `target_id IS NULL`)
- Cada notificação: tipo (badge colorido), título, mensagem, timestamp
- Marcar como lida ao clicar
- Badge com contador de não lidas no ícone da aba
- Tipos e cores:
  - `info` → azul
  - `warning` → amarelo
  - `combat` → vermelho
  - `item` → dourado
  - `level_up` → roxo pulsante
  - `custom` → zinc

---

## 9. REALTIME DO JOGADOR

Canal único por sessão:

```typescript
supabase.channel(`player-view-${sessionId}`)
  .on('postgres_changes', {
    table: 'characters',
    filter: `id=eq.${characterId}`
  }, refetchCharacter)
  .on('postgres_changes', {
    table: 'session_media_state',
    filter: `session_id=eq.${sessionId}`
  }, handleMediaChange)
  .on('postgres_changes', {
    table: 'sessions',
    filter: `id=eq.${sessionId}`
  }, handleSessionChange)
  .on('postgres_changes', {
    event: 'INSERT',
    table: 'notifications',
    filter: `session_id=eq.${sessionId}`
  }, handleNewNotification)
  .subscribe()
```

**Comportamentos especiais:**
- `session.status` muda para `active` → se estava em lobby, anima transição para jogo
- `session.status` muda para `finished` → redireciona para `/play/[session_id]/summary`
- `session.status` muda para `paused` → overlay "Partida pausada" semitransparente
- Nova notificação com `vibrate = true` → `navigator.vibrate(200)` no mobile
- Nova notificação `level_up` → animação especial

---

## 10. SELEÇÃO DE PERSONAGEM

**Rota:** `/play/characters/select?session=[id]`

- Lista os personagens do jogador (`characters` com `owner_id = user.id`)
- Card por personagem: avatar, nome, classe, nível
- Botão "Usar este personagem" → `update characters set session_id = [id]`
- Botão "Criar novo personagem" → `/play/characters/new`
- Se personagem já vinculado a outra sessão ativa → aviso

---

## 11. TELA DE ENCERRAMENTO

**Rota:** `/play/[session_id]/summary`

- "A partida encerrou!"
- Resumo da sessão: duração, eventos principais, dano sofrido/causado
- XP ganho na sessão
- Itens recebidos
- Botão "Voltar ao início"

---

## 12. ROTAS

```
/play/[session_id]                    → visão principal (lobby ou jogo)
/play/[session_id]/summary            → encerramento
/play/characters/select               → seleção de personagem
/play/characters/new                  → criar personagem (já existe)
/play/characters/[id]                 → ver/editar personagem fora de sessão
```

---

## 13. COMPONENTES

```
app/play/[session_id]/
├── page.tsx                          ← Server: fetch session + char + redirect logic
└── summary/
    └── page.tsx                      ← tela de encerramento

app/play/characters/
├── select/
│   └── page.tsx                      ← seleção de personagem
└── [id]/
    └── page.tsx                      ← ver/editar personagem

components/player/
├── PlayerView.tsx                    ← orquestrador client com realtime
├── PlayerLobby.tsx                   ← tela de espera
├── PlayerGame.tsx                    ← interface de jogo com abas
├── PlayerTabStatus.tsx               ← aba de status/HP
├── PlayerTabWorld.tsx                ← aba de cena/mídia
├── PlayerTabInventory.tsx            ← aba de inventário compacto
├── PlayerTabNotifications.tsx        ← aba de notificações
├── PlayerSummary.tsx                 ← tela de encerramento
└── CharacterSelectCard.tsx           ← card de seleção de personagem
```

---

## 14. REGRAS DE NEGÓCIO

- Jogador só acessa `/play/[session_id]` se estiver em `session_players` com status `invited` ou `joined`
- Jogador pode editar apenas o próprio HP e spell slots (campos de jogo) — RLS garante
- GM pode editar qualquer campo do personagem via painel (já implementado)
- Notificações com `target_id IS NULL` são broadcast para todos — jogador vê mesmo sem ser target direto
- Vibração funciona apenas em mobile com `navigator.vibrate` disponível
- Player sem personagem vinculado vê prompt para selecionar/criar
- Múltiplos personagens do mesmo jogador na mesma sessão não é permitido (constraint na seleção)

---

## 15. ESTADOS DE UI

| Estado | Comportamento |
|---|---|
| Sessão em lobby | Tela de espera com lista de jogadores |
| Sessão pausada | Overlay "Partida pausada" + conteúdo visível mas inativo |
| HP crítico | Borda da tela vermelha pulsante |
| HP zero | Tela escurecida + death saves em destaque |
| Notificação nova | Badge animado + vibração se configurado |
| Level up | Animação especial fullscreen por 3s |
| Sessão encerrada | Redirect automático para summary |
| Sem personagem | Prompt para selecionar ou criar |
