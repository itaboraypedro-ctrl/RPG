# SPEC_SESSION.md
## GM Controller — Sessões de Jogo
**Versão:** 1.0
**Stack:** Next.js App Router, Supabase, Supabase Realtime
**Depende de:** SPEC_DATABASE.md (tabelas `sessions`, `session_players`, `session_media_state`), SPEC_AUTH.md, SPEC_STORY_BANK.md

---

## 1. VISÃO GERAL

Uma sessão é uma partida de RPG em andamento ou arquivada. O GM cria a sessão, define as configurações, convida os jogadores via link e controla o ciclo de vida da partida (lobby → ativa → pausada → encerrada).

Cada sessão é completamente isolada — múltiplas sessões podem rodar simultaneamente com GMs e jogadores distintos.

---

## 2. CICLO DE VIDA DE UMA SESSÃO

```
lobby → active → paused → active → finished
                              ↑________↓
```

| Status | Descrição |
|---|---|
| `lobby` | Sessão criada, aguardando jogadores. GM pode configurar. |
| `active` | Partida em andamento. Painel do GM ativo. |
| `paused` | Partida pausada. Estado preservado. |
| `finished` | Partida encerrada. Somente leitura. Resumo disponível. |

---

## 3. FUNCIONALIDADES

### 3.1 Listagem de Sessões (`/dashboard/sessions`)
- Lista todas as sessões do GM logado
- Cards com: título, status (badge colorido), data, número de jogadores, template usado
- Filtro por status
- Botão "Nova sessão" no topo
- Estado vazio: "Nenhuma sessão ainda. Crie sua primeira partida."

**Badges de status:**
- `lobby` → cinza — "Lobby"
- `active` → verde pulsante — "Ativa"
- `paused` → amarelo — "Pausada"
- `finished` → zinc — "Encerrada"

### 3.2 Criar Sessão (`/dashboard/sessions/new`)
Formulário simples (não wizard):

**Campos:**
- Título (obrigatório)
- Descrição (opcional)
- Template (select — lista templates do GM + opção "Sem template")
- Configurações:
  - Máximo de jogadores (número, default 6)
  - Permitir criar personagem na hora (toggle, default true)
  - Sistema de XP ativo (toggle, default true)
  - Death saves ativo (toggle, default true)
  - Assistente de IA ativo (toggle, default true)

Ao salvar:
- Cria registro em `sessions` com `status = 'lobby'`
- Trigger cria automaticamente o `session_media_state`
- Redireciona para `/dashboard/sessions/[id]`

### 3.3 Lobby da Sessão (`/dashboard/sessions/[id]`)
Página de pré-partida. Exibe:

**Header:**
- Título da sessão
- Status badge
- Botão "Iniciar partida" (muda status para `active`, redireciona para `/dashboard/sessions/[id]/play`)

**Link de convite:**
- URL completa: `[APP_URL]/join/[invite_code]`
- Botão de copiar
- QR Code (opcional — gera a partir da URL)

**Jogadores no lobby:**
- Lista de `session_players` com status `invited` ou `joined`
- Para cada jogador: nome, status, personagem selecionado (se houver)
- GM pode remover jogador (muda status para `kicked`)

**Configurações:**
- Exibe as configurações definidas na criação
- Botão "Editar configurações"

**Ações:**
- "Iniciar partida" → status = `active`
- "Cancelar sessão" → status = `finished` (com confirmação)

### 3.4 Editar Sessão (`/dashboard/sessions/[id]/edit`)
- Mesmo formulário da criação, pré-populado
- Não permite editar se status = `active` (redireciona para o painel)
- Não permite editar se status = `finished`

### 3.5 Painel de Jogo (`/dashboard/sessions/[id]/play`)
**Apenas o stub por agora** — página placeholder que exibe o título da sessão e "Painel do GM em construção". O SPEC_GM_PANEL vai preencher essa página completamente.

Proteção: só acessível se `status = 'active'` ou `status = 'paused'`. Caso contrário redireciona para `/dashboard/sessions/[id]`.

---

## 4. REALTIME NO LOBBY

O lobby escuta mudanças em tempo real em `session_players` para atualizar a lista de jogadores sem recarregar a página.

```typescript
supabase
  .channel(`session-lobby-${sessionId}`)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'session_players',
    filter: `session_id=eq.${sessionId}`
  }, handleChange)
  .subscribe()
```

---

## 5. ROTAS

```
/dashboard/sessions                  → listagem
/dashboard/sessions/new              → criar
/dashboard/sessions/[id]             → lobby
/dashboard/sessions/[id]/edit        → editar
/dashboard/sessions/[id]/play        → painel de jogo (stub)
```

---

## 6. COMPONENTES

```
app/dashboard/sessions/
├── page.tsx                          ← listagem
├── new/
│   └── page.tsx                      ← criar
└── [id]/
    ├── page.tsx                      ← lobby
    ├── edit/
    │   └── page.tsx                  ← editar
    └── play/
        └── page.tsx                  ← stub do painel

components/sessions/
├── SessionCard.tsx                   ← card da listagem
├── SessionsList.tsx                  ← listagem com filtro
├── SessionForm.tsx                   ← formulário criar/editar
├── SessionLobby.tsx                  ← página do lobby (client — realtime)
└── InviteLink.tsx                    ← componente de link de convite

app/dashboard/sessions/[id]/
└── actions.ts                        ← server actions (updateStatus, kickPlayer)
```

---

## 7. REGRAS DE NEGÓCIO

- Apenas GM e admin acessam `/dashboard/sessions`
- GM só vê/edita suas próprias sessões (RLS já garante)
- Não é possível iniciar uma sessão sem pelo menos 1 jogador no lobby (warning, não bloqueio)
- Não é possível voltar de `finished` para qualquer outro status
- `invite_code` é gerado automaticamente pelo trigger e não pode ser alterado
- Ao iniciar (`active`), registra evento `session_start` em `session_events`
- Ao encerrar (`finished`), registra evento `session_end` em `session_events`
- Ao pausar (`paused`), registra evento `session_pause` em `session_events`

---

## 8. ESTADOS DE UI

| Estado | O que mostrar |
|---|---|
| Carregando lista | Skeleton cards |
| Lista vazia | Ícone + mensagem + CTA |
| Salvando sessão | Botão disabled + "Salvando..." |
| Iniciando partida | Botão disabled + "Iniciando..." |
| Copiando link | Feedback "Copiado!" por 2 segundos |
| Jogador entrou no lobby | Lista atualiza em tempo real |

---

## 9. ARQUIVOS A CRIAR

```
app/dashboard/sessions/page.tsx
app/dashboard/sessions/new/page.tsx
app/dashboard/sessions/[id]/page.tsx
app/dashboard/sessions/[id]/edit/page.tsx
app/dashboard/sessions/[id]/play/page.tsx
app/dashboard/sessions/[id]/actions.ts
components/sessions/SessionCard.tsx
components/sessions/SessionsList.tsx
components/sessions/SessionForm.tsx
components/sessions/SessionLobby.tsx
components/sessions/InviteLink.tsx
```
