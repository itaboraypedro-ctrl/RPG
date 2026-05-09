# SPEC_LANDING_PAGE.md
## Arcana — Landing Page Pública
**Versão:** 1.0
**Rota:** `/` (raiz do projeto)
**Stack:** Next.js App Router, Tailwind CSS
**Referência visual:** Dark fantasy épico — Eldroot UI Kit (cores escuras, tipografia serif, ornamentos dourados)

---

## 1. VISÃO GERAL

Landing page pública de uma tela única (scroll), dark fantasy, com identidade visual forte. O objetivo é converter visitantes em usuários — GM ou jogador — com um único CTA principal: **"Jogar agora"**.

Fluxo do usuário:
```
/ (LP) → botão "Jogar agora" → /login ou /register → sessão → /play ou /dashboard
```

---

## 2. IDENTIDADE VISUAL

### 2.1 Nome e Tagline
- **Nome:** Arcana
- **Tagline:** *"Onde histórias ganham vida."*
- **Sub-tagline:** *"A plataforma de RPG de mesa para mestres e jogadores."*

### 2.2 Paleta de Cores
```
Fundo principal:    #0a0a0f  (quase preto, azul muito escuro)
Fundo superfície:   #0e0e1a
Borda sutil:        #1a1a2e
Dourado primário:   #c9a84c  (ornamentos, destaques, CTA)
Dourado brilhante:  #f0cc6a  (hover, glow)
Vermelho sangue:    #3f1c18  (acento, perigo, drama)
Azul névoa:         #252d34  (backgrounds secundários)
Texto principal:    #e0caab  (creme, legível no escuro)
Texto secundário:   #7a6a55  (labels, subtextos)
Texto branco:       #ffffff
```

### 2.3 Tipografia
- **Títulos:** `'Cinzel', serif` — já importado no projeto via Google Fonts
- **Corpo:** `'Crimson Text', serif` — já importado no projeto
- **Labels/UI:** Tailwind padrão (Inter/system)

### 2.4 Ornamentos
Separadores de seção com losango central:
```
──── ◆ ────
```
Implementado em CSS com `before`/`after` ou componente SVG simples.

---

## 3. SEÇÕES DA LP

### 3.1 HERO — Tela cheia

**Layout:** Fullscreen (`min-h-screen`), fundo com gradiente radial + ruído de textura sutil.

**Conteúdo (centralizado verticalmente):**
```
        ◆ ARCANA ◆
  
  Onde histórias ganham vida.
  
  A plataforma de RPG de mesa para
  mestres e jogadores.
  
  [ Jogar agora ]    [ Saiba mais ↓ ]
```

**Elementos visuais:**
- Logo "ARCANA" em Cinzel, tamanho grande, com letter-spacing amplo
- Glow dourado sutil atrás do título (`text-shadow` ou `filter: drop-shadow`)
- Gradiente de fundo: `radial-gradient(ellipse at 50% 30%, #1a1030 0%, #0a0a0f 70%)`
- Partículas leves ou brilhos (CSS puro — `::before` com `opacity: 0.3`, `border-radius: 50%`, `animation: float`)
- Linha separadora dourada horizontal acima e abaixo do nome
- Scroll indicator animado na base da seção (chevron pulsante)

**CTAs:**
- "Jogar agora" → `/register` — botão primário dourado com hover glow
- "Saiba mais ↓" → smooth scroll para seção Como Funciona — ghost button

**Estilo dos botões:**
```
Primário:
  background: linear-gradient(135deg, #c9a84c, #f0cc6a)
  color: #0a0a0f
  padding: 14px 36px
  border-radius: 2px (quase quadrado — estilo medieval)
  font: Cinzel, uppercase, letter-spacing: 3px
  hover: box-shadow: 0 0 30px rgba(201,168,76,0.5)
  transition: all 300ms ease

Ghost:
  background: transparent
  border: 1px solid #c9a84c44
  color: #c9a84c
  hover: border-color: #c9a84c, background: #c9a84c10
```

---

### 3.2 COMO FUNCIONA — 3 Passos

**Separador:** `──── ◆ COMO FUNCIONA ◆ ────`

**Layout:** 3 cards lado a lado (desktop) / coluna (mobile)

```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│      I      │  │     II      │  │     III     │
│   Crie sua  │  │  Convide os │  │    Jogue    │
│   história  │  │  jogadores  │  │  ao vivo    │
│             │  │             │  │             │
│ Monte sessões│  │Compartilhe  │  │Painel GM,   │
│ com IA ou   │  │um link.     │  │fichas em    │
│ do zero.    │  │Entram em    │  │tempo real,  │
│             │  │segundos.    │  │IA de suporte│
└─────────────┘  └─────────────┘  └─────────────┘
```

