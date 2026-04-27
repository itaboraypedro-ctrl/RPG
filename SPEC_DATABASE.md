# SPEC_DATABASE.md
## GM Controller — Arquitetura de Banco de Dados
**Versão:** 1.0  
**Stack:** Supabase (PostgreSQL) + Row Level Security (RLS)  
**Princípios:** Multi-tenancy por sessão, IA integrada, tempo real via Supabase Realtime

---

## 1. VISÃO GERAL

Toda a plataforma é organizada em torno de três conceitos centrais:

- **Profile** — quem é o usuário (Admin, GM, Jogador)
- **Session** — uma partida ativa ou arquivada, sempre pertencente a um GM
- **Character** — o personagem de um jogador dentro de uma sessão

Múltiplas sessões podem rodar simultaneamente. O isolamento de dados é garantido por RLS — cada usuário só acessa dados das sessões às quais pertence.

---

## 2. TABELAS

### 2.1 `profiles`
Extensão do `auth.users` do Supabase. Criada automaticamente via trigger no cadastro.

```sql
profiles
├── id              uuid PRIMARY KEY REFERENCES auth.users(id)
├── display_name    text NOT NULL
├── avatar_url      text
├── role            text NOT NULL DEFAULT 'player' CHECK (role IN ('admin', 'gm', 'player'))
├── created_at      timestamptz NOT NULL DEFAULT now()
└── updated_at      timestamptz NOT NULL DEFAULT now()
```

**Regras:**
- Todo usuário nasce com role `player`
- Role `gm` é concedido pelo Admin ou auto-atribuído (configurável)
- Role `admin` só pode ser atribuído via service role

---

### 2.2 `story_templates`
Banco de histórias/modelos criados pelos GMs. Reutilizáveis em múltiplas sessões.

```sql
story_templates
├── id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
├── gm_id           uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE
├── title           text NOT NULL
├── description     text NOT NULL DEFAULT ''
├── genre           text NOT NULL DEFAULT 'fantasy' CHECK (genre IN ('fantasy', 'sci-fi', 'horror', 'western', 'modern', 'custom'))
├── cover_image_url text
├── content         jsonb NOT NULL DEFAULT '{}'
│   ├── synopsis        text        — Resumo da história
│   ├── acts            jsonb[]     — Atos/capítulos estruturados
│   ├── npcs            jsonb[]     — NPCs pré-definidos
│   ├── locations       jsonb[]     — Locais do cenário
│   ├── items           jsonb[]     — Itens e tesouros
│   └── music_cues      jsonb[]     — Trilha sonora sugerida por cena
├── ai_generated    boolean NOT NULL DEFAULT false
├── is_public       boolean NOT NULL DEFAULT false
├── tags            text[] NOT NULL DEFAULT '{}'
├── created_at      timestamptz NOT NULL DEFAULT now()
└── updated_at      timestamptz NOT NULL DEFAULT now()
```

---

### 2.3 `sessions`
Uma partida — pode estar em qualquer estado do ciclo de vida.

```sql
sessions
├── id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
├── gm_id           uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE
├── template_id     uuid REFERENCES story_templates(id) ON DELETE SET NULL
├── title           text NOT NULL
├── description     text NOT NULL DEFAULT ''
├── status          text NOT NULL DEFAULT 'lobby' CHECK (status IN ('lobby', 'active', 'paused', 'finished'))
├── invite_code     text NOT NULL UNIQUE DEFAULT substr(md5(random()::text), 1, 8)
├── current_round   integer NOT NULL DEFAULT 0
├── current_scene   text NOT NULL DEFAULT ''
├── settings        jsonb NOT NULL DEFAULT '{}'
│   ├── max_players         integer     — Limite de jogadores
│   ├── allow_new_chars     boolean     — Permite criar personagem na hora
│   ├── xp_enabled          boolean     — Sistema de XP ativo
│   ├── death_saves         boolean     — Usa saving throws de morte
│   └── ai_assistant        boolean     — IA de suporte ativa
├── ai_context      jsonb NOT NULL DEFAULT '{}'
│   ├── story_summary       text        — Resumo acumulado pela IA
│   ├── key_events          jsonb[]     — Eventos marcantes registrados
│   └── npc_memory          jsonb[]     — Memória de NPCs pela IA
├── created_at      timestamptz NOT NULL DEFAULT now()
└── updated_at      timestamptz NOT NULL DEFAULT now()
```

---

### 2.4 `session_players`
Tabela de junção — quais jogadores estão em qual sessão.

```sql
session_players
├── id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
├── session_id      uuid NOT NULL REFERENCES sessions(id) ON DELETE CASCADE
├── player_id       uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE
├── status          text NOT NULL DEFAULT 'invited' CHECK (status IN ('invited', 'joined', 'left', 'kicked'))
├── joined_at       timestamptz
├── created_at      timestamptz NOT NULL DEFAULT now()
└── UNIQUE(session_id, player_id)
```

