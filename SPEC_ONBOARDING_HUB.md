# SPEC_ONBOARDING_HUB.md
## Arcana — Onboarding + Hub Central
**Versão:** 1.0
**Stack:** Next.js App Router, Supabase, Tailwind
**Substitui:** `/register` atual, `/dashboard` (GM) e `/play` (player) como ponto de entrada

---

## 1. VISÃO GERAL

Dois entregáveis neste spec:

1. **Onboarding em 3 etapas** — substitui o `/register` atual com um fluxo guiado: papel → dados → dentro
2. **Hub Central** — tela pós-login que antecede qualquer partida, serve para os dois perfis (GM e Jogador)

---

## 2. FLUXO DE ONBOARDING — `/register`

### Etapa 1 — Escolha do papel
**Rota:** `/register` (step 1)

Tela cheia, dark fantasy. Duas opções grandes lado a lado (ou coluna no mobile):

```
┌─────────────────────┐    ┌─────────────────────┐
│                     │    │                     │
│      ⚔️ MESTRE      │    │    🎭 JOGADOR        │
│                     │    │                     │
│  Crie e conduza     │    │  Entre em aventuras │
│  suas aventuras.    │    │  criadas por outros │
│  Controle a mesa,   │    │  mestres. Crie seus │
│  a história e o     │    │  personagens e viva │
│  destino dos        │    │  a história.        │
│  jogadores.         │    │                     │
│                     │    │                     │
│  [ Ser Mestre ]     │    │  [ Ser Jogador ]    │
└─────────────────────┘    └─────────────────────┘
```

- Click seleciona o papel e avança para etapa 2
- Card selecionado: borda dourada + glow
- Fundo: mesmo visual da LP (dark fantasy, partículas sutis opcionais)
- Rodapé: "Já tem conta? Entrar →" link para `/login`

### Etapa 2 — Dados da conta
**Rota:** `/register?step=2&role=[gm|player]`

Formulário simples centralizado:
```
Nome de usuário   [campo]
E-mail            [campo]
Senha             [campo, toggle mostrar/ocultar]
Confirmar senha   [campo]

          [ Criar minha conta ]
```

- Validação inline (usuário disponível, email válido, senhas iguais)
- Botão desabilitado até formulário válido
- Loading state no botão durante criação
- Em caso de erro: mensagem inline abaixo do campo

### Etapa 3 — Redirect automático
- Após criar conta com sucesso → redirect direto para `/hub`
- Sem tela intermediária de "bem-vindo" — o Hub já recebe o usuário

### Indicador de progresso
Três dots no topo:
```
  ● ● ○     (etapa 2 de 3 — o 3 é o Hub)
```
Ou barra de progresso fina dourada.

---

## 3. HUB CENTRAL — `/hub`

### 3.1 Quem acessa
- **GM:** vê tudo — seus personagens, partidas que criou, partidas em que foi convidado como jogador
- **Jogador:** vê seus personagens e partidas em que foi convidado

### 3.2 Layout geral
```
┌─────────────────────────────────────────────────┐
│  ◆ ARCANA          [avatar] [nome]  [config ⚙]  │  ← navbar
├─────────────────────────────────────────────────┤
│                                                  │
│  Olá, [nome]. Bem-vindo de volta.               │  ← saudação
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │  SEUS PERSONAGENS                    [+] │   │  ← carrossel
│  │  ◀  [ card ]  [ card ]  [ card ]  ▶      │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
│  PARTIDAS                                        │  ← seção partidas
│  [ card sessão ]  [ card sessão ]               │
│                                                  │
│  (apenas GM) [ + Criar nova partida ]            │
└─────────────────────────────────────────────────┘
```

---

## 4. CARROSSEL DE PERSONAGENS

### 4.1 Visual dos cards
Cards grandes — `280x380px` (desktop), `220x300px` (mobile).

```
┌─────────────────────┐
│                     │
│   [avatar 120px]    │  ← centralizado, borda colorida por classe
│                     │
│   NOME              │  ← Cinzel, branco
│   Classe · Nível X  │  ← pequeno, dourado
│   Raça              │  ← zinc-400
│                     │
│   HP ████████  50   │  ← barra HP atual
│   ────────────────  │
│   [ Jogar ]         │  ← botão primário
└─────────────────────┘
```

Cor da borda do card por classe:
- Guerreiro/Paladino → dourado `#c9a84c`
- Mago/Feiticeiro → violeta `#9b6bcc`
- Ladino/Ranger → verde `#4ecb8a`
- Clérigo/Druida → azul `#4a8fff`
- Bárbaro/Monge → vermelho `#e05050`
- Artífice e outros → cinza `#888`

