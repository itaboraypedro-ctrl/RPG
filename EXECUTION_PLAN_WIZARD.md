# EXECUTION_PLAN_WIZARD.md
## Arcana — Wizard de Criação Progressiva
## Plano de Execução Paralela por Agentes

Cole isso no Claude Code após aprovar o plano.

---

## INSTRUÇÃO GERAL

Execute este plano usando **múltiplos agentes simultâneos**. Cada agente é independente e não depende dos outros para começar. Lance todos ao mesmo tempo.

---

## AGENTE 1 — Dados Estáticos (Simples)
**Responsabilidade:** Criar todos os arquivos de dados puros sem lógica de UI.
**Pode começar:** imediatamente
**Depende de:** nada

```
Crie a pasta lib/character-creation/ e os seguintes arquivos:

1. lib/character-creation/race-data.ts
   - Array RACES com 9 raças completas do PHB (Anão, Elfo, Halfling, Humano,
     Draconato, Gnomo, Meio-Elfo, Meio-Orc, Tiefling)
   - Cada raça tem: id, name, subraces[], abilityBonus, speed, size,
     traits[], languages[], visualDescription (string em inglês para o prompt)
   - Sub-raças com seus bônus específicos

2. lib/character-creation/class-data.ts
   - Array CLASSES com 12 classes do PHB
   - Cada classe tem: id, name, hitDie, primaryAbility, savingThrows,
     armorProficiency[], weaponProficiency[], primaryAttribute,
     visualDescription, basicAttire, startingEquipmentChoices[],
     isSpellcaster, spellcastingAbility?
   - startingEquipmentChoices: array de grupos, cada grupo tem opções (a/b/c)

3. lib/character-creation/background-data.ts
   - Array BACKGROUNDS com 13 antecedentes do PHB
   - Cada antecedente tem: id, name, skills[], tools?, languages?,
     equipment[], gold, visualDetail, feature, featureDesc,
     personalityTraits[], ideals[], bonds[], flaws[]

4. lib/character-creation/outfit-suggestions.ts
   - Função getOutfitSuggestions(classId: string, backgroundId: string): string[]
   - Retorna 4 sugestões de vestimenta combinando classe + antecedente
   - Ex: guerreiro+soldado → ["armadura de placas envelhecida com manto vermelho", ...]

5. lib/character-creation/types.ts
   - Todos os tipos TypeScript usados no wizard:
     CharacterCreationData, Race, SubRace, Class, EquipmentChoice,
     Background, WizardStep (1-8)
   - NÃO modificar lib/types.ts

Ao terminar: npx tsc --noEmit (só nos arquivos criados)
```

---

## AGENTE 2 — prompt-builder + API route (Médio)
**Responsabilidade:** Lógica de montagem de prompt e endpoint de geração de imagem.
**Pode começar:** imediatamente (só depende dos tipos do Agente 1, mas pode usar tipos inline por ora)
**Depende de:** Agente 1 (tipos) — pode usar `any` provisoriamente e tipar depois

```
Crie:

1. lib/character-creation/prompt-builder.ts
   Exporta buildCharacterPrompt(data, step: 2|3|5|6): string

   Lógica acumulativa:
   - step 2: "{sex} {age} {race} character, {raceVisualDescription},
     wearing only basic undergarments (simple linen tunic and cloth shorts),
     neutral standing pose, arms slightly away from body,
     dark plain background, soft ambient lighting,
     detailed fantasy illustration style, full body portrait,
     high quality, professional concept art"

   - step 3: step 2 base + remove "undergarments" + adiciona:
     "wearing {classBasicAttire}"

   - step 5: step 3 base + adiciona:
     "{backgroundVisualDetail}"

   - step 6: step 5 base + substitui attire por:
     "wearing {outfitDescription}" + adiciona:
     "holding {weaponDescription}" + se conjurador:
     "with {focusDescription} as magical focus" +
     muda pose: "heroic stance, dramatic lighting"

   Se referenceImageUrl fornecida: adiciona ao final
   "maintain consistent face and facial features from reference"

2. app/api/ai/generate-character-image/route.ts
   POST endpoint:
   - Body: { prompt: string, referenceImageUrl?: string, step: number }
   - Auth: usar getProfile() de lib/auth.ts (igual ao generate-avatar)
   - DALL-E 3: modelo dall-e-3, size 1024x1024, quality standard, n=1
   - Response: { imageUrl: string }
   - Fallback: se OPENAI_API_KEY vazia, retorna SVG placeholder como data URL
   - Headers: Cache-Control: private, max-age=3600
   - Não modificar app/api/ai/generate-avatar/route.ts existente

Ao terminar: npx tsc --noEmit nos arquivos criados
```