---

### 2.5 `characters`
Personagens salvos — pertencem a um jogador, podem ser usados em sessões.

```sql
characters
├── id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
├── owner_id        uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE
├── session_id      uuid REFERENCES sessions(id) ON DELETE SET NULL   — NULL = personagem salvo fora de sessão
├── name            text NOT NULL
├── class           text NOT NULL DEFAULT ''
├── race            text NOT NULL DEFAULT ''
├── level           integer NOT NULL DEFAULT 1
├── hp              integer NOT NULL DEFAULT 10
├── max_hp          integer NOT NULL DEFAULT 10
├── temp_hp         integer NOT NULL DEFAULT 0
├── ac              integer NOT NULL DEFAULT 10
├── initiative      integer NOT NULL DEFAULT 0
├── speed           integer NOT NULL DEFAULT 30
├── xp              integer NOT NULL DEFAULT 0
├── xp_next_level   integer NOT NULL DEFAULT 300
├── gold            integer NOT NULL DEFAULT 0
├── conditions      text[] NOT NULL DEFAULT '{}'
├── death_saves     jsonb NOT NULL DEFAULT '{"successes": 0, "failures": 0}'
├── stats           jsonb NOT NULL DEFAULT '{}'
│   ├── strength        integer
│   ├── dexterity       integer
│   ├── constitution    integer
│   ├── intelligence    integer
│   ├── wisdom          integer
│   └── charisma        integer
├── skills          jsonb NOT NULL DEFAULT '{}'
├── inventory       jsonb NOT NULL DEFAULT '[]'
├── spells          jsonb NOT NULL DEFAULT '[]'
├── backstory       text NOT NULL DEFAULT ''
├── notes           text NOT NULL DEFAULT ''
├── avatar_url      text
├── ai_summary      text NOT NULL DEFAULT ''   — Resumo do personagem gerado por IA
├── created_at      timestamptz NOT NULL DEFAULT now()
└── updated_at      timestamptz NOT NULL DEFAULT now()
```

---

### 2.6 `session_events`
Log de tudo que acontece em uma sessão. Base para o resumo de IA e histórico.

```sql
session_events
├── id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
├── session_id      uuid NOT NULL REFERENCES sessions(id) ON DELETE CASCADE
├── actor_id        uuid REFERENCES profiles(id) ON DELETE SET NULL   — quem causou o evento (NULL = sistema/IA)
├── type            text NOT NULL CHECK (type IN (
│                       'combat_damage', 'combat_heal', 'combat_kill',
│                       'condition_added', 'condition_removed',
│                       'round_start', 'round_end',
│                       'scene_change', 'media_play', 'media_stop',
│                       'item_given', 'item_removed',
│                       'xp_gained', 'level_up',
│                       'player_joined', 'player_left',
│                       'gm_note', 'player_note',
│                       'ai_suggestion', 'ai_illustration',
│                       'session_start', 'session_pause', 'session_end'
│                   ))
├── payload         jsonb NOT NULL DEFAULT '{}'   — dados específicos do evento
├── round           integer
├── is_public       boolean NOT NULL DEFAULT false   — visível para jogadores?
├── created_at      timestamptz NOT NULL DEFAULT now()
```

**Índices:**
```sql
CREATE INDEX ON session_events(session_id, created_at DESC);
CREATE INDEX ON session_events(session_id, type);
```

---

### 2.7 `media_library`
Sons, imagens e vídeos que o GM pode usar durante as partidas.

```sql
media_library
├── id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
├── owner_id        uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE
├── type            text NOT NULL CHECK (type IN ('audio', 'image', 'video'))
├── category        text NOT NULL DEFAULT 'misc' CHECK (category IN ('ambient', 'sfx', 'music', 'illustration', 'map', 'misc'))
├── title           text NOT NULL
├── url             text NOT NULL
├── duration_ms     integer   — para áudio/vídeo
├── tags            text[] NOT NULL DEFAULT '{}'
├── ai_generated    boolean NOT NULL DEFAULT false
├── is_public       boolean NOT NULL DEFAULT false
├── created_at      timestamptz NOT NULL DEFAULT now()
```

---

### 2.8 `session_media_state`
Estado atual de mídia de uma sessão — o que está tocando/exibindo agora.

```sql
session_media_state
├── id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
├── session_id      uuid NOT NULL UNIQUE REFERENCES sessions(id) ON DELETE CASCADE
├── current_audio   jsonb DEFAULT NULL
│   ├── media_id    uuid
│   ├── title       text
│   ├── url         text
│   └── loop        boolean
├── current_image   jsonb DEFAULT NULL
│   ├── media_id    uuid
│   ├── url         text
│   └── caption     text
├── ambient_active  boolean NOT NULL DEFAULT false
├── updated_at      timestamptz NOT NULL DEFAULT now()
```

---

### 2.9 `ai_requests`
Log de todas as requisições de IA — para auditoria, custo e replay.