**Estilo dos cards:**
- Fundo `#0e0e1a`, borda `1px solid #1a1a2e`, border-top `2px solid #c9a84c`
- Número romano em Cinzel dourado grande
- Título em Cinzel branco
- Descrição em Crimson Text, cor `#e0caab`

---

### 3.3 FEATURES — O que o Arcana oferece

**Separador:** `──── ◆ RECURSOS ◆ ────`

**Layout:** Grid 2x2 (desktop) / 1 coluna (mobile)

| Feature | Ícone | Descrição |
|---|---|---|
| Painel do Mestre | ⚔️ | Controle HP, iniciativa, sons e cenas em tempo real durante a partida |
| Fichas Inteligentes | 📜 | Fichas D&D 5e completas que atualizam automaticamente quando o GM age |
| IA Integrada | ✨ | Gere histórias, NPCs e resumos de sessão com inteligência artificial |
| Multijogador Real | ⚡ | Todos os jogadores veem as mudanças instantaneamente, sem recarregar |

**Estilo de cada feature:**
- Ícone grande (emoji ou SVG) com fundo `#1a1a2e` redondo
- Título em Cinzel
- Descrição em Crimson Text
- Linha dourada à esquerda do card (`border-left: 2px solid #c9a84c`)

---

### 3.4 CTA FINAL — Chamada para ação

**Separador:** `──── ◆ ────`

**Conteúdo centralizado:**
```
Sua próxima aventura começa aqui.

[ Criar conta grátis ]

Já tem conta? Entrar →
```

**Fundo:** gradiente sutil diferenciado do resto (`#0e0e1a`)
**Borda superior e inferior:** linha dourada de 1px

---

### 3.5 FOOTER — Minimalista

```
◆ ARCANA · 2025 · Onde histórias ganham vida. ◆
```

Texto centralizado, pequeno, cor `#7a6a55`.

---

## 4. ANIMAÇÕES

Todas as animações usam CSS puro ou Tailwind — sem bibliotecas externas.

### 4.1 Entrada das seções
Fade-in + translate-up ao entrar na viewport:
```css
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
```
Usando `IntersectionObserver` ou `animate-` classes do Tailwind com `animation-delay`.

### 4.2 Glow pulsante no título
```css
@keyframes glowPulse {
  0%, 100% { text-shadow: 0 0 20px rgba(201,168,76,0.3); }
  50%       { text-shadow: 0 0 40px rgba(201,168,76,0.6), 0 0 80px rgba(201,168,76,0.2); }
}
```

### 4.3 Scroll indicator
Chevron `∨` pulsando para baixo na base do hero.

### 4.4 Partículas do hero
4-6 pontos de luz flutuantes (`position: absolute`, `border-radius: 50%`, `animation: float`).

---

## 5. RESPONSIVIDADE

| Breakpoint | Comportamento |
|---|---|
| Mobile (< 640px) | Tudo em coluna, textos menores, botões full-width |
| Tablet (640-1024px) | 2 colunas no grid de features |
| Desktop (> 1024px) | Layout completo conforme descrito |

Hero sempre fullscreen independente do dispositivo.

---

## 6. NAVEGAÇÃO

**Navbar:** Não existe navbar complexa. Apenas:
```
◆ ARCANA          [Entrar]  [Criar conta]
```
- Sticky no topo
- Fundo `bg-zinc-950/80` com `backdrop-blur-sm`
- Desaparece ao scroll (ou permanece, decisão do Claude Code)
- "Entrar" → `/login`
- "Criar conta" → `/register`

---

## 7. FLUXO PÓS-CTA

```
"Jogar agora" ou "Criar conta grátis"
    → /register
    → cadastro (já implementado)
    → se NEXT_PUBLIC_GM_OPEN_REGISTRATION=true → role gm → /dashboard
    → se role player → /play
```

```
"Entrar" ou "Já tem conta?"
    → /login
    → baseado no role → /dashboard (gm) ou /play (player)
```

A LP não precisa saber se o usuário está logado — o middleware já redireciona usuários logados que tentam acessar `/login` ou `/register`.

---

## 8. ARQUIVO A CRIAR/MODIFICAR

```
app/page.tsx    ← substitui o stub atual (tabs do GM Controller)
```

Componentes auxiliares inline no mesmo arquivo ou em:
```
components/landing/
├── LandingHero.tsx
├── LandingHowItWorks.tsx
├── LandingFeatures.tsx
├── LandingCta.tsx
└── LandingNav.tsx
```

---

## 9. O QUE NÃO ENTRA

- Pricing / planos
- Blog ou documentação
- Vídeo demo
- Formulário de contato
- Depoimentos / social proof
- Métricas ou números ("X usuários")
