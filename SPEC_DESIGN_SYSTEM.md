# SPEC — Design System ARCANA v2 ("Ouro Vivo")

> Versão 2.0, 19/09/2026. Substitui os pilares visuais implícitos do tema `arcana-*` em `app/globals.css`.
> Escopo: tokens de cor, contraste, tipografia de UI, botões, inputs, selects/dropdowns, scrollbars, chips, painéis e vidro fosco. O namespace `rpg-*` (ficha in-game) está fora do escopo desta versão.

## 1. Análise do estado anterior (v1)

Medições de contraste (WCAG, sobre `--color-arcana-bg #07070d`):

| Token v1 | Valor | Contraste | Veredito |
|---|---|---:|---|
| `arcana-text` | `#e8d5b4` | ~12:1 | OK, mas subusado |
| `arcana-text-dim` | `#7a6a55` | ~3,5:1 | **Reprova AA** para texto normal — e era a cor de 70% da UI |
| `arcana-text-muted` | `#3d3028` | ~1,6:1 | Invisível |
| `arcana-surface` vs `bg` | `#0f0f1c` | ~1,15:1 | Superfícies não se separam do fundo |
| `arcana-border-dim` | `#1a1a2e` | ~1,4:1 | Bordas somem |

Agravantes de implementação:
1. **Opacidade sobre cor já escura** — padrões como `text-arcana-text-dim/50`, `/40`, `/35` derrubavam o contraste efetivo para ~2:1. Era a principal causa do "tudo muito escuro".
2. **Tipografia de UI microscópica** — labels em `text-[7px]`–`text-[9px]` com `tracking-[0.3em]`+.
3. **Estados incompletos** — botões sem `:active`, sem `:focus-visible`, sem variante danger; `.arcana-btn-disabled` era usada mas não existia (só `.arcana-btn-primary-disabled`).
4. **Componentes nativos crus** — scrollbar, `<select>` e dropdowns sem estilo (quebra total da imersão).
5. **Blur usado ad hoc** — `backdrop-filter` espalhado em estilos inline, sem token/classe.

## 2. Pilares do v2

Referências de direção: menus de Baldur's Gate 3, Diablo IV e Elden Ring — fundo profundo, **pergaminho legível**, ouro com vida, vidro fosco discreto, ornamento contido.

1. **Contraste é sagrado.** Texto de leitura ≥ 7:1; texto secundário ≥ 4,5:1; nunca aplicar opacidade `< /70` em texto. O escuro vem do *fundo*, não do texto.
2. **Três camadas de profundidade, visíveis.** `bg → surface → surface-2/3` com passos perceptíveis + borda + luz interna no topo (`inset 0 1px 0 rgba(255,255,255,.05)`). Elevação = borda mais clara + sombra maior, não só cor.
3. **Ouro vivo, não ouro sujo.** O dourado é o metal da UI: gradientes verticais (luz de cima), brilho no hover, glow contido (nunca >24px). Estados: repouso → hover (acende) → active (pressiona, `translateY(1px)`) → focus-visible (anel dourado 2px).
4. **Vidro fosco como material de chrome.** Headers, footers, sidebars e overlays usam `.arcana-glass` (blur 16px + saturação + borda de 1px translúcida). Conteúdo de leitura nunca fica sobre blur.
5. **Tipografia de UI legível.** Cinzel small-caps para chrome com **mínimo 10px**; tracking máximo `0.3em`; Crimson para prosa com mínimo 14px.
6. **Todo controle nativo é vestido.** Scrollbar, select, dropdown, checkbox/toggle têm estilo próprio — nenhum widget cinza de browser no meio do jogo.

## 3. Tokens v2

Mesmos nomes (upgrade automático de todo o app), valores novos:

| Token | v1 | v2 | Contraste v2 (vs bg) |
|---|---|---|---:|
| `--color-arcana-bg` | `#07070d` | `#0b0b14` | — |
| `--color-arcana-surface` | `#0f0f1c` | `#14141f` | 1,3:1 vs bg |
| `--color-arcana-surface-2` | `#161625` | `#1b1b2a` | — |
| `--color-arcana-surface-3` | `#1e1e30` | `#232336` | — |
| `--color-arcana-border` | `#2a2a42` | `#3d3d5c` | visível |
| `--color-arcana-border-dim` | `#1a1a2e` | `#2a2a40` | sutil mas presente |
| `--color-arcana-gold` | `#c9a84c` | `#d1ab55` | 8,2:1 |
| `--color-arcana-gold-bright` | `#f0cc6a` | `#f5d478` | 12:1 |
| `--color-arcana-gold-dim` | `#7a5c1e` | `#8a6a2a` | uso decorativo |
| `--color-arcana-text` | `#e8d5b4` | `#f2e6cf` | 14:1 |
| `--color-arcana-text-dim` | `#7a6a55` | `#b5a68c` | **7,2:1** |
| `--color-arcana-text-muted` | `#3d3028` | `#807460` | 3,6:1 (só decorativo) |
| `--color-arcana-blood` | `#3f1c18` | `#5c241d` | superfícies de perigo |
| *(novo)* `--color-arcana-danger` | — | `#e0705f` | 5,5:1 (texto de perigo) |