```sql
ai_requests
├── id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
├── session_id      uuid REFERENCES sessions(id) ON DELETE SET NULL
├── requested_by    uuid REFERENCES profiles(id) ON DELETE SET NULL
├── type            text NOT NULL CHECK (type IN (
│                       'gm_suggestion',        — sugestão ao GM
│                       'npc_dialogue',         — fala de NPC
│                       'scene_description',    — descrição de cena
│                       'session_summary',      — resumo de sessão
│                       'character_summary',    — resumo de personagem
│                       'illustration',         — geração de imagem
│                       'audio_summary'         — resumo em áudio
│                   ))
├── prompt          text NOT NULL
├── response        text
├── model           text NOT NULL DEFAULT 'claude-sonnet-4-20250514'
├── tokens_used     integer
├── status          text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed'))
├── created_at      timestamptz NOT NULL DEFAULT now()
└── completed_at    timestamptz
```

---

### 2.10 `notifications`
Notificações em tempo real enviadas do GM para jogadores.

```sql
notifications
├── id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
├── session_id      uuid NOT NULL REFERENCES sessions(id) ON DELETE CASCADE
├── target_id       uuid REFERENCES profiles(id) ON DELETE CASCADE   — NULL = todos da sessão
├── type            text NOT NULL CHECK (type IN ('info', 'warning', 'combat', 'item', 'level_up', 'custom'))
├── title           text NOT NULL
├── message         text NOT NULL DEFAULT ''
├── vibrate         boolean NOT NULL DEFAULT false
├── read            boolean NOT NULL DEFAULT false
├── created_at      timestamptz NOT NULL DEFAULT now()
```

---

## 3. ROW LEVEL SECURITY (RLS)

Todas as tabelas têm RLS habilitado. Regras principais:

```
profiles          — usuário lê/edita só o próprio perfil. Admin lê todos.
story_templates   — GM lê/edita as próprias. Lê públicas de outros.
sessions          — GM acessa as próprias. Jogador acessa sessões onde está em session_players.
session_players   — GM da sessão acessa todos. Jogador acessa só o próprio registro.
characters        — jogador acessa os próprios. GM acessa de jogadores na sua sessão.
session_events    — GM acessa todos da sessão. Jogador acessa só os is_public = true.
media_library     — dono acessa as próprias. Todos acessam as públicas.
session_media_state — GM da sessão escreve. Todos da sessão leem.
notifications     — GM da sessão cria. Jogador lê as próprias.
ai_requests       — apenas backend (service role) escreve. GM lê as da sua sessão.
```

---

## 4. REALTIME

Tabelas habilitadas para Supabase Realtime:

| Tabela | Evento | Quem escuta |
|---|---|---|
| `sessions` | UPDATE | Todos da sessão |
| `characters` | UPDATE | Dono do personagem + GM |
| `session_events` | INSERT | Todos da sessão (filtrado por is_public) |
| `session_media_state` | UPDATE | Todos da sessão |
| `notifications` | INSERT | Target do notification |

---

## 5. TRIGGERS

```sql
-- Cria profile automaticamente ao cadastrar
on auth.users INSERT → create_profile_for_user()

-- Atualiza updated_at automaticamente
on profiles, sessions, characters, story_templates UPDATE → update_updated_at()

-- Gera invite_code único ao criar sessão
on sessions INSERT → generate_unique_invite_code()

-- Cria session_media_state ao criar sessão
on sessions INSERT → create_session_media_state()
```

---

## 6. RELAÇÕES — DIAGRAMA SIMPLIFICADO

```
auth.users
    └── profiles (1:1)
            ├── story_templates (1:N)
            ├── sessions (1:N) ← como GM
            ├── session_players (1:N) ← como jogador
            ├── characters (1:N)
            ├── media_library (1:N)
            └── ai_requests (1:N)

sessions
    ├── session_players (1:N)
    ├── characters (1:N) ← personagens ativos na sessão
    ├── session_events (1:N)
    ├── session_media_state (1:1)
    ├── notifications (1:N)
    └── ai_requests (1:N)
```

---

## 7. DECISÕES DE ARQUITETURA

**Por que `session_events` em vez de múltiplas tabelas de log?**
Um único log polimórfico com `type` + `payload` é mais flexível para a IA processar e gerar resumos. Evita joins complexos para reconstituir o histórico de uma sessão.

**Por que `ai_context` dentro de `sessions`?**
A IA precisa de contexto acumulado da sessão para dar sugestões relevantes. Manter isso no próprio registro da sessão evita queries adicionais a cada chamada de IA.

**Por que `session_media_state` separado?**
É atualizado com alta frequência pelo GM durante a partida. Separar evita locks na tabela `sessions` e facilita o Realtime só nessa tabela para os jogadores.

**Multi-tenancy:**
O isolamento é feito em duas camadas — RLS no PostgreSQL (segurança) e `session_id` como chave de partição em todas as queries (performance).
