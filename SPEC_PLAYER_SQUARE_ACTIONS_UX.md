# SPEC_PLAYER_SQUARE_ACTIONS_UX.md
## GM Controller — Ações Rápidas no Card de Personagem (UX Premium)
**Arquivo alvo:** `components/gm-panel/PlayerSquareBlock.tsx`
**Tipo:** Refatoração visual — sem mudanças de lógica ou persistência

---

## 1. PROBLEMA ATUAL

Ao clicar em uma ação (Dano, Cura, Feitiço, Esforço), um overlay vermelho toma o card inteiro, cobrindo o avatar e as informações do personagem. A experiência é abrupta e visualmente poluída.

---

## 2. COMPORTAMENTO DESEJADO

### 2.1 Estado de repouso
Card normal — avatar, nome, HP bar visíveis.

### 2.2 Hover no card
Na base do card, desliza para cima suavemente uma faixa fina com 4 botões de ação:
- ⚔ Dano (vermelho)
- ✚ Cura (verde)
- ✦ Feitiço (violeta)
- ⚡ Esforço (âmbar)

A faixa tem a **mesma largura do card**, altura de ~32px, fundo `bg-zinc-950/90` com `backdrop-blur-sm`, bordas arredondadas na base.

Animação: `transform: translateY(100%)` → `translateY(0)` com `transition: transform 200ms ease-out`.

### 2.3 Click em uma ação
A faixa de 4 botões **se transforma** no painel de controle da ação selecionada — **na mesma posição e tamanho**, expandindo verticalmente apenas o suficiente para mostrar:

```
┌─────────────────────────────────────┐  ← base do card
│  ⚔ Dano          Sister Mira    ×  │  ← header compacto, 1 linha
│  ████████░░░░░░░░░░░░░░░░░░░░  10  │  ← slider + valor inline
│  [    Aplicar    ]                  │  ← botão
└─────────────────────────────────────┘
```

Altura total do painel expandido: ~80px máximo.
O avatar e o nome do personagem continuam visíveis acima.

### 2.4 Animação de transição
- Faixa de botões → painel expandido: `max-height` de 32px → 80px com `transition: max-height 200ms ease-out`
- Painel fecha → `max-height` volta para 32px → depois `opacity 0` → some

### 2.5 Toast de confirmação
Após clicar "Aplicar":
- Painel fecha suavemente
- Toast aparece **sobre o avatar** (centralizado no card, não na base)
- Animação: fade-in rápido → pausa 1s → fade-out
- Duração total: 1.5s

---

## 3. ESPECIFICAÇÕES VISUAIS

### Faixa de botões (hover state)
```
height: 32px
background: bg-zinc-950/90
backdrop-filter: blur(4px)
border-radius: 0 0 6px 6px (apenas base)
border-top: 1px solid zinc-800
padding: 0 4px
display: flex, justify: space-around, align: center
```

Cada botão:
```
width: 28px, height: 24px
border-radius: 4px
font-size: 14px
transition: background 150ms
```

### Painel expandido (action state)
```
background: bg-zinc-950
border: 1px solid [cor da ação] com opacity 0.6
border-radius: 0 0 6px 6px
padding: 6px 8px
display: flex, flex-direction: column, gap: 4px
```

Header do painel:
```
display: flex, justify: space-between, align: center
font-size: 10px, uppercase, tracking-wide
cor: [text da ação]
botão ×: 16x16, text-zinc-400
```

Slider + valor inline:
```
display: flex, align: center, gap: 6px
slider: flex-1
valor: text-lg font-bold tabular-nums, cor: [text da ação], min-width: 28px, text-right
```

Botão Aplicar:
```
width: 100%
height: 24px
font-size: 11px, font-weight: 600
border-radius: 4px
cor: [confirm da ação]
```

### Feitiço (caso especial)
Painel tem um campo a mais — select de feitiço — que aparece entre o header e o slider. O painel expande para ~96px para acomodar o select.

---

## 4. IMPLEMENTAÇÃO

### Estrutura JSX desejada

```tsx
{/* Base overlay — aparece no hover, fica na base do card */}
<div className="absolute inset-x-0 bottom-0 overflow-hidden rounded-b-md">
  <div
    className={`
      transition-all duration-200 ease-out
      ${actionOpen ? 'max-h-[96px]' : hovered ? 'max-h-[32px]' : 'max-h-0'}
    `}
  >
    {!actionOpen ? (
      /* Faixa de 4 botões */
      <div className="flex h-8 items-center justify-around border-t border-zinc-800 bg-zinc-950/90 backdrop-blur-sm px-1">
        {/* botões ⚔ ✚ ✦ ⚡ */}
      </div>
    ) : (
      /* Painel expandido da ação */
      <ActionPanel ... />
    )}
  </div>
</div>
```

### Estado necessário
```typescript
const [hovered, setHovered] = useState(false)  // controla faixa de botões
const [actionOpen, setActionOpen] = useState<ActionKind | null>(null)
```

Usar `onMouseEnter` / `onMouseLeave` no card raiz para controlar `hovered`.

### Regra importante
- O card raiz precisa de `overflow-hidden` para o painel não vazar
- O avatar e nome ficam **sempre visíveis** — o painel fica sobre eles apenas na base
- `e.stopPropagation()` em todos os cliques dentro do painel

---

## 5. O QUE NÃO MUDA

- Lógica de toast (só feedback visual, sem persistência)
- Lista de feitiços
- Ranges dos sliders (0-100 para dano/cura/esforço, 1-9 para feitiço)
- onClick do card abre o CharacterSheet (quando painel fechado)