`--background` global passa a `#0b0b14` (app é dark-only; elimina flash branco no overscroll).

## 4. Componentes

### 4.1 Botões (`.arcana-btn-*`)
- **`primary`**: gradiente vertical `180deg, #f0cc6a → #bd9540`, texto `#1c1206`, borda 1px `rgba(255,235,180,.5)` (fio de luz), sombra externa + glow âmbar; hover acende (`#f7dd8f → #cfa952`) e sobe 1px; active pressiona; focus-visible anel `2px` dourado afastado 2px.
- **`ghost`**: vidro leve (`rgba(255,255,255,.04)`) + borda `rgba(209,171,85,.35)` + **texto `arcana-text`** (não mais dim); hover: borda e texto dourados, fundo `rgba(209,171,85,.10)`.
- **`danger`**: como ghost, em vermelho (`--color-arcana-danger`).
- **`disabled`**: existe de fato; superfície apagada + texto `rgba` legível o bastante para ler o rótulo.
- Modificador **`.arcana-btn-sm`** para ações dentro de cards (padding e tracking menores).

### 4.2 Inputs e áreas de texto (`.arcana-input`)
Fundo `rgba(8,8,15,.55)`, borda `--border`, texto `--text`, placeholder `rgba(242,230,207,.38)`; focus: borda dourada + anel `rgba(209,171,85,.22)` de 3px + fundo levemente mais claro. `caret-color` dourado.

### 4.3 Select / dropdown (`.arcana-select`)
`appearance: none` + chevron dourado em SVG embutido; mesmo chrome do input; `option` com fundo `surface-3` e texto pergaminho. Menus custom (ex.: menu do usuário no hub) usam `.arcana-glass` + `.arcana-menu-item` (hover dourado com barra de 2px à esquerda).

### 4.4 Scrollbar (global)
Thumb em gradiente `gold-dim → rgba(209,171,85,.55)` com `border-radius`, 10px, engrossa/acende no hover; track transparente; Firefox: `scrollbar-width: thin; scrollbar-color`. A scrollbar é parte do cenário, não um widget cinza.

### 4.5 Vidro fosco (`.arcana-glass`)
`background: rgba(15,15,26,.72)` + `backdrop-filter: blur(16px) saturate(1.35)` + borda `rgba(255,255,255,.08)` + luz interna no topo. Uso: headers, footers de wizard, sidebars, menus, banners.

### 4.6 Chips e cards
`.arcana-chip` / `.arcana-chip-active` (seleção de temas, tons, NdC): repouso com borda visível e texto `--text-dim` (agora legível); ativo com fundo dourado translúcido, texto `gold-bright` e glow de 12px. Cards (`.arcana-card`) com hover elevando borda.

### 4.7 Foco e acessibilidade
`:focus-visible` global: anel dourado 2px. `prefers-reduced-motion` continua desligando animações. Nenhum texto informativo abaixo de 4,5:1.

## 5. Regras de uso (lint mental)

1. **Proibido** `text-arcana-text-dim/NN` com `NN < 70` — se precisa de menos ênfase, use `text-arcana-text-muted` (só decorativo) ou reescreva a hierarquia.
2. Labels de chrome: mínimo `text-[10px]`; corpo: mínimo `text-sm` em Crimson.
3. Botões: sempre uma das classes `.arcana-btn-*` — nunca recriar botão com utilitários soltos.
4. Overlays/menus: sempre `.arcana-glass`, nunca `bg-*/opacity` improvisado.
5. Glow máximo 24px; ouro em gradiente vertical (luz vem de cima).

## 6. Migração aplicada nesta versão

- `app/globals.css`: tokens v2 + componentes novos (§4) + scrollbar global + focus-visible.
- Varredura nas superfícies novas (`app/campaigns/`, `components/campaign-creation/`, `components/campaign-story/`) e no chrome compartilhado do wizard (`components/character-creation/WizardLayout.tsx`, `StepIndicator.tsx`): opacidades de texto elevadas, fontes de 7–9px promovidas a 10px+, botões migrados para as classes novas, fundos `rgba(7,7,13,…)` atualizados para o bg v2.
- Landing (`arcana-ember/aura/mist` etc.) intocada: é cena cinematográfica sobre imagem, não chrome de UI.