---

## AGENTE 3 — Migration SQL + Server Action (Simples/Médio)
**Responsabilidade:** Banco de dados e lógica de save do personagem.
**Pode começar:** imediatamente
**Depende de:** nada (pode usar tipos inline)

```
Crie:

1. supabase/migrations/004_character_creation.sql
   Conteúdo exato:
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

   Adicionar comentário no topo:
   -- RODAR MANUALMENTE NO SUPABASE SQL EDITOR ANTES DO DEPLOY

2. app/play/characters/new/actions.ts
   'use server'
   Exporta createCharacter(data: CharacterCreationData)

   Lógica:
   a. Auth via getProfile() — se falhar, throw error
   b. Calcular campos derivados:
      - mod = (val: number) => Math.floor((val - 10) / 2)
      - max_hp = data.hitDie + mod(data.stats.constitution ?? 10)
      - ac = data.armorAC ?? (10 + mod(data.stats.dexterity ?? 10))
      - initiative = mod(data.stats.dexterity ?? 10)
      - speed = data.raceSpeed ?? 9
      - gold = data.backgroundGold ?? 0
   c. Supabase INSERT em characters com todos os campos
      (campos novos opcionais com IF EXISTS pattern — não quebrar se migration não rodou)
   d. revalidatePath('/hub')
   e. redirect('/hub')

3. Atualizar app/play/characters/new/page.tsx
   Server component que:
   - Chama getProfile() — redireciona /login se não autenticado
   - Renderiza <CharacterWizard /> (ainda não existe, mas importar com dynamic())
   - Passa profile como prop

Ao terminar: npx tsc --noEmit nos arquivos criados
```

---

## AGENTE 4 — Componentes Base + Layout (Médio)
**Responsabilidade:** Estrutura do wizard, layout, preview, indicadores.
**Pode começar:** imediatamente
**Depende de:** Agente 1 (tipos) — pode usar tipos inline provisoriamente

```
Crie em components/character-creation/:

1. WizardLayout.tsx
   - Props: { formContent: React.ReactNode, previewContent: React.ReactNode }
   - Desktop: CSS grid 2 colunas (55% | 45%), sticky preview
   - Mobile: 1 coluna com tab toggle "Formulário" / "Personagem"
   - Paleta Arcana: bg-arcana-bg, bordas arcana-gold/20
   - Fonte Cinzel para labels

2. StepIndicator.tsx
   - Props: { currentStep: number, totalSteps: 8 }
   - 8 dots: preenchido (concluído), pulsando (atual), vazio (futuro)
   - Cor: arcana-gold para concluído/atual, zinc-700 para futuro
   - Labels abaixo (desktop): "Identidade", "Raça", "Classe"...

3. PreviewSkeleton.tsx
   - Shimmer animado na silhueta de corpo humano
   - Texto rotativo a cada 3s:
     "Conjurando seu personagem..."
     "Tecendo a essência..."
     "O destino se manifesta..."
     "Moldando o herói..."
   - Usar CSS animation (não framer-motion)

4. CharacterPreview.tsx
   - Props: { imageUrl: string | null, isGenerating: boolean,
             history: string[], onRegenerate: () => void,
             onNavigateHistory: (dir: 'prev'|'next') => void }
   - Se isGenerating: mostra PreviewSkeleton
   - Se imageUrl: next/image com fade-in (opacity transition CSS)
   - Botão "🔄 Regerar" (só aparece nas etapas 3+)
   - Arrows ← → para navegar histórico (só aparece se history.length > 1)
   - Rodapé: nome do personagem + classe + raça (vindos de props)

5. cards/RaceCard.tsx
   - Props: { race: Race, selected: boolean, onSelect: (race) => void }
   - Card com emoji da raça, nome, sub-raças colapsáveis
   - Borda arcana-gold quando selected
   - Quando tem sub-raças: dropdown inline após seleção
   - Mobile-friendly: toque expande sub-raças

6. cards/ClassCard.tsx
   - Props: { class: Class, selected: boolean, onSelect: (class) => void }
   - Ícone, nome, dado de vida, atributo principal, vibe em 3 palavras
   - Tag colorida por tipo: Fighter=dourado, Mage=roxo, Rogue=verde...

7. cards/BackgroundCard.tsx
   - Props: { background: Background, selected: boolean, onSelect }
   - Nome, perícias, visual detail highlight

Ao terminar: npx tsc --noEmit nos arquivos criados
```

