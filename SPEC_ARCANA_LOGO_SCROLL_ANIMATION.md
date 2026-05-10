# SPEC_ARCANA_LOGO_SCROLL_ANIMATION.md
## Arcana — Animação de Logo no Scroll (Estilo Apple)
**Arquivo alvo:** `components/landing/LandingHero.tsx` (logo "ARCANA" existente)
**Dependências:** zero — CSS puro + rAF (já no projeto)

---

## 1. EFEITO DESEJADO

Ao rolar a página para baixo, a logo "ARCANA" cresce na tela com perspectiva 3D, desfoque de movimento e fade — sensação de que a câmera está se aproximando do texto organicamente. Estilo Apple keynote / product reveal.

---

## 2. COMPORTAMENTO

### 2.1 Estado inicial (scroll = 0)
- Logo no tamanho normal
- Sem blur, sem perspectiva
- Opacidade 1

### 2.2 Durante o scroll (0 → 60% da viewport)
À medida que o usuário rola:

**Escala:** `scale` cresce de `1.0` → `2.8`
- Curva ease-out (começa rápido, desacelera)
- Origem do zoom: `transform-origin: center center`

**Perspectiva 3D:** `perspective(600px) translateZ(0px)` → `perspective(600px) translateZ(120px)`
- Dá sensação de aproximação em profundidade
- Combinado com leve `rotateX(-2deg)` → `rotateX(0deg)` (endireita conforme aproxima)

**Motion blur:** `filter: blur(0px)` → `blur(6px)` no pico do scroll → volta para `blur(0px)`
- Blur cresce até 40% do scroll, depois diminui
- Simula desfoque de movimento (câmera acelerando e desacelerando)

**Opacidade:** `opacity: 1` → `0.0` ao atingir 70% do scroll
- Fade suave, logo some antes de sair completamente da tela

**Letter-spacing:** `0.35em` → `0.55em`
- Letras se abrem levemente conforme crescem — efeito orgânico

### 2.3 Fim do scroll (> 70% da viewport)
- Logo invisível (opacity 0)
- Tagline e CTAs continuam visíveis (z-index separado)

---

## 3. IMPLEMENTAÇÃO TÉCNICA

### 3.1 Estrutura de camadas
```
[Hero container]
  ├── [bg landscape] z-0
  ├── [mist] z-10
  ├── [vinheta] z-20
  ├── [brasas] z-25
  ├── [ARCANA logo wrapper] z-30  ← ANIMAR AQUI
  │     └── <h1>ARCANA</h1>
  ├── [personagem PNG] z-35
  ├── [fade base] z-40
  └── [tagline + CTAs] z-50
```

### 3.2 Ref e cálculo no scroll handler existente
O `LandingHero.tsx` já tem um `useEffect` com `window.addEventListener('scroll', onScroll)` e `requestAnimationFrame`. Adicionar dentro dele:

```typescript
// progress: 0 (topo) → 1 (quando scroll = 70% da vh)
const progress = Math.min(1, scrollY / (window.innerHeight * 0.7));

// Easing: ease-out cúbico
const eased = 1 - Math.pow(1 - progress, 3);

// Escala: 1.0 → 2.8
const scale = 1 + eased * 1.8;

// TranslateZ: 0 → 120px
const tz = eased * 120;

// RotateX: -2deg → 0deg
const rx = -2 + eased * 2;

// Motion blur: sobe até 40% depois desce
const blurProgress = progress < 0.4
  ? progress / 0.4          // 0 → 1 na primeira metade
  : (1 - progress) / 0.6;   // 1 → 0 na segunda metade
const blur = blurProgress * 6; // máx 6px

// Letter-spacing: 0.35em → 0.55em
const ls = 0.35 + eased * 0.20;

// Opacidade: 1 → 0 entre 50% e 70% do scroll
const opacity = progress < 0.5 ? 1 : Math.max(0, 1 - (progress - 0.5) / 0.2);

// Aplicar no elemento
if (logoRef.current) {
  logoRef.current.style.transform =
    `perspective(600px) translateZ(${tz}px) scale(${scale}) rotateX(${rx}deg)`;
  logoRef.current.style.filter = `blur(${blur}px)`;
  logoRef.current.style.letterSpacing = `${ls}em`;
  logoRef.current.style.opacity = String(opacity);
}
```

### 3.3 Ref necessária
```typescript
const logoRef = useRef<HTMLHeadingElement>(null);
```

Adicionar `ref={logoRef}` no `<h1>` existente do título "ARCANA".

### 3.4 CSS base no elemento
```css
/* No h1 da logo — garantir que transform não conflite */
will-change: transform, filter, opacity;
transform-style: preserve-3d;
backface-visibility: hidden;
transition: none; /* desligar transitions — tudo via JS para ser síncrono com scroll */
```

---

## 4. PERFORMANCE

- `will-change: transform, filter` → GPU compositing
- `requestAnimationFrame` já implementado — não adiciona listener novo
- `passive: true` no scroll listener (já está no código)
- `prefers-reduced-motion` → desliga blur e translateZ, mantém só opacity fade

---

## 5. O QUE NÃO MUDA

- Posição e layout do h1 na tela
- Reveal cinematográfico inicial (arcana-title-reveal keyframe)
- Tagline, CTAs, personagem PNG — não são afetados
- Mobile: efeito completo (scroll existe no mobile)
- Sem biblioteca nova — zero dependências

---

## 6. RESULTADO ESPERADO

Scroll suave → logo cresce como se a câmera voasse em direção ao texto → blur de movimento suave no meio do caminho → letras se abrem → logo some com fade → personagem e CTAs ficam em foco. Sensação cinematográfica, orgânica, premium.
