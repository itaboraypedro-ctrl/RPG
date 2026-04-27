# SPEC_STORY_BANK.md
## GM Controller — Banco de Histórias
**Versão:** 1.0
**Stack:** Next.js App Router, Supabase, Claude API
**Depende de:** SPEC_DATABASE.md (tabela `story_templates`), SPEC_AUTH.md (role `gm`)

---

## 1. VISÃO GERAL

O Banco de Histórias é onde o GM cria, organiza e reutiliza templates de aventuras. Um template é a espinha dorsal de uma sessão — define o cenário, os atos, os NPCs, os locais e as sugestões de trilha sonora. Pode ser criado manualmente ou com assistência da IA.

Um template nunca é uma sessão — ele é um molde. O GM pode usar o mesmo template em múltiplas sessões com grupos diferentes.

---

## 2. FUNCIONALIDADES

### 2.1 Listagem de Templates (`/dashboard/templates`)
- Lista todos os templates do GM logado
- Cards com: título, gênero, data de criação, badge "IA" se `ai_generated = true`, badge "Público" se `is_public = true`
- Filtro por gênero (fantasy, sci-fi, horror, western, modern, custom)
- Busca por título
- Botão "Novo template" no topo
- Estado vazio: mensagem encorajadora + botão de criar

### 2.2 Criar Template Manual (`/dashboard/templates/new`)
Formulário em etapas (wizard de 3 passos):

**Passo 1 — Identidade**
- Título (obrigatório)
- Gênero (select)
- Descrição curta
- Tags (input de chips)

**Passo 2 — Conteúdo**
- Sinopse (textarea longo)
- Atos/capítulos (lista dinâmica — adicionar/remover/reordenar)
  - Cada ato: título + descrição
- NPCs (lista dinâmica)
  - Cada NPC: nome + papel + motivação
- Locais (lista dinâmica)
  - Cada local: nome + descrição + atmosfera

**Passo 3 — Mídia e Config**
- Sugestões de trilha sonora por cena (texto livre)
- Imagem de capa (upload ou URL)
- Visibilidade: Privado / Público
- Botão "Salvar template"

### 2.3 Criar Template com IA (`/dashboard/templates/new?mode=ai`)
- Campo único: "Descreva sua aventura em poucas palavras"
  - Exemplo: "Uma vila assombrada por um dragão esquecido que na verdade protege um segredo"
- Botão "Gerar com IA"
- Loading state com mensagem animada ("A IA está tecendo sua história...")
- IA retorna JSON com todos os campos do template preenchidos
- GM revisa e edita antes de salvar
- Campo de gênero preenchido automaticamente pela IA
- `ai_generated = true` no registro

### 2.4 Editar Template (`/dashboard/templates/[id]/edit`)
- Mesmo wizard do criar, pré-populado com os dados existentes
- Botão "Atualizar template"
- Histórico não é mantido — é uma substituição direta

### 2.5 Visualizar Template (`/dashboard/templates/[id]`)
- Leitura completa do template
- Botão "Usar em nova sessão" → redireciona para `/dashboard/sessions/new?template=[id]`
- Botão "Editar"
- Botão "Duplicar" → cria cópia com título "Cópia de [título]"
- Botão "Excluir" (com confirmação)

---

## 3. INTEGRAÇÃO COM IA

### 3.1 Geração de Template
**Endpoint:** `POST /api/ai/generate-template`

**Request:**
```typescript
{
  prompt: string   // descrição livre do GM
}
```

**System prompt para Claude:**
```
Você é um assistente especializado em RPG de mesa. 
Dado um prompt do Mestre, gere um template completo de aventura em JSON.
Responda APENAS com o JSON, sem markdown, sem explicações.
O JSON deve seguir exatamente este formato:
{
  "title": string,
  "genre": "fantasy" | "sci-fi" | "horror" | "western" | "modern" | "custom",
  "description": string (máx 200 chars),
  "tags": string[],
  "content": {
    "synopsis": string (2-4 parágrafos),
    "acts": [{ "title": string, "description": string }],
    "npcs": [{ "name": string, "role": string, "motivation": string }],
    "locations": [{ "name": string, "description": string, "atmosphere": string }],
    "music_cues": [{ "scene": string, "suggestion": string }]
  }
}
```

**Response:** JSON do template gerado, salvo em `ai_requests` com `type = 'scene_description'`

### 3.2 Registro em `ai_requests`
Toda geração de template registra em `ai_requests`:
- `type`: `'scene_description'`
- `prompt`: o texto do GM
- `response`: o JSON gerado
- `model`: `'claude-sonnet-4-20250514'`
- `tokens_used`: tokens consumidos
- `status`: `'completed'` ou `'failed'`

---

## 4. ROTAS

```
/dashboard/templates              → listagem
/dashboard/templates/new          → criar manual
/dashboard/templates/new?mode=ai  → criar com IA
/dashboard/templates/[id]         → visualizar
/dashboard/templates/[id]/edit    → editar

/api/ai/generate-template         → POST — geração via Claude API
```

---

## 5. COMPONENTES

```
app/dashboard/templates/
├── page.tsx                        ← listagem
├── new/
│   └── page.tsx                    ← wizard criar (manual + IA via query param)
└── [id]/
    ├── page.tsx                    ← visualizar
    └── edit/
        └── page.tsx                ← editar

components/templates/
├── TemplateCard.tsx                ← card da listagem
├── TemplateWizard.tsx              ← wizard de criação/edição
├── TemplateWizardStep1.tsx         ← identidade
├── TemplateWizardStep2.tsx         ← conteúdo
├── TemplateWizardStep3.tsx         ← mídia e config
├── AiTemplateGenerator.tsx         ← modo IA
└── TemplateViewer.tsx              ← visualização completa

app/api/ai/
└── generate-template/
    └── route.ts                    ← handler da geração IA
```

---

## 6. REGRAS DE NEGÓCIO

- Apenas GMs e admins acessam `/dashboard/templates`
- GM só vê/edita seus próprios templates (RLS já garante)
- Templates públicos (`is_public = true`) são visíveis para qualquer GM na listagem (futura feature de marketplace — por ora apenas criador vê)
- Ao duplicar, o novo template é sempre privado
- Não é possível excluir um template que está sendo usado em uma sessão com `status != 'finished'` — retorna erro com mensagem explicativa
- Limite de NPCs por template: 20
- Limite de locais por template: 20
- Limite de atos por template: 10

---

## 7. ESTADOS DE UI

| Estado | O que mostrar |
|---|---|
| Carregando lista | Skeleton cards |
| Lista vazia | Ilustração + "Nenhuma história ainda. Crie sua primeira aventura." |
| Gerando com IA | Spinner + "A IA está tecendo sua história..." |
| Erro na geração | Toast de erro + campo continua editável |
| Salvando | Botão disabled + "Salvando..." |
| Salvo com sucesso | Toast + redirect para `/dashboard/templates/[id]` |

---

## 8. VARIÁVEIS DE AMBIENTE NECESSÁRIAS

```env
ANTHROPIC_API_KEY=   ← para chamadas server-side à Claude API
```

Esta chave nunca é exposta ao cliente — todas as chamadas à Claude API passam por Route Handlers.