---

## AGENTE 5 — Steps 1, 2, 3 (Médio)
**Responsabilidade:** Primeiras 3 etapas do wizard (identidade, raça, classe).
**Pode começar:** imediatamente
**Depende de:** Agente 4 (cards) — pode criar stubs dos cards se não existirem ainda

```
Crie em components/character-creation/steps/:

1. Step1Identity.tsx
   Campos:
   - Input: "Nome do personagem" (required, min 2 chars)
   - Botões: Sexo (Masculino / Feminino / Andrógino) — toggle exclusivo
   - Botões: Idade (Jovem / Adulto / Maduro / Ancião) — toggle exclusivo
   - Upload de foto (optional):
     input type="file" accept="image/*"
     Preview 80×80 circular da foto após upload
     Converte para base64 e salva em data.referencePhoto
     Label: "Envie uma foto do rosto para manter a aparência entre gerações"
   - Botão "Próximo →": habilitado apenas quando nome preenchido
   - SEM chamada de API

2. Step2Race.tsx
   - Grid 3 colunas desktop / 2 mobile com RaceCard para cada raça
   - Ao clicar na raça: salva no estado
   - Se tem sub-raças: expande inline no card para escolha
   - Após raça + sub-raça selecionadas: chama generateImage({ step: 2 })
   - AbortController: se mudar de raça antes de gerar, cancela a request anterior
   - Mostra bônus de atributos da raça selecionada (chip: "+2 FOR, +1 CON")
   - Botão "Próximo" habilitado após raça (e sub-raça se houver) selecionada

3. Step3Class.tsx
   - Grid 3 colunas desktop / 2 mobile com ClassCard para cada classe
   - Ao clicar: salva no estado + chama generateImage({ step: 3 })
   - AbortController: cancela geração anterior se trocar de classe
   - Mostra resumo da classe selecionada:
     Dado: d{hitDie} | HP inicial: {hitDie} + mod CON
     Armaduras: {armorProficiency.join(', ')}
     Atributo: {primaryAbility}
   - Botão "Próximo" habilitado após classe selecionada

Função generateImage a ser usada nas Steps 2 e 3:
```typescript
const generateImage = async (step: 2 | 3 | 5 | 6) => {
  abortController.current?.abort()
  abortController.current = new AbortController()
  setIsGenerating(true)
  try {
    const prompt = buildCharacterPrompt({ ...data, step })
    const res = await fetch('/api/ai/generate-character-image', {
      method: 'POST',
      body: JSON.stringify({ prompt, referenceImageUrl: data.referencePhotoUrl, step }),
      signal: abortController.current.signal,
    })
    const { imageUrl } = await res.json()
    setCurrentImageUrl(imageUrl)
    setImageHistory(prev => [...prev, imageUrl])
  } catch (e) {
    if ((e as Error).name !== 'AbortError') console.error(e)
  } finally {
    setIsGenerating(false)
  }
}
```

Ao terminar: npx tsc --noEmit nos arquivos criados
```

---

## AGENTE 6 — Steps 4, 5, 6 (Complexo)
**Responsabilidade:** Atributos, antecedente, equipamento — as etapas mais complexas.
**Pode começar:** imediatamente
**Depende de:** Agente 1 (dados), Agente 4 (cards)

