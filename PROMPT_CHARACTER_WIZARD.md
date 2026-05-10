# PROMPT — Character Creation Wizard (Progressive Visual)

Cole isso no Claude Code em **plan mode** antes de executar.

---

Leia os arquivos:
- `SPEC_CHARACTER_CREATION_WIZARD.md`
- `SPEC_CHARACTER_CREATION_VARIABLES.md`
- `app/play/characters/new/page.tsx` (wizard atual)
- `lib/types.ts`
- `lib/supabase-server.ts`
- `app/api/ai/generate-avatar/route.ts` (se existir)

---

## Objetivo

Substituir o wizard de criação de personagem atual por um wizard de **8 etapas progressivas** onde o personagem é gerado visualmente em tempo real, como um jogo de videogame (Skyrim/Elden Ring/Baldur's Gate).

**O princípio:** a imagem nunca está vazia. O boneco começa em roupa íntima/base na etapa 2, e vai recebendo camadas (traje da classe, detalhes do antecedente, armadura, arma) conforme o jogador avança.

---

## PARTE 1 — Banco de dados

### 1.1 Migration SQL

Crie o arquivo `supabase/migrations/004_character_creation.sql` com:

```sql
ALTER TABLE characters ADD COLUMN IF NOT EXISTS background TEXT;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS subrace TEXT;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS sex TEXT DEFAULT 'male';
ALTER TABLE characters ADD COLUMN IF NOT EXISTS age_category TEXT DEFAULT 'adult';
ALTER TABLE characters ADD COLUMN IF NOT EXISTS alignment TEXT;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS personality JSONB DEFAULT '{}';
ALTER TABLE characters ADD COLUMN IF NOT EXISTS race_traits JSONB DEFAULT '{}';
ALTER TABLE characters ADD COLUMN IF NOT EXISTS class_features JSONB DEFAULT '{}';
ALTER TABLE characters ADD COLUMN IF NOT EXISTS appearance_description TEXT;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS reference_photo_url TEXT;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS avatar_history JSONB DEFAULT '[]';
```

Instrução ao usuário: rodar no Supabase SQL Editor antes de continuar.

---

## PARTE 2 — Dados estáticos (lib/character-creation/)

Crie a pasta `lib/character-creation/` com os seguintes arquivos:

### `race-data.ts`
Exporta array `RACES` com as 9 raças do PHB. Cada raça:
```typescript
type Race = {
  id: string
  name: string          // "Elfo"
  subraces: SubRace[]
  abilityBonus: Partial<Record<'str'|'dex'|'con'|'int'|'wis'|'cha', number>>
  speed: number         // metros (7.5 anão, 9 humano/elfo)
  size: 'small' | 'medium'
  traits: string[]      // nomes dos traços raciais
  languages: string[]
  visualDescription: string  // para o prompt do ChatGPT
  // "pointed ears, slender build, almond-shaped eyes, graceful posture"
}
```

Dados das 9 raças (do livro, Cap 2):
- **Anão** (sub: Colina +1 SAB, Montanha +2 FOR): velocidade 7.5m, Pequeno/Médio, Visão no Escuro, Resiliência Anã, Proficiência com machados/martelos
- **Elfo** (sub: Alto +1 INT, Floresta +1 SAB, Drow +1 CAR): 9m, Médio, Visão no Escuro, Sentidos Aguçados, Ancestralidade Élfica, Transe
- **Halfling** (sub: Pés-leves +1 CAR, Robusto +1 CON): 7.5m, Pequeno, Sortudo, Corajoso, Agilidade Halfling
- **Humano**: 9m, Médio, +1 em TODOS os atributos, 1 idioma extra
- **Draconato**: 9m, Médio, +2 FOR +1 CAR, Ancestralidade Dracônica (10 cores/elementos), Sopro, Resistência a dano
- **Gnomo** (sub: Floresta +1 DES, Rochas +2 INT): 7.5m, Pequeno, Visão no Escuro, Astúcia Gnômica
- **Meio-Elfo**: 9m, Médio, +2 CAR +1 em dois outros, Visão no Escuro, Sangue Élfico, +2 perícias
- **Meio-Orc**: 9m, Médio, +2 FOR +1 CON, Visão no Escuro, Ameaçador, Resistência Implacável, Ataques Brutais
- **Tiefling**: 9m, Médio, +2 CAR +1 INT, Visão no Escuro, Resistência Infernal, Herança Infernal (magias)

### `class-data.ts`
Exporta array `CLASSES` com as 12 classes. Cada classe:
```typescript
type Class = {
  id: string
  name: string             // "Guerreiro"
  hitDie: 6 | 8 | 10 | 12
  primaryAbility: string
  savingThrows: [string, string]
  armorProficiency: string[]
  weaponProficiency: string[]
  primaryAttribute: 'str'|'dex'|'con'|'int'|'wis'|'cha'
  visualDescription: string   // para o prompt
  // "plate-armored, sword and shield, commanding posture"
  basicAttire: string         // roupa básica da etapa 3
  // "leather gambeson, simple soldier's tunic, boots"
  startingEquipmentChoices: EquipmentChoice[]
  isSpellcaster: boolean
  spellcastingAbility?: string
}
```

Dados das 12 classes (do livro, Cap 3):
- **Bárbaro**: d12, FOR, basicAttire: "tribal hide vest, fur-lined boots, leather arm wraps"
- **Bardo**: d8, CAR, basicAttire: "colorful traveling clothes, simple lute on back"
- **Bruxo**: d8, CAR, basicAttire: "dark hooded cloak, worn eldritch robes, tome at hip"
- **Clérigo**: d8, SAB, basicAttire: "simple religious vestments, holy symbol pendant on chest"
- **Druida**: d8, SAB, basicAttire: "natural fiber robes, leaf and wood accessories, no metal"
- **Feiticeiro**: d6, CAR, basicAttire: "ornate but worn robes, faint magical marks visible on skin"
- **Guerreiro**: d10, FOR/DES, basicAttire: "leather gambeson, simple soldier's tunic, worn boots"
- **Ladino**: d8, DES, basicAttire: "dark fitted leather outfit, hooded cloak, hidden dagger visible"
- **Mago**: d6, INT, basicAttire: "scholarly robes, cloth belt, leather satchel with books"
- **Monge**: d8, DES+SAB, basicAttire: "loose-fitting monk's training robes, bare feet, meditation beads"
- **Paladino**: d10, FOR+CAR, basicAttire: "white tunic with religious sigil, traveling cape, symbol at chest"
- **Patrulheiro**: d10, DES+SAB, basicAttire: "green forest cloak, leather vest, longbow slung on back"

Equipamentos iniciais (choices) para cada classe conforme o livro:
- Bárbaro: (a) machado grande OU (b) arma marcial + (a) 2 machadinhas OU (b) arma simples + pacote aventureiro + 4 azagaias
- Bardo: (a) rapieira OU (b) espada longa OU (c) arma simples + (a) kit diplomata OU (b) kit artista + (a) alaúde OU (b) instrumento + armadura de couro
- Etc. (implementar todas as 12 do livro)

### `background-data.ts`
Exporta array `BACKGROUNDS` com os 13 antecedentes:
```typescript
type Background = {
  id: string
  name: string           // "Soldado"
  skills: string[]       // 2 perícias
  tools?: string[]       // ferramentas
  languages?: number     // quantos idiomas extras
  equipment: string[]    // itens iniciais
  gold: number          // ouro inicial
  visualDetail: string  // detalhe visual sutil para o prompt
  // "battle scar on left cheek, military posture"
  feature: string       // nome da característica especial
  featureDesc: string   // descrição curta
  personalityTraits: string[]  // 8 opções
  ideals: string[]      // 6 opções
  bonds: string[]       // 6 opções
  flaws: string[]       // 6 opções
}
```

Os 13 antecedentes com visual detail:
- Acólito → "holy symbol visible on neck, serene expression"
- Artesão de Guilda → "callused hands, guild insignia on belt"
- Artista → "colorful outfit, instrument case on back"
- Charlatão → "fine clothes slightly worn, knowing smirk"
- Criminoso → "dark circles under eyes, suspicious glance"
- Eremita → "long unkempt hair/beard, simple worn robes"
- Forasteiro → "tribal marks or tattoos, animal-hide accessories"
- Herói do Povo → "simple farmer's clothes, determined look"
- Marinheiro → "nautical tattoo on forearm, weathered skin"
- Nobre → "subtle jewelry, fine fabric hints under armor"
- Órfão → "patched clothing, street-smart posture"
- Sábio → "ink stain on fingers, round spectacles"
- Soldado → "scar on left cheek, rigid military posture"

### `prompt-builder.ts`
Exporta função `buildCharacterPrompt(data: Partial<CharacterCreationData>): string`

Monta o prompt acumulativo baseado no que já foi preenchido:

```typescript
export function buildCharacterPrompt(data: {
  sex?: string
  ageCategory?: string
  raceName?: string
  subraceName?: string
  raceVisualDescription?: string
  className?: string
  classBasicAttire?: string
  backgroundVisualDetail?: string
  outfitDescription?: string     // texto livre etapa 6
  weaponDescription?: string     // texto livre etapa 6
  focusDescription?: string      // foco mágico (conjuradores)
  step: 2 | 3 | 5 | 6           // qual etapa está gerando
}): string

// Lógica:
// step 2 (raça): boneco em roupa íntima
// step 3 (classe): + attire básico da classe
// step 5 (antecedente): + visual detail do antecedente
// step 6 (equipamento): + outfit customizado + arma + foco
```

Prompt base (step 2):
```
{sex} {age} {race} character, {raceVisualDescription},
wearing only basic undergarments (simple linen tunic and cloth shorts),
neutral standing pose, arms slightly away from body,
dark plain background, soft ambient lighting,
detailed fantasy illustration style, full body portrait,
high quality, professional concept art
```

Adiciona progressivamente nas etapas seguintes.

### `outfit-suggestions.ts`
Exporta `getOutfitSuggestions(classId: string, backgroundId: string): string[]`
Retorna 4 sugestões de vestimenta para o campo de texto livre da etapa 6.

---

## PARTE 3 — API de geração de imagem

### `app/api/ai/generate-character-image/route.ts`

```typescript
// POST /api/ai/generate-character-image
// Body: { prompt: string, referenceImageUrl?: string, step: number }
// Retorna: { imageUrl: string }

// Usar DALL-E 3 via OpenAI API (OPENAI_API_KEY já está no .env)
// modelo: "dall-e-3"
// size: "1024x1024"
// quality: "standard"
// response_format: "url"
```

Se `referenceImageUrl` existe, incluir no contexto do prompt (image-to-image quando possível, ou adicionar descrição facial).

Salvar URLs geradas temporariamente (TTL 1h via header `Cache-Control`).

---

## PARTE 4 — Wizard (UI)

### Estrutura de arquivos

```
app/play/characters/new/
├── page.tsx              ← server component (auth check)
└── CharacterWizard.tsx   ← client component principal

components/character-creation/
├── WizardLayout.tsx      ← layout 2 colunas (form | preview)
├── CharacterPreview.tsx  ← coluna direita com imagem + loading
├── PreviewSkeleton.tsx   ← shimmer loading
├── StepIndicator.tsx     ← indicador de progresso (8 dots)
├── steps/
│   ├── Step1Identity.tsx
│   ├── Step2Race.tsx
│   ├── Step3Class.tsx
│   ├── Step4Stats.tsx
│   ├── Step5Background.tsx
│   ├── Step6Equipment.tsx
│   ├── Step7Spells.tsx
│   └── Step8Review.tsx
└── cards/
    ├── RaceCard.tsx
    ├── ClassCard.tsx
    └── BackgroundCard.tsx
```

### `CharacterWizard.tsx` (estado global)

Estado do wizard:
```typescript
const [step, setStep] = useState(1)
const [data, setData] = useState<Partial<CharacterCreationData>>({})
const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null)
const [isGenerating, setIsGenerating] = useState(false)
const [imageHistory, setImageHistory] = useState<string[]>([])
```

Ao avançar de etapa, verificar se é uma etapa de geração (2, 3, 5, 6) e chamar a API automaticamente.

AbortController para cancelar geração se o jogador trocar escolha antes da imagem chegar.

### `WizardLayout.tsx`
```
Desktop: grid 2 colunas (55% form | 45% preview)
Mobile: coluna única com tab toggle (Formulário / Personagem)
```

### `CharacterPreview.tsx`
- Enquanto `isGenerating`: mostra `PreviewSkeleton` com textos rotativos
  - "Conjurando seu personagem..."
  - "Tecendo a essência..."
  - "O destino se manifesta..."
  - "Moldando o herói..."
- Quando tem imagem: `next/image` com fade-in suave
- Botão "🔄 Regerar" visível quando há imagem (etapas 3+)
- Histórico de versões: arrows ← → pra ver versões anteriores geradas

### `Step1Identity.tsx`
Campos:
- Nome (input text)
- Sexo (3 botões: Masculino / Feminino / Andrógino)
- Idade (4 botões: Jovem / Adulto / Maduro / Ancião)
- Upload de foto (opcional): "Envie uma foto do rosto para manter a aparência nas gerações"

Sem chamada de API. Botão "Próximo" ativa quando nome está preenchido.

### `Step2Race.tsx`
Grid 3 colunas (mobile: 2) com `RaceCard`:
- Ícone/emoji da raça
- Nome
- Sub-raças (se houver) — expandem ao clicar no card

Ao selecionar raça (e sub-raça se necessário): 
- Salva no estado
- **Chama API automaticamente** com prompt da etapa 2
- Mostra loading na preview enquanto gera

### `Step3Class.tsx`
Grid 3 colunas com `ClassCard`:
- Ícone da classe
- Nome
- Dado de Vida (d6/d8/d10/d12)
- Atributo principal
- Vibe em 3 palavras ("Resistente · Furtivo · Ágil")

Ao selecionar:
- **Chama API** com prompt etapa 3 (acumula raça + classe)

### `Step4Stats.tsx`
3 métodos em tabs:
1. **Array padrão** (recomendado para iniciantes): distribuir 15, 14, 13, 12, 10, 8 pelos 6 atributos via drag ou select
2. **Compra de pontos**: 27 pontos, interface com sliders
3. **Rolagem**: botão rolar 4d6 drop lowest × 6, pode re-rolar

Mostrar modificadores em tempo real: `(valor - 10) / 2` arredondado.
Mostrar HP calculado: `hitDie max + mod CON`.

### `Step5Background.tsx`
Grid 2 colunas com cards de antecedente:
- Nome
- Perícias extras
- Itens iniciais (lista rápida)
- Detalhe visual (cicatriz, tatuagem, etc.)

Ao selecionar: botão "Atualizar visual" aparece → clicando chama API com etapa 5.
(Não regera automático — deixa o jogador decidir se quer atualizar)

### `Step6Equipment.tsx`
3 sub-seções:

**6.1 — Kit inicial da classe**
Mostra as choices "(a) ou (b) ou (c)" da classe escolhida.
Cada item escolhido vai para `data.inventory`.

**6.2 — Vestimenta (texto livre)**
Textarea: "Como seu personagem se veste?"
Sugestões clicáveis (chips) retornadas de `getOutfitSuggestions(classId, backgroundId)`.

**6.3 — Arma e foco**
Com base no inventário escolhido em 6.1, mostra o campo:
"Descreva sua arma principal" (ex: "espada longa de aço com punho de couro vermelho")
Para conjuradores: "Descreva seu foco mágico"

**Botão "Gerar personagem"** → chama API com prompt etapa 6 (completo).
Após gerar: botão "🔄 Regenerar" disponível.

### `Step7Spells.tsx`
Aparece APENAS se `class.isSpellcaster === true`.

Truques (cantrips): grid de cards com nome + escola + descrição curta. Selecionar N (por classe).
Magias 1º nível: idem. Selecionar N (por classe).

Usar dados da Open5e API para listar magias por classe:
`GET https://api.open5e.com/v1/spells/?level=0&classes={className}&limit=50`

### `Step8Review.tsx`
Layout:
- **Esquerda:** ficha resumida (atributos, HP, CA, proficiências, magias, inventário, traços)
- **Direita:** imagem final + nome + classe + raça

Botão "✨ Criar Personagem" → server action que salva no banco e redireciona `/hub`.

---

## PARTE 5 — Server Action (salvar personagem)

### `app/play/characters/new/actions.ts`

```typescript
'use server'
export async function createCharacter(data: CharacterCreationData) {
  // 1. Auth check
  // 2. Calcular HP = hitDie max + mod CON
  // 3. Calcular CA = armadura equipada + mod DES (se aplicável)
  // 4. Calcular initiative = mod DES
  // 5. Calcular speed = da raça
  // 6. Salvar avatar_history como array de URLs
  // 7. INSERT na tabela characters
  // 8. Redirecionar para /hub
}
```

---

## REGRAS DE IMPLEMENTAÇÃO

1. **TypeScript estrito** — sem `any`, tipar tudo
2. **Visual dark fantasy consistente** — usar tokens CSS do projeto (arcana-bg, arcana-gold, Cinzel)
3. **Mobile-first** — wizard funciona em 390px
4. **AbortController** nas chamadas de imagem — se mudar de escolha, cancela a request anterior
5. **Não quebrar** rotas existentes (`/play/characters/select`, `/play/characters/new` existente pode ser sobrescrito)
6. **`npx tsc --noEmit`** no final sem erros
7. **Open5e API** apenas para listar magias na etapa 7 (não instalar pacote, usar fetch nativo)
8. **OPENAI_API_KEY** já está no `.env.local` — usar para DALL-E 3

---

## O QUE NÃO FAZER

- Não instalar bibliotecas novas (sem framer-motion, sem react-spring, sem swiper)
- Não criar sistema de magias completo — apenas seleção básica na etapa 7
- Não implementar multiclasse
- Não implementar feitos/talentos (nível 4+)
- Não mudar `lib/types.ts` — adicionar campos opcionais apenas com `?`

---

## ANTES DE IMPLEMENTAR

Mostre o plano completo dividido em:
1. Arquivos de dados estáticos a criar
2. Componentes a criar
3. API route a criar/modificar
4. Server action a criar
5. Migration SQL

Pergunte se pode prosseguir.