### 4.2 Card "Criar personagem"
Último card do carrossel (ou primeiro se não houver nenhum):
```
┌─────────────────────┐
│                     │
│        ╋            │  ← ícone grande, zinc-600
│                     │
│   Criar personagem  │  ← zinc-400
│                     │
└─────────────────────┘
```
Click → `/play/characters/new`

### 4.3 Comportamento do carrossel
- Scroll horizontal suave com botões ◀ ▶
- No mobile: swipe nativo (overflow-x: auto, snap)
- Se nenhum personagem: apenas o card "Criar personagem" em destaque
- Se 1+ personagens: carrossel com scroll, card criar no final
- Destaque: o primeiro card fica ligeiramente maior (scale 1.05) e mais opaco que os demais

### 4.4 Botão "Jogar" no card
- Se personagem tem `session_id` ativo → "Continuar partida" → `/play/[session_id]`
- Se não tem sessão ativa → "Selecionar partida" → `/play/characters/select`

---

## 5. SEÇÃO DE PARTIDAS

### 5.1 Card de sessão
```
┌──────────────────────────────────┐
│  [status badge]                  │
│  Nome da campanha                │
│  Mestre: [nome]                  │
│  [N] jogadores · [data]          │
│                                  │
│  [ Entrar ]                      │
└──────────────────────────────────┘
```

Status badges:
- `active` → 🟢 "Ao vivo agora" — borda pulsante verde
- `lobby` → 🟡 "Aguardando" — borda amarela
- `paused` → ⏸ "Pausada"
- `finished` → ✓ "Encerrada" — opaco

### 5.2 Partidas do GM
Se o usuário é GM, aparece uma seção separada:
```
SUAS CAMPANHAS
[ card sessão que ele criou ] [ card sessão ] [ + Nova campanha ]
```

### 5.3 Partidas como jogador
```
CONVITES E PARTIDAS
[ card sessão onde foi convidado ]
```

### 5.4 Estado vazio
Se não há partidas:
```
Nenhuma partida ativa.
[Para GMs] → [ + Criar campanha ]
[Para jogadores] → Peça um link de convite ao seu Mestre.
```

---

## 6. NAVBAR DO HUB

```
◆ ARCANA          [avatar pequeno] [nome de usuário]  [⚙ Config]
```

- Sticky no topo
- Fundo `bg-zinc-950/90 backdrop-blur-sm`
- Click no avatar → menu dropdown:
  - Meu perfil
  - Configurações
  - Sair (logout → `/login`)
- Badge de role (GM ou Jogador) ao lado do nome

---

## 7. SAUDAÇÃO DINÂMICA

```
Bom dia / Boa tarde / Boa noite, [display_name].
```

Baseado no horário local do cliente.

Sub-linha contextual:
- Se tem personagem em sessão ativa → "Você tem uma partida em andamento."
- Se foi convidado para nova sessão → "Você tem [N] convite(s) novo(s)."
- Se nada → "Pronto para uma nova aventura?"

---

## 8. ROTAS

```
/register              → Etapa 1 (escolha de papel)
/register?step=2&role= → Etapa 2 (dados)
/hub                   → Hub central (requer auth)
```

### Redirects
- Usuário logado acessa `/` → redirect `/hub`
- Usuário logado acessa `/login` ou `/register` → redirect `/hub`
- Usuário não logado acessa `/hub` → redirect `/login`
- Após login → redirect `/hub` (em vez de `/dashboard` ou `/play`)

---

## 9. DADOS NECESSÁRIOS (fetch no server)

```typescript
// /hub page.tsx — server component
const [profile, characters, sessions, invites] = await Promise.all([
  getProfile(),
  supabase.from('characters').select('*').eq('owner_id', user.id),
  supabase.from('sessions').select('*').eq('gm_id', user.id), // GM
  supabase.from('session_players')
    .select('*, session:sessions(*)')
    .eq('player_id', user.id)
    .in('status', ['invited', 'joined']),
])
```

---

## 10. ARQUIVOS A CRIAR/MODIFICAR

```
app/
├── register/
│   └── page.tsx              ← substitui register atual (multi-step)
├── hub/
│   └── page.tsx              ← hub central (server)
│
components/
├── onboarding/
│   ├── RoleSelector.tsx      ← etapa 1: escolha GM/Jogador
│   └── RegisterForm.tsx      ← etapa 2: nome/email/senha
├── hub/
│   ├── HubNav.tsx            ← navbar do hub
│   ├── HubGreeting.tsx       ← saudação dinâmica
│   ├── CharacterCarousel.tsx ← carrossel de personagens
│   ├── CharacterCard.tsx     ← card individual do personagem
│   └── SessionCard.tsx       ← card de sessão/campanha
```

---

## 11. O QUE NÃO ENTRA NESTE SPEC

- Edição de perfil (tela de configurações)
- Notificações em tempo real no hub (Realtime entra depois)
- Busca de campanhas públicas
- Sistema de amigos/contatos