```
Crie em components/character-creation/steps/:

1. Step4Stats.tsx
   Tabs: "Array Padrão" | "Compra de Pontos" | "Rolagem"

   Tab "Array Padrão":
   - 6 valores disponíveis: [15, 14, 13, 12, 10, 8]
   - Cada atributo tem um select para escolher qual valor usar
   - Cada valor só pode ser usado uma vez (remove das opções após uso)
   - Mostrar modificador em tempo real: floor((val-10)/2) com + ou -

   Tab "Compra de Pontos":
   - 27 pontos disponíveis
   - Cada atributo começa em 8, pode ir até 15
   - Custo: 8-13 = 1pt/nível, 14 = 2pts, 15 = 2pts
   - Mostra pontos restantes em tempo real
   - Bloqueia botão Próximo se pontos sobrando > 0

   Tab "Rolagem":
   - Botão "🎲 Rolar atributos" → gera 6 valores (4d6 drop lowest)
   - Mostra os valores gerados
   - Permite redistribuir com selects (igual Array Padrão)
   - Botão "Rolar novamente" disponível

   Em todos os tabs:
   - Mostrar HP calculado: {hitDie}+{modCON} = {total}
   - Mostrar bônus raciais aplicados (+{bonus} em verde)
   - Botão "Próximo" após todos os 6 atributos distribuídos

2. Step5Background.tsx
   - Grid 2 colunas com BackgroundCard para os 13 antecedentes
   - Ao selecionar: mostra detalhes expandidos
     - Perícias treinadas
     - Itens iniciais
     - Detalhe visual (cicatriz, tatuagem...)
     - Traço de personalidade sugerido
   - Após seleção: aparece botão "✨ Atualizar visual do personagem"
     - Clicar chama generateImage({ step: 5 }) — NÃO automático
   - Botão "Próximo" habilitado após antecedente selecionado

3. Step6Equipment.tsx
   Dividido em 3 sub-seções com accordion:

   Sub-seção 6.1 "Kit de equipamento inicial":
   - Para cada grupo de choices da classe (startingEquipmentChoices):
     Mostrar botões radio "(a) machado grande OU (b) qualquer arma marcial"
     Cada escolha vai para data.inventory quando selecionada
   - Mostrar resumo do inventário atual

   Sub-seção 6.2 "Como seu personagem se veste?":
   - Textarea (min 3 linhas) com placeholder sugestivo
   - Chips clicáveis abaixo: getOutfitSuggestions(classId, backgroundId)
     Clicar no chip preenche/substitui o textarea
   - Contador de chars (máx 300)

   Sub-seção 6.3 "Arma e foco mágico":
   - Input text: "Descreva sua arma principal"
     Placeholder baseado na arma escolhida em 6.1
     Ex: se escolheu machado grande → "ex: machado de batalha enferrujado..."
   - Se classe é conjuradora:
     Input text: "Descreva seu foco mágico"
     Placeholder: "ex: cajado de carvalho com cristal azul no topo"

   Botão grande "⚔️ Gerar personagem completo":
   - Chama generateImage({ step: 6 })
   - Após gerar: botão "🔄 Regenerar" aparece
   - Desabilitado se outfit vazio

Ao terminar: npx tsc --noEmit nos arquivos criados
```

---

## AGENTE 7 — Steps 7, 8 + CharacterWizard (Médio)
**Responsabilidade:** Magias, revisão final e orquestrador principal.
**Pode começar:** após Agentes 1, 4, 5 terminarem (ou usar stubs)
**Depende de:** todos os Steps para o CharacterWizard

```
Crie:

1. components/character-creation/steps/Step7Spells.tsx
   - Renderiza APENAS se class.isSpellcaster === true
   - Se não: pular para step 8 automaticamente

   Fetch da Open5e API (fetch nativo, sem pacote):
   - Truques: GET https://api.open5e.com/v1/spells/?level=0&dnd_class={className}&limit=50
   - Magias 1°: GET https://api.open5e.com/v1/spells/?level=1&dnd_class={className}&limit=80
   - Loading state enquanto fetcha
   - Fallback: se API falhar, mostrar lista hardcoded de 5 magias básicas por classe

   UI:
   - Tabs: "Truques (cantrips)" | "Magias de 1° Nível"
   - Grid de cards: nome, escola, concentração? (ícone), alcance
   - Contador: "X de N selecionados" (N varia por classe)
   - Botão "Próximo" habilitado quando atingiu o mínimo de truques

2. components/character-creation/steps/Step8Review.tsx
   Layout 2 colunas:

   Esquerda (ficha resumida):
   - Bloco Identidade: Nome, Raça (sub-raça), Classe, Antecedente, Alinhamento
   - Bloco Atributos: grid 2×3 com valor + modificador + bônus racial
   - Bloco Combate: HP, CA, Iniciativa, Deslocamento
   - Bloco Proficiências: lista de perícias treinadas
   - Bloco Inventário: lista dos itens escolhidos
   - Bloco Magias: truques e magias (se conjurador)

   Direita (avatar):
   - Imagem final gerada
   - Nome grande em Cinzel
   - "Raça · Classe · Nível 1"

   Botão centralizado:
   "✨ Criar Personagem" → chama createCharacter(data) (server action)
   Loading state no botão durante o save

3. app/play/characters/new/CharacterWizard.tsx
   Client component principal que orquestra tudo:

   Estado:
   - step: 1-8
   - data: Partial<CharacterCreationData>
   - currentImageUrl: string | null
   - isGenerating: boolean
   - imageHistory: string[]
   - abortController: useRef<AbortController>

   Renderiza:
   - StepIndicator
   - WizardLayout com:
     - Left: step atual (Step1 a Step8 baseado em step)
     - Right: CharacterPreview

   Função generateImage compartilhada (usada pelos Steps 2, 3, 5, 6)
   Função nextStep / prevStep
   Função updateData (merge parcial no estado)

   Passa props para cada Step:
   - data: estado atual
   - onUpdate: (partial) => updateData(partial)
   - onNext: () => nextStep()
   - onBack: () => prevStep()
   - onGenerateImage: (step) => generateImage(step) [para Steps 2,3,5,6]
   - isGenerating: boolean

4. Atualizar app/play/characters/new/page.tsx
   - Import CharacterWizard com dynamic({ ssr: false }) [evita hydration issues]
   - Auth check com getProfile()
   - Se não autenticado: redirect('/login')
   - Render: <CharacterWizard />

Ao terminar:
- npx tsc --noEmit completo do projeto
- Verificar que /play/characters/new carrega sem erro
- Verificar que /play/characters/select ainda funciona
```

---

## ORDEM DE EXECUÇÃO RECOMENDADA

```
Lançar simultaneamente:
├── AGENTE 1 (dados estáticos) ──────────────────────────────► done
├── AGENTE 2 (prompt-builder + API) ────────────────────────► done
├── AGENTE 3 (migration + server action) ───────────────────► done
├── AGENTE 4 (layout + cards base) ─────────────────────────► done
├── AGENTE 5 (steps 1, 2, 3) ───────────────────────────────► done
├── AGENTE 6 (steps 4, 5, 6) ───────────────────────────────► done
└── AGENTE 7 (steps 7, 8 + orquestrador) ──── aguarda 1+4+5 ► done

Após todos:
└── TYPE CHECK FINAL: npx tsc --noEmit
└── BUILD: npm run build
└── COMMIT: feat(characters): wizard progressivo estilo videogame
```

---

## APÓS TODOS OS AGENTES TERMINAREM

1. Rodar no Supabase SQL Editor:
   O conteúdo de `supabase/migrations/004_character_creation.sql`

2. Adicionar no `.env.local` (se ainda vazio):
   `OPENAI_API_KEY=sua-chave-aqui`

3. Testar o fluxo completo em localhost:
   - /play/characters/new → Step 1 (identidade)
   - Escolher raça → imagem do boneco em roupa base gera
   - Escolher classe → imagem atualiza com traje da classe
   - Completar até Step 8 → personagem salvo no /hub

4. git commit + push → Vercel redeploy automático
